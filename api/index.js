import express from 'express'
import cors from 'cors'
import { neon } from '@neondatabase/serverless'
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken'

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// DB
const sql = neon(process.env.DATABASE_URL)

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// ── AUTH ──────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body
  if (password !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ message: 'Access denied' })
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

// ── BIO ───────────────────────────────────────────
app.get('/api/bio', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_bio LIMIT 1`
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.put('/api/bio', auth, async (req, res) => {
  const { name, role, bio_text, tags } = req.body
  try {
    await sql`UPDATE portfolio_bio SET name=${name}, role=${role}, bio_text=${bio_text}, tags=${tags}, updated_at=NOW() WHERE id=1`
    res.json({ message: 'Bio updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/bio/pfp', auth, async (req, res) => {
  const { image } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/pfp' })
    await sql`UPDATE portfolio_bio SET pfp_url=${upload.secure_url}, updated_at=NOW() WHERE id=1`
    res.json({ url: upload.secure_url })
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

// ── ART ───────────────────────────────────────────
app.get('/api/art', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_art ORDER BY created_at DESC`
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/art', auth, async (req, res) => {
  const { image, title } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/art' })
    const rows = await sql`INSERT INTO portfolio_art (title, image_url) VALUES (${title}, ${upload.secure_url}) RETURNING *`
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

app.delete('/api/art/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_art WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── VIDEOS ────────────────────────────────────────
app.get('/api/videos', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_videos ORDER BY created_at DESC`
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/videos', auth, async (req, res) => {
  const { title, youtube_url } = req.body
  try {
    const rows = await sql`INSERT INTO portfolio_videos (title, youtube_url) VALUES (${title}, ${youtube_url}) RETURNING *`
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/api/videos/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_videos WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── DESIGN ────────────────────────────────────────
app.get('/api/design', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_design ORDER BY created_at DESC`
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/design', auth, async (req, res) => {
  const { image, title } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/design' })
    const rows = await sql`INSERT INTO portfolio_design (title, image_url) VALUES (${title}, ${upload.secure_url}) RETURNING *`
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

app.delete('/api/design/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_design WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default app