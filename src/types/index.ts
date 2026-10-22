export type UserRole = 'admin' | 'cashier' | 'student';

export type FacilityCategory =
  | "Men's Hostel"
  | "Men's Mess"
  | "Women's Mess"
  | "Men's PG"
  | "Women's Hostel / PG"
  | "General / Central";

export type CashierDesignation =
  | "Men's Hostel Cashier"
  | "Men's Mess Cashier"
  | "Women's Mess Cashier"
  | "System Administrator"
  | "Counter Cashier";

export type GenderCategory = 'Men' | 'Women' | 'Co-ed';

export interface User {
  id: string; // Editable & customizable User ID (e.g. "USR-001", "MENS-HOSTEL-01", "STU-001")
  username: string; // Editable & customizable username (e.g. "admin", "mens_cashier", "stu-001")
  name: string;
  role: UserRole;
  category?: FacilityCategory | string; // e.g. "Men's Hostel", "Men's Mess", "Women's Mess", "Men's PG"
  designation?: CashierDesignation | string; // e.g. "Men's Hostel Cashier", "Men's Mess Cashier", "Women's Mess Cashier"
  genderCategory?: GenderCategory; // "Men" | "Women" | "Co-ed"
  email: string;
  phone: string;
  active: boolean;
  lastLogin: string;
  avatar?: string;
  permissions: string[];
}

export type StudentStatus = 'active' | 'inactive' | 'suspended';

export interface Student {
  id: string; // e.g. "STU-001" to "STU-500"
  name: string;
  department: string;
  year: number; // 1, 2, 3, 4
  roomNumber: string;
  hostelBlock: string; // "Block A", "Block B", "Block C", "Block D"
  category?: string; // "Men's Hostel", "Men's Mess", "Women's Mess", "Men's PG"
  phone: string;
  email: string;
  password?: string; // Optional custom student portal password (defaults to phone number)
  isFirstLoginDone?: boolean; // Set to true after first-time activation
  status: StudentStatus;
  creditLimit: number;
  monthlySpending: number;
  totalSpending: number;
  pendingBalance: number;
  balance: number; // alias for pendingBalance
  createdAt: string;
  billsCount?: number;
  barcode?: string;
}

export interface StudentPayment {
  id: string;
  paymentNumber: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'qr';
  transactionRef: string;
  timestamp: string;
  previousBalance: number;
  remainingBalance: number;
  status: 'success' | 'failed';
  notes?: string;
}

export type ProductCategory =
  | 'Breakfast & Tiffin'
  | 'Lunch & Dinner'
  | 'Snacks & Quick Bites'
  | 'Beverages & Dairy'
  | 'Desserts & Sweets'
  | 'Eggs & Extras'
  | 'Meals & Thali'
  | string;

export type MeasurementType = 'weight' | 'pieces' | 'eggs' | 'cups' | 'servings';

export interface ServingConversion {
  portionLabel: string;
  multiplier: number;
  displayUnit: string;
}

export type MealSlot = 'morning' | 'afternoon' | 'evening' | 'all_day';

export interface MealSlotTime {
  name: string;
  tamilName: string;
  startTime: string; // "06:30"
  endTime: string;   // "11:30"
  enabled: boolean;
}

export interface MealScheduleSettings {
  morning: MealSlotTime;
  afternoon: MealSlotTime;
  evening: MealSlotTime;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  mealSlot?: MealSlot;
  imageUrl?: string;
  price: number;
  costPrice: number;
  unit: string; // 'Plate', 'Cup', 'Piece', 'Glass', 'Bowl', 'Serving'
  isStockTracked: boolean;
  stockQuantity: number;
  minStockThreshold: number;
  isAvailable: boolean;
  imageEmoji?: string;
  description?: string;
  updatedAt: string;
}

export interface BillItem {
  productId: string;
  productName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  total: number;
  unit?: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'hostel_credit';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface Bill {
  id: string;
  billNumber: string; // e.g. "BILL-2026-0001"
  studentId: string;
  studentName: string;
  studentDepartment: string;
  studentRoom: string;
  studentBlock?: string;
  cashierId: string;
  cashierName: string;
  timestamp: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  paymentRef?: string;
  mealSlot?: MealSlot;
  status: 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  refundedAt?: string;
  refundedBy?: string;
  refundReason?: string;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  startTime?: string;
  endTime?: string;
  status: 'open' | 'closed';
  openingFloat: number;
  openingCash?: number;
  cashInflow: number;
  cashReceived?: number;
  upiInflow: number;
  upiReceived?: number;
  creditInflow: number;
  refunds?: number;
  totalSales: number;
  billsCount: number;
  closingCashCounted?: number;
  actualClosingCash?: number;
  expectedClosingCash?: number;
  cashVariance?: number;
  difference?: number;
  notes?: string;
}

export type StockMovementType = 'in' | 'out' | 'wastage' | 'adjustment' | 'sale';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  createdBy?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  recordId: string;
  description: string;
  reason?: string;
}

export type CouncilCategory = 'A' | 'B' | 'C' | 'D';

export interface MessSettings {
  messName: string;
  instituteName: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  gstin?: string;
  currency: string;
  currencySymbol: string;
  creditAllowed: boolean;
  maxCreditLimit: number;
  allowDiscounts: boolean;
  maxDiscountPercent: number;
  lowStockAlertThreshold: number;
  printHeaderNote: string;
  printFooterNote: string;
  receiptHeader?: string;
  receiptFooter?: string;
  timezone?: string;
  billPrefix?: string;
  allowNegativeStock?: boolean;
  paymentMethods?: {
    cash: boolean;
    upi: boolean;
    hostel_credit: boolean;
    credit?: boolean;
  };
  categories: string[];
  mealSchedule?: MealScheduleSettings;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export interface AppState {
  users: User[];
  currentUser: User;
  students: Student[];
  products: Product[];
  bills: Bill[];
  shifts: Shift[];
  activeShift?: Shift | null;
  stockMovements: StockMovement[];
  auditLogs: AuditLog[];
  settings: MessSettings;
  studentPayments: StudentPayment[];
}
