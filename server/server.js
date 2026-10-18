require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const equipmentSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    category: { type: String, default: "General" },
    status: {
      type: String,
      enum: ["Available", "Assigned", "Maintenance"],
      default: "Available",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        // Conserva el campo "id" que ya utiliza la interfaz.
        result.id = result._id.toString();
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  }
);

const Equipment = mongoose.model("Equipment", equipmentSchema);

function equipmentFields(body) {
  const fields = {};

  for (const key of ["serialNumber", "model", "category", "status"]) {
    if (body[key] !== undefined) {
      fields[key] = body[key];
    }
  }

  return fields;
}

// Comprobar los identificadores antes de consultar MongoDB.
app.param("id", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ message: "Identificador inválido." });
  }

  next();
});

// Consultar equipos.
app.get("/api/equipments", async (req, res) => {
  const equipments = await Equipment.find().sort({ createdAt: -1 });
  res.json(equipments);
});

// Agregar un equipo.
app.post("/api/equipments", async (req, res) => {
  const equipment = await Equipment.create(equipmentFields(req.body));
  res.status(201).json(equipment);
});

// Actualizar un equipo.
app.put("/api/equipments/:id", async (req, res) => {
  const equipment = await Equipment.findByIdAndUpdate(
    req.params.id,
    { $set: equipmentFields(req.body) },
    { new: true, runValidators: true }
  );

  if (!equipment) {
    return res.status(404).json({ message: "Equipo no encontrado." });
  }

  res.json(equipment);
});

// Eliminar un equipo.
app.delete("/api/equipments/:id", async (req, res) => {
  const equipment = await Equipment.findByIdAndDelete(req.params.id);

  if (!equipment) {
    return res.status(404).json({ message: "Equipo no encontrado." });
  }

  res.json({ message: "Equipo eliminado." });
});

// Manejar errores de las rutas.
app.use((error, req, res, next) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Revisa los datos del equipo." });
  }

  console.error("Error en la API:", error.message);
  res.status(500).json({ message: "Error interno del servidor." });
});

// Iniciar la API solo cuando MongoDB esté conectado.
async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("Falta configurar MONGODB_URI en el archivo .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB conectado");

    app.listen(PORT, () => {
      console.log(`AssetFlow API running on http://localhost:${PORT}`);
    });
  } catch {
    console.error(
      "No se pudo conectar a MongoDB. Revisa la URI, las credenciales y la IP autorizada."
    );
    process.exit(1);
  }
}

start();