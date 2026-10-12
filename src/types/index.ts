export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  active: boolean;
  lastLogin: string;
  avatar?: string;
  permissions: string[];
}

export type StudentStatus = 'active' | 'inactive' | 'suspended';

export interface Student {
  id: string; // STU-001 ... STU-500
  name: string;
  department: string;
  year: number; // 1, 2, 3, 4
  roomNumber: string; // e.g. A-204, B-112
  hostelBlock: string; // A, B, C, D
  phone: string;
  email: string;
  status: StudentStatus;
  barcode: string;
  creditLimit: number;
  monthlySpending: number;
  totalSpending: number;
  billsCount: number;
  createdAt: string;
}

export type ProductCategory = 
  | 'Meals & Thali'
  | 'Breakfast & Tiffin'
  | 'Snacks & Quick Bites'
  | 'Beverages'
  | 'Extras & Breads'
  | 'Desserts';

export interface Product {
  id: string; // PRD-101
  code: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  isStockTracked: boolean;
  stockQuantity: number;
  minStockThreshold: number;
  isAvailable: boolean;
  unit: string; // plate, cup, pcs, bottle
  imageEmoji?: string;
  description?: string;
  updatedAt: string;
}

export interface BillItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unitPrice: number; // Sale-time unit price
  quantity: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'hostel_credit';
export type PaymentStatus = 'paid' | 'pending';
export type BillStatus = 'completed' | 'cancelled' | 'refunded';

export interface Bill {
  id: string; // BILL-2026-XXXX
  billNumber: string;
  studentId: string;
  studentName: string;
  studentDepartment: string;
  studentRoom: string;
  cashierId: string;
  cashierName: string;
  timestamp: string; // ISO 8601
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BillStatus;
  refundReason?: string;
  cancelledAt?: string;
  notes?: string;
}

export type StockMovementType = 'in' | 'out' | 'sale' | 'wastage' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  createdBy: string;
}

export type ShiftStatus = 'open' | 'closed';

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  cashReceived: number;
  upiReceived: number;
  creditReceived: number;
  refunds: number;
  expectedClosingCash: number;
  actualClosingCash?: number;
  difference?: number;
  status: ShiftStatus;
  billsCount: number;
  notes?: string;
}

export type AuditEntity = 'bill' | 'student' | 'product' | 'inventory' | 'shift' | 'user' | 'settings' | 'auth';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: AuditEntity;
  recordId: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface MessSettings {
  messName: string;
  instituteName: string;
  address: string;
  phone: string;
  email: string;
  gstin?: string;
  receiptHeader: string;
  receiptFooter: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  billPrefix: string;
  allowNegativeStock: boolean;
  maxDiscountPercent: number;
  categories: ProductCategory[];
  paymentMethods: {
    cash: boolean;
    upi: boolean;
    hostel_credit: boolean;
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
