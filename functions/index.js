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

// Configure multer to use memory storage for Firebase Functions
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});


app.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate unique filename
    const ext = path.extname(req.file.originalname);
    const filename = Date.now() + ext;
    const folder = req.body.folder || "sandwiches";
    const filePath = `images/${folder}/${filename}`;

    // Create a file reference in Firebase Storage
    const file = bucket.file(filePath);

    // Create a write stream
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Handle stream events
    stream.on("error", (error) => {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    });

    stream.on("finish", async () => {
      try {
        // Make the file publicly accessible
        await file.makePublic();
        
        // Return the filename (not the full URL, to match existing frontend expectations)
        res.json({ 
          message: "Upload successful", 
          filename: filename,
          url: `https://storage.googleapis.com/${bucket.name}/${filePath}`
        });
      } catch (error) {
        console.error("Error making file public:", error);
        res.status(500).json({ error: "Failed to make file public" });
      }
    });

    // Write the file buffer to the stream
    stream.end(req.file.buffer);

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
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
