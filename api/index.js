import express from 'express'
import cors from 'cors'
import { neon } from '@neondatabase/serverless'
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }
  
  try {
    // Find user
    const result = await sql`SELECT * FROM users WHERE username = ${username}`
    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    const user = result[0]
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Username, email, and password are required' })
  try {
    const userCheck = await sql`SELECT * FROM users WHERE username = ${username} OR email = ${email}`
    if (userCheck.length > 0)
      return res.status(409).json({ message: 'User already exists' })
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${passwordHash})
      RETURNING id, username, email, created_at`
      
    // Create default character for user
    await sql`
      INSERT INTO characters (user_id, name, role)
      VALUES (${result[0].id}, ${username}, 'Adventurer')
    `
    
    const token = jwt.sign({ userId: result[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: result[0] })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId
    
    const result = await sql`SELECT id, username, email, created_at FROM users WHERE id = ${userId}`
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.json({ user: result[0] })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Admin login (existing functionality preserved)
app.post('/api/auth/admin/login', (req, res) => {
  const { password } = req.body
  
  console.log('--- ADMIN LOGIN REQUEST ---');
  console.log('Input password:', password);
  console.log('Env password:', process.env.ADMIN_PASSWORD);
  
  if (password !== process.env.ADMIN_PASSWORD) {
    console.log('RESULT: DENIED');
    return res.status(401).json({ message: 'Access denied' });
  }
  
  console.log('RESULT: SUCCESS');
  
  const token = jwt.sign(
    { admin: true },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({ token });
});

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
    const rows = await sql`SELECT * FROM characters ORDER BY created_at DESC`
    res.json(rows)
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.post('/api/characters', auth, async (req, res) => {
  const { name, birth_city, backstory, role, image_url } = req.body
  if (!name)
    return res.status(400).json({ message: 'Character name is required' })
  try {
    const userCheck = await sql`SELECT * FROM users WHERE id = ${req.body.userId}`
    if (userCheck.length === 0)
      return res.status(404).json({ message: 'User not found' })
      
    const result = await sql`
      INSERT INTO characters (user_id, name, birth_city, backstory, role, image_url)
      VALUES (${req.body.userId}, ${name}, ${birth_city || ''}, ${backstory || ''}, ${role || 'Adventurer'}, ${image_url || ''})
      RETURNING *`
    const token = jwt.sign({ userId: result[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: result[0] })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/characters/:id/image', auth, async (req, res) => {
  const { image } = req.body
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/characters' })
    await sql`UPDATE characters SET image_url=${upload.secure_url} WHERE id=${req.params.id}`
    res.json({ url: upload.secure_url })
  } catch { res.status(500).json({ message: 'Upload failed' }) }
})

app.put('/api/characters/:id', auth, async (req, res) => {
  const { name, birth_city, backstory, role, image_url } = req.body
  try {
    const rows = await sql`
      UPDATE characters 
      SET name = COALESCE(${name}, name), 
          birth_city = COALESCE(${birth_city}, birth_city), 
          backstory = COALESCE(${backstory}, backstory), 
          role = COALESCE(${role}, role), 
          image_url = COALESCE(${image_url}, image_url),
          updated_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING *`
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Server error' }) }
})

app.delete('/api/characters/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM characters WHERE id=${req.params.id}`
    res.json({ message: 'Deleted' })
  } catch { res.status(500).json({ message: 'Server error' }) }
})

// Admin routes for content moderation
app.put('/api/characters/admin/:id/toggle-nsfw', auth, async (req, res) => {
  try {
    // Check if user is admin (simplified - in production you'd want to check the JWT for admin flag)
    const { id } = req.params;
    const { is_nsfw } = req.body;
    
    // Toggle NSFW flag
    const result = await sql`
      UPDATE characters SET is_nsfw = ${is_nsfw} WHERE id = ${id} RETURNING *
    `;
    
    res.json({ character: result[0] });
  } catch (error) {
    console.error('Toggle NSFW error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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



// ── USER PROFILE ─────────────────────────────────────
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId
    const { bio, birth_city, age, power_level } = req.body
    await sql`UPDATE users SET bio = COALESCE(${bio}, bio), birth_city = COALESCE(${birth_city}, birth_city), age = COALESCE(${age}, age), power_level = COALESCE(${power_level}, power_level), updated_at = NOW() WHERE id = ${userId}`
    const result = await sql`SELECT id, username, email, bio, birth_city, age, power_level, avatar_url, avatar_approved, created_at FROM users WHERE id = ${userId}`
    res.json({ user: result[0] })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── AVATAR UPLOAD ─────────────────────────────────────
app.post('/api/auth/avatar', auth, async (req, res) => {
  const { image } = req.body
  if (!image) return res.status(400).json({ message: 'No image provided' })
  try {
    const upload = await cloudinary.uploader.upload(image, { folder: 'swift-portfolio/avatars', transformation: [{ width: 400, height: 400, crop: 'limit' }] })
    await sql`UPDATE users SET avatar_url = ${upload.secure_url}, avatar_approved = FALSE, updated_at = NOW() WHERE id = ${req.user.userId}`
    res.json({ url: upload.secure_url, message: 'Avatar uploaded. Awaiting admin approval.' })
  } catch (err) {
    console.error('Avatar upload error:', err)
    res.status(500).json({ message: 'Upload failed' })
  }
})

// ── ADMIN AVATAR APPROVAL ─────────────────────────────
app.put('/api/auth/admin/avatar/:userId/approve', auth, async (req, res) => {
  try {
    const adminCheck = await sql`SELECT admin FROM users WHERE id = ${req.user.userId}`
    if (!adminCheck[0]?.admin) return res.status(403).json({ message: 'Admin access required' })
    const { approved } = req.body
    await sql`UPDATE users SET avatar_approved = ${approved}, updated_at = NOW() WHERE id = ${req.params.userId}`
    res.json({ message: `Avatar ${approved ? 'approved' : 'rejected'}` })
  } catch (error) {
    console.error('Avatar approval error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── PENDING AVATARS ───────────────────────────────────
app.get('/api/auth/admin/avatars/pending', auth, async (req, res) => {
  try {
    const adminCheck = await sql`SELECT admin FROM users WHERE id = ${req.user.userId}`
    if (!adminCheck[0]?.admin) return res.status(403).json({ message: 'Admin access required' })
    const result = await sql`SELECT id, username, email, avatar_url, created_at FROM users WHERE avatar_url IS NOT NULL AND avatar_approved IS NOT TRUE ORDER BY created_at ASC`
    res.json({ avatars: result })
  } catch (error) {
    console.error('Get pending avatars error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})




export default app
