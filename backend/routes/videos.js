const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all videos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM portfolio_videos ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add video
router.post('/', async (req, res) => {
  const { title, youtube_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO portfolio_videos (title, youtube_url) VALUES ($1, $2) RETURNING *',
      [title, youtube_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete video
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM portfolio_videos WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;