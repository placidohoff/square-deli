const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

//Firebase-admin settings for bucket storage
const admin = require('firebase-admin');

const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'square-deli-menu.firebasestorage.app'
});

const bucket = admin.storage().bucket();

//End Firebase settings setup


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

// Simple upload endpoint using raw body parsing
app.post('/upload-image', (req, res) => {
  console.log('Upload request received');
  console.log('Headers:', req.headers);
  
  // Collect raw body data
  const chunks = [];
  
  req.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  req.on('end', async () => {
    try {
      const body = Buffer.concat(chunks);
      console.log('Body length:', body.length);
      
      if (body.length === 0) {
        return res.status(400).json({ error: 'No data received' });
      }

      // For now, let's create a test file to verify the upload works
      const fileName = `test_${Date.now()}.bin`;
      const folder = 'sandwiches';
      
      // Create a reference to the Firebase Storage file
      const fileUpload = bucket.file(`images/${folder}/${fileName}`);

      // Upload the raw data to Firebase Storage
      const blobStream = fileUpload.createWriteStream({
        resumable: false,
        metadata: {
          contentType: 'application/octet-stream',
        },
      });

      blobStream.on('finish', async () => {
        try {
          // Make the uploaded file publicly accessible
          await fileUpload.makePublic();

          // Public URL for the image
          const imageUrl = `https://storage.googleapis.com/${bucket.name}/images/${folder}/${fileName}`;

          console.log('Upload successful:', imageUrl);
          res.status(200).json({
            message: 'Upload successful',
            imageUrl,
            filename: fileName,
          });
        } catch (err) {
          console.error('Error making file public:', err);
          res.status(500).json({ error: 'Error making file public.' });
        }
      });

      blobStream.on('error', (err) => {
        console.error('Error uploading file:', err);
        res.status(500).json({ error: 'Error uploading file.' });
      });

      blobStream.end(body);
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ error: 'Error processing upload' });
    }
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
    res.status(500).json({ error: 'Request error' });
  });
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

// Export for Firebase Functions
const { onRequest } = require("firebase-functions/https");
exports.api = onRequest(app);

// Keep the local server for development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}
