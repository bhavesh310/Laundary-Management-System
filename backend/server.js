/**
 * 🧺 CleanTrack - Laundry Order Management System
 * Backend API Server
 * Built with Express.js + In-Memory Storage
 */

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ─── In-Memory Store ──────────────────────────────────────────────────────────
let orders = [];

// ─── Config: Price List ───────────────────────────────────────────────────────
const PRICE_LIST = {
  shirt: 50,
  pants: 60,
  saree: 120,
  suit: 200,
  jacket: 150,
  dress: 100,
  kurta: 70,
  lehenga: 250,
  bedsheet: 80,
  curtain: 90,
  blanket: 130,
  towel: 30,
};

// ─── Status Enum ──────────────────────────────────────────────────────────────
const VALID_STATUSES = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateOrderId() {
  const prefix = "CLN";
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `${prefix}-${timestamp}-${random}`;
}

function calculateEstimatedDelivery(garments) {
  const totalItems = garments.reduce((sum, g) => sum + g.quantity, 0);
  const daysNeeded = totalItems <= 5 ? 2 : totalItems <= 10 ? 3 : 5;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + daysNeeded);
  return deliveryDate.toISOString().split("T")[0];
}

function calculateBill(garments) {
  return garments.reduce((total, garment) => {
    const price =
      garment.pricePerItem ||
      PRICE_LIST[garment.name.toLowerCase()] ||
      50;
    return total + price * garment.quantity;
  }, 0);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/prices - Get price list
app.get("/api/prices", (req, res) => {
  res.json({ success: true, prices: PRICE_LIST });
});

// POST /api/orders - Create new order
app.post("/api/orders", (req, res) => {
  const { customerName, phoneNumber, garments } = req.body;

  // Validation
  if (!customerName || !customerName.trim()) {
    return res
      .status(400)
      .json({ success: false, error: "Customer name is required" });
  }
  if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber.replace(/\s/g, ""))) {
    return res
      .status(400)
      .json({ success: false, error: "Valid 10-digit phone number required" });
  }
  if (!garments || !Array.isArray(garments) || garments.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: "At least one garment is required" });
  }

  // Validate each garment
  for (const g of garments) {
    if (!g.name || !g.quantity || g.quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "Each garment needs a name and quantity >= 1",
      });
    }
  }

  const totalAmount = calculateBill(garments);
  const estimatedDelivery = calculateEstimatedDelivery(garments);

  const order = {
    id: generateOrderId(),
    customerName: customerName.trim(),
    phoneNumber: phoneNumber.replace(/\s/g, ""),
    garments: garments.map((g) => ({
      name: g.name,
      quantity: parseInt(g.quantity),
      pricePerItem:
        g.pricePerItem || PRICE_LIST[g.name.toLowerCase()] || 50,
    })),
    totalAmount,
    estimatedDelivery,
    status: "RECEIVED",
    statusHistory: [
      {
        status: "RECEIVED",
        timestamp: new Date().toISOString(),
        note: "Order placed",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(order);

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    order,
  });
});

// GET /api/orders - List all orders with filters
app.get("/api/orders", (req, res) => {
  let filtered = [...orders];
  const { status, name, phone, garment } = req.query;

  if (status) {
    filtered = filtered.filter(
      (o) => o.status.toUpperCase() === status.toUpperCase()
    );
  }
  if (name) {
    filtered = filtered.filter((o) =>
      o.customerName.toLowerCase().includes(name.toLowerCase())
    );
  }
  if (phone) {
    filtered = filtered.filter((o) => o.phoneNumber.includes(phone));
  }
  if (garment) {
    filtered = filtered.filter((o) =>
      o.garments.some((g) =>
        g.name.toLowerCase().includes(garment.toLowerCase())
      )
    );
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    total: filtered.length,
    orders: filtered,
  });
});

// GET /api/orders/:id - Get single order
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }
  res.json({ success: true, order });
});

// PATCH /api/orders/:id/status - Update order status
app.patch("/api/orders/:id/status", (req, res) => {
  const { status, note } = req.body;

  if (!status || !VALID_STATUSES.includes(status.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  // Prevent backward status (optional business rule)
  const currentIdx = VALID_STATUSES.indexOf(order.status);
  const newIdx = VALID_STATUSES.indexOf(status.toUpperCase());
  if (newIdx < currentIdx) {
    return res.status(400).json({
      success: false,
      error: `Cannot move order back from ${order.status} to ${status.toUpperCase()}`,
    });
  }

  order.status = status.toUpperCase();
  order.updatedAt = new Date().toISOString();
  order.statusHistory.push({
    status: status.toUpperCase(),
    timestamp: new Date().toISOString(),
    note: note || "",
  });

  res.json({
    success: true,
    message: `Order status updated to ${order.status}`,
    order,
  });
});

// DELETE /api/orders/:id - Delete an order
app.delete("/api/orders/:id", (req, res) => {
  const index = orders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }
  orders.splice(index, 1);
  res.json({ success: true, message: "Order deleted" });
});

// GET /api/dashboard - Dashboard stats
app.get("/api/dashboard", (req, res) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const ordersByStatus = VALID_STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  const todayStr = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Top garments
  const garmentCount = {};
  orders.forEach((o) =>
    o.garments.forEach((g) => {
      garmentCount[g.name] = (garmentCount[g.name] || 0) + g.quantity;
    })
  );
  const topGarments = Object.entries(garmentCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  res.json({
    success: true,
    dashboard: {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      todayOrders: todayOrders.length,
      todayRevenue,
      topGarments,
      recentOrders,
    },
  });
});

// ─── Seed Data (demo) ─────────────────────────────────────────────────────────
function seedData() {
  const sampleOrders = [
    {
      customerName: "Rajesh Kumar",
      phoneNumber: "9876543210",
      garments: [
        { name: "Shirt", quantity: 3, pricePerItem: 50 },
        { name: "Pants", quantity: 2, pricePerItem: 60 },
      ],
      status: "DELIVERED",
    },
    {
      customerName: "Priya Sharma",
      phoneNumber: "8765432109",
      garments: [
        { name: "Saree", quantity: 2, pricePerItem: 120 },
        { name: "Blouse", quantity: 1, pricePerItem: 50 },
      ],
      status: "READY",
    },
    {
      customerName: "Amit Patel",
      phoneNumber: "7654321098",
      garments: [
        { name: "Suit", quantity: 1, pricePerItem: 200 },
        { name: "Shirt", quantity: 5, pricePerItem: 50 },
      ],
      status: "PROCESSING",
    },
    {
      customerName: "Sunita Verma",
      phoneNumber: "6543210987",
      garments: [
        { name: "Lehenga", quantity: 1, pricePerItem: 250 },
        { name: "Kurta", quantity: 2, pricePerItem: 70 },
      ],
      status: "RECEIVED",
    },
    {
      customerName: "Vikram Singh",
      phoneNumber: "9123456780",
      garments: [
        { name: "Jacket", quantity: 2, pricePerItem: 150 },
        { name: "Pants", quantity: 3, pricePerItem: 60 },
      ],
      status: "PROCESSING",
    },
  ];

  sampleOrders.forEach((data) => {
    const totalAmount = calculateBill(data.garments);
    const order = {
      id: generateOrderId(),
      customerName: data.customerName,
      phoneNumber: data.phoneNumber,
      garments: data.garments,
      totalAmount,
      estimatedDelivery: calculateEstimatedDelivery(data.garments),
      status: data.status,
      statusHistory: [
        {
          status: "RECEIVED",
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          note: "Order placed",
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(order);
  });

  console.log(`✅ Seeded ${sampleOrders.length} demo orders`);
}

// ─── Start Server ─────────────────────────────────────────────────────────────
seedData();
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🧺  CleanOps AI API Server          ║
  ║   Running on http://localhost:${PORT}   ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
