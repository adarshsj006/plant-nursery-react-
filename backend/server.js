import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 5000;

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const ADMIN_ID = process.env.ADMIN_ID || "ADM001";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "items.json");
const USERS_FILE = path.join(__dirname, "users.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

/* ---------- ensure folders/files exist ---------- */
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ plants: [] }, null, 2), "utf-8");
}

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), "utf-8");
}

/* ---------- middleware ---------- */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

/* ---------- helpers ---------- */
function readPlantsData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw || '{"plants":[]}');
}
function writePlantsData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function readUsersData() {
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw || '{"users":[]}');
}
function writeUsersData(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

/* ---------- auth middleware ---------- */
function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET); // { sub, role, email? }
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  return next();
}

/* ---------- multer (image upload) ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

/* ===================== AUTH ===================== */

// Register (users only)
app.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || String(name).trim().length < 2)
    return res.status(400).json({ message: "Name must be at least 2 characters" });

  if (!isValidEmail(email))
    return res.status(400).json({ message: "Invalid email" });

  if (!password || String(password).length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  const data = readUsersData();
  data.users = data.users || [];

  const exists = data.users.some(
    (u) => u.email.toLowerCase() === String(email).trim().toLowerCase()
  );
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = bcrypt.hashSync(String(password), 10);

  const newUser = {
    id: Date.now(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    passwordHash,
    role: "user",
    phone: "",
    createdAt: new Date().toISOString(),
  };

  data.users.push(newUser);
  writeUsersData(data);

  res.status(201).json({ message: "Registered successfully" });
});

// Login (admin by unique ID, user by email)
app.post("/auth/login", (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ message: "Identifier and password are required" });
  }

  // Admin login using ADMIN_ID
  if (String(identifier) === String(ADMIN_ID)) {
    if (String(password) !== String(ADMIN_PASSWORD)) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = signToken({ sub: "admin", role: "admin", adminId: ADMIN_ID });
    return res.json({ token, role: "admin" });
  }

  // User login using email
  if (!isValidEmail(identifier)) {
    return res.status(400).json({ message: "Use a valid email (or Admin ID)" });
  }

  const data = readUsersData();
  const user = (data.users || []).find(
    (u) => u.email.toLowerCase() === String(identifier).trim().toLowerCase()
  );

  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const ok = bcrypt.compareSync(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const token = signToken({ sub: user.id, role: "user", email: user.email });
  return res.json({ token, role: "user" });
});

app.get("/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

/* ===================== PROFILE ===================== */

app.get("/users/me", authRequired, (req, res) => {
  if (req.user.role === "admin") {
    return res.json({ id: "admin", role: "admin", adminId: ADMIN_ID });
  }

  const data = readUsersData();
  const user = (data.users || []).find((u) => String(u.id) === String(req.user.sub));
  if (!user) return res.status(404).json({ message: "User not found" });

  const { passwordHash, ...safe } = user;
  res.json(safe);
});

app.put("/users/me", authRequired, (req, res) => {
  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Admin profile is not editable here" });
  }

  const { name, phone } = req.body || {};

  const data = readUsersData();
  const idx = (data.users || []).findIndex((u) => String(u.id) === String(req.user.sub));
  if (idx === -1) return res.status(404).json({ message: "User not found" });

  if (name !== undefined) {
    if (String(name).trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
    data.users[idx].name = String(name).trim();
  }

  if (phone !== undefined) {
    data.users[idx].phone = String(phone).trim();
  }

  writeUsersData(data);

  const { passwordHash, ...safe } = data.users[idx];
  res.json(safe);
});

/* ===================== PLANTS (Inventory) ===================== */

// Public: all plants
app.get("/plants", (req, res) => {
  const data = readPlantsData();
  res.json(data.plants || []);
});

// Public: single plant
app.get("/plants/:id", (req, res) => {
  const data = readPlantsData();
  const plant = (data.plants || []).find((p) => String(p.id) === String(req.params.id));

  if (!plant) return res.status(404).json({ message: "Plant not found" });
  res.json(plant);
});

// Admin: add plant (image upload from PC)
app.post("/plants", authRequired, adminOnly, upload.single("image"), (req, res) => {
  const data = readPlantsData();

  const imageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : "";

  const { name, price, category, stock, description } = req.body || {};

  if (!name || String(name).trim().length < 2)
    return res.status(400).json({ message: "Name is required" });

  const newPlant = {
    id: Date.now(),
    name: String(name).trim(),
    price: Number(price),
    category: String(category || "").trim(),
    stock: Number(stock),
    description: String(description || ""),
    image: imageUrl,
  };

  data.plants = data.plants || [];
  data.plants.push(newPlant);
  writePlantsData(data);

  res.status(201).json(newPlant);
});

// ✅ Admin: update plant (optional new image)
app.put("/plants/:id", authRequired, adminOnly, upload.single("image"), (req, res) => {
  const data = readPlantsData();
  const plants = data.plants || [];

  const index = plants.findIndex((p) => String(p.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Plant not found" });

  const existing = plants[index];

  // keep old image if no new upload
  const imageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : (existing.image || "");

  // partial update (keep old if not sent)
  const name = req.body.name ?? existing.name;
  const category = req.body.category ?? existing.category;
  const description = req.body.description ?? existing.description;

  const price =
    req.body.price === undefined || req.body.price === ""
      ? existing.price
      : Number(req.body.price);

  const stock =
    req.body.stock === undefined || req.body.stock === ""
      ? existing.stock
      : Number(req.body.stock);

  if (!name || String(name).trim().length < 2)
    return res.status(400).json({ message: "Name is required" });

  if (Number.isNaN(price) || price < 0)
    return res.status(400).json({ message: "Price must be a valid number" });

  if (Number.isNaN(stock) || stock < 0)
    return res.status(400).json({ message: "Stock must be a valid number" });

  const updatedPlant = {
    ...existing,
    name: String(name).trim(),
    category: String(category || "").trim(),
    description: String(description || ""),
    price,
    stock,
    image: imageUrl,
  };

  plants[index] = updatedPlant;
  data.plants = plants;
  writePlantsData(data);

  res.json(updatedPlant);
});

// Admin: delete plant (also deletes uploaded file if it exists)
app.delete("/plants/:id", authRequired, adminOnly, (req, res) => {
  const data = readPlantsData();

  const plantToDelete = (data.plants || []).find(
    (p) => String(p.id) === String(req.params.id)
  );

  data.plants = (data.plants || []).filter((p) => String(p.id) !== String(req.params.id));
  writePlantsData(data);

  // delete local uploaded file (best effort)
  if (plantToDelete?.image) {
    try {
      const url = new URL(plantToDelete.image);
      if (url.pathname.startsWith("/uploads/")) {
        const relPath = url.pathname.replace(/^\/+/, ""); // remove leading /
        const filePath = path.join(__dirname, relPath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } catch {
      // ignore
    }
  }

  res.json({ success: true });
});

/* ===================== START ===================== */
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log("Admin ID:", ADMIN_ID);
});
// ===================== ADMIN: MANAGE USERS =====================

// Admin only: list all users (without passwordHash)
app.get("/admin/users", authRequired, adminOnly, (req, res) => {
  const data = readUsersData();
  const users = (data.users || []).map(({ passwordHash, ...safe }) => safe);
  res.json(users);
});

// Admin only: delete a user by id
app.delete("/admin/users/:id", authRequired, adminOnly, (req, res) => {
  const data = readUsersData();
  const before = (data.users || []).length;

  data.users = (data.users || []).filter(
    (u) => String(u.id) !== String(req.params.id)
  );

  const after = data.users.length;
  if (after === before) {
    return res.status(404).json({ message: "User not found" });
  }

  writeUsersData(data);
  res.json({ success: true });
});