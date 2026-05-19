const express = require('express');
const router = express.Router();
const pool = require('../db');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all art
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM portfolio_art ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload art
router.post('/', async (req, res) => {
  const { image, title } = req.body;
  try {
    const upload = await cloudinary.uploader.upload(image, {
      folder: 'swift-portfolio/art',
    });
    const result = await pool.query(
      'INSERT INTO portfolio_art (title, image_url) VALUES ($1, $2) RETURNING *',
      [title, upload.secure_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Delete art
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM portfolio_art WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;