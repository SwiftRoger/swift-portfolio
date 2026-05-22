// ── USER PROFILE ─────────────────────────────────────
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    
    const { bio, birth_city, age, power_level } = req.body
    
    await sql`
      UPDATE users 
      SET bio = COALESCE(${bio}, bio),
          birth_city = COALESCE(${birth_city}, birth_city),
          age = COALESCE(${age}, age),
          power_level = COALESCE(${power_level}, power_level),
          updated_at = NOW()
      WHERE id = ${userId}
    `
    
    const result = await sql`SELECT id, username, email, bio, birth_city, age, power_level, avatar_url, avatar_approved, created_at FROM users WHERE id = ${userId}`
    res.json({ user: result[0] })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Avatar upload
app.post('/api/auth/avatar', auth, async (req, res) => {
  const { image } = req.body
  if (!image) {
    return res.status(400).json({ message: 'No image provided' })
  }
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    
    const upload = await cloudinary.uploader.upload(image, { 
      folder: 'swift-portfolio/avatars',
      transformation: [{ width: 400, height: 400, crop: 'limit' }]
    })
    
    await sql`
      UPDATE users 
      SET avatar_url = ${upload.secure_url},
          avatar_approved = FALSE,
          updated_at = NOW()
      WHERE id = ${userId}
    `
    
    res.json({ 
      url: upload.secure_url,
      message: 'Avatar uploaded successfully. Awaiting admin approval.'
    })
  } catch (err) {
    console.error('Avatar upload error:', err)
    res.status(500).json({ message: 'Upload failed' })
  }
})

// Admin avatar approval
app.put('/api/auth/admin/avatar/:userId/approve', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const adminUserId = decoded.userId
    
    // Check if user is admin (simplified check)
    const adminCheck = await sql`SELECT admin FROM users WHERE id = ${adminUserId}`
    if (adminCheck.length === 0 || !adminCheck[0].admin) {
      return res.status(403).json({ message: 'Admin access required' })
    }
    
    const { userId } = req.params
    const { approved } = req.body
    
    await sql`
      UPDATE users 
      SET avatar_approved = ${approved || true},
          updated_at = NOW()
      WHERE id = ${userId}
    `
    
    const result = await sql`SELECT id, username, email, avatar_url, avatar_approved FROM users WHERE id = ${userId}`
    res.json({ 
      user: result[0],
      message: `Avatar ${approved ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    console.error('Avatar approval error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get pending avatar approvals
app.get('/api/auth/admin/avatars/pending', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const adminUserId = decoded.userId
    
    // Check if user is admin (simplified check)
    const adminCheck = await sql`SELECT admin FROM users WHERE id = ${adminUserId}`
    if (adminCheck.length === 0 || !adminCheck[0].admin) {
      return res.status(403).json({ message: 'Admin access required' })
    }
    
    const result = await sql`
      SELECT id, username, email, avatar_url, avatar_approved, created_at 
      FROM users 
      WHERE avatar_url IS NOT NULL AND avatar_approved = FALSE
      ORDER BY created_at ASC
    `
    res.json({ avatars: result })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    console.error('Get pending avatars error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})