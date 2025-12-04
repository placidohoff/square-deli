const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const admin = require("firebase-admin");
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),  // Service account credentials
  storageBucket: 'square-deli-menu.firebasestorage.app',  // Replace with your Firebase Storage bucket URL
});

const bucket = admin.storage().bucket();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 5000;
const dbPath = path.join(__dirname, "menu.json");

app.use(cors());
app.use(express.json());
// Serve static files from /public
app.use("/public", express.static(path.join(__dirname, "public")));

// Helper function
function readData() {
  const jsonData = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(jsonData);
}

function writeData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ✅ GET entire menu
app.get("/menu", (req, res) => {
  const data = readData();
  res.json(data);
});

// ✅ GET all sandwiches
app.get("/sandwiches", (req, res) => {
  const data = readData();
  res.json(data.sandwiches);
});

// ✅ POST new sandwich
app.post("/sandwiches", (req, res) => {
  const newSandwich = req.body;
  const data = readData();

  newSandwich.id = Date.now();
  data.sandwiches.push(newSandwich);

  writeData(data);
  res.status(201).json(newSandwich);
});

// ✅ PUT update sandwich
app.put("/sandwiches/:id", (req, res) => {
  const { id } = req.params;
  const updated = req.body;
  const data = readData();

  const index = data.sandwiches.findIndex((s) => s.id == id);
  if (index === -1) return res.status(404).json({ error: "Not found" });

  data.sandwiches[index] = { ...data.sandwiches[index], ...updated };
  writeData(data);

  res.json(data.sandwiches[index]);
});

// ✅ DELETE sandwich
app.delete("/sandwiches/:id", (req, res) => {
  const { id } = req.params;
  const data = readData();

  const filtered = data.sandwiches.filter((s) => s.id != id);
  if (filtered.length === data.sandwiches.length) {
    return res.status(404).json({ error: "Not found" });
  }

  data.sandwiches = filtered;
  writeData(data);

  res.status(204).send();
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint to upload image
app.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;  // Unique file name
    const fileBuffer = file.buffer;  // The buffer containing the file data

    // Create a reference to the Firebase Storage file
    const fileUpload = bucket.file(`images/${fileName}`);

    // Upload the image to Firebase Storage
    const blobStream = fileUpload.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on('finish', async () => {
      try {
        // Make the uploaded file publicly accessible
        await fileUpload.makePublic();

        // Public URL for the image
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/images/${fileName}`;

        res.status(200).json({
          message: 'Upload successful',
          imageUrl,
          filename: fileName,
        });
      } catch (err) {
        console.error('Error making file public:', err);
        res.status(500).send('Error making file public.');
      }
    });

    blobStream.on('error', (err) => {
      console.error('Error uploading file:', err);
      res.status(500).send('Error uploading file.');
    });

    blobStream.end(fileBuffer);  // Write the buffer to Firebase Storage
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Internal server error');
  }
});


//OTHER MENU ITEMS CONTROLLERS
app.put("/other-menu-items/:id", (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  const data = readData();
  let found = false;

  for (const category in data) {
    const items = data[category];

    const index = items.findIndex((item) => item.id == id);
    if (index !== -1) {
      data[category][index] = { ...items[index], ...updated };
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ error: "Item not found." });
  }

  writeData(data);
  res.json(updated);
});

exports.api = onRequest(app); // Fix to use `onRequest`
