import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  Product,
  Bill,
  User,
  Shift,
  StockMovement,
  AuditLog,
  MessSettings,
  BillItem,
  PaymentMethod,
  PaymentStatus,
  ToastMessage,
  StockMovementType,
} from '../types';
import {
  AppState,
  initialAppState,
  saveStateToStorage,
  resetStateToInitial,
} from './demoStore';

interface CreateBillParams {
  studentId: string;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  discount?: number;
  notes?: string;
}

interface BulkImportResult {
  success: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

interface MessContextType {
  state: AppState;
  currentUser: User;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  login: (username: string, role?: string) => boolean;
  logout: () => void;
  // Billing
  createBill: (params: CreateBillParams) => { success: boolean; bill?: Bill; error?: string };
  cancelBill: (billId: string, reason: string) => { success: boolean; error?: string };
  refundBill: (billId: string, reason: string) => { success: boolean; error?: string };
  // Students
  addStudent: (student: Omit<Student, 'monthlySpending' | 'totalSpending' | 'billsCount' | 'createdAt'>) => { success: boolean; error?: string };
  updateStudent: (id: string, updates: Partial<Student>) => { success: boolean; error?: string };
  toggleStudentStatus: (id: string) => void;
  bulkImportStudents: (students: Partial<Student>[]) => BulkImportResult;
  // Products
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => { success: boolean; product?: Product; error?: string };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; error?: string };
  toggleProductAvailability: (id: string) => void;
  // Inventory
  adjustStock: (productId: string, type: StockMovementType, quantity: number, reason: string) => { success: boolean; error?: string };
  // Shifts
  startShift: (openingCash: number) => { success: boolean; shift?: Shift; error?: string };
  closeShift: (shiftId: string, actualClosingCash: number, notes?: string) => { success: boolean; error?: string };
  // Settings & Users
  updateSettings: (settings: MessSettings) => void;
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => { success: boolean; error?: string };
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  resetDemoData: () => void;
}

const MessContext = createContext<MessContextType | undefined>(undefined);

export const MessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialAppState);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Keep state synced with localStorage
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const logAudit = useCallback(
    (
      action: string,
      entityType: AuditLog['entityType'],
      recordId: string,
      description: string,
      metadata?: Record<string, any>
    ) => {
      const newLog: AuditLog = {
        id: `AUD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        timestamp: new Date().toISOString(),
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userRole: state.currentUser.role,
        action,
        entityType,
        recordId,
        description,
        metadata,
      };
      return newLog;
    },
    [state.currentUser]
  );

  const login = useCallback(
    (username: string): boolean => {
      const found = state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (found && found.active) {
        const updatedUser = {
          ...found,
          lastLogin: new Date().toISOString(),
        };
        setState((prev) => ({
          ...prev,
          currentUser: updatedUser,
          users: prev.users.map((u) => (u.id === found.id ? updatedUser : u)),
        }));
        addToast('success', 'Logged in successfully', `Welcome back, ${found.name}!`);
        return true;
      }
      return false;
    },
    [state.users, addToast]
  );

  const logout = useCallback(() => {
    const adminUser = state.users.find((u) => u.role === 'admin') || state.users[0];
    setState((prev) => ({
      ...prev,
      currentUser: adminUser,
    }));
    addToast('info', 'Logged out', 'Switched to guest state. Please log in.');
  }, [state.users, addToast]);

  // Billing Flow
  const createBill = useCallback(
    (params: CreateBillParams) => {
      const student = state.students.find((s) => s.id === params.studentId);
      if (!student) {
        return { success: false, error: 'Selected student does not exist.' };
      }
      if (student.status !== 'active') {
        return {
          success: false,
          error: `Student status is ${student.status.toUpperCase()}. Inactive students cannot be billed.`,
        };
      }
      if (!params.items || params.items.length === 0) {
        return { success: false, error: 'Cannot create an empty bill. Add at least one item.' };
      }

      // Check stock tracking and deduct
      const billItems: BillItem[] = [];
      const stockUpdates: { [productId: string]: number } = {};
      const newStockMovements: StockMovement[] = [];
      let subtotal = 0;

      for (const item of params.items) {
        const prod = state.products.find((p) => p.id === item.productId);
        if (!prod) {
          return { success: false, error: `Product ID ${item.productId} was not found.` };
        }
        if (!prod.isAvailable) {
          return { success: false, error: `${prod.name} is currently marked as unavailable.` };
        }

        if (prod.isStockTracked) {
          const currentStock = stockUpdates[prod.id] !== undefined ? stockUpdates[prod.id] : prod.stockQuantity;
          if (!state.settings.allowNegativeStock && currentStock < item.quantity) {
            return {
              success: false,
              error: `Insufficient stock for ${prod.name}. Available: ${currentStock}, Requested: ${item.quantity}.`,
            };
          }
          const updatedQty = currentStock - item.quantity;
          stockUpdates[prod.id] = updatedQty;

          newStockMovements.push({
            id: `SM-SALE-${Date.now()}-${item.productId}`,
            productId: prod.id,
            productName: prod.name,
            type: 'sale',
            quantity: item.quantity,
            previousStock: currentStock,
            newStock: updatedQty,
            reason: `Bill sale deduction for ${student.id} (${student.name})`,
            timestamp: new Date().toISOString(),
            createdBy: state.currentUser.name,
          });
        }

        const lineTotal = prod.price * item.quantity;
        subtotal += lineTotal;
        billItems.push({
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          unitPrice: prod.price, // Freeze sale-time price!
          quantity: item.quantity,
          total: lineTotal,
        });
      }

      const discount = Math.max(0, Number(params.discount) || 0);
      const total = Math.max(0, subtotal - discount);

      // Unique bill ID
      const timestamp = new Date().toISOString();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const billNumber = `${state.settings.billPrefix}${randomSuffix}`;

      const newBill: Bill = {
        id: billNumber,
        billNumber,
        studentId: student.id,
        studentName: student.name,
        studentDepartment: student.department,
        studentRoom: student.roomNumber,
        cashierId: state.currentUser.id,
        cashierName: state.currentUser.name,
        timestamp,
        items: billItems,
        subtotal,
        discount,
        tax: 0,
        total,
        paymentMethod: params.paymentMethod,
        paymentStatus: params.paymentStatus,
        status: 'completed',
        notes: params.notes,
      };

      const audit = logAudit(
        'CREATE_BILL',
        'bill',
        billNumber,
        `Generated bill ${billNumber} for ${student.name} (${student.id}) total: ₹${total.toFixed(2)} via ${params.paymentMethod.toUpperCase()}`,
        { total, itemsCount: billItems.length, paymentMethod: params.paymentMethod }
      );

      setState((prev) => {
        // Update product stock
        const updatedProducts = prev.products.map((p) => {
          if (stockUpdates[p.id] !== undefined) {
            return {
              ...p,
              stockQuantity: stockUpdates[p.id],
              updatedAt: timestamp,
            };
          }
          return p;
        });

        // Update student spending
        const updatedStudents = prev.students.map((s) => {
          if (s.id === student.id) {
            return {
              ...s,
              totalSpending: s.totalSpending + total,
              monthlySpending: s.monthlySpending + total,
              billsCount: s.billsCount + 1,
            };
          }
          return s;
        });

        // Update shift for current cashier if open
        const updatedShifts = prev.shifts.map((sh) => {
          if (sh.cashierId === prev.currentUser.id && sh.status === 'open') {
            const isCash = params.paymentMethod === 'cash';
            const isUpi = params.paymentMethod === 'upi';
            const isCredit = params.paymentMethod === 'hostel_credit';
            return {
              ...sh,
              cashReceived: sh.cashReceived + (isCash ? total : 0),
              upiReceived: sh.upiReceived + (isUpi ? total : 0),
              creditReceived: sh.creditReceived + (isCredit ? total : 0),
              expectedClosingCash: sh.expectedClosingCash + (isCash ? total : 0),
              billsCount: sh.billsCount + 1,
            };
          }
          return sh;
        });

        return {
          ...prev,
          bills: [newBill, ...prev.bills],
          products: updatedProducts,
          students: updatedStudents,
          shifts: updatedShifts,
          stockMovements: [...newStockMovements, ...prev.stockMovements],
          auditLogs: [audit, ...prev.auditLogs],
        };
      });

      addToast('success', 'Bill Created Successfully', `Bill #${billNumber} for ₹${total.toFixed(2)} generated.`);
      return { success: true, bill: newBill };
    },
    [state, logAudit, addToast]
  );

  // Cancel bill
  const cancelBill = useCallback(
    (billId: string, reason: string) => {
      const bill = state.bills.find((b) => b.id === billId || b.billNumber === billId);
      if (!bill) return { success: false, error: 'Bill not found' };
      if (bill.status !== 'completed') {
        return { success: false, error: `Bill is already marked as ${bill.status.toUpperCase()}` };
      }
      if (!reason || reason.trim().length === 0) {
        return { success: false, error: 'A cancellation reason is required for compliance.' };
      }

      const timestamp = new Date().toISOString();
      const audit = logAudit(
        'CANCEL_BILL',
        'bill',
        bill.billNumber,
        `Cancelled bill ${bill.billNumber} for ${bill.studentName}. Reason: ${reason}`
      );

      // Restore stock for tracked items
      const restorations: StockMovement[] = [];
      const stockRestores: { [id: string]: number } = {};

      bill.items.forEach((item) => {
        const prod = state.products.find((p) => p.id === item.productId);
        if (prod && prod.isStockTracked) {
          stockRestores[prod.id] = (stockRestores[prod.id] || prod.stockQuantity) + item.quantity;
          restorations.push({
            id: `SM-CANCEL-${Date.now()}-${item.productId}`,
            productId: prod.id,
            productName: prod.name,
            type: 'in',
            quantity: item.quantity,
            previousStock: prod.stockQuantity,
            newStock: prod.stockQuantity + item.quantity,
            reason: `Restoration from cancelled bill ${bill.billNumber}`,
            timestamp,
            createdBy: state.currentUser.name,
          });
        }
      });

      setState((prev) => {
        const updatedBills = prev.bills.map((b) => {
          if (b.id === bill.id) {
            return {
              ...b,
              status: 'cancelled' as const,
              refundReason: reason,
              cancelledAt: timestamp,
            };
          }
          return b;
        });

        const updatedProducts = prev.products.map((p) => {
          if (stockRestores[p.id] !== undefined) {
            return { ...p, stockQuantity: stockRestores[p.id], updatedAt: timestamp };
          }
          return p;
        });

        // Deduct from student totals
        const updatedStudents = prev.students.map((s) => {
          if (s.id === bill.studentId) {
            return {
              ...s,
              totalSpending: Math.max(0, s.totalSpending - bill.total),
              monthlySpending: Math.max(0, s.monthlySpending - bill.total),
              billsCount: Math.max(0, s.billsCount - 1),
            };
          }
          return s;
        });

        return {
          ...prev,
          bills: updatedBills,
          products: updatedProducts,
          students: updatedStudents,
          stockMovements: [...restorations, ...prev.stockMovements],
          auditLogs: [audit, ...prev.auditLogs],
        };
      });

      addToast('info', 'Bill Cancelled', `Bill ${bill.billNumber} cancelled and inventory restored.`);
      return { success: true };
    },
    [state, logAudit, addToast]
  );

  // Refund bill
  const refundBill = useCallback(
    (billId: string, reason: string) => {
      const bill = state.bills.find((b) => b.id === billId || b.billNumber === billId);
      if (!bill) return { success: false, error: 'Bill not found' };
      if (bill.status !== 'completed') {
        return { success: false, error: `Bill is already marked as ${bill.status.toUpperCase()}` };
      }
      if (!reason || reason.trim().length === 0) {
        return { success: false, error: 'A mandatory refund reason is required.' };
      }

      const timestamp = new Date().toISOString();
      const audit = logAudit(
        'REFUND_BILL',
        'bill',
        bill.billNumber,
        `Refunded bill ${bill.billNumber} of ₹${bill.total.toFixed(2)}. Reason: ${reason}`
      );

      setState((prev) => {
        const updatedBills = prev.bills.map((b) => {
          if (b.id === bill.id) {
            return {
              ...b,
              status: 'refunded' as const,
              refundReason: reason,
              cancelledAt: timestamp,
            };
          }
          return b;
        });

        const updatedStudents = prev.students.map((s) => {
          if (s.id === bill.studentId) {
            return {
              ...s,
              totalSpending: Math.max(0, s.totalSpending - bill.total),
              monthlySpending: Math.max(0, s.monthlySpending - bill.total),
            };
          }
          return s;
        });

        // Add refund to shift if cash
        const updatedShifts = prev.shifts.map((sh) => {
          if (sh.cashierId === bill.cashierId && sh.status === 'open') {
            return {
              ...sh,
              refunds: sh.refunds + bill.total,
              expectedClosingCash: Math.max(0, sh.expectedClosingCash - bill.total),
            };
          }
          return sh;
        });

        return {
          ...prev,
          bills: updatedBills,
          students: updatedStudents,
          shifts: updatedShifts,
          auditLogs: [audit, ...prev.auditLogs],
        };
      });

      addToast('warning', 'Bill Refunded', `Refund recorded for Bill ${bill.billNumber}.`);
      return { success: true };
    },
    [state, logAudit, addToast]
  );

  // Add student
  const addStudent = useCallback(
    (studentData: Omit<Student, 'monthlySpending' | 'totalSpending' | 'billsCount' | 'createdAt'>) => {
      const existing = state.students.find(
        (s) => s.id.toLowerCase() === studentData.id.toLowerCase()
      );
      if (existing) {
        return { success: false, error: `Student ID "${studentData.id}" already exists.` };
      }

      const newStudent: Student = {
        ...studentData,
        monthlySpending: 0,
        totalSpending: 0,
        billsCount: 0,
        createdAt: new Date().toISOString(),
      };

      const audit = logAudit(
        'ADD_STUDENT',
        'student',
        newStudent.id,
        `Registered student ${newStudent.name} (${newStudent.id}) - Room ${newStudent.roomNumber}`
      );

      setState((prev) => ({
        ...prev,
        students: [newStudent, ...prev.students],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Student Registered', `${newStudent.name} added successfully.`);
      return { success: true };
    },
    [state.students, logAudit, addToast]
  );

  // Update student
  const updateStudent = useCallback(
    (id: string, updates: Partial<Student>) => {
      const student = state.students.find((s) => s.id === id);
      if (!student) return { success: false, error: 'Student not found' };

      const audit = logAudit(
        'UPDATE_STUDENT',
        'student',
        id,
        `Updated details for student ${student.name} (${id})`
      );

      setState((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Student Updated', `Profile for ${student.name} updated.`);
      return { success: true };
    },
    [state.students, logAudit, addToast]
  );

  // Toggle student status
  const toggleStudentStatus = useCallback(
    (id: string) => {
      const student = state.students.find((s) => s.id === id);
      if (!student) return;
      const nextStatus: Student['status'] = student.status === 'active' ? 'inactive' : 'active';
      updateStudent(id, { status: nextStatus });
    },
    [state.students, updateStudent]
  );

  // Bulk import students
  const bulkImportStudents = useCallback(
    (importList: Partial<Student>[]): BulkImportResult => {
      let success = 0;
      let failed = 0;
      let duplicates = 0;
      const errors: string[] = [];
      const newStudents: Student[] = [];
      const existingIds = new Set(state.students.map((s) => s.id.toLowerCase()));

      importList.forEach((raw, idx) => {
        if (!raw.id || !raw.name) {
          failed++;
          errors.push(`Row ${idx + 1}: Missing student ID or name.`);
          return;
        }

        const normId = raw.id.trim();
        if (existingIds.has(normId.toLowerCase())) {
          duplicates++;
          return;
        }

        existingIds.add(normId.toLowerCase());
        const student: Student = {
          id: normId,
          name: raw.name.trim(),
          department: raw.department || 'General Engineering',
          year: Number(raw.year) || 1,
          roomNumber: raw.roomNumber || 'Hostel Block',
          hostelBlock: raw.hostelBlock || 'A',
          phone: raw.phone || '+91 90000 00000',
          email: raw.email || `${normId.toLowerCase()}@hostel.edu`,
          status: (raw.status as Student['status']) || 'active',
          barcode: raw.barcode || `BRC-${normId}`,
          creditLimit: 3000,
          monthlySpending: 0,
          totalSpending: 0,
          billsCount: 0,
          createdAt: new Date().toISOString(),
        };

        newStudents.push(student);
        success++;
      });

      if (newStudents.length > 0) {
        const audit = logAudit(
          'BULK_IMPORT_STUDENTS',
          'student',
          `BATCH-${Date.now()}`,
          `Bulk imported ${newStudents.length} students via CSV`
        );

        setState((prev) => ({
          ...prev,
          students: [...newStudents, ...prev.students],
          auditLogs: [audit, ...prev.auditLogs],
        }));
      }

      addToast(
        success > 0 ? 'success' : 'warning',
        'Import Processed',
        `Imported: ${success}, Duplicates skipped: ${duplicates}, Failed: ${failed}`
      );

      return { success, failed, duplicates, errors };
    },
    [state.students, logAudit, addToast]
  );

  // Add Product
  const addProduct = useCallback(
    (productData: Omit<Product, 'id' | 'updatedAt'>) => {
      const id = `PRD-${100 + state.products.length + 1}`;
      const newProduct: Product = {
        ...productData,
        id,
        updatedAt: new Date().toISOString(),
      };

      const audit = logAudit(
        'ADD_PRODUCT',
        'product',
        id,
        `Added menu product: ${newProduct.name} (₹${newProduct.price}) in category ${newProduct.category}`
      );

      setState((prev) => ({
        ...prev,
        products: [newProduct, ...prev.products],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Product Added', `${newProduct.name} added to menu.`);
      return { success: true, product: newProduct };
    },
    [state.products, logAudit, addToast]
  );

  // Update Product (never mutates historical bill items)
  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      const prod = state.products.find((p) => p.id === id);
      if (!prod) return { success: false, error: 'Product not found' };

      const priceChanged = updates.price !== undefined && updates.price !== prod.price;
      const description = priceChanged
        ? `Updated price for ${prod.name} from ₹${prod.price} to ₹${updates.price}`
        : `Updated product details for ${prod.name}`;

      const audit = logAudit('UPDATE_PRODUCT', 'product', id, description);

      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Product Updated', `${prod.name} successfully updated.`);
      return { success: true };
    },
    [state.products, logAudit, addToast]
  );

  // Toggle availability
  const toggleProductAvailability = useCallback(
    (id: string) => {
      const prod = state.products.find((p) => p.id === id);
      if (!prod) return;
      updateProduct(id, { isAvailable: !prod.isAvailable });
    },
    [state.products, updateProduct]
  );

  // Stock Adjustment
  const adjustStock = useCallback(
    (productId: string, type: StockMovementType, quantity: number, reason: string) => {
      const prod = state.products.find((p) => p.id === productId);
      if (!prod) return { success: false, error: 'Product not found' };

      let nextStock = prod.stockQuantity;
      if (type === 'in') nextStock += quantity;
      else if (type === 'out' || type === 'wastage') nextStock = Math.max(0, nextStock - quantity);
      else if (type === 'adjustment') nextStock = quantity;

      const movement: StockMovement = {
        id: `SM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: prod.id,
        productName: prod.name,
        type,
        quantity,
        previousStock: prod.stockQuantity,
        newStock: nextStock,
        reason,
        timestamp: new Date().toISOString(),
        createdBy: state.currentUser.name,
      };

      const audit = logAudit(
        'STOCK_ADJUSTMENT',
        'inventory',
        productId,
        `Stock adjustment (${type.toUpperCase()} ${quantity} ${prod.unit}) for ${prod.name}. Reason: ${reason}`
      );

      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, stockQuantity: nextStock, updatedAt: new Date().toISOString() } : p
        ),
        stockMovements: [movement, ...prev.stockMovements],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Inventory Updated', `${prod.name} stock updated to ${nextStock} ${prod.unit}.`);
      return { success: true };
    },
    [state.products, state.currentUser, logAudit, addToast]
  );

  // Start shift
  const startShift = useCallback(
    (openingCash: number) => {
      const existingOpen = state.shifts.find(
        (sh) => sh.cashierId === state.currentUser.id && sh.status === 'open'
      );
      if (existingOpen) {
        return { success: false, error: 'You already have an active open shift.' };
      }

      const newShift: Shift = {
        id: `SHF-${Date.now().toString().slice(-6)}`,
        cashierId: state.currentUser.id,
        cashierName: state.currentUser.name,
        startTime: new Date().toISOString(),
        openingCash,
        cashReceived: 0,
        upiReceived: 0,
        creditReceived: 0,
        refunds: 0,
        expectedClosingCash: openingCash,
        status: 'open',
        billsCount: 0,
      };

      const audit = logAudit(
        'START_SHIFT',
        'shift',
        newShift.id,
        `Started cashier shift for ${state.currentUser.name} with opening cash ₹${openingCash}`
      );

      setState((prev) => ({
        ...prev,
        shifts: [newShift, ...prev.shifts],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Shift Started', `Shift opened with initial cash ₹${openingCash}.`);
      return { success: true, shift: newShift };
    },
    [state.shifts, state.currentUser, logAudit, addToast]
  );

  // Close shift
  const closeShift = useCallback(
    (shiftId: string, actualClosingCash: number, notes?: string) => {
      const shift = state.shifts.find((sh) => sh.id === shiftId);
      if (!shift) return { success: false, error: 'Shift not found' };

      const difference = actualClosingCash - shift.expectedClosingCash;
      const endTime = new Date().toISOString();

      const audit = logAudit(
        'CLOSE_SHIFT',
        'shift',
        shiftId,
        `Closed shift for ${shift.cashierName}. Expected: ₹${shift.expectedClosingCash}, Actual: ₹${actualClosingCash}, Difference: ₹${difference}`
      );

      setState((prev) => ({
        ...prev,
        shifts: prev.shifts.map((sh) =>
          sh.id === shiftId
            ? {
                ...sh,
                endTime,
                actualClosingCash,
                difference,
                status: 'closed' as const,
                notes: notes || sh.notes,
              }
            : sh
        ),
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast(
        difference === 0 ? 'success' : 'warning',
        'Shift Closed',
        `Shift closed. Drawer variance: ₹${difference.toFixed(2)}.`
      );
      return { success: true };
    },
    [state.shifts, logAudit, addToast]
  );

  // Settings
  const updateSettings = useCallback(
    (newSettings: MessSettings) => {
      const audit = logAudit('UPDATE_SETTINGS', 'settings', 'GLOBAL', 'Updated mess configuration and preferences');
      setState((prev) => ({
        ...prev,
        settings: newSettings,
        auditLogs: [audit, ...prev.auditLogs],
      }));
      addToast('success', 'Settings Saved', 'Mess preferences updated successfully.');
    },
    [logAudit, addToast]
  );

  // User management
  const addUser = useCallback(
    (userData: Omit<User, 'id' | 'lastLogin'>) => {
      const id = `USR-${(state.users.length + 1).toString().padStart(3, '0')}`;
      const newUser: User = {
        ...userData,
        id,
        lastLogin: new Date().toISOString(),
      };
      const audit = logAudit('ADD_USER', 'user', id, `Created new system account: ${newUser.name} (${newUser.role})`);
      setState((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
        auditLogs: [audit, ...prev.auditLogs],
      }));
      addToast('success', 'User Added', `Account created for ${newUser.name}.`);
      return { success: true };
    },
    [state.users, logAudit, addToast]
  );

  const updateUser = useCallback(
    (id: string, updates: Partial<User>) => {
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      }));
      addToast('success', 'User Updated', 'Account details updated.');
    },
    [addToast]
  );

  const toggleUserStatus = useCallback(
    (id: string) => {
      const user = state.users.find((u) => u.id === id);
      if (!user) return;
      if (user.role === 'admin' && state.users.filter((u) => u.role === 'admin' && u.active).length <= 1) {
        addToast('error', 'Cannot Deactivate', 'System must have at least one active administrator.');
        return;
      }
      updateUser(id, { active: !user.active });
    },
    [state.users, updateUser, addToast]
  );

  // Reset Demo
  const resetDemoData = useCallback(() => {
    const fresh = resetStateToInitial();
    setState(fresh);
    addToast('info', 'Demo Data Reset', 'Dataset restored to original 500 students and catalog.');
  }, [addToast]);

  return (
    <MessContext.Provider
      value={{
        state,
        currentUser: state.currentUser,
        toasts,
        addToast,
        dismissToast,
        login,
        logout,
        createBill,
        cancelBill,
        refundBill,
        addStudent,
        updateStudent,
        toggleStudentStatus,
        bulkImportStudents,
        addProduct,
        updateProduct,
        toggleProductAvailability,
        adjustStock,
        startShift,
        closeShift,
        updateSettings,
        addUser,
        updateUser,
        toggleUserStatus,
        resetDemoData,
      }}
    >
      {children}
    </MessContext.Provider>
  );
};

export function useMess() {
  const context = useContext(MessContext);
  if (!context) {
    throw new Error('useMess must be used within a MessProvider');
  }
  return context;
}
