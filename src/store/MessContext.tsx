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
  StockMovementType,
  StudentStatus,
  ToastMessage,
  AppState,
  StudentPayment,
  MealScheduleSettings,
} from '../types';
import {
  initialAppState,
  saveStateToStorage,
  resetStateToInitial,
} from './demoStore';

interface MessContextType {
  state: AppState;
  currentUser: User;
  currentStudent: Student | null;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  login: (username: string, password?: string) => boolean;
  loginUser: (username: string) => boolean;
  logout: () => void;
  resetDemoData: () => void;

  // Student Self-Service Portal
  loginStudent: (studentId: string, passwordOrPhone: string) => { success: boolean; error?: string; student?: Student };
  activateStudentAccount: (studentId: string, newPassword?: string) => { success: boolean; error?: string; student?: Student; defaultPassword?: string };
  payStudentDue: (
    studentId: string,
    amount: number,
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'qr',
    transactionRef?: string
  ) => { success: boolean; error?: string; paymentRecord?: StudentPayment };

  // POS / Bills
  createBill: (params: {
    studentId: string;
    items: { product: Product; quantity: number }[];
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    discount?: number;
    notes?: string;
  }) => { success: boolean; bill?: Bill; error?: string };
  cancelBill: (billId: string, reason: string) => { success: boolean; error?: string };
  refundBill: (billId: string, reason: string) => { success: boolean; error?: string };

  // Students
  addStudent: (student: Omit<Student, 'createdAt' | 'billsCount' | 'monthlySpending' | 'totalSpending' | 'pendingBalance' | 'balance'>) => { success: boolean; error?: string };
  updateStudent: (id: string, updates: Partial<Student>) => { success: boolean; error?: string };
  toggleStudentStatus: (id: string) => { success: boolean };
  bulkImportStudents: (importedList: Partial<Student>[]) => { success: number; failed: number; duplicates: number; errors: string[] };

  // Products & Menu
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => { success: boolean; error?: string };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; error?: string };
  updateProductPrice: (productId: string, newPrice: number, reason: string) => { success: boolean };
  toggleProductAvailability: (productId: string) => { success: boolean };
  adjustStock: (productId: string, type: StockMovementType, quantity: number, reason: string) => { success: boolean; error?: string };

  // Shifts
  startShift: (openingFloat: number, notes?: string) => { success: boolean; shift?: Shift; error?: string };
  closeShift: (shiftId: string, closingCashCounted: number, notes?: string) => { success: boolean; shift?: Shift; error?: string };

  // Users
  addUser: (user: (Omit<User, 'id' | 'lastLogin'> & { id?: string }) | (Omit<User, 'lastLogin'>)) => { success: boolean; error?: string; user?: User };
  updateUser: (id: string, updates: Partial<User>) => { success: boolean; error?: string };
  toggleUserStatus: (id: string) => { success: boolean };

  // Auth & Session
  isLoggedIn: boolean;

  // Settings & Meal Schedule
  updateSettings: (updates: Partial<MessSettings>) => { success: boolean };
  updateMealSchedule: (schedule: MealScheduleSettings) => void;
}

const MessContext = createContext<MessContextType | undefined>(undefined);

export const MessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialAppState);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const logAudit = useCallback(
    (action: string, entityType: string, recordId: string, description: string, reason?: string): AuditLog => {
      return {
        id: `AUD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        timestamp: new Date().toISOString(),
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userRole: state.currentUser.role,
        action,
        entityType,
        recordId,
        description,
        reason,
      };
    },
    [state.currentUser]
  );

  const login = useCallback(
    (usernameOrId: string): boolean => {
      const q = usernameOrId.trim().toLowerCase();
      const user = state.users.find(
        (u) => (u.username.toLowerCase() === q || u.id.toLowerCase() === q) && u.active
      );
      if (!user) {
        addToast('error', 'Login Failed', 'Invalid username/ID or inactive user account.');
        return false;
      }

      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      setState((prev) => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map((u) => (u.id === user.id ? updatedUser : u)),
      }));

      setIsLoggedIn(true);
      addToast('success', `Welcome back, ${user.name}`, `Logged in as ${user.role.toUpperCase()}`);
      return true;
    },
    [state.users, addToast]
  );

  const loginUser = useCallback(
    (username: string): boolean => {
      return login(username);
    },
    [login]
  );

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    addToast('info', 'Logged Out', 'Session terminated. Returned to login page.');
  }, [addToast]);

  const updateMealSchedule = useCallback(
    (schedule: MealScheduleSettings) => {
      setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          mealSchedule: schedule,
        },
      }));
      addToast('success', 'Meal Schedule Updated', 'Active slot timings synchronized with all POS counters.');
    },
    [addToast]
  );

  const resetDemoData = useCallback(() => {
    const fresh = resetStateToInitial();
    setState(fresh);
    addToast('success', 'Demo Reset', 'System re-seeded with initial 500 students and catalog items.');
  }, [addToast]);

  // Current Student reference if logged-in user is a student
  const currentStudent = React.useMemo(() => {
    if (state.currentUser.role === 'student') {
      return state.students.find((s) => s.id.toLowerCase() === state.currentUser.id.toLowerCase()) || null;
    }
    return null;
  }, [state.currentUser, state.students]);

  // Student Portal Auth (Student ID + default password: Mobile Number)
  const loginStudent = useCallback(
    (studentIdInput: string, passwordOrPhoneInput: string) => {
      const sId = studentIdInput.trim().toUpperCase();
      const student = state.students.find((s) => s.id.toUpperCase() === sId);

      if (!student) {
        return { success: false, error: `Student ID "${studentIdInput}" was not found in the mess roster.` };
      }

      if (student.status !== 'active') {
        return {
          success: false,
          error: `Student status is ${student.status.toUpperCase()}. Account cannot access the dining portal. Please contact the Mess Warden.`,
        };
      }

      const inputPass = passwordOrPhoneInput.trim();
      const cleanInputDigits = inputPass.replace(/\D/g, '');
      const cleanPhoneDigits = student.phone.replace(/\D/g, '');

      // Check registered mobile number (full or 10 digits) OR custom password
      const isPhoneMatch =
        inputPass === student.phone ||
        (cleanInputDigits.length >= 6 && cleanPhoneDigits.endsWith(cleanInputDigits));
      const isCustomPassMatch = Boolean(student.password && student.password === inputPass);

      if (!isPhoneMatch && !isCustomPassMatch) {
        return {
          success: false,
          error: `Incorrect security key/password. For new students, your default password is your registered mobile number (${student.phone.slice(-4).padStart(10, '*')}).`,
        };
      }

      const studentUser: User = {
        id: student.id,
        username: student.id.toLowerCase(),
        name: student.name,
        role: 'student',
        category: student.category || "Men's Mess",
        email: student.email,
        phone: student.phone,
        active: true,
        lastLogin: new Date().toISOString(),
        permissions: ['student.view', 'student.pay'],
      };

      setState((prev) => ({
        ...prev,
        currentUser: studentUser,
      }));

      setIsLoggedIn(true);
      addToast('success', `Welcome, ${student.name}`, `Signed in to Student Mess Self-Service Portal (${student.id})`);
      return { success: true, student };
    },
    [state.students, addToast]
  );

  const activateStudentAccount = useCallback(
    (studentIdInput: string, newPassword?: string) => {
      const sId = studentIdInput.trim().toUpperCase();
      const student = state.students.find((s) => s.id.toUpperCase() === sId);

      if (!student) {
        return { success: false, error: `Student ID "${studentIdInput}" is not enrolled in the mess roster.` };
      }

      const defaultPassword = newPassword && newPassword.trim() ? newPassword.trim() : student.phone;

      const updatedStudent: Student = {
        ...student,
        password: defaultPassword,
        isFirstLoginDone: true,
      };

      const studentUser: User = {
        id: student.id,
        username: student.id.toLowerCase(),
        name: student.name,
        role: 'student',
        category: student.category || "Men's Mess",
        email: student.email,
        phone: student.phone,
        active: true,
        lastLogin: new Date().toISOString(),
        permissions: ['student.view', 'student.pay'],
      };

      const audit = logAudit(
        'STUDENT_PORTAL_ACTIVATION',
        'Student',
        student.id,
        `Student ${student.name} (${student.id}) activated their self-service portal account.`
      );

      setState((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === student.id ? updatedStudent : s)),
        currentUser: studentUser,
        auditLogs: [audit, ...prev.auditLogs],
      }));

      setIsLoggedIn(true);
      addToast('success', 'Portal Activated!', `Welcome ${student.name}. Your default login key is ${student.phone}`);
      return { success: true, student: updatedStudent, defaultPassword };
    },
    [state.students, logAudit, addToast]
  );

  const payStudentDue = useCallback(
    (
      studentId: string,
      amount: number,
      paymentMethod: 'upi' | 'card' | 'netbanking' | 'qr',
      transactionRef?: string
    ) => {
      const student = state.students.find((s) => s.id === studentId);
      if (!student) {
        return { success: false, error: 'Student not found in mess roster.' };
      }

      if (amount <= 0) {
        return { success: false, error: 'Payment amount must be greater than zero.' };
      }

      const prevBal = student.pendingBalance;
      const newPending = Math.max(0, prevBal - amount);
      const paySeq = (state.studentPayments?.length || 0) + 1;
      const payNumber = `PAY-2026-${String(paySeq).padStart(4, '0')}`;
      const txnRef = transactionRef || `TXN-UPI-${Date.now().toString().slice(-6)}`;

      const paymentRecord: StudentPayment = {
        id: `pay-${Date.now()}`,
        paymentNumber: payNumber,
        studentId: student.id,
        studentName: student.name,
        amount,
        paymentMethod,
        transactionRef: txnRef,
        timestamp: new Date().toISOString(),
        previousBalance: prevBal,
        remainingBalance: newPending,
        status: 'success',
        notes: `Online student self-service payment via ${paymentMethod.toUpperCase()}`,
      };

      const audit = logAudit(
        'STUDENT_PAYMENT',
        'Student',
        student.id,
        `Student ${student.name} (${student.id}) paid ₹${amount} via ${paymentMethod.toUpperCase()} (Ref: ${txnRef}). Remaining due: ₹${newPending}`
      );

      setState((prev) => {
        let rem = amount;
        const updatedBills = prev.bills.map((b) => {
          if (b.studentId === student.id && b.paymentStatus === 'pending') {
            if (rem > 0) {
              rem -= b.totalAmount;
              return {
                ...b,
                paymentStatus: 'paid' as PaymentStatus,
                paidAt: paymentRecord.timestamp,
                paymentRef: payNumber,
              };
            }
          }
          return b;
        });

        return {
          ...prev,
          students: prev.students.map((s) =>
            s.id === student.id ? { ...s, pendingBalance: newPending, balance: newPending } : s
          ),
          bills: updatedBills,
          studentPayments: [paymentRecord, ...(prev.studentPayments || [])],
          auditLogs: [audit, ...prev.auditLogs],
        };
      });

      addToast(
        'success',
        'Payment Credited!',
        `Receipt ${payNumber}: ₹${amount.toFixed(2)} received. Outstanding due is now ₹${newPending.toFixed(2)}.`
      );

      return { success: true, paymentRecord };
    },
    [state.students, state.studentPayments, logAudit, addToast]
  );

  // Create Bill
  const createBill = useCallback(
    (params: {
      studentId: string;
      items: { product: Product; quantity: number }[];
      paymentMethod: PaymentMethod;
      paymentStatus: PaymentStatus;
      discount?: number;
      notes?: string;
    }) => {
      const student = state.students.find((s) => s.id === params.studentId);
      if (!student) {
        return { success: false, error: 'Selected student does not exist.' };
      }
      if (student.status !== 'active') {
        return { success: false, error: `Student is currently marked as ${student.status.toUpperCase()} and cannot make purchases.` };
      }
      if (!params.items || params.items.length === 0) {
        return { success: false, error: 'Please add at least one food item to the bill.' };
      }

      // Check stock for tracked products
      for (const item of params.items) {
        const prod = state.products.find((p) => p.id === item.product.id);
        if (prod && prod.isStockTracked && prod.stockQuantity < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for ${prod.name}. Available: ${prod.stockQuantity}, Requested: ${item.quantity}`,
          };
        }
      }

      const billItems: BillItem[] = params.items.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        category: String(it.product.category),
        unitPrice: it.product.price,
        quantity: it.quantity,
        total: it.product.price * it.quantity,
        unit: it.product.unit,
      }));

      const subtotal = billItems.reduce((acc, it) => acc + it.total, 0);
      const discount = Math.min(params.discount || 0, subtotal);
      const totalAmount = Math.max(0, subtotal - discount);

      // Check credit limit if paying via hostel_credit
      if (params.paymentMethod === 'hostel_credit') {
        const potentialPending = student.pendingBalance + totalAmount;
        if (potentialPending > student.creditLimit) {
          return {
            success: false,
            error: `Credit limit exceeded! Student credit limit is ₹${student.creditLimit}, current pending is ₹${student.pendingBalance}. Adding ₹${totalAmount} would exceed limit.`,
          };
        }
      }

      const billSeq = state.bills.length + 1;
      const billNumber = `BILL-2026-${String(billSeq).padStart(4, '0')}`;
      const newBill: Bill = {
        id: `bill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        billNumber,
        studentId: student.id,
        studentName: student.name,
        studentDepartment: student.department,
        studentRoom: student.roomNumber,
        studentBlock: student.hostelBlock,
        cashierId: state.currentUser.id,
        cashierName: state.currentUser.name,
        timestamp: new Date().toISOString(),
        items: billItems,
        subtotal,
        discount,
        totalAmount,
        total: totalAmount,
        paymentMethod: params.paymentMethod,
        paymentStatus: params.paymentStatus,
        status: 'completed',
        notes: params.notes,
      };

      // Deduct stock
      const updatedProducts = state.products.map((p) => {
        const billedItem = billItems.find((it) => it.productId === p.id);
        if (billedItem && p.isStockTracked) {
          return {
            ...p,
            stockQuantity: Math.max(0, p.stockQuantity - billedItem.quantity),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      // Update student spending & balance
      const updatedStudents = state.students.map((s) => {
        if (s.id === student.id) {
          const addedPending = params.paymentStatus === 'pending' || params.paymentMethod === 'hostel_credit' ? totalAmount : 0;
          const nextPending = s.pendingBalance + addedPending;
          return {
            ...s,
            monthlySpending: s.monthlySpending + totalAmount,
            totalSpending: s.totalSpending + totalAmount,
            pendingBalance: nextPending,
            balance: nextPending,
            billsCount: (s.billsCount || 0) + 1,
          };
        }
        return s;
      });

      // Update active shift if any
      let updatedShifts = [...state.shifts];
      let updatedActiveShift = state.activeShift;

      if (state.activeShift && state.activeShift.status === 'open') {
        const cashInflow = params.paymentMethod === 'cash' ? totalAmount : 0;
        const upiInflow = params.paymentMethod === 'upi' ? totalAmount : 0;
        const creditInflow = params.paymentMethod === 'hostel_credit' ? totalAmount : 0;

        const nextShift: Shift = {
          ...state.activeShift,
          cashInflow: state.activeShift.cashInflow + cashInflow,
          cashReceived: (state.activeShift.cashReceived || 0) + cashInflow,
          upiInflow: state.activeShift.upiInflow + upiInflow,
          upiReceived: (state.activeShift.upiReceived || 0) + upiInflow,
          creditInflow: state.activeShift.creditInflow + creditInflow,
          totalSales: state.activeShift.totalSales + totalAmount,
          billsCount: state.activeShift.billsCount + 1,
        };

        updatedActiveShift = nextShift;
        updatedShifts = updatedShifts.map((sh) => (sh.id === nextShift.id ? nextShift : sh));
      }

      const audit = logAudit(
        'BILL_CREATE',
        'Bill',
        newBill.billNumber,
        `Bill ${newBill.billNumber} created for ${student.name} (${student.id}) total ₹${totalAmount} via ${params.paymentMethod.toUpperCase()}`
      );

      setState((prev) => ({
        ...prev,
        bills: [newBill, ...prev.bills],
        products: updatedProducts,
        students: updatedStudents,
        shifts: updatedShifts,
        activeShift: updatedActiveShift,
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', `Bill ${newBill.billNumber} Generated`, `₹${totalAmount.toFixed(2)} charged to ${student.name}`);
      return { success: true, bill: newBill };
    },
    [state.students, state.products, state.bills, state.currentUser, state.shifts, state.activeShift, logAudit, addToast]
  );

  // Cancel Bill
  const cancelBill = useCallback(
    (billId: string, reason: string) => {
      const bill = state.bills.find((b) => b.id === billId || b.billNumber === billId);
      if (!bill) return { success: false, error: 'Bill not found.' };
      if (bill.status !== 'completed') {
        return { success: false, error: `Bill is already ${bill.status}.` };
      }

      // Restore inventory
      const updatedProducts = state.products.map((p) => {
        const bi = bill.items.find((it) => it.productId === p.id);
        if (bi && p.isStockTracked) {
          return {
            ...p,
            stockQuantity: p.stockQuantity + bi.quantity,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      // Restore student spending
      const updatedStudents = state.students.map((s) => {
        if (s.id === bill.studentId) {
          const pendingDeduction = bill.paymentStatus === 'pending' || bill.paymentMethod === 'hostel_credit' ? bill.totalAmount : 0;
          const nextPending = Math.max(0, s.pendingBalance - pendingDeduction);
          return {
            ...s,
            monthlySpending: Math.max(0, s.monthlySpending - bill.totalAmount),
            totalSpending: Math.max(0, s.totalSpending - bill.totalAmount),
            pendingBalance: nextPending,
            balance: nextPending,
          };
        }
        return s;
      });

      const updatedBill: Bill = {
        ...bill,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: state.currentUser.name,
        cancellationReason: reason,
      };

      const audit = logAudit(
        'BILL_CANCEL',
        'Bill',
        bill.billNumber,
        `Bill ${bill.billNumber} cancelled by ${state.currentUser.name}. Reason: ${reason}`
      );

      setState((prev) => ({
        ...prev,
        bills: prev.bills.map((b) => (b.id === bill.id ? updatedBill : b)),
        products: updatedProducts,
        students: updatedStudents,
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('warning', `Bill ${bill.billNumber} Cancelled`, 'Stock and student totals reverted.');
      return { success: true };
    },
    [state.bills, state.products, state.students, state.currentUser, logAudit, addToast]
  );

  // Refund Bill
  const refundBill = useCallback(
    (billId: string, reason: string) => {
      const bill = state.bills.find((b) => b.id === billId || b.billNumber === billId);
      if (!bill) return { success: false, error: 'Bill not found.' };
      if (bill.status !== 'completed') {
        return { success: false, error: `Cannot refund bill with status ${bill.status}.` };
      }

      const updatedBill: Bill = {
        ...bill,
        status: 'refunded',
        paymentStatus: 'refunded',
        refundedAt: new Date().toISOString(),
        refundedBy: state.currentUser.name,
        refundReason: reason,
      };

      // Restore inventory
      const updatedProducts = state.products.map((p) => {
        const bi = bill.items.find((it) => it.productId === p.id);
        if (bi && p.isStockTracked) {
          return {
            ...p,
            stockQuantity: p.stockQuantity + bi.quantity,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      // Update student spending
      const updatedStudents = state.students.map((s) => {
        if (s.id === bill.studentId) {
          return {
            ...s,
            monthlySpending: Math.max(0, s.monthlySpending - bill.totalAmount),
            totalSpending: Math.max(0, s.totalSpending - bill.totalAmount),
          };
        }
        return s;
      });

      const audit = logAudit(
        'BILL_REFUND',
        'Bill',
        bill.billNumber,
        `Bill ${bill.billNumber} refunded by ${state.currentUser.name}. Reason: ${reason}`
      );

      setState((prev) => ({
        ...prev,
        bills: prev.bills.map((b) => (b.id === bill.id ? updatedBill : b)),
        products: updatedProducts,
        students: updatedStudents,
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('info', `Bill ${bill.billNumber} Refunded`, `₹${bill.totalAmount.toFixed(2)} refunded.`);
      return { success: true };
    },
    [state.bills, state.products, state.students, state.currentUser, logAudit, addToast]
  );

  // Student Actions
  const addStudent = useCallback(
    (studentData: Omit<Student, 'createdAt' | 'billsCount' | 'monthlySpending' | 'totalSpending' | 'pendingBalance' | 'balance'>) => {
      if (state.students.some((s) => s.id.toLowerCase() === studentData.id.toLowerCase())) {
        return { success: false, error: `Student with ID ${studentData.id} already exists!` };
      }

      const newStudent: Student = {
        ...studentData,
        createdAt: new Date().toISOString(),
        billsCount: 0,
        monthlySpending: 0,
        totalSpending: 0,
        pendingBalance: 0,
        balance: 0,
        barcode: `BC-${studentData.id}`,
      };

      const audit = logAudit('STUDENT_CREATE', 'Student', newStudent.id, `Enrolled student ${newStudent.name} (${newStudent.id})`);

      setState((prev) => ({
        ...prev,
        students: [newStudent, ...prev.students],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Student Enrolled', `${newStudent.name} (${newStudent.id}) registered.`);
      return { success: true };
    },
    [state.students, logAudit, addToast]
  );

  const updateStudent = useCallback(
    (id: string, updates: Partial<Student>) => {
      setState((prev) => ({
        ...prev,
        students: prev.students.map((s) => {
          if (s.id === id) {
            const nextPending = updates.pendingBalance !== undefined ? updates.pendingBalance : s.pendingBalance;
            return { ...s, ...updates, pendingBalance: nextPending, balance: nextPending };
          }
          return s;
        }),
      }));
      addToast('success', 'Student Updated', `Details for ${id} saved.`);
      return { success: true };
    },
    [addToast]
  );

  const toggleStudentStatus = useCallback(
    (id: string) => {
      let nextStatus: Student['status'] = 'active';
      setState((prev) => ({
        ...prev,
        students: prev.students.map((s) => {
          if (s.id === id) {
            nextStatus = s.status === 'active' ? 'inactive' : 'active';
            return { ...s, status: nextStatus };
          }
          return s;
        }),
      }));
      addToast('info', 'Student Status Changed', `Status set to ${nextStatus.toUpperCase()}`);
      return { success: true };
    },
    [addToast]
  );

  const bulkImportStudents = useCallback(
    (importedList: Partial<Student>[]) => {
      let importedCount = 0;
      let duplicateCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      const existingIds = new Set(state.students.map((s) => s.id.toLowerCase()));
      const newStudents: Student[] = [];

      importedList.forEach((row, idx) => {
        const id = row.id?.trim() || `STU-${String(state.students.length + idx + 1).padStart(3, '0')}`;
        if (existingIds.has(id.toLowerCase())) {
          duplicateCount++;
          return;
        }

        existingIds.add(id.toLowerCase());
        importedCount++;
        newStudents.push({
          id,
          name: row.name?.trim() || `Resident ${id}`,
          department: row.department?.trim() || 'General Engineering',
          year: Number(row.year) || 1,
          roomNumber: row.roomNumber?.trim() || 'A-101',
          hostelBlock: row.hostelBlock?.trim() || 'Block A',
          phone: row.phone?.trim() || '+91 98000 00000',
          email: row.email?.trim() || `${id.toLowerCase()}@hostel.edu`,
          status: (row.status as StudentStatus) || 'active',
          creditLimit: 3000,
          monthlySpending: 0,
          totalSpending: 0,
          pendingBalance: 0,
          balance: 0,
          createdAt: new Date().toISOString(),
          billsCount: 0,
          barcode: `BC-${id}`,
        });
      });

      if (importedCount > 0) {
        const audit = logAudit(
          'STUDENT_BULK_IMPORT',
          'Student',
          'BULK-IMPORT',
          `Imported ${importedCount} students (${duplicateCount} skipped duplicates)`
        );

        setState((prev) => ({
          ...prev,
          students: [...newStudents, ...prev.students],
          auditLogs: [audit, ...prev.auditLogs],
        }));

        addToast('success', 'Bulk Import Complete', `Added ${importedCount} students (${duplicateCount} duplicates skipped)`);
      } else {
        addToast('warning', 'No New Records', 'All student records in the file already existed.');
      }

      return {
        success: importedCount,
        failed: failedCount,
        duplicates: duplicateCount,
        errors,
      };
    },
    [state.students, logAudit, addToast]
  );

  // Product Actions
  const addProduct = useCallback(
    (productData: Omit<Product, 'id' | 'updatedAt'>) => {
      const id = `PRD-${String(state.products.length + 1).padStart(3, '0')}`;
      const newProduct: Product = {
        ...productData,
        id,
        updatedAt: new Date().toISOString(),
      };

      const audit = logAudit('PRODUCT_CREATE', 'Product', id, `Added ${newProduct.name} (₹${newProduct.price})`);

      setState((prev) => ({
        ...prev,
        products: [newProduct, ...prev.products],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Product Added', `${newProduct.name} added to menu.`);
      return { success: true };
    },
    [state.products, logAudit, addToast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
      }));
      addToast('success', 'Product Updated', `Changes saved.`);
      return { success: true };
    },
    [addToast]
  );

  const toggleProductAvailability = useCallback(
    (productId: string) => {
      let isNowAvailable = true;
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => {
          if (p.id === productId) {
            isNowAvailable = !p.isAvailable;
            return { ...p, isAvailable: isNowAvailable, updatedAt: new Date().toISOString() };
          }
          return p;
        }),
      }));
      addToast('info', 'Availability Toggled', `Item is now ${isNowAvailable ? 'Available' : 'Unavailable'}`);
      return { success: true };
    },
    [addToast]
  );

  const updateProductPrice = useCallback(
    (productId: string, newPrice: number, reason: string) => {
      let pName = '';
      let oldPrice = 0;

      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => {
          if (p.id === productId) {
            pName = p.name;
            oldPrice = p.price;
            return { ...p, price: newPrice, updatedAt: new Date().toISOString() };
          }
          return p;
        }),
      }));

      const audit = logAudit(
        'PRICE_ADJUST',
        'Product',
        productId,
        `Adjusted price of ${pName} from ₹${oldPrice} to ₹${newPrice}`,
        reason
      );

      setState((prev) => ({
        ...prev,
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Price Updated', `${pName} is now ₹${newPrice.toFixed(2)}`);
      return { success: true };
    },
    [logAudit, addToast]
  );

  const adjustStock = useCallback(
    (productId: string, type: StockMovementType, quantity: number, reason: string) => {
      const prod = state.products.find((p) => p.id === productId);
      if (!prod) return { success: false, error: 'Product not found.' };

      const prevStock = prod.stockQuantity;
      let newStock = prevStock;
      if (type === 'in') newStock = prevStock + quantity;
      else if (type === 'out' || type === 'wastage') newStock = Math.max(0, prevStock - quantity);
      else if (type === 'adjustment') newStock = quantity;

      const movement: StockMovement = {
        id: `MOV-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        type,
        quantity,
        previousStock: prevStock,
        newStock,
        reason,
        performedBy: state.currentUser.name,
        createdBy: state.currentUser.name,
        timestamp: new Date().toISOString(),
      };

      const updatedProducts = state.products.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock, updatedAt: new Date().toISOString() } : p));

      const audit = logAudit(
        'STOCK_ADJUST',
        'Inventory',
        productId,
        `Stock adjustment (${type.toUpperCase()}) for ${prod.name}: ${prevStock} -> ${newStock} (${quantity})`,
        reason
      );

      setState((prev) => ({
        ...prev,
        products: updatedProducts,
        stockMovements: [movement, ...prev.stockMovements],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('info', 'Stock Updated', `${prod.name} stock adjusted to ${newStock} units`);
      return { success: true };
    },
    [state.products, state.currentUser, logAudit, addToast]
  );

  // Shift Actions
  const startShift = useCallback(
    (openingFloat: number, notes?: string) => {
      const shiftId = `SHIFT-2026-${String(state.shifts.length + 1).padStart(3, '0')}`;
      const newShift: Shift = {
        id: shiftId,
        cashierId: state.currentUser.id,
        cashierName: state.currentUser.name,
        openedAt: new Date().toISOString(),
        startTime: new Date().toISOString(),
        status: 'open',
        openingFloat,
        openingCash: openingFloat,
        cashInflow: 0,
        cashReceived: 0,
        upiInflow: 0,
        upiReceived: 0,
        creditInflow: 0,
        refunds: 0,
        expectedClosingCash: openingFloat,
        totalSales: 0,
        billsCount: 0,
        notes,
      };

      const audit = logAudit('SHIFT_OPEN', 'Shift', shiftId, `Opened shift ${shiftId} with ₹${openingFloat} opening float`);

      setState((prev) => ({
        ...prev,
        shifts: [newShift, ...prev.shifts],
        activeShift: newShift,
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Shift Opened', `Active drawer ready with ₹${openingFloat.toFixed(2)} float.`);
      return { success: true, shift: newShift };
    },
    [state.shifts, state.currentUser, logAudit, addToast]
  );

  const closeShift = useCallback(
    (shiftId: string, closingCashCounted: number, notes?: string) => {
      const shift = state.shifts.find((s) => s.id === shiftId);
      if (!shift) return { success: false, error: 'Shift not found.' };

      const expectedCash = shift.openingFloat + shift.cashInflow;
      const cashVariance = closingCashCounted - expectedCash;

      const closedShift: Shift = {
        ...shift,
        status: 'closed',
        closedAt: new Date().toISOString(),
        endTime: new Date().toISOString(),
        closingCashCounted,
        actualClosingCash: closingCashCounted,
        expectedClosingCash: expectedCash,
        cashVariance,
        difference: cashVariance,
        notes: notes || shift.notes,
      };

      const audit = logAudit(
        'SHIFT_CLOSE',
        'Shift',
        shiftId,
        `Closed shift ${shiftId}. Counted ₹${closingCashCounted}, Variance: ₹${cashVariance}`
      );

      setState((prev) => ({
        ...prev,
        shifts: prev.shifts.map((s) => (s.id === shiftId ? closedShift : s)),
        activeShift: prev.activeShift?.id === shiftId ? null : prev.activeShift,
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast(
        cashVariance === 0 ? 'success' : 'warning',
        'Shift Closed',
        cashVariance === 0 ? 'Cash drawer reconciled with 0 variance!' : `Shift closed with variance of ₹${cashVariance.toFixed(2)}`
      );

      return { success: true, shift: closedShift };
    },
    [state.shifts, logAudit, addToast]
  );

  // User Actions
  const addUser = useCallback(
    (userData: (Omit<User, 'id' | 'lastLogin'> & { id?: string }) | Omit<User, 'lastLogin'>) => {
      const trimmedUsername = userData.username.trim().toLowerCase();
      if (!trimmedUsername) {
        return { success: false, error: 'Username is required.' };
      }
      if (state.users.some((u) => u.username.toLowerCase() === trimmedUsername)) {
        return { success: false, error: `Username "${userData.username}" is already taken.` };
      }

      let id = userData.id?.trim();
      if (id) {
        if (state.users.some((u) => u.id.toLowerCase() === id!.toLowerCase())) {
          return { success: false, error: `User ID "${id}" is already assigned to another account.` };
        }
      } else {
        id = `USR-${String(state.users.length + 1).padStart(3, '0')}`;
      }

      const newUser: User = {
        ...userData,
        id,
        username: trimmedUsername,
        name: userData.name.trim(),
        role: userData.role || 'cashier',
        category: userData.category || "Men's Mess",
        designation: userData.designation || (userData.role === 'admin' ? 'System Administrator' : "Men's Mess Cashier"),
        genderCategory: userData.genderCategory || (userData.role === 'admin' ? 'Co-ed' : 'Men'),
        active: userData.active !== undefined ? userData.active : true,
        lastLogin: new Date().toISOString(),
        permissions: userData.permissions || (userData.role === 'admin' ? ['all'] : ['pos.read', 'pos.write', 'shifts.read']),
      };

      const audit = logAudit(
        'USER_CREATE',
        'User',
        id,
        `Added user ${newUser.name} (ID: ${id}, Username: ${newUser.username}, Role: ${newUser.role}, Category: ${newUser.category}, Designation: ${newUser.designation})`
      );

      setState((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'User Created', `${newUser.name} (${newUser.username}) added to personnel roster.`);
      return { success: true, user: newUser };
    },
    [state.users, logAudit, addToast]
  );

  const updateUser = useCallback(
    (currentId: string, updates: Partial<User>) => {
      const existingUser = state.users.find((u) => u.id === currentId);
      if (!existingUser) {
        return { success: false, error: `User with ID ${currentId} was not found.` };
      }

      const targetId = updates.id !== undefined && updates.id.trim() ? updates.id.trim() : currentId;
      const targetUsername = updates.username !== undefined ? updates.username.trim().toLowerCase() : existingUser.username.toLowerCase();

      // Check if new ID collides with another user
      if (targetId.toLowerCase() !== currentId.toLowerCase()) {
        const idCollision = state.users.some(
          (u) => u.id.toLowerCase() !== currentId.toLowerCase() && u.id.toLowerCase() === targetId.toLowerCase()
        );
        if (idCollision) {
          return { success: false, error: `User ID "${targetId}" is already taken by another account.` };
        }
      }

      // Check if new Username collides with another user
      if (targetUsername !== existingUser.username.toLowerCase()) {
        const usernameCollision = state.users.some(
          (u) => u.id.toLowerCase() !== currentId.toLowerCase() && u.username.toLowerCase() === targetUsername
        );
        if (usernameCollision) {
          return { success: false, error: `Username "${updates.username}" is already taken by another user.` };
        }
      }

      const updatedUser: User = {
        ...existingUser,
        ...updates,
        id: targetId,
        username: updates.username !== undefined ? updates.username.trim() : existingUser.username,
        name: updates.name !== undefined ? updates.name.trim() : existingUser.name,
      };

      const audit = logAudit(
        'USER_UPDATE',
        'User',
        targetId,
        `Updated user ${updatedUser.name} (ID: ${targetId}, Username: ${updatedUser.username}, Category: ${updatedUser.category || 'N/A'}, Designation: ${updatedUser.designation || 'N/A'})`
      );

      setState((prev) => {
        const updatedUsers = prev.users.map((u) => (u.id === currentId ? updatedUser : u));
        const updatedShifts = prev.shifts.map((sh) => {
          if (sh.cashierId === currentId) {
            return {
              ...sh,
              cashierId: targetId,
              cashierName: updatedUser.name,
            };
          }
          return sh;
        });

        const isCurrent = prev.currentUser.id === currentId;

        return {
          ...prev,
          users: updatedUsers,
          currentUser: isCurrent ? updatedUser : prev.currentUser,
          shifts: updatedShifts,
          auditLogs: [audit, ...prev.auditLogs],
        };
      });

      addToast('success', 'User Updated', `Changes saved for ${updatedUser.name} (${updatedUser.username}).`);
      return { success: true };
    },
    [state.users, logAudit, addToast]
  );

  const toggleUserStatus = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
      }));
      addToast('info', 'Status Updated', 'User access status toggled.');
      return { success: true };
    },
    [addToast]
  );

  // Settings
  const updateSettings = useCallback(
    (updates: Partial<MessSettings>) => {
      const audit = logAudit('SETTINGS_UPDATE', 'Settings', 'CONFIG', `Updated mess configuration properties`);

      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
        auditLogs: [audit, ...prev.auditLogs],
      }));

      addToast('success', 'Settings Saved', 'Mess configuration parameters updated.');
      return { success: true };
    },
    [logAudit, addToast]
  );

  return (
    <MessContext.Provider
      value={{
        state,
        currentUser: state.currentUser,
        currentStudent,
        toasts,
        addToast,
        dismissToast,
        login,
        loginUser,
        logout,
        resetDemoData,
        loginStudent,
        activateStudentAccount,
        payStudentDue,
        createBill,
        cancelBill,
        refundBill,
        addStudent,
        updateStudent,
        toggleStudentStatus,
        bulkImportStudents,
        addProduct,
        updateProduct,
        updateProductPrice,
        toggleProductAvailability,
        adjustStock,
        startShift,
        closeShift,
        addUser,
        updateUser,
        toggleUserStatus,
        updateSettings,
        updateMealSchedule,
        isLoggedIn,
      }}
    >
      {children}
    </MessContext.Provider>
  );
};

export const useMess = (): MessContextType => {
  const context = useContext(MessContext);
  if (!context) {
    throw new Error('useMess must be used within a MessProvider');
  }
  return context;
};
