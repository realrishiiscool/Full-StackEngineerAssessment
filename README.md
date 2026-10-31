# Maintenance Work Order Management System

A full-stack application for managing maintenance work orders, assets, and technicians.

## Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| **Backend**  | Node.js, Express, Sequelize ORM     |
| **Database** | MySQL 8.x                           |
| **Frontend** | React 18, Vite, Tailwind CSS        |

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.x running on localhost:3306

### 1. Backend

```bash
cd backend
npm install
```

Configure `backend/.env` for the MySQL instance:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=maintenance_db
DB_USER=root
DB_PASSWORD=your_mysql_password
SEED_DEMO_DATA=true
```

On backend startup, the app creates the configured database if it is missing, syncs the Sequelize models into tables, and adds any missing demo assets, technicians, and work orders. Existing records are preserved. Demo seeding defaults on outside production; set `SEED_DEMO_DATA=false` to disable it, or explicitly set it to `true` in production if demo rows are desired. Restart the backend after changing `.env`.

You can also run `npm run seed` to safely add any missing demo rows later. It no longer drops or resets tables.

Start the server:
```bash
npm run dev
```

Backend runs at **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## API Endpoints

### Assets
| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| POST   | `/api/assets`                | Create an asset          |
| GET    | `/api/assets`                | List assets (filterable) |
| GET    | `/api/assets/:id`            | Get asset by ID          |
| PUT    | `/api/assets/:id`            | Update asset             |
| GET    | `/api/assets/:id/work-orders`| Maintenance history      |

### Technicians
| Method | Endpoint               | Description                |
|--------|------------------------|----------------------------|
| POST   | `/api/technicians`     | Create a technician        |
| GET    | `/api/technicians`     | List technicians (filterable) |
| GET    | `/api/technicians/:id` | Get technician by ID       |
| PUT    | `/api/technicians/:id` | Update technician          |

### Work Orders
| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| POST   | `/api/work-orders`              | Create work order            |
| GET    | `/api/work-orders`              | List/search/filter work orders (paginated) |
| GET    | `/api/work-orders/:id`          | Get work order by ID         |
| PUT    | `/api/work-orders/:id`          | Update work order            |
| PATCH  | `/api/work-orders/:id/status`   | Update status only           |

---

## Business Rules

1. **Unique Work Order** — `workOrderNumber` must be unique
2. **Critical Work** — CRITICAL priority requires an assigned technician
3. **Completed → OPEN blocked** — Completed work orders cannot revert to Open
4. **Cancelled is terminal** — Cancelled orders cannot move to IN_PROGRESS
5. **No past schedule** — New work orders cannot have a `scheduledDate` in the past
6. **OUT_OF_SERVICE guard** — Out-of-service assets only accept EMERGENCY work orders

The API accepts both `assetId` / `technicianId` and the assessment's `asset_id` / `technician_id` query parameters. Work-order search is available with `q`.

Status changes are recorded in `work_order_history` and returned as `statusHistory` on work-order detail responses. Existing work orders are not given invented transition records; their historical transitions cannot be reconstructed from the original three-table database.

## Work Order State Machine

```
OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
  ↓        ↓
CANCELLED  CANCELLED
```

---

## Project Structure

```
├── backend/
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── index.js              # Express server entry
│       ├── database.js           # Sequelize + MySQL config
│       ├── models/
│       │   ├── index.js          # Associations
│       │   ├── Asset.js
│       │   ├── Technician.js
│       │   └── WorkOrder.js
│       ├── routes/
│       │   ├── assets.js
│       │   ├── technicians.js
│       │   └── workOrders.js
│       ├── middleware/
│       │   └── errorHandler.js
│       ├── validators/
│       │   └── businessRules.js  # All 6 rules enforced
│       └── seeders/
│           └── seed.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx               # Routes
        ├── api/                  # Axios service layer
        ├── components/           # Layout, StatusBadge, Modal, Pagination
        └── pages/
            ├── Dashboard.jsx
            ├── assets/
            ├── technicians/
            └── work-orders/
```
"# Full-StackEngineerAssessment" 
