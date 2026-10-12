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
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  generate500Students,
  generateSeededBills,
} from './mockSeed';

const STORAGE_KEY = 'HOSTEL_MESS_SYSTEM_STATE_V2';

export interface AppState {
  users: User[];
  students: Student[];
  products: Product[];
  bills: Bill[];
  stockMovements: StockMovement[];
  shifts: Shift[];
  auditLogs: AuditLog[];
  settings: MessSettings;
  currentUser: User;
}

function initializeState(): AppState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.students && parsed.bills && parsed.products) {
        // Find or fallback current user
        const currentUser = parsed.currentUser || parsed.users[0] || INITIAL_USERS[0];
        return {
          ...parsed,
          currentUser,
        };
      }
    } catch (e) {
      console.error('Failed to parse cached mess system state, re-seeding...', e);
    }
  }

  // Seed fresh state
  const students = generate500Students();
  const products = [...INITIAL_PRODUCTS];
  const users = [...INITIAL_USERS];
  const { bills, stockMovements, shifts, auditLogs } = generateSeededBills(
    students,
    products,
    users
  );

  const freshState: AppState = {
    users,
    students,
    products,
    bills,
    stockMovements,
    shifts,
    auditLogs,
    settings: { ...INITIAL_SETTINGS },
    currentUser: users[0], // Default logged-in as admin
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
  } catch (e) {
    console.warn('LocalStorage quota limit reached, operating in memory', e);
  }

  return freshState;
}

export function saveStateToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state to localStorage', e);
  }
}

export function resetStateToInitial(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  return initializeState();
}

export const initialAppState: AppState = initializeState();
