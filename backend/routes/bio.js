const express = require('express');
const router = express.Router();
const pool = require('../db');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get bio
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM portfolio_bio LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bio
router.put('/', async (req, res) => {
  const { name, role, bio_text, tags } = req.body;
  try {
    await pool.query(
      'UPDATE portfolio_bio SET name=$1, role=$2, bio_text=$3, tags=$4, updated_at=NOW() WHERE id=1',
      [name, role, bio_text, tags]
    );
    res.json({ message: 'Bio updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload PFP
router.post('/pfp', async (req, res) => {
  const { image } = req.body;
  try {
    const upload = await cloudinary.uploader.upload(image, {
      folder: 'swift-portfolio/pfp',
    });
    await pool.query(
      'UPDATE portfolio_bio SET pfp_url=$1, updated_at=NOW() WHERE id=1',
      [upload.secure_url]
    );
    res.json({ url: upload.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;