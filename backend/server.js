const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 5000;
// const dbPath = path.join(__dirname, 'data', 'db.json');
const dbPath = path.join(__dirname, 'menu.json');

app.use(cors());
app.use(express.json());
// Serve static files from /public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Helper function
function readData() {
  const jsonData = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(jsonData);
}

function writeData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ✅ GET entire menu
app.get('/menu', (req, res) => {
  const data = readData();
  res.json(data);
});

// ✅ GET all sandwiches
app.get('/sandwiches', (req, res) => {
  const data = readData();
  res.json(data.sandwiches);
});

// ✅ POST new sandwich
app.post('/sandwiches', (req, res) => {
  const newSandwich = req.body;
  const data = readData();

  newSandwich.id = Date.now();
  data.sandwiches.push(newSandwich);

  writeData(data);
  res.status(201).json(newSandwich);
});

// ✅ PUT update sandwich
app.put('/sandwiches/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body;
  const data = readData();

  const index = data.sandwiches.findIndex(s => s.id == id);
  if (index === -1) return res.status(404).json({ error: "Not found" });

  data.sandwiches[index] = { ...data.sandwiches[index], ...updated };
  writeData(data);

  res.json(data.sandwiches[index]);
});

// ✅ DELETE sandwich
app.delete('/sandwiches/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();

  const filtered = data.sandwiches.filter(s => s.id != id);
  if (filtered.length === data.sandwiches.length) {
    return res.status(404).json({ error: "Not found" });
  }

  data.sandwiches = filtered;
  writeData(data);

  res.status(204).send();
});

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || '';
    const uploadPath = path.join(__dirname, 'public/images/sandwiches', folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });

app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ message: 'Upload successful', filename: req.file.filename });
});


//OTHER MENU ITEMS CONTROLLERS
app.put('/other-menu-items/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  const data = readData();
  let found = false;
//   let returnItem;

  for (const category in data) {
    const items = data[category];

    const index = items.findIndex(item => item.id == id);
    if (index !== -1) {
      data[category][index] = { ...items[index], ...updated };
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  writeData(data);
//   res.json({ message: 'Item updated successfully.' });
  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
