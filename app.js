const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const DATA_DIR = path.join(__dirname, 'data');
const SAREES_FILE = path.join(DATA_DIR, 'sarees.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// Helpers to read/write JSON safely
function readData(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

function writeData(filePath, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Ensure default sarees exist
function initDefaultData() {
  const existing = readData(SAREES_FILE);
  if (existing.length === 0) {
    const defaults = [
      {
        id: 1,
        name: "Royal Peacock Pure Paithani",
        category: "Paithani",
        price: 8499,
        originalPrice: 11999,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        description: "Handwoven pure silk Paithani with authentic gold zari peacock pallu and rich contrast border.",
        trustBadge: "Silk Mark Certified"
      },
      {
        id: 2,
        name: "Heritage Kanjivaram Bridal Silk",
        category: "Kanjivaram",
        price: 12499,
        originalPrice: 16999,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
        description: "Traditional crimson red pure mulberry silk with korvai gold temple borders.",
        trustBadge: "100% Pure Mulberry Silk"
      },
      {
        id: 3,
        name: "Banarasi Floral Katan Silk",
        category: "Banarasi",
        price: 6999,
        originalPrice: 9499,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
        description: "Classic Varanasi handloom featuring kadwa floral bootas in antique metallic zari.",
        trustBadge: "Handcrafted Zari"
      }
    ];
    writeData(SAREES_FILE, defaults);
  }
}
initDefaultData();

// --- API ENDPOINTS ---

// 1. Sarees
app.get('/api/sarees', (req, res) => {
  res.json(readData(SAREES_FILE));
});

app.post('/api/sarees', (req, res) => {
  const sarees = readData(SAREES_FILE);
  const newSaree = { id: Date.now(), ...req.body };
  sarees.push(newSaree);
  writeData(SAREES_FILE, sarees);
  res.json(newSaree);
});

app.delete('/api/sarees/:id', (req, res) => {
  let sarees = readData(SAREES_FILE);
  sarees = sarees.filter(s => s.id !== Number(req.params.id));
  writeData(SAREES_FILE, sarees);
  res.json({ success: true });
});

// 2. Auth (Users)
app.post('/api/auth/register', (req, res) => {
  const users = readData(USERS_FILE);
  const { name, phone, pass } = req.body;

  if (users.find(u => u.phone === phone)) {
    return res.status(400).json({ error: "Phone number already registered." });
  }

  const newUser = {
    name,
    phone,
    pass,
    isAdmin: pass === "1s0k9j2d",
    flag: "Active",
    joinedDate: new Date().toLocaleDateString('en-IN')
  };

  users.push(newUser);
  writeData(USERS_FILE, users);
  res.json(newUser);
});

app.post('/api/auth/login', (req, res) => {
  const { phone, pass } = req.body;

  // Master Admin Code Bypass
  if (pass === "1s0k9j2d") {
    return res.json({ name: "Owner / Dev", phone: phone || "9322575059", isAdmin: true, flag: "VIP" });
  }

  const users = readData(USERS_FILE);
  const user = users.find(u => u.phone === phone && u.pass === pass);

  if (!user) {
    return res.status(401).json({ error: "Invalid phone number or password." });
  }

  res.json(user);
});

app.get('/api/users', (req, res) => {
  const users = readData(USERS_FILE);
  res.json(users);
});

app.patch('/api/users/:phone/flag', (req, res) => {
  const users = readData(USERS_FILE);
  const user = users.find(u => u.phone === req.params.phone);
  if (user) {
    user.flag = req.body.flag;
    writeData(USERS_FILE, users);
  }
  res.json({ success: true });
});

// 3. Orders
app.get('/api/orders', (req, res) => {
  res.json(readData(ORDERS_FILE));
});

app.get('/api/orders/:id', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const order = orders.find(o => o.id.toUpperCase() === req.params.id.toUpperCase());
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const newOrder = {
    id: `RM-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: req.body.customer.name,
    customerPhone: req.body.customer.phone,
    city: req.body.customer.city,
    pincode: req.body.customer.pincode,
    address: req.body.customer.address,
    items: req.body.items,
    total: req.body.total,
    status: "Placed",
    date: new Date().toLocaleDateString('en-IN')
  };

  orders.push(newOrder);
  writeData(ORDERS_FILE, orders);
  res.json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status;
    writeData(ORDERS_FILE, orders);
  }
  res.json({ success: true });
});

// 4. NEW ANALYTICS ENDPOINT (Aggregates customer data for Excel/Analysis)
app.get('/api/admin/analytics', (req, res) => {
  const users = readData(USERS_FILE);
  const orders = readData(ORDERS_FILE);

  const analytics = users.map(user => {
    const userOrders = orders.filter(o => o.customerPhone === user.phone);
    const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const purchasedCategories = [];

    userOrders.forEach(ord => {
      if (Array.isArray(ord.items)) {
        ord.items.forEach(item => {
          if (item.category && !purchasedCategories.includes(item.category)) {
            purchasedCategories.push(item.category);
          }
        });
      }
    });

    return {
      name: user.name,
      phone: user.phone,
      joinedDate: user.joinedDate || 'N/A',
      flag: user.flag || 'Active',
      totalOrders: userOrders.length,
      totalSpent: totalSpent,
      favoriteCategories: purchasedCategories.join(', ') || 'None'
    };
  });

  res.json(analytics);
});

// Fallback to index.html
app.get('{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rajmata Sarees running at http://localhost:${PORT}`);
});