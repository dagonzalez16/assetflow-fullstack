import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/equipments"; // Change to live URL after deploy

export default function AssetFlowApp() {
  const [equipments, setEquipments] = useState([]);
  const [formData, setFormData] = useState({
    serialNumber: "",
    model: "",
    category: "Laptop",
    status: "Available",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEquipments(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({
          serialNumber: "",
          model: "",
          category: "Laptop",
          status: "Available",
        });
        fetchEquipments();
      }
    } catch (err) {
      console.error("Error creating equipment:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) fetchEquipments();
    } catch (err) {
      console.error("Error deleting equipment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold text-indigo-400">
            AssetFlow Inventory
          </h1>
          <p className="text-slate-400 text-sm">
            Hardware & Equipment Management System
          </p>
        </header>

        {/* Add Equipment Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <input
            type="text"
            placeholder="Serial Number (e.g. EQ-1004)"
            value={formData.serialNumber}
            onChange={(e) =>
              setFormData({ ...formData, serialNumber: e.target.value })
            }
            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Model / Description"
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            required
          />
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 font-semibold rounded px-4 py-2 text-sm transition"
          >
            + Add Asset
          </button>
        </form>

        {/* Equipment Table */}
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-700/50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-4">Serial</th>
                <th className="p-4">Model</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    Loading inventory...
                  </td>
                </tr>
              ) : (
                equipments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30">
                    <td className="p-4 font-mono text-indigo-300">
                      {item.serialNumber}
                    </td>
                    <td className="p-4 font-medium">{item.model}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === "Available"
                            ? "bg-emerald-900/60 text-emerald-400"
                            : item.status === "Assigned"
                              ? "bg-blue-900/60 text-blue-400"
                              : "bg-amber-900/60 text-amber-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
