/**
 * REST API Client Contract & Configuration
 *
 * Prepared for future Python backend integration (FastAPI / Flask + PostgreSQL).
 * In this demo environment, calls are fulfilled via the local shared reactive store.
 * When backend is connected, set VITE_API_BASE_URL (e.g. http://localhost:8000/api).
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Documentation of planned FastAPI / Flask endpoints:
 * 
 * Authentication:
 * - POST /api/auth/login        -> Token / User session
 * - POST /api/auth/logout       -> Invalidate session
 * - GET  /api/auth/me           -> Current logged in user info
 *
 * Students:
 * - GET   /api/students         -> List students with pagination, search & filters
 * - POST  /api/students         -> Create student record
 * - GET   /api/students/{id}    -> Student profile & historical bills
 * - PATCH /api/students/{id}    -> Update student fields
 * - POST  /api/students/import  -> Bulk CSV parse & insert
 *
 * Products:
 * - GET   /api/products         -> Menu catalog with stock & availability
 * - POST  /api/products         -> Add new dish / item
 * - PATCH /api/products/{id}    -> Update price, name, stock tracking
 *
 * Billing (POS):
 * - POST  /api/bills            -> Transactional bill generation & stock deduction
 * - GET   /api/bills            -> Transactions ledger
 * - GET   /api/bills/{id}       -> Bill detail
 * - POST  /api/bills/{id}/refund-> Process refund
 * - POST  /api/bills/{id}/cancel-> Cancel bill & reverse inventory
 *
 * Analytics & Reports:
 * - GET   /api/reports/dashboard-> Aggregated KPI cards & live figures
 * - GET   /api/reports/sales    -> Date-range trend data
 * - GET   /api/reports/products -> Product volume and revenue rankings
 * - GET   /api/reports/cashiers -> Cashier shift reconciliations
 *
 * Inventory:
 * - GET   /api/inventory        -> Stock ledger
 * - POST  /api/inventory/movements -> Manual adjustment / stock-in
 */
export async function mockApiDelay<T>(result: T, delayMs = 60): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delayMs));
}
