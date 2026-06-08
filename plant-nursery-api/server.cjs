const express = require("express");
const cors = require("cors");
const plants = require("./plants.json");

const app = express();
app.use(cors());
app.use(express.json());

// GET all plants
app.get("/api/plants", (req, res) => {
  res.json(plants);
});

// GET plant by ID
app.get("/api/plants/:id", (req, res) => {
  const plant = plants.find(p => p.id === Number(req.params.id));
  plant ? res.json(plant) : res.status(404).json({ message: "Plant not found" });
});

// GET plants by category
app.get("/api/category/:category", (req, res) => {
  const filtered = plants.filter(
    p => p.category.toLowerCase() === req.params.category.toLowerCase()
  );
  res.json(filtered);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
