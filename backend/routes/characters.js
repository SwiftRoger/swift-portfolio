const express = require('express');
const router = express.Router();
const db = require('../db/index');
const { upload } = require('../utils/cloudinary');
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_your_groq_api_key_here'
});

// Get all characters (public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.username 
      FROM characters c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.is_nsfw = FALSE 
      ORDER BY c.created_at DESC
    `);
    res.json({ characters: result.rows });
  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get character by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT c.*, u.username 
      FROM characters c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = $1 AND c.is_nsfw = FALSE
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    res.json({ character: result.rows[0] });
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's characters (protected)
router.get('/user/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // Check if user is requesting their own data or is admin
    if (parseInt(req.params.userId) !== userId) {
      // Check if user is admin (simplified check)
      const adminCheck = await db.query('SELECT admin FROM users WHERE id = $1', [userId]);
      if (!adminCheck.rows[0] || !adminCheck.rows[0].admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const result = await db.query(`
      SELECT c.* 
      FROM characters c 
      WHERE c.user_id = $1 
      ORDER BY c.created_at DESC
    `, [req.params.userId]);
    
    res.json({ characters: result.rows });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Get user characters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create character (protected)
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    const { name, birth_city, backstory, role, image_url } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Character name is required' });
    }
    
    // Create character
    const result = await db.query(
      `INSERT INTO characters (user_id, name, birth_city, backstory, role, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, name, birth_city || '', backstory || '', role || 'Adventurer', image_url || '']
    );
    
    // Generate initial AI daily activity
    try {
      const activity = await generateDailyActivity(name, backstory || '', role || 'Adventurer');
      await db.query(
        'UPDATE characters SET daily_activity = $1 WHERE id = $2',
        [activity, result.rows[0].id]
      );
      result.rows[0].daily_activity = activity;
    } catch (aiError) {
      console.warn('AI activity generation failed:', aiError);
      // Set default activity if AI fails
      await db.query(
        'UPDATE characters SET daily_activity = $1 WHERE id = $2',
        [`Begins their journey in the world of Terminus.`, result.rows[0].id]
      );
      result.rows[0].daily_activity = 'Begins their journey in the world of Terminus.';
    }
    
    res.status(201).json({ character: result.rows[0] });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Create character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update character (protected)
router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    const { id } = req.params;
    const { name, birth_city, backstory, role, image_url } = req.body;
    
    // Check if character exists and belongs to user
    const charCheck = await db.query('SELECT * FROM characters WHERE id = $1', [id]);
    if (charCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    const character = charCheck.rows[0];
    if (character.user_id !== userId) {
      // Check if user is admin
      const adminCheck = await db.query('SELECT admin FROM users WHERE id = $1', [userId]);
      if (!adminCheck.rows[0] || !adminCheck.rows[0].admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Update character
    const result = await db.query(
      `UPDATE characters 
       SET name = COALESCE($2, name), 
           birth_city = COALESCE($3, birth_city), 
           backstory = COALESCE($4, backstory), 
           role = COALESCE($5, role), 
           image_url = COALESCE($6, image_url),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name, birth_city, backstory, role, image_url]
    );
    
    // Update AI daily activity if backstory or role changed
    if (backstory !== undefined || role !== undefined) {
      try {
        const activity = await generateDailyActivity(
          name || character.name,
          backstory !== undefined ? backstory : character.backstory,
          role !== undefined ? role : character.role
        );
        await db.query(
          'UPDATE characters SET daily_activity = $1 WHERE id = $2',
          [activity, id]
        );
        result.rows[0].daily_activity = activity;
      } catch (aiError) {
        console.warn('AI activity generation failed:', aiError);
        // Keep existing activity if AI fails
      }
    }
    
    res.json({ character: result.rows[0] });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Update character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete character (protected)
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    const { id } = req.params;
    
    // Check if character exists and belongs to user
    const charCheck = await db.query('SELECT * FROM characters WHERE id = $1', [id]);
    if (charCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    const character = charCheck.rows[0];
    if (character.user_id !== userId) {
      // Check if user is admin
      const adminCheck = await db.query('SELECT admin FROM users WHERE id = $1', [userId]);
      if (!adminCheck.rows[0] || !adminCheck.rows[0].admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Delete character
    await db.query('DELETE FROM characters WHERE id = $1', [id]);
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Delete character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for content moderation
router.put('/admin/:id/toggle-nsfw', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token and check admin status
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    const adminCheck = await db.query('SELECT admin FROM users WHERE id = $1', [userId]);
    if (!adminCheck.rows[0] || !adminCheck.rows[0].admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { is_nsfw } = req.body;
    
    // Toggle NSFW flag
    const result = await db.query(
      'UPDATE characters SET is_nsfw = $2 WHERE id = $1 RETURNING *',
      [id, is_nsfw]
    );
    
    res.json({ character: result.rows[0] });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Toggle NSFW error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate daily activity using Groq AI
async function generateDailyActivity(name, backstory, role) {
  try {
    const prompt = `Generate a brief, imaginative daily activity update (1-2 sentences) for a character named ${name} who is a ${role}. Backstory: ${backstory || 'A mysterious adventurer in the world of Terminus.'}. Make it fit the tone of a fantasy/sci-fi world. Keep it very brief and use minimal tokens.`;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      max_tokens: 50,
      temperature: 0.7,
    });
    
    return chatCompletion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq AI error:', error);
    // Fallback activity
    return `${name} continues their journey through the realms of Terminus, seeking new discoveries and adventures.`;
  }
}

module.exports = router;