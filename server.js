const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// In-memory storage: { username: { images: [{filename, uploader}] } }
let users = {};
let publicImages = []; // { filename, uploader }

app.use(express.static('public'));
app.use(express.json());

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Use username as sessionId (for demo only)
function getSessionId(req) {
  return req.headers['x-session-id'];
}

// Auth endpoint
app.post('/api/auth', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  if (!users[name]) users[name] = { images: [] };
  res.json({ sessionId: name, name });
});

// Dashboard: get user info
app.get('/api/dashboard', (req, res) => {
  const sessionId = getSessionId(req);
  const user = users[sessionId];
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ name: sessionId, images: user.images });
});

// Public gallery
app.get('/api/public', (req, res) => {
  res.json(publicImages);
});

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  const sessionId = getSessionId(req);
  const user = users[sessionId];
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const image = { filename: req.file.filename, uploader: sessionId };
  user.images.push(image);
  publicImages.push(image);
  res.json({ success: true, image });
});

// Profile
app.get('/api/profile', (req, res) => {
  const sessionId = getSessionId(req);
  const user = users[sessionId];
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ name: sessionId, images: user.images });
});

// Get all registered users (for demo, no auth)
app.get('/api/users', (req, res) => {
    // Return array of { name, imageCount }
    const userList = Object.keys(users).map(name => ({
      name,
      imageCount: users[name].images.length
    }));
    res.json(userList);
  });

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));