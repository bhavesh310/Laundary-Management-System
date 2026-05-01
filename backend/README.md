# 🧺 CleanOps — AI Laundry Management System

> A cinematic, production-grade order management system for modern dry-cleaning stores — built AI-first, shipped fast.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-SPA-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude_AI-Assisted-8A2BE2?style=for-the-badge&logo=anthropic&logoColor=white)

---

## Overview

**CleanOps** is not just a CRUD app — it's a complete command center for dry-cleaning operations.

A dark-luxury, single-page application paired with a clean REST API that lets store operators create orders, track garment status in real time, calculate billing automatically, and read daily performance from a live dashboard — all from one screen.

Built entirely within a 72-hour window with AI as a first-class development partner. Every scaffold, fix, and design decision is documented transparently in the AI Usage Report below.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Backend | Node.js 18 + Express 4 | Fast, minimal, zero-overhead API server |
| Storage | In-memory JavaScript array | No setup friction; swap-ready for any DB |
| Frontend | Vanilla HTML / CSS / JS (SPA) | No build step — runs instantly anywhere |
| Typography | Cormorant Garamond + Inter + JetBrains Mono | Editorial, premium, readable |
| API Testing | Postman Collection (included) | One-click import, all endpoints pre-wired |
| AI Tooling | Claude (Anthropic) | Scaffolding, logic, UI generation |

---

## 🚀 Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) >= 16
- npm (bundled with Node)
- Git

### Installation & Run

```bash
# 1 — Clone the repository
git clone https://github.com/YOUR_USERNAME/cleanops-laundry.git
cd cleanops-laundry/backend

# 2 — Install dependencies
npm install

# 3 — Start the server
npm start
# → Server live at http://localhost:3000
```

Open your browser → **`http://localhost:3000`**

> The app boots with **5 pre-seeded demo orders** spread across all statuses so you can
> explore the dashboard, filters, and status updates immediately — no manual setup required.

### Available Scripts

```bash
npm start      # Start production server  → localhost:3000
npm run dev    # Start with nodemon (auto-reload on file changes)
```

---

## ✅ Features Implemented

### Core Features

| Feature | Status | Notes |
|---|---|---|
| Create order — name, phone, garments, qty | ✅ Done | Full input validation |
| Auto-calculate total bill | ✅ Done | Live-reactive in UI |
| Unique Order ID (`CLN-XXXXX-XX`) | ✅ Done | Human-readable, store-friendly format |
| Status flow: RECEIVED → PROCESSING → READY → DELIVERED | ✅ Done | Forward-only business rule enforced |
| Update status with optional note | ✅ Done | Every change logged with timestamp |
| List all orders | ✅ Done | Sorted newest-first |
| Filter by status | ✅ Done | |
| Filter by customer name | ✅ Done | Partial-match search |
| Filter by phone number | ✅ Done | |
| Dashboard — total orders, revenue, per-status counts | ✅ Done | |
| Today's orders & today's revenue | ✅ Done | |
| Price list endpoint | ✅ Done | 12 garment types |
| Delete order | ✅ Done | |

### Bonus Features

| Feature | Status | Notes |
|---|---|---|
| Estimated delivery date | ✅ Done | Auto-calculated from garment count (2–5 days) |
| Search / filter by garment type | ✅ Done | e.g. find all orders containing "saree" |
| Full status history timeline | ✅ Done | Timestamp + note on every transition |
| Top garments chart | ✅ Done | Animated bar on dashboard |
| Printable order receipt | ✅ Done | Modal with print button |
| Premium dark-luxury SPA frontend | ✅ Done | Cinematic UI, zero framework needed |
| 5 demo orders on boot | ✅ Done | Instant exploration, no manual data entry |
| Postman collection | ✅ Done | All 7 endpoints pre-configured |

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/prices` | Garment price list |
| `POST` | `/orders` | Create a new order |
| `GET` | `/orders` | List all orders (supports query filters) |
| `GET` | `/orders/:id` | Single order with full status history |
| `PATCH` | `/orders/:id/status` | Update order status |
| `DELETE` | `/orders/:id` | Delete an order |
| `GET` | `/dashboard` | Live store metrics |

### Create Order — Request Body
```json
{
  "customerName": "Priya Sharma",
  "phoneNumber": "9876543210",
  "garments": [
    { "name": "saree",  "quantity": 2, "pricePerItem": 120 },
    { "name": "kurta",  "quantity": 3, "pricePerItem": 70  },
    { "name": "jacket", "quantity": 1, "pricePerItem": 150 }
  ]
}
```

### Update Status — Request Body
```json
{
  "status": "READY",
  "note": "Stain removed, packed and ready for pickup"
}
```

### Filter Orders — Query Parameters
```
GET /api/orders?status=READY&name=Priya&phone=9876&garment=saree
```

### Dashboard — Sample Response
```json
{
  "totalOrders": 12,
  "totalRevenue": 4850,
  "ordersByStatus": {
    "RECEIVED": 2,
    "PROCESSING": 3,
    "READY": 4,
    "DELIVERED": 3
  },
  "todayOrders": 3,
  "todayRevenue": 1100,
  "topGarments": [
    { "name": "shirt", "count": 18 },
    { "name": "saree", "count": 11 },
    { "name": "kurta", "count": 8  }
  ],
  "recentOrders": [ "...last 5 orders" ]
}
```

---

## 🤖 AI Usage Report

This project was built AI-first. Every tool used, every prompt written, and every correction made is documented here — because knowing *where AI helps and where it fails* is a senior engineering skill in itself.

### Tools Used

| Tool | Role |
|---|---|
| **Claude — Anthropic (claude.ai)** | Primary tool — API scaffolding, validation logic, dashboard aggregation, frontend layout, modal UX, UI components |

---

### Sample Prompts & What Happened

**Prompt 1 — Backend Scaffold**
```
Build a mini laundry order management system with Node.js + Express.
Features: create orders, track status (RECEIVED → PROCESSING → READY → DELIVERED),
calculate billing, dashboard stats. Use in-memory storage. Include garments:
shirt, pants, saree, suit, jacket, kurta, lehenga with hardcoded prices.
Return a unique order ID and total bill on creation.
```

✅ **What AI got right:**
- Express route structure with correct HTTP verbs
- Request body destructuring and basic `if(!field)` null checks
- In-memory array CRUD operations
- Status enum definition and validation

❌ **What I had to fix:**
- AI generated `Math.random().toString(36)` for Order IDs — completely unreadable. Replaced with a branded `CLN-TIMESTAMP-RANDOM` format that staff can read over a phone call
- Status history was not tracked at all. Designed and added the `statusHistory[]` array — every transition stores `{ status, timestamp, note }`
- Bill calculation assumed all items use the hardcoded price and ignored a passed `pricePerItem`. Added the correct fallback: `pricePerItem || PRICES[name] || 50`
- Orders returned in insertion order. Added `.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))` so newest shows first

---

**Prompt 2 — Dashboard Endpoint**
```
Add a GET /api/dashboard endpoint returning: total orders, total revenue,
orders-per-status breakdown, today's order count, today's revenue,
top 5 garments by total quantity across all orders, and the last 5 recent orders.
```

✅ **What AI got right:**
- `reduce()` chain for revenue aggregation
- `Object.entries()` pattern for per-status grouping
- Garment frequency accumulation using an object map

❌ **What I had to fix:**
- AI compared today's date using `new Date().getDate()` — this breaks across month boundaries (e.g. March 31 → April 1 both return `31` and `1`, causing false matches). Replaced with ISO string prefix comparison: `order.createdAt.startsWith(todayStr)`
- Top garments were hardcoded to return only 3 items. Parameterised to `.slice(0, 5)`
- The `recentOrders` field was missing from the AI's response shape entirely — added it manually since the dashboard UI panel requires it

---

**Prompt 3 — Frontend SPA**
```
Build a single-file HTML/CSS/JS SPA for this laundry API.
Dark luxury aesthetic — void black background, gold typography using
Cormorant Garamond + Inter + JetBrains Mono fonts. Four sections:
dashboard with live stats and animated status bars, create-order form
with dynamic garment rows and a live bill total, all-orders table with
filter inputs, price list grid. Include modals for order detail,
status update, and a printable receipt.
```

✅ **What AI got right:**
- Sidebar + main content layout skeleton
- Dynamic garment row injection/removal pattern
- Modal overlay open/close structure
- `fetch()` calls wired to the correct endpoints

❌ **What I had to fix:**
- AI used `<form onsubmit>` tags — caused full-page reloads inside the SPA context. Rewrote all interactions to use `onclick` button handlers
- `syncPrice()` wasn't firing on garment select change — the `onchange` attribute was missing from the generated `<select>`. Rewired all event bindings
- Bill total only recalculated on form submit, not while the user typed. Added `oninput` listeners on every qty/price field for live reactivity
- Status update modal showed all 4 statuses as options, including backwards ones. Wrote `flow.slice(currentIndex + 1)` progression logic so only valid forward transitions appear
- Dashboard stat numbers had no animation — just instant text replacement. Wrote a `countUp()` function using `requestAnimationFrame` for the cinematic number-rolling effect
- No error feedback anywhere. Built a full toast notification system from scratch (success / error variants, auto-dismiss, slide-in animation)
- AI didn't add count-up animations, loading spinners, or page-transition animations. All micro-interactions were added manually

---

### Overall AI Performance Assessment

| Area | AI Performance | My Contribution |
|---|---|---|
| Express route boilerplate | ✅ Excellent | Minor tweaks only |
| Request validation | ✅ Good | Added phone regex, descriptive error messages |
| Bill calculation | ⚠️ Partial | Fixed price override fallback |
| Status flow logic | ⚠️ Basic | Full history array + forward-only rule |
| Dashboard aggregation | ✅ Good | Fixed critical date comparison bug |
| Frontend layout skeleton | ✅ Good | Major reactivity, UX, and animation work |
| Order ID design | ❌ Poor | Fully redesigned to branded readable format |
| Count-up animations | ❌ Missing | Written entirely from scratch |
| Toast / error system | ❌ Missing | Written entirely from scratch |
| Seed / demo data | ❌ Missing | Written manually |

**Verdict:** AI compressed roughly 60% of development time by generating boilerplate and structure at speed. The remaining 40% — correctness under edge cases, UX quality, animation, and the premium feel — required human judgment and hands-on iteration. The most valuable skill demonstrated here is knowing exactly *where* to trust AI output and *where* to override it immediately.

---

## ⚖️ Tradeoffs

### What I Skipped (Time Constraints)

| Skipped | Reason | What I'd Use |
|---|---|---|
| Authentication / login | Outside 72-hr scope | JWT + bcrypt, admin vs staff roles |
| Persistent database | Adds setup complexity | MongoDB + Mongoose or PostgreSQL + Prisma |
| Deployment | Focus on code quality first | Railway or Render (zero-config Node.js hosting) |
| Input sanitisation | Basic validation only | `express-validator` + DOMPurify on the frontend |
| Unit & integration tests | Time constraint | Jest + Supertest for all API routes |
| Rate limiting | Not needed for local demo | `express-rate-limit` middleware |

### What I'd Improve With More Time

1. **Persistent Database** — Replace in-memory array with MongoDB or PostgreSQL. Data survives restarts. Mongoose for schema definitions, Prisma for migrations
2. **JWT Authentication** — Login screen, session tokens, role-based access (admin can delete & refund; staff can only update status)
3. **SMS Notifications via Twilio** — Auto-text the customer when their order moves to `READY` — removes the need for manual phone calls entirely
4. **Revenue Analytics Chart** — 7-day or 30-day revenue trend line rendered on a Canvas. Visualise peak days and slow periods at a glance
5. **Bulk Status Update** — Checkbox-select multiple orders and move them all to `PROCESSING` in one click — essential time-saver for high-volume store mornings
6. **Customer Self-Tracking Portal** — Public page where customers type their phone number and see their order status live — no login, no friction
7. **PWA / Mobile App Shell** — `manifest.json` + service worker so the app installs on staff phones and works offline for basic lookups
8. **Smarter Delivery ETA** — Factor in the current queue depth (orders already in PROCESSING), not just item count, for a more accurate estimated delivery date

---

## 🗂 Project Structure

```
cleanops-laundry/
│
├── backend/
│   ├── server.js                      # Express app — all routes, business logic, seed data
│   └── package.json
│
├── frontend/
│ └── public/
│ ├── index.html # Main UI
│ ├── script.js # Frontend logic
│ └── style.css # Styling
│
├── CleanOps.postman_collection.json   # Import into Postman — all 7 endpoints ready
├── .gitignore
└── README.md
```

> **Why single-file frontend?** Zero build step. Any recruiter, reviewer, or store owner
> can clone and run `npm start` — no Webpack, no Vite, no `npm run build`.
> Working in under 30 seconds from a cold clone.

---

## 📮 API Testing — Postman

Import `CleanOps.postman_collection.json` into Postman.

All 7 endpoints are pre-configured with:
- Correct HTTP methods and base URLs
- Sample JSON request bodies ready to send
- Query parameter examples with filters pre-filled
- `{{base_url}}` variable → `http://localhost:3000/api`
- `{{order_id}}` variable — paste any ID from a create response to instantly test GET / PATCH / DELETE

---

## Design System

**Typography** (Google Fonts)

| Font | Usage |
|---|---|
| `Cormorant Garamond` | Hero numbers, page headings, bill totals — editorial weight |
| `Inter` | Body copy, form labels, navigation — clean legibility |
| `JetBrains Mono` | Order IDs, timestamps, status labels, API metadata — precision data |

**Colour Palette**

```css
--void:    #06060a    /* Page background — true black          */
--surface: #111118    /* Card and panel surfaces               */
--gold:    #c8a96e    /* Primary accent — luxury amber gold    */
--gold2:   #e2c98a    /* Gold highlight / amounts              */
--jade:    #3ecfb2    /* READY status, success states          */
--rose:    #f06080    /* Error states, delete actions          */
--sky:     #5ab4ff    /* RECEIVED status                       */
--amber:   #f0a040    /* PROCESSING status                     */
--ink:     #f2ede4    /* Primary text                          */
--ink3:    #5c5750    /* Muted labels and metadata             */
```

---

## Author

**Bhavesh Ghatode** — Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/bhavesh-kumar-4466a3276/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/bhavesh310)

---

<p align="center">
  <i>Orders are not just data. They're someone's favourite suit.</i>
</p>
