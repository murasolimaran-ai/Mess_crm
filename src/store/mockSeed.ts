import {
  Student,
  Product,
  Bill,
  User,
  Shift,
  StockMovement,
  AuditLog,
  MessSettings,
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-001',
    username: 'admin',
    name: 'Dr. R. Ramanathan',
    role: 'admin',
    category: 'General / Central',
    designation: 'System Administrator',
    genderCategory: 'Co-ed',
    email: 'warden.mess@hostel.edu',
    phone: '+91 98450 12345',
    active: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    permissions: ['all_modules', 'user_management', 'finance_reports', 'settings_edit', 'audit_full'],
  },
  {
    id: 'USR-MENS-01',
    username: 'cashier1',
    name: 'Ramesh Kumar',
    role: 'cashier',
    category: "Men's Mess",
    designation: "Men's Mess Cashier",
    genderCategory: 'Men',
    email: 'ramesh.cashier@hostel.edu',
    phone: '+91 98765 11223',
    active: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    permissions: ['pos_billing', 'shift_drawer', 'my_transactions'],
  },
  {
    id: 'USR-MENS-02',
    username: 'cashier2',
    name: 'Suresh Patil',
    role: 'cashier',
    category: "Men's Hostel",
    designation: "Men's Hostel Cashier",
    genderCategory: 'Men',
    email: 'suresh.cashier@hostel.edu',
    phone: '+91 98765 44556',
    active: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    permissions: ['pos_billing', 'shift_drawer', 'my_transactions'],
  },
  {
    id: 'USR-WMNS-01',
    username: 'cashier3',
    name: 'Priya Sharma',
    role: 'cashier',
    category: "Women's Mess",
    designation: "Women's Mess Cashier",
    genderCategory: 'Women',
    email: 'priya.cashier@hostel.edu',
    phone: '+91 98765 77889',
    active: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    permissions: ['pos_billing', 'shift_drawer', 'my_transactions'],
  },
  {
    id: 'USR-MPG-01',
    username: 'cashier4',
    name: 'Karthik Anand',
    role: 'cashier',
    category: "Men's PG",
    designation: "Men's Hostel Cashier",
    genderCategory: 'Men',
    email: 'karthik.pg@hostel.edu',
    phone: '+91 98765 99001',
    active: true,
    lastLogin: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    permissions: ['pos_billing', 'shift_drawer', 'my_transactions'],
  },
];

export const INITIAL_SETTINGS: MessSettings = {
  messName: 'Kavery Central Mess & Dining Hall',
  instituteName: 'Campus Engineering & Technology Hostels',
  phone: '+91 44 2257 8000',
  email: 'mess-admin@campus.edu',
  address: 'Hostel Zone North, Main Campus Road, Pin 600036',
  gstNumber: '33AAAAA0000A1Z5',
  gstin: '33AAAAA0000A1Z5',
  currency: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata (IST)',
  billPrefix: 'BILL-2026-',
  allowNegativeStock: false,
  receiptHeader: 'Thank you for dining at Kavery Central Mess! Please retain this slip.',
  receiptFooter: 'For queries, contact mess supervisor at Extension 4021.',
  creditAllowed: true,
  maxCreditLimit: 3000,
  allowDiscounts: true,
  maxDiscountPercent: 15,
  lowStockAlertThreshold: 15,
  printHeaderNote: 'Thank you for dining at Kavery Central Mess! Please retain this slip for monthly reconciliation.',
  printFooterNote: 'For queries, contact mess supervisor at Extension 4021 or email mess-admin@campus.edu.',
  paymentMethods: {
    cash: true,
    upi: true,
    hostel_credit: true,
  },
  mealSchedule: {
    morning: {
      name: 'Morning Breakfast',
      tamilName: 'காலை உணவு',
      startTime: '06:30',
      endTime: '11:30',
      enabled: true,
    },
    afternoon: {
      name: 'Afternoon Lunch',
      tamilName: 'மதிய உணவு',
      startTime: '11:31',
      endTime: '16:30',
      enabled: true,
    },
    evening: {
      name: 'Evening Dinner & Snacks',
      tamilName: 'மாலை & இரவு உணவு',
      startTime: '16:31',
      endTime: '22:30',
      enabled: true,
    },
  },
  categories: [
    'Breakfast & Tiffin',
    'Lunch & Dinner',
    'Snacks & Quick Bites',
    'Beverages & Dairy',
    'Desserts & Sweets',
    'Eggs & Extras',
  ],
};

export const INITIAL_PRODUCTS: Product[] = [
  // Breakfast & Tiffin (Morning Slot)
  {
    id: 'PRD-001',
    code: 'BF-DOSA',
    name: 'Ghee Masala Dosa',
    category: 'Breakfast & Tiffin',
    mealSlot: 'morning',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
    price: 45,
    costPrice: 24,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 40,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🥞',
    description: 'Crispy fermented crepe with spiced potato filling, served with sambar and two chutneys.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-002',
    code: 'BF-IDLI',
    name: 'Steamed Idli (2 pcs) with Vada',
    category: 'Breakfast & Tiffin',
    mealSlot: 'morning',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
    price: 35,
    costPrice: 18,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 65,
    minStockThreshold: 20,
    isAvailable: true,
    imageEmoji: '🥟',
    description: 'Soft fluffy rice cakes with 1 crispy medu vada, served with hot lentil sambar.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-003',
    code: 'BF-PURI',
    name: 'Poori Bhaji (3 pcs)',
    category: 'Breakfast & Tiffin',
    mealSlot: 'morning',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
    price: 40,
    costPrice: 20,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 30,
    minStockThreshold: 10,
    isAvailable: true,
    imageEmoji: '🫓',
    description: 'Puffed whole wheat bread served with spiced potato curry and pickle.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-004',
    code: 'BF-UPMA',
    name: 'Rava Upma with Chutney',
    category: 'Breakfast & Tiffin',
    mealSlot: 'morning',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop&q=80',
    price: 25,
    costPrice: 12,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 25,
    minStockThreshold: 8,
    isAvailable: true,
    imageEmoji: '🍲',
    description: 'Semolina cooked with vegetables, mustard seeds, and roasted cashews.',
    updatedAt: new Date().toISOString(),
  },

  // Lunch & Dinner (Afternoon & Evening)
  {
    id: 'PRD-005',
    code: 'LN-SPL-THALI',
    name: 'Special Veg Thali Meal',
    category: 'Lunch & Dinner',
    mealSlot: 'afternoon',
    imageUrl: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400&auto=format&fit=crop&q=80',
    price: 85,
    costPrice: 48,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 50,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🍱',
    description: 'Steamed rice, 2 rotis, paneer butter masala, dal tadka, curd, papad and sweet.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-006',
    code: 'LN-MINI-MEAL',
    name: 'South Indian Mini Meal',
    category: 'Lunch & Dinner',
    mealSlot: 'afternoon',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
    price: 55,
    costPrice: 30,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 70,
    minStockThreshold: 20,
    isAvailable: true,
    imageEmoji: '🍛',
    description: 'Sambar rice or variety rice served with potato fry, rasam, curd and papad.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-007',
    code: 'LN-CHAPATI',
    name: 'Butter Chapati Set (3 pcs) + Dal',
    category: 'Lunch & Dinner',
    mealSlot: 'evening',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80',
    price: 40,
    costPrice: 20,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 45,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🫓',
    description: 'Fresh wheat chapatis served with homestyle dal tadka and pickle.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-008',
    code: 'LN-PANEER',
    name: 'Extra Paneer Butter Masala (Portion)',
    category: 'Lunch & Dinner',
    mealSlot: 'evening',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
    price: 50,
    costPrice: 28,
    unit: 'Bowl',
    isStockTracked: true,
    stockQuantity: 18,
    minStockThreshold: 8,
    isAvailable: true,
    imageEmoji: '🥘',
    description: 'Rich tomato gravy with fresh paneer cubes and butter.',
    updatedAt: new Date().toISOString(),
  },

  // Snacks & Quick Bites (Evening Slot)
  {
    id: 'PRD-009',
    code: 'SN-SAMOSA',
    name: 'Punjabi Samosa (2 pcs) + Chutney',
    category: 'Snacks & Quick Bites',
    mealSlot: 'evening',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
    price: 25,
    costPrice: 12,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 55,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🥟',
    description: 'Crispy pastry loaded with spiced potatoes, peas, and mint chutney.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-010',
    code: 'SN-MAGGI-VEG',
    name: 'Vegetable Masala Maggi',
    category: 'Snacks & Quick Bites',
    mealSlot: 'evening',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
    price: 35,
    costPrice: 16,
    unit: 'Bowl',
    isStockTracked: true,
    stockQuantity: 60,
    minStockThreshold: 20,
    isAvailable: true,
    imageEmoji: '🍜',
    description: 'Hot 2-minute noodles tossed with onions, tomatoes, and secret mess spices.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-011',
    code: 'SN-CHEESE-MAGGI',
    name: 'Cheese Corn Maggi',
    category: 'Snacks & Quick Bites',
    mealSlot: 'evening',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
    price: 50,
    costPrice: 25,
    unit: 'Bowl',
    isStockTracked: true,
    stockQuantity: 28,
    minStockThreshold: 10,
    isAvailable: true,
    imageEmoji: '🧀',
    description: 'Noodles topped with melted mozzarella cheese and sweet corn.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-012',
    code: 'SN-BREAD-OMELET',
    name: 'Bread Omelette (Double Egg)',
    category: 'Snacks & Quick Bites',
    mealSlot: 'evening',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
    price: 45,
    costPrice: 22,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 35,
    minStockThreshold: 10,
    isAvailable: true,
    imageEmoji: '🥪',
    description: 'Toasted bread slices wrapped inside seasoned double egg omelette.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-013',
    code: 'SN-PAV-BHAJI',
    name: 'Mumbai Pav Bhaji (2 Pav)',
    category: 'Snacks & Quick Bites',
    mealSlot: 'evening',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop&q=80',
    price: 55,
    costPrice: 28,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 22,
    minStockThreshold: 10,
    isAvailable: true,
    imageEmoji: '🥖',
    description: 'Butter toasted pavs served with thick mashed vegetable gravy and onion lemon salad.',
    updatedAt: new Date().toISOString(),
  },

  // Beverages & Dairy (All-Day Slot)
  {
    id: 'PRD-014',
    code: 'BV-CHAI',
    name: 'Special Masala Chai',
    category: 'Beverages & Dairy',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
    price: 15,
    costPrice: 6,
    unit: 'Cup',
    isStockTracked: true,
    stockQuantity: 120,
    minStockThreshold: 30,
    isAvailable: true,
    imageEmoji: '☕',
    description: 'Fresh milk tea infused with ginger and fragrant green cardamom.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-015',
    code: 'BV-COFFEE',
    name: 'South Indian Filter Coffee',
    category: 'Beverages & Dairy',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    price: 20,
    costPrice: 9,
    unit: 'Cup',
    isStockTracked: true,
    stockQuantity: 90,
    minStockThreshold: 25,
    isAvailable: true,
    imageEmoji: '☕',
    description: 'Authentic decoction brew with frothed whole milk.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-016',
    code: 'BV-BADAM-MILK',
    name: 'Chilled Badam Milk',
    category: 'Beverages & Dairy',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80',
    price: 30,
    costPrice: 15,
    unit: 'Glass',
    isStockTracked: true,
    stockQuantity: 40,
    minStockThreshold: 12,
    isAvailable: true,
    imageEmoji: '🥛',
    description: 'Cool milk sweetened with almond paste, saffron flavor, and chopped nuts.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-017',
    code: 'BV-BUTTERMILK',
    name: 'Masala Spiced Chaas / Buttermilk',
    category: 'Beverages & Dairy',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop&q=80',
    price: 15,
    costPrice: 6,
    unit: 'Glass',
    isStockTracked: true,
    stockQuantity: 50,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🥛',
    description: 'Refreshing churned curd with ginger, green chilli, curry leaves, and cumin.',
    updatedAt: new Date().toISOString(),
  },

  // Desserts & Sweets (All-Day Slot)
  {
    id: 'PRD-018',
    code: 'DS-GULAB-JAMUN',
    name: 'Warm Gulab Jamun (2 pcs)',
    category: 'Desserts & Sweets',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&auto=format&fit=crop&q=80',
    price: 30,
    costPrice: 14,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 32,
    minStockThreshold: 10,
    isAvailable: true,
    imageEmoji: '🍩',
    description: 'Soft milk dumplings soaked in rose flavored cardamom sugar syrup.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-019',
    code: 'DS-ICE-CREAM',
    name: 'Vanilla / Chocolate Ice Cream Cup',
    category: 'Desserts & Sweets',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=80',
    price: 25,
    costPrice: 13,
    unit: 'Cup',
    isStockTracked: true,
    stockQuantity: 8,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🍨',
    description: 'Chilled branded dairy ice cream single cup.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-020',
    code: 'DS-FRUIT-CUSTARD',
    name: 'Chilled Fruit Custard',
    category: 'Desserts & Sweets',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80',
    price: 35,
    costPrice: 18,
    unit: 'Bowl',
    isStockTracked: true,
    stockQuantity: 14,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🍧',
    description: 'Rich vanilla custard layered with fresh seasonal fruits.',
    updatedAt: new Date().toISOString(),
  },

  // Eggs & Extras (Evening & All-Day Slot)
  {
    id: 'PRD-021',
    code: 'EG-BOILED',
    name: 'Boiled Egg (Single) with Pepper',
    category: 'Eggs & Extras',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80',
    price: 12,
    costPrice: 6,
    unit: 'Piece',
    isStockTracked: true,
    stockQuantity: 80,
    minStockThreshold: 25,
    isAvailable: true,
    imageEmoji: '🥚',
    description: 'Farm fresh hard boiled egg served with salt and crushed black pepper.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-022',
    code: 'EG-BHURJI',
    name: 'Egg Bhurji (2 Eggs) with Onion',
    category: 'Eggs & Extras',
    mealSlot: 'evening',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
    price: 35,
    costPrice: 16,
    unit: 'Plate',
    isStockTracked: true,
    stockQuantity: 40,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🍳',
    description: 'Scrambled eggs stir fried with chopped onions, green chilies, tomatoes, and cilantro.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-023',
    code: 'EG-OMELETTE',
    name: 'Masala Omelette (Single Egg)',
    category: 'Eggs & Extras',
    mealSlot: 'all_day',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
    price: 22,
    costPrice: 10,
    unit: 'Piece',
    isStockTracked: true,
    stockQuantity: 50,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🍳',
    description: 'Single egg pan omelette seasoned with Indian herbs and spices.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PRD-024',
    code: 'EG-CHICKEN-FRY',
    name: 'Hostel Special Chicken Sukka (Portion)',
    category: 'Eggs & Extras',
    mealSlot: 'afternoon',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    price: 75,
    costPrice: 42,
    unit: 'Portion',
    isStockTracked: true,
    stockQuantity: 6,
    minStockThreshold: 15,
    isAvailable: true,
    imageEmoji: '🍗',
    description: 'Spiced semi-dry chicken roasted in traditional south coastal spices and curry leaves.',
    updatedAt: new Date().toISOString(),
  },
];

// Helper to generate 500 realistic students
export function generate500Students(): Student[] {
  const departments = [
    'Computer Science & Engineering',
    'Mechanical Engineering',
    'Electrical & Electronics',
    'Civil Engineering',
    'Electronics & Communication',
    'Information Technology',
    'Chemical Engineering',
    'Artificial Intelligence & Data Science',
  ];

  const blocks = ['Block A', 'Block B', 'Block C', 'Block D'];

  const firstNames = [
    'Aarav', 'Aditya', 'Akash', 'Ananya', 'Anirudh', 'Arjun', 'Ashwin', 'Bhavya',
    'Chaitanya', 'Deepak', 'Divya', 'Ganesh', 'Gautam', 'Hari', 'Harini', 'Ishaan',
    'Jayant', 'Karthik', 'Kavya', 'Keerthana', 'Krishna', 'Madhav', 'Manish', 'Manoj',
    'Meera', 'Naveen', 'Nikhil', 'Nithya', 'Pooja', 'Pranav', 'Praveen', 'Rahul',
    'Rajesh', 'Rakesh', 'Rohit', 'Sahil', 'Sai', 'Sanjay', 'Santosh', 'Saravanan',
    'Shreya', 'Sneha', 'Srinivas', 'Surya', 'Swathi', 'Tarun', 'Tejas', 'Varun',
    'Venkatesh', 'Vignesh', 'Vijay', 'Vishal', 'Yash', 'Abhishek', 'Akshaya', 'Bhuvan',
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Iyer', 'Menon', 'Nair', 'Reddy', 'Rao', 'Sundaram',
    'Krishnan', 'Kumar', 'Singh', 'Gupta', 'Joshi', 'Bose', 'Chakraborty', 'Deshmukh',
    'Kulkarni', 'Pillai', 'Murthy', 'Hegde', 'Bhat', 'Shetty', 'Swamy', 'Chowdhury',
    'Banerjee', 'Mishra', 'Pandey', 'Tiwari', 'Natarajan', 'Subramanian', 'Vaidya',
  ];

  const students: Student[] = [];

  for (let i = 1; i <= 500; i++) {
    const idNum = String(i).padStart(3, '0');
    const id = `STU-${idNum}`;
    const fName = firstNames[(i * 7) % firstNames.length];
    const lName = lastNames[(i * 13) % lastNames.length];
    const name = `${fName} ${lName}`;
    const dept = departments[i % departments.length];
    const year = ((i % 4) + 1);
    const block = blocks[i % blocks.length];
    const floor = ((i % 4) + 1);
    const roomNum = ((i % 30) + 1).toString().padStart(2, '0');
    const room = `${block.replace('Block ', '')}-${floor}${roomNum}`;

    // A few students can be inactive or suspended for demo testing
    let status: Student['status'] = 'active';
    if (i === 17 || i === 84 || i === 142) status = 'inactive';
    if (i === 55 || i === 312) status = 'suspended';

    // Simulated financial numbers
    const baseSpend = (i * 123) % 2200;
    const monthlySpending = status === 'active' ? baseSpend + 250 : 0;
    const totalSpending = monthlySpending * 4 + ((i * 311) % 4000);
    const pendingBalance = i % 5 === 0 ? ((i * 79) % 850) : 0;

    students.push({
      id,
      name,
      department: dept,
      year,
      roomNumber: room,
      hostelBlock: block,
      phone: `+91 9${((i * 1234567) % 899999999 + 100000000)}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@hostel.edu`,
      status,
      creditLimit: 3000,
      monthlySpending,
      totalSpending,
      pendingBalance,
      balance: pendingBalance,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (90 + (i % 60))).toISOString(),
      billsCount: Math.max(1, Math.round(monthlySpending / 50)),
      barcode: `BC-${id}`,
    });
  }

  return students;
}

// Generate realistic starting bills linked to real students and products
export function generateSeedBills(students: Student[], products: Product[]): Bill[] {
  const bills: Bill[] = [];
  const cashiers = [INITIAL_USERS[1], INITIAL_USERS[2]]; // Ramesh Kumar, Suresh Patil
  const now = Date.now();

  const paymentModes: Array<Bill['paymentMethod']> = ['upi', 'cash', 'hostel_credit', 'upi', 'cash'];

  // Generate 45 realistic recent bills
  for (let b = 1; b <= 45; b++) {
    const student = students[(b * 11) % 200];
    const cashier = cashiers[b % 2];
    const minutesAgo = (45 - b) * 35; // distributed over past ~26 hours
    const billTime = new Date(now - minutesAgo * 60 * 1000).toISOString();

    // Select 1 to 3 items
    const prod1 = products[(b * 3) % products.length];
    const prod2 = products[(b * 7) % products.length];
    const qty1 = (b % 3) + 1;
    const qty2 = b % 2 === 0 ? 1 : 2;

    const items = [
      {
        productId: prod1.id,
        productName: prod1.name,
        category: prod1.category,
        unitPrice: prod1.price,
        quantity: qty1,
        total: prod1.price * qty1,
        unit: prod1.unit,
      },
    ];

    if (b % 2 === 0) {
      items.push({
        productId: prod2.id,
        productName: prod2.name,
        category: prod2.category,
        unitPrice: prod2.price,
        quantity: qty2,
        total: prod2.price * qty2,
        unit: prod2.unit,
      });
    }

    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const discount = b % 7 === 0 ? Math.round(subtotal * 0.1) : 0;
    const totalAmount = subtotal - discount;

    const paymentMethod = paymentModes[b % paymentModes.length];
    let paymentStatus: Bill['paymentStatus'] = 'paid';
    let billStatus: Bill['status'] = 'completed';

    if (paymentMethod === 'hostel_credit' && b % 3 === 0) {
      paymentStatus = 'pending';
    }

    // Bill #42 was refunded for demo
    if (b === 42) {
      billStatus = 'refunded';
      paymentStatus = 'refunded';
    }

    // Bill #38 was cancelled for demo
    if (b === 38) {
      billStatus = 'cancelled';
    }

    const billNumber = `BILL-2026-${String(b).padStart(4, '0')}`;

    bills.push({
      id: `bill-${b}`,
      billNumber,
      studentId: student.id,
      studentName: student.name,
      studentDepartment: student.department,
      studentRoom: student.roomNumber,
      studentBlock: student.hostelBlock,
      cashierId: cashier.id,
      cashierName: cashier.name,
      timestamp: billTime,
      items,
      subtotal,
      discount,
      totalAmount,
      total: totalAmount,
      paymentMethod,
      paymentStatus,
      status: billStatus,
      notes: b === 42 ? 'Refunded: Wrong item punched by student in rush' : undefined,
      refundedAt: b === 42 ? billTime : undefined,
      refundedBy: b === 42 ? cashier.name : undefined,
      refundReason: b === 42 ? 'Student exchanged dish preference' : undefined,
      cancelledAt: b === 38 ? billTime : undefined,
      cancelledBy: b === 38 ? cashier.name : undefined,
      cancellationReason: b === 38 ? 'Duplicate punch accidentally registered' : undefined,
    });
  }

  return bills;
}

export function generateInitialShifts(): Shift[] {
  const now = new Date();
  const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30);
  const todayAfternoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0);

  return [
    {
      id: 'SHIFT-2026-001',
      cashierId: 'USR-002',
      cashierName: 'Ramesh Kumar',
      openedAt: todayMorning.toISOString(),
      closedAt: todayAfternoon.toISOString(),
      status: 'closed',
      openingFloat: 1500,
      cashInflow: 2840,
      upiInflow: 3920,
      creditInflow: 1150,
      totalSales: 7910,
      billsCount: 28,
      closingCashCounted: 4340, // 1500 + 2840 = 4340 (perfect match, 0 variance)
      cashVariance: 0,
      notes: 'Morning breakfast and lunch rush completed smoothly.',
    },
    {
      id: 'SHIFT-2026-002',
      cashierId: 'USR-003',
      cashierName: 'Suresh Patil',
      openedAt: todayAfternoon.toISOString(),
      status: 'open',
      openingFloat: 1500,
      cashInflow: 1650,
      upiInflow: 2420,
      creditInflow: 780,
      totalSales: 4850,
      billsCount: 17,
      notes: 'Evening tea and dinner counter active.',
    },
  ];
}

export function generateInitialStockMovements(): StockMovement[] {
  const now = Date.now();
  return [
    {
      id: 'MOV-001',
      productId: 'PRD-001',
      productName: 'Ghee Masala Dosa',
      type: 'in',
      quantity: 50,
      previousStock: 0,
      newStock: 50,
      reason: 'Morning raw batter & potato prep delivery',
      performedBy: 'Kitchen Supervisor',
      timestamp: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: 'MOV-002',
      productId: 'PRD-014',
      productName: 'Special Masala Chai',
      type: 'in',
      quantity: 150,
      previousStock: 0,
      newStock: 150,
      reason: 'Fresh dairy milk crate batch (20L)',
      performedBy: 'Storekeeper',
      timestamp: new Date(now - 1000 * 60 * 60 * 7).toISOString(),
    },
    {
      id: 'MOV-003',
      productId: 'PRD-019',
      productName: 'Vanilla / Chocolate Ice Cream Cup',
      type: 'wastage',
      quantity: 4,
      previousStock: 12,
      newStock: 8,
      reason: 'Freezer temperature trip during power maintenance',
      performedBy: 'Dr. R. Ramanathan',
      timestamp: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
    },
  ];
}

export function generateInitialAuditLogs(): AuditLog[] {
  const now = Date.now();
  return [
    {
      id: 'AUD-001',
      timestamp: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
      userId: 'USR-001',
      userName: 'Dr. R. Ramanathan',
      userRole: 'admin',
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'System',
      recordId: 'SYS-INIT',
      description: 'Hostel Mess Smart Billing System bootstrapped with 500 residents & 24 catalog dishes.',
    },
    {
      id: 'AUD-002',
      timestamp: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
      userId: 'USR-002',
      userName: 'Ramesh Kumar',
      userRole: 'cashier',
      action: 'SHIFT_OPEN',
      entityType: 'Shift',
      recordId: 'SHIFT-2026-001',
      description: 'Morning counter opened with ₹1,500.00 cash drawer float.',
    },
    {
      id: 'AUD-003',
      timestamp: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      userId: 'USR-002',
      userName: 'Ramesh Kumar',
      userRole: 'cashier',
      action: 'BILL_REFUND',
      entityType: 'Bill',
      recordId: 'BILL-2026-0042',
      description: 'Refunded bill BILL-2026-0042 for Aarav Sharma (STU-001).',
      reason: 'Student exchanged dish preference during counter rush.',
    },
    {
      id: 'AUD-004',
      timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      userId: 'USR-003',
      userName: 'Suresh Patil',
      userRole: 'cashier',
      action: 'SHIFT_OPEN',
      entityType: 'Shift',
      recordId: 'SHIFT-2026-002',
      description: 'Evening dinner counter opened with ₹1,500.00 cash drawer float.',
    },
  ];
}
