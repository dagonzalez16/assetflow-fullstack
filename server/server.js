const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory Mock Database
let equipmentList = [
  {
    id: 1,
    serialNumber: "EQ-1001",
    model: 'MacBook Pro 16"',
    category: "Laptop",
    status: "Available",
  },
  {
    id: 2,
    serialNumber: "EQ-1002",
    model: "Dell XPS 15",
    category: "Laptop",
    status: "Assigned",
  },
  {
    id: 3,
    serialNumber: "EQ-1003",
    model: 'LG UltraGear 27"',
    category: "Monitor",
    status: "Maintenance",
  },
];

// GET: Fetch all equipment
app.get("/api/equipments", (req, res) => {
  res.status(200).json(equipmentList);
});

// POST: Add new equipment
app.post("/api/equipments", (req, res) => {
  const { serialNumber, model, category, status } = req.body;

  if (!serialNumber || !model) {
    return res
      .status(400)
      .json({ message: "Serial number and model are required." });
  }

  const newEquipment = {
    id: Date.now(),
    serialNumber,
    model,
    category: category || "General",
    status: status || "Available",
  };

  equipmentList.push(newEquipment);
  res.status(201).json(newEquipment);
});

// PUT: Update equipment status or details
app.put("/api/equipments/:id", (req, res) => {
  const { id } = req.params;
  const { serialNumber, model, category, status } = req.body;

  const itemIndex = equipmentList.findIndex((item) => item.id === parseInt(id));

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Equipment not found." });
  }

  equipmentList[itemIndex] = {
    ...equipmentList[itemIndex],
    serialNumber: serialNumber || equipmentList[itemIndex].serialNumber,
    model: model || equipmentList[itemIndex].model,
    category: category || equipmentList[itemIndex].category,
    status: status || equipmentList[itemIndex].status,
  };

  res.status(200).json(equipmentList[itemIndex]);
});

// DELETE: Remove equipment
app.delete("/api/equipments/:id", (req, res) => {
  const { id } = req.params;
  equipmentList = equipmentList.filter((item) => item.id !== parseInt(id));
  res.status(200).json({ message: "Equipment removed successfully." });
});

app.listen(PORT, () => {
  console.log(`AssetFlow API running on http://localhost:${PORT}`);
});
