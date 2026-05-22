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
    const rows = await sql`
      SELECT * FROM portfolio_world_events
      WHERE source_type != 'system'
      ORDER BY created_at DESC LIMIT 40`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.get('/api/world/status', async (req, res) => {
  try {
    const now = new Date()
    const utcMonth = now.getUTCMonth()
    const season =
      utcMonth >= 2 && utcMonth <= 4 ? 'spring'
        : utcMonth >= 5 && utcMonth <= 7 ? 'summer'
          : utcMonth >= 8 && utcMonth <= 10 ? 'autumn'
            : 'winter'
    const worldDate = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }) + ', 2070'
    const worldTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }) + ' UTC'

    const statusRows = await sql`
      SELECT summary FROM portfolio_world_events
      WHERE source_type = 'system' AND headline = '__BROADCAST_STATUS__'
      ORDER BY created_at DESC LIMIT 1`

    let weather_mood = null
    if (statusRows[0]?.summary) {
      try {
        const parsed = JSON.parse(statusRows[0].summary)
        weather_mood = parsed.weather_mood || null
      } catch { /* ignore */ }
    }

    res.json({ worldDate, worldTime, season, weather_mood })
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




// ── DAILY AI BROADCAST (per-realm ephemeral news) ───
const REALM_Y = {
  north: [10, 35],
  middle: [36, 65],
  south: [66, 90],
}

const randomRealmCounts = () => ({
  north: 2 + Math.floor(Math.random() * 4),
  middle: 2 + Math.floor(Math.random() * 4),
  south: 2 + Math.floor(Math.random() * 4),
})

const clamp = (n, min, max) => Math.min(max, Math.max(min, Number(n) || min))

const normalizeRealmEvent = (ev, realm) => {
  const [yMin, yMax] = REALM_Y[realm]
  return {
    headline: ev.headline,
    summary: ev.summary,
    location_name: ev.location_name,
    x_percent: clamp(ev.x_percent, 10, 90),
    y_percent: clamp(ev.y_percent, yMin, yMax),
  }
}

const cronAuth = (req, res, next) => {
  const secret = process.env.CRON_SECRET
  if (!secret) return res.status(501).json({ message: 'CRON_SECRET not set on server' })
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  next()
}

async function runDailyBroadcast() {
  const now = new Date()
  const utcMonth = now.getUTCMonth()
  const season =
    utcMonth >= 2 && utcMonth <= 4 ? 'spring'
      : utcMonth >= 5 && utcMonth <= 7 ? 'summer'
        : utcMonth >= 8 && utcMonth <= 10 ? 'autumn'
          : 'winter'

  const worldDate = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }) + ', 2070'
  const worldTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }) + ' UTC'

  const manualRows = await sql`
    SELECT headline, summary, location_name
    FROM portfolio_world_events
    WHERE source_type = 'manual'
    ORDER BY created_at DESC
    LIMIT 10`

  const canonBlock = manualRows.length
    ? manualRows.map((e, i) => `${i + 1}. ${e.headline}${e.summary ? ` — ${e.summary}` : ''}`).join('\n')
    : 'No manual canon yet. Keep broadcasts atmospheric only — weather, travel, trade, mood. No major wars or plagues unless implied by season.'

  const realmCounts = randomRealmCounts()
  const totalTarget = realmCounts.north + realmCounts.middle + realmCounts.south

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 2400,
      messages: [{
        role: 'system',
        content: `You are a news broadcaster for "The Land of Three" (dark fantasy).
Write today's bulletin — NOT new canon. React to admin canon facts when provided.
Pick ONE weather mood for the whole day (sunny, cloudy, windy, rainy, or snowy) that fits the season.
Return ONLY JSON:
{
  "weather_mood": "sunny|cloudy|windy|rainy|snowy",
  "north": [ { "headline", "summary", "location_name", "x_percent", "y_percent" }, ... ],
  "middle": [ ... ],
  "south": [ ... ]
}
Each array item = one bulletin for that realm only.
Ashen North: y 10–35. Verdant Middle: y 36–65. Sunken South: y 66–90. x 10–90.
headline = short ticker. summary = 1–2 sentences. Vary tone across lines in a realm.
Do not contradict manual canon. Do not invent huge new plot. Flow naturally.`,
      }, {
        role: 'user',
        content: `Broadcast date: ${worldDate}
Broadcast time: ${worldTime}
Season: ${season}

Manual canon (source of truth):
${canonBlock}

Write EXACTLY this many bulletins per realm:
- Ashen North (north): ${realmCounts.north} lines
- Verdant Middle (middle): ${realmCounts.middle} lines
- Sunken South (south): ${realmCounts.south} lines
Total: ${totalTarget} lines.`,
      }],
    }),
  })

  const groqData = await groqRes.json()
  const text = groqData.choices?.[0]?.message?.content || '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  const weather_mood = parsed.weather_mood || 'cloudy'

  let events = []
  for (const realm of ['north', 'middle', 'south']) {
    const list = Array.isArray(parsed[realm]) ? parsed[realm] : []
    const capped = list.slice(0, realmCounts[realm]).map(ev => normalizeRealmEvent(ev, realm))
    events = events.concat(capped)
  }

  await sql`DELETE FROM portfolio_world_events WHERE source_type IN ('ai', 'system')`

  await sql`
    INSERT INTO portfolio_world_events (headline, summary, location_name, x_percent, y_percent, source_type)
    VALUES (
      '__BROADCAST_STATUS__',
      ${JSON.stringify({ weather_mood, broadcast_day: worldDate })},
      'Station',
      50,
      50,
      'system'
    )`

  for (const ev of events) {
    await sql`
      INSERT INTO portfolio_world_events (headline, summary, location_name, x_percent, y_percent, source_type)
      VALUES (${ev.headline}, ${ev.summary}, ${ev.location_name}, ${ev.x_percent}, ${ev.y_percent}, 'ai')`
  }

  const rows = await sql`
    SELECT * FROM portfolio_world_events
    WHERE source_type != 'system'
    ORDER BY created_at DESC LIMIT 40`
  return {
    message: 'Daily broadcast published',
    count: events.length,
    realm_counts: realmCounts,
    broadcast_day: worldDate,
    worldTime,
    season,
    weather_mood,
    events: rows,
  }
}

const handleBroadcast = async (req, res) => {
  try {
    const result = await runDailyBroadcast()
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Daily broadcast failed', error: err.message })
  }
}

// UTC midnight cron (set CRON_SECRET in Vercel env)
app.get('/api/cron/world-broadcast', cronAuth, handleBroadcast)

// Admin test button (same logic as cron)
app.post('/api/world/refresh', auth, handleBroadcast)

export default app
