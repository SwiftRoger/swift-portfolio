import express from 'express'
import cors from 'cors'
import { neon } from '@neondatabase/serverless'
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const sql = neon(process.env.DATABASE_URL)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── AUTH MIDDLEWARE ───────────────────────────────
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
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.put('/api/bio', auth, async (req, res) => {
  const { name, role, bio_text, tags } = req.body
  try {
    await sql`UPDATE portfolio_bio SET name=${name}, role=${role}, bio_text=${bio_text}, tags=${tags}, updated_at=NOW() WHERE id=1`
    res.json({ message: 'Bio updated' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/bio/pfp', auth, async (req, res) => {
  const { image } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/pfp' })
    await sql`UPDATE portfolio_bio SET pfp_url=${upload.secure_url}, updated_at=NOW() WHERE id=1`
    res.json({ url: upload.secure_url })
  } catch { res.status(500).json({ message: 'Upload failed' }) }
})

// ── ART ───────────────────────────────────────────
app.get('/api/art', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_art ORDER BY created_at DESC`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/art', auth, async (req, res) => {
  const { image, title } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/art' })
    const rows = await sql`INSERT INTO portfolio_art (title, image_url) VALUES (${title}, ${upload.secure_url}) RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Upload failed' }) }
})

app.delete('/api/art/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_art WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})

// ── VIDEOS ────────────────────────────────────────
app.get('/api/videos', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_videos ORDER BY created_at DESC`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/videos', auth, async (req, res) => {
  const { title, youtube_url } = req.body
  try {
    const rows = await sql`INSERT INTO portfolio_videos (title, youtube_url) VALUES (${title}, ${youtube_url}) RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.delete('/api/videos/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_videos WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})

// ── DESIGN ────────────────────────────────────────
app.get('/api/design', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_design ORDER BY created_at DESC`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/design', auth, async (req, res) => {
  const { image, title } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/design' })
    const rows = await sql`INSERT INTO portfolio_design (title, image_url) VALUES (${title}, ${upload.secure_url}) RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Upload failed' }) }
})

app.delete('/api/design/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_design WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})

// ── CHAPTERS ─────────────────────────────────────
app.get('/api/chapters', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_chapters ORDER BY chapter_order ASC`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.get('/api/chapters/:id', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_chapters WHERE id=${req.params.id}`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/chapters', auth, async (req, res) => {
  const { title, subtitle, content, chapter_order, published } = req.body
  try {
    const rows = await sql`
      INSERT INTO portfolio_chapters (title, subtitle, content, chapter_order, published)
      VALUES (${title}, ${subtitle}, ${content}, ${chapter_order}, ${published})
      RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.put('/api/chapters/:id', auth, async (req, res) => {
  const { title, subtitle, content, chapter_order, published } = req.body
  try {
    const rows = await sql`
      UPDATE portfolio_chapters
      SET title=${title}, subtitle=${subtitle}, content=${content},
          chapter_order=${chapter_order}, published=${published}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/chapters/:id/cover', auth, async (req, res) => {
  const { image } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/chapters' })
    await sql`UPDATE portfolio_chapters SET cover_url=${upload.secure_url} WHERE id=${req.params.id}`
    res.json({ url: upload.secure_url })
  } catch { res.status(500).json({ message: 'Upload failed' }) }
})

app.delete('/api/chapters/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_chapters WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})

// ── CHARACTERS ────────────────────────────────────
app.get('/api/characters', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_characters ORDER BY created_at DESC`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/characters', auth, async (req, res) => {
  const { name, role, lore, type, story_ref, first_appearance } = req.body
  try {
    const rows = await sql`
      INSERT INTO portfolio_characters (name, role, lore, type, story_ref, first_appearance)
      VALUES (${name}, ${role}, ${lore}, ${type}, ${story_ref}, ${first_appearance})
      RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/characters/:id/image', auth, async (req, res) => {
  const { image } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/characters' })
    await sql`UPDATE portfolio_characters SET image_url=${upload.secure_url} WHERE id=${req.params.id}`
    res.json({ url: upload.secure_url })
  } catch { res.status(500).json({ message: 'Upload failed' }) }
})

app.put('/api/characters/:id', auth, async (req, res) => {
  const { name, role, lore, type, story_ref, first_appearance } = req.body
  try {
    const rows = await sql`
      UPDATE portfolio_characters
      SET name=${name}, role=${role}, lore=${lore}, type=${type},
          story_ref=${story_ref}, first_appearance=${first_appearance}
      WHERE id=${req.params.id} RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.delete('/api/characters/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_characters WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})

// ── WORLD LOCATIONS ───────────────────────────────
app.get('/api/world/locations', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_world_locations ORDER BY created_at ASC`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/world/locations', auth, async (req, res) => {
  const { name, description, x_percent, y_percent, type } = req.body
  try {
    const rows = await sql`
      INSERT INTO portfolio_world_locations (name, description, x_percent, y_percent, type)
      VALUES (${name}, ${description}, ${x_percent}, ${y_percent}, ${type})
      RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.delete('/api/world/locations/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_world_locations WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})

// ── WORLD EVENTS (AI) ─────────────────────────────
app.get('/api/world/events', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM portfolio_world_events ORDER BY created_at DESC LIMIT 20`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})


// ── WORLD EVENTS CRUD ─────────────────────────────
app.post('/api/world/events', auth, async (req, res) => {
  const { headline, summary, location_name, x_percent, y_percent, source_type } = req.body
  try {
    const rows = await sql`
      INSERT INTO portfolio_world_events (headline, summary, location_name, x_percent, y_percent, source_type)
      VALUES (${headline}, ${summary}, ${location_name}, ${x_percent}, ${y_percent}, ${source_type || 'manual'})
      RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.put('/api/world/events/:id', auth, async (req, res) => {
  const { headline, summary, location_name, x_percent, y_percent, source_type } = req.body
  try {
    const rows = await sql`
      UPDATE portfolio_world_events
      SET headline=${headline}, summary=${summary}, location_name=${location_name},
          x_percent=${x_percent}, y_percent=${y_percent}, source_type=${source_type}
      WHERE id=${req.params.id} RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.delete('/api/world/events/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM portfolio_world_events WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})




// Groq AI trigger — called by cron or admin manually
app.post('/api/world/refresh', auth, async (req, res) => {
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1000,
        messages: [{
          role: 'system',
          content: `You are a lore keeper for "The Land of Three", a dark fantasy world. 
          Real-world events are reinterpreted as events in this fictional world.
          The three realms are: The Ashen North (cold, industrial, war), The Verdant Middle (fertile, political intrigue), The Sunken South (oceanic, mysterious, ancient).
          Return ONLY a JSON array of 5 events. Each event: { headline, summary, location_name, x_percent, y_percent }
          x_percent and y_percent are 0-100 coordinates on a world map.
          Ashen North: y 10-35. Verdant Middle: y 36-65. Sunken South: y 66-90. x varies 10-90.
          Make the events dramatic and lore-appropriate, inspired by real current world tensions.`
        }, {
          role: 'user',
          content: `Generate 5 world events happening right now in The Land of Three. Today is ${new Date().toDateString()}. Make them feel alive and urgent.`
        }]
      })
    })

    const groqData = await groqRes.json()
    const text = groqData.choices?.[0]?.message?.content || '[]'
    const clean = text.replace(/```json|```/g, '').trim()
    const events = JSON.parse(clean)

    // Clear old events and insert new ones
    await sql`DELETE FROM portfolio_world_events WHERE source_type='ai'`

    for (const ev of events) {
      await sql`
        INSERT INTO portfolio_world_events (headline, summary, location_name, x_percent, y_percent, source_type)
        VALUES (${ev.headline}, ${ev.summary}, ${ev.location_name}, ${ev.x_percent}, ${ev.y_percent}, 'ai')`
    }

    const rows = await sql`SELECT * FROM portfolio_world_events ORDER BY created_at DESC LIMIT 20`
    res.json({ message: 'World updated', events: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Groq refresh failed', error: err.message })
  }
})

export default app
