import {
  Student,
  Product,
  Bill,
  User,
  Shift,
  StockMovement,
  AuditLog,
  MessSettings,
  StudentPayment,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  generate500Students,
  generateSeedBills,
  generateInitialShifts,
  generateInitialStockMovements,
  generateInitialAuditLogs,
} from './mockSeed';

const STORAGE_KEY = 'HOSTEL_MESS_MANAGEMENT_SYSTEM_V4';

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

export function initializeState(): AppState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.students && parsed.bills && parsed.products && parsed.settings && parsed.users) {
        // Ensure users have category, designation, and genderCategory
        const enrichedUsers: User[] = (parsed.users as User[]).map((u, idx) => {
          if (!u.category || !u.designation) {
            const fallback = INITIAL_USERS[idx] || INITIAL_USERS[0];
            return {
              ...u,
              category: u.category || fallback.category || "Men's Mess",
              designation: u.designation || fallback.designation || (u.role === 'admin' ? 'System Administrator' : "Men's Mess Cashier"),
              genderCategory: u.genderCategory || fallback.genderCategory || (u.role === 'admin' ? 'Co-ed' : 'Men'),
            };
          }
          return u;
        });

        // Ensure products have mealSlot and imageUrl
        const enrichedProducts: Product[] = (parsed.products as Product[]).map((p) => {
          const initP = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
          return {
            ...p,
            mealSlot: p.mealSlot || initP?.mealSlot || 'all_day',
            imageUrl: p.imageUrl || initP?.imageUrl,
          };
        });

        const activeUser = enrichedUsers.find((u) => u.id === parsed.currentUser?.id) || enrichedUsers[0];

        return {
          ...parsed,
          users: enrichedUsers,
          products: enrichedProducts,
          settings: {
            ...INITIAL_SETTINGS,
            ...parsed.settings,
            mealSchedule: parsed.settings.mealSchedule || INITIAL_SETTINGS.mealSchedule,
          },
          currentUser: activeUser,
          activeShift: parsed.shifts?.find((s: Shift) => s.status === 'open') || null,
          studentPayments: parsed.studentPayments || [],
        };
      }
    } catch (e) {
      console.error('Failed to parse cached mess state, resetting to initial seed', e);
    }
  }

  // Generate complete seed
  const students = generate500Students();
  const products = [...INITIAL_PRODUCTS];
  const bills = generateSeedBills(students, products);
  const shifts = generateInitialShifts();
  const stockMovements = generateInitialStockMovements();
  const auditLogs = generateInitialAuditLogs();
  const activeShift = shifts.find((s) => s.status === 'open') || null;

  const freshState: AppState = {
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0], // Default admin
    students,
    products,
    bills,
    shifts,
    activeShift,
    stockMovements,
    auditLogs,
    settings: INITIAL_SETTINGS,
    studentPayments: [],
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
  } catch (e) {
    console.warn('LocalStorage limit reached, running with memory store', e);
  }

  return freshState;
}

export function saveStateToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not persist mess state to localStorage', e);
  }
}

export function resetStateToInitial(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  return initializeState();
}

export const initialAppState: AppState = initializeState();
