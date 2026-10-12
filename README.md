# Hostel Mess Management & Smart Billing System

A high-performance, enterprise-grade React TypeScript web application for hostel mess administrators and cashiers serving ~500 students.

## 🚀 Key Features

1. **Ultra-Fast Point of Sale (POS) Billing**
   - Instant student lookup by ID (`STU-001`), name, room, or optical smart card/barcode scan.
   - Quick dish selection cards with live inventory availability checks.
   - Dynamic cart calculation with discounts, line totals, and payment modes (UPI / Cash / Hostel Credit).
   - Generates authentic printable thermal tax invoices & receipts.
   - Keyboard-friendly shortcuts (`[F2]` to focus student search).

2. **Unified Mock Data & LocalStorage Persistence**
   - Single source of truth containing 500 unique students with realistic names, departments, years, and room allocations.
   - 24 realistic hostel mess menu products (Thalis, Dosas, Idlis, Maggi, Snacks, Beverages, Chai, Coffee).
   - Cohesive transaction history where every new POS bill updates dashboard revenue KPIs, product popularity rankings, student purchase statements, cashier shift drawer balances, and immutable audit logs.
   - Safe `localStorage` caching with one-click **"Reset Demo Data"** to restore initial seed.

3. **Student Directory & Detailed Profiles**
   - Multi-filtering by Department, Academic Year, Room, Block, and Account Status.
   - Detailed ledger profile with favorite items, monthly spend trends, and exportable purchase statements.
   - Add/edit resident forms and Bulk CSV import with duplicate ID detection.

4. **Product Catalog & Finished Food Inventory**
   - Catalog management with selling price, cost price, and margins.
   - Tracked finished stock with low-stock warnings, manual Stock-In/Stock-Out, and wastage logging.
   - Product price changes maintain historical bill prices (sale-time pricing integrity).

5. **Cashier Shifts & Payment Reconciliation**
   - Opening cash float recording, cash inflows, and closing drawer count audits.
   - Discrepancy/variance detection between expected drawer cash and counted cash.
   - Daily Payment Reconciliation closing balance sheet with printable supervisor sign-off format.

6. **Immutable Audit Trail**
   - Read-only audit log stream logging bill creation, price adjustments, shift closures, refunds, and cancellations.

---

## 🔑 Demo Login Accounts

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **Administrator** | Dr. R. Ramanathan (Mess Warden) &middot; Full access to all 12 modules |
| `cashier1` | `cashier123` | **Cashier** | Ramesh Kumar (Morning Shift) &middot; High-speed POS billing &amp; shift drawer |
| `cashier2` | `cashier123` | **Cashier** | Suresh Patil (Evening Shift) &middot; Dinner rush POS billing &amp; drawer balance |

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (Vite bundler)
- **Styling**: Tailwind CSS v4 (enterprise navy &amp; blue enterprise palette)
- **Routing**: React Router v7 (`react-router-dom`)
- **Charts**: Recharts (Revenue curves, category shares, monthly spending bars)
- **Icons**: Lucide React
- **Data Persistence**: Versioned LocalStorage with automatic fallback

---

## 🐍 Future Python Backend Integration (FastAPI / PostgreSQL)

This frontend demo is architected to transition into a production REST client without modifying UI components. The service contracts in `src/services/apiClient.ts` map directly to the planned FastAPI routes:

### Authentication
- `POST /api/auth/login` &rarr; Authenticates user and returns JWT access token.
- `GET /api/auth/me` &rarr; Retrieves user profile and permissions.

### Students
- `GET /api/students` &rarr; Paginated query with search, filter, and sorting.
- `POST /api/students` &rarr; Registers student with unique constraint on `student_id`.
- `GET /api/students/{id}` &rarr; Returns student profile with aggregated spend statistics.
- `POST /api/students/import` &rarr; Bulk CSV ingestion with transaction rollback on error.

### Products & Inventory
- `GET /api/products` &rarr; Retrieves catalog with current stock quantities.
- `PATCH /api/products/{id}` &rarr; Updates selling price and logs an audit log record.
- `POST /api/inventory/movements` &rarr; Records stock receipt, wastage, or manual adjustments.

### Billing & Transactions
- `POST /api/bills` &rarr; Transactional POS checkout:
  - Validates active student status and sufficient stock.
  - Locks product rows and deducts quantities atomically.
  - Stores sale-time unit price in `bill_items`.
  - Appends to cashier active shift balance.
- `POST /api/bills/{id}/cancel` &rarr; Cancels bill and restores inventory.
- `POST /api/bills/{id}/refund` &rarr; Records auditable refund with mandatory reason.

---

## 💻 Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
The application runs at `http://localhost:3000`.
