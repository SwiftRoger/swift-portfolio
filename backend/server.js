console.log("ADMIN_PASSWORD =", process.env.ADMIN_PASSWORD);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Routes
const bioRoutes = require('./routes/bio');
const artRoutes = require('./routes/art');
const videoRoutes = require('./routes/videos');
const designRoutes = require('./routes/design');
const authRoutes = require('./routes/auth');

app.use('/api/bio', bioRoutes);
app.use('/api/art', artRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/design', designRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Swift Portfolio API 🖤' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});