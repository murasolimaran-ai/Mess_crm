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
    email: 'warden.mess@hostel.edu',
    phone: '+91 98765 43210',
    active: true,
    lastLogin: new Date(Date.now() - 15 * 60000).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    permissions: ['all'],
  },
  {
    id: 'USR-002',
    username: 'cashier1',
    name: 'Ramesh Kumar (Morning)',
    role: 'cashier',
    email: 'ramesh.pos@hostel.edu',
    phone: '+91 98111 22334',
    active: true,
    lastLogin: new Date(Date.now() - 45 * 60000).toISOString(),
    permissions: ['pos.read', 'pos.write', 'shifts.read'],
  },
  {
    id: 'USR-003',
    username: 'cashier2',
    name: 'Suresh Patil (Evening)',
    role: 'cashier',
    email: 'suresh.pos@hostel.edu',
    phone: '+91 98222 33445',
    active: true,
    lastLogin: new Date(Date.now() - 360 * 60000).toISOString(),
    permissions: ['pos.read', 'pos.write', 'shifts.read'],
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'PRD-101',
    code: 'THL-SPL',
    name: 'Special Royal Thali',
    category: 'Meals & Thali',
    price: 90,
    costPrice: 55,
    isStockTracked: true,
    stockQuantity: 45,
    minStockThreshold: 15,
    isAvailable: true,
    unit: 'thali',
    imageEmoji: '🍱',
    description: 'Paneer sabzi, dal makhani, 3 rotis, jeera rice, gulab jamun, papad & salad',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PRD-102',
    code: 'THL-NRTH',
    name: 'North Indian Thali',
    category: 'Meals & Thali',
    price: 75,
    costPrice: 45,
    isStockTracked: true,
    stockQuantity: 60,
    minStockThreshold: 20,
    isAvailable: true,
    unit: 'thali',
    imageEmoji: '🍛',
    description: 'Seasonal veg curry, dal tadka, 3 phulkas, steamed rice, raita & pickle',
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'PRD-103',
    code: 'THL-STH',
    name: 'South Indian Meals',
    category: 'Meals & Thali',
    price: 70,
    costPrice: 40,
    isStockTracked: true,
    stockQuantity: 55,
    minStockThreshold: 15,
    isAvailable: true,
    unit: 'meal',
    imageEmoji: '🍲',
    description: 'Unlimited rice, sambar, rasam, kootu, curd, appalam & pickle',
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'PRD-104',
    code: 'THL-MINI',
    name: 'Mini Dal Chawal Combo',
    category: 'Meals & Thali',
    price: 50,
    costPrice: 28,
    isStockTracked: true,
    stockQuantity: 70,
    minStockThreshold: 25,
    isAvailable: true,
    unit: 'plate',
    imageEmoji: '🥣',
    description: 'Steaming basmati rice with homestyle yellow dal and papad',
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'PRD-105',
    code: 'BRK-MDOS',
    name: 'Crispy Masala Dosa',
    category: 'Breakfast & Tiffin',
    price: 45,
    costPrice: 22,
    isStockTracked: true,
    stockQuantity: 40,
    minStockThreshold: 12,
    isAvailable: true,
    unit: 'pcs',
    imageEmoji: '🥞',
    description: 'Golden fermented crepe stuffed with spiced potato masala, served with 2 chutneys & sambar',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'PRD-106',
    code: 'BRK-PDOS',
    name: 'Plain Paper Dosa',
    category: 'Breakfast & Tiffin',
    price: 35,
    costPrice: 16,
    isStockTracked: true,
    stockQuantity: 35,
    minStockThreshold: 10,
    isAvailable: true,
    unit: 'pcs',
    imageEmoji: '🫓',
    description: 'Crisp plain dosa served with coconut chutney & piping hot sambar',
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'PRD-107',
    code: 'BRK-IDLI',
    name: 'Steamed Idli Sambar (2 pcs)',
    category: 'Breakfast & Tiffin',
    price: 30,
    costPrice: 14,
    isStockTracked: true,
    stockQuantity: 8, // Low stock on purpose
    minStockThreshold: 15,
    isAvailable: true,
    unit: 'plate',
    imageEmoji: '⚪',
    description: 'Soft fluffy steamed rice cakes dipped in lentil sambar and coconut chutney',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'PRD-108',
    code: 'BRK-VADA',
    name: 'Medu Vada (2 pcs)',
    category: 'Breakfast & Tiffin',
    price: 35,
    costPrice: 18,
    isStockTracked: true,
    stockQuantity: 5, // Low stock on purpose
    minStockThreshold: 15,
    isAvailable: true,
    unit: 'plate',
    imageEmoji: '🍩',
    description: 'Crisp fried black gram donuts with coconut & tomato chutney',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'PRD-109',
    code: 'BRK-POHA',
    name: 'Indori Kanda Poha',
    category: 'Breakfast & Tiffin',
    price: 25,
    costPrice: 11,
    isStockTracked: true,
    stockQuantity: 50,
    minStockThreshold: 15,
    isAvailable: true,
    unit: 'plate',
    imageEmoji: '🍚',
    description: 'Flattened rice tempered with mustard, onions, roasted peanuts and lemon',
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'PRD-110',
    code: 'BRK-PRTH',
    name: 'Aloo Paratha with Curd',
    category: 'Breakfast & Tiffin',
    price: 45,
    costPrice: 20,
    isStockTracked: true,
    stockQuantity: 30,
    minStockThreshold: 10,
    isAvailable: true,
    unit: 'plate',
    imageEmoji: '🫓',
    description: 'Whole wheat flatbread stuffed with spiced potato filling, butter & chilled curd',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PRD-111',
    code: 'SNK-SAMS',
    name: 'Punjabi Samosa (2 pcs)',
    category: 'Snacks & Quick Bites',
    price: 20,
    costPrice: 9,
    isStockTracked: true,
    stockQuantity: 65,
    minStockThreshold: 20,
    isAvailable: true,
    unit: 'plate',
    imageEmoji: '🥟',
    description: 'Crisp pastry triangles filled with spiced potatoes and green peas with saunth chutney',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PRD-112',
    code: 'SNK-PATT',
    name: 'Paneer Puff Patties',
    category: 'Snacks & Quick Bites',
    price: 25,
    costPrice: 13,
    isStockTracked: true,
    stockQuantity: 28,
    minStockThreshold: 12,
    isAvailable: true,
    unit: 'pcs',
    imageEmoji: '🥐',
    description: 'Flaky baked pastry filled with mildly spiced paneer crumbles',
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'PRD-113',
    code: 'SNK-MAGI',
    name: 'Veg Masala Maggi',
    category: 'Snacks & Quick Bites',
    price: 35,
    costPrice: 15,
    isStockTracked: true,
    stockQuantity: 90,
    minStockThreshold: 25,
    isAvailable: true,
    unit: 'bowl',
    imageEmoji: '🍜',
    description: 'Instant noodles cooked with green peas, onions, carrots and special mess masala',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'PRD-114',
    code: 'SNK-EMAG',
    name: 'Egg Masala Maggi (2 Eggs)',
    category: 'Snacks & Quick Bites',
    price: 45,
    costPrice: 22,
    isStockTracked: true,
    stockQuantity: 42,
    minStockThreshold: 15,
    isAvailable: true,
    unit: 'bowl',
    imageEmoji: '🍳',
    description: 'Spicy Maggi noodles tossed with scrambled eggs and veggies',
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'PRD-115',
    code: 'SNK-SNDW',
    name: 'Grilled Veg Cheese Sandwich',
    category: 'Snacks & Quick Bites',
    price: 50,
    costPrice: 24,
    isStockTracked: true,
    stockQuantity: 32,
    minStockThreshold: 10,
    isAvailable: true,
    unit: 'pcs',
    imageEmoji: '🥪',
    description: 'Toasted bread with cheese slice, capsicum, cucumber, tomato & mint chutney',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PRD-116',
    code: 'BEV-CHAI',
    name: 'Special Masala Chai',
    category: 'Beverages',
    price: 12,
    costPrice: 4,
    isStockTracked: false, // Made on order
    stockQuantity: 999,
    minStockThreshold: 0,
    isAvailable: true,
    unit: 'cup',
    imageEmoji: '☕',
    description: 'Fresh milk tea infused with cardamom, ginger and cinnamon',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PRD-117',
    code: 'BEV-COFF',
    name: 'South Indian Filter Coffee',
    category: 'Beverages',
    price: 15,
    costPrice: 6,
    isStockTracked: false,
    stockQuantity: 999,
    minStockThreshold: 0,
    isAvailable: true,
    unit: 'cup',
    imageEmoji: '☕',
    description: 'Freshly brewed chicory coffee with frothy hot buffalo milk',
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'PRD-118',
    code: 'BEV-LASS',
    name: 'Sweet Punjabi Lassi',
    category: 'Beverages',
    price: 30,
    costPrice: 12,
    isStockTracked: true,
    stockQuantity: 24,
    minStockThreshold: 10,
    isAvailable: true,
    unit: 'glass',
    imageEmoji: '🥛',
    description: 'Thick churned chilled yogurt drink flavored with rose and cardamom',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PRD-119',
    code: 'BEV-WATR',
    name: 'Packaged Mineral Water (1L)',
    category: 'Beverages',
    price: 20,
    costPrice: 12,
    isStockTracked: true,
    stockQuantity: 120,
    minStockThreshold: 30,
    isAvailable: true,
    unit: 'bottle',
    imageEmoji: '💧',
    description: 'Chilled packaged 1 liter mineral water bottle',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'PRD-120',
    code: 'BEV-COLC',
    name: 'Cold Coffee with Ice Cream',
    category: 'Beverages',
    price: 40,
    costPrice: 19,
    isStockTracked: true,
    stockQuantity: 18,
    minStockThreshold: 10,
    isAvailable: true,
    unit: 'glass',
    imageEmoji: '🧋',
    description: 'Rich blended cold coffee topped with vanilla scoop and cocoa powder',
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'PRD-121',
    code: 'EXT-ROTI',
    name: 'Tawa Chapati / Roti (2 pcs)',
    category: 'Extras & Breads',
    price: 15,
    costPrice: 6,
    isStockTracked: false,
    stockQuantity: 999,
    minStockThreshold: 0,
    isAvailable: true,
    unit: 'pair',
    imageEmoji: '🫓',
    description: 'Fresh wheat tawa rotis brushed with pure desi ghee',
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'PRD-122',
    code: 'EXT-CURD',
    name: 'Fresh Curd Bowl',
    category: 'Extras & Breads',
    price: 15,
    costPrice: 7,
    isStockTracked: true,
    stockQuantity: 45,
    minStockThreshold: 15,
    isAvailable: true,
    unit: 'bowl',
    imageEmoji: '🥣',
    description: 'Creamy homemade curd bowl (150g)',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PRD-123',
    code: 'EXT-EGG',
    name: 'Boiled Egg (Single)',
    category: 'Extras & Breads',
    price: 10,
    costPrice: 6,
    isStockTracked: true,
    stockQuantity: 80,
    minStockThreshold: 20,
    isAvailable: true,
    unit: 'pcs',
    imageEmoji: '🥚',
    description: 'Farm fresh hard boiled egg with black pepper and salt',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'PRD-124',
    code: 'DES-JAMN',
    name: 'Hot Gulab Jamun (2 pcs)',
    category: 'Desserts',
    price: 25,
    costPrice: 11,
    isStockTracked: true,
    stockQuantity: 36,
    minStockThreshold: 12,
    isAvailable: true,
    unit: 'bowl',
    imageEmoji: '🧆',
    description: 'Warm fried milk dumplings soaked in cardamom and saffron sugar syrup',
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// Generator for ~500 realistic students
export function generate500Students(): Student[] {
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Dhruv', 'Kabir', 'Rudra', 'Aryan', 'Ayush', 'Rohan', 'Pranav', 'Harsh',
    'Dev', 'Kunal', 'Tanmay', 'Manish', 'Siddharth', 'Varun', 'Naveen', 'Gautam', 'Karthik', 'Sanjay',
    'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Pari', 'Anushka', 'Navya', 'Sneha', 'Pooja', 'Riya',
    'Ishita', 'Tanvi', 'Shreya', 'Meera', 'Kavya', 'Aditi', 'Prisha', 'Nidhi', 'Neha', 'Swati',
    'Bhavya', 'Divya', 'Priyanka', 'Simran', 'Shruti', 'Akanksha', 'Deepika', 'Tara', 'Vaishnavi', 'Shalini'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Reddy', 'Rao', 'Nair', 'Iyer',
    'Menon', 'Joshi', 'Kulkarni', 'Deshmukh', 'Chatterjee', 'Banerjee', 'Das', 'Sen', 'Choudhury', 'Mehta',
    'Shah', 'Agarwal', 'Bansal', 'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Yadav', 'Bose', 'Pillai',
    'Sethi', 'Bhat', 'Hegde', 'Shetty', 'Pawar', 'Kaur', 'Grewal', 'Chopra', 'Malhotra', 'Kapoor'
  ];

  const departments = [
    'Computer Science & Engg',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Electrical & Electronics',
    'Civil Engineering',
    'Information Technology',
    'Biotechnology',
    'Chemical Engineering',
  ];

  const blocks = ['A', 'B', 'C', 'D'];
  const students: Student[] = [];

  for (let i = 1; i <= 500; i++) {
    const fIdx = (i * 7 + 13) % firstNames.length;
    const lIdx = (i * 11 + 23) % lastNames.length;
    const deptIdx = (i * 3 + 5) % departments.length;
    const blockIdx = (i % 4);
    const floor = 1 + (i % 4);
    const roomNum = ((i % 25) + 1).toString().padStart(2, '0');
    const room = `${blocks[blockIdx]}-${floor}${roomNum}`;
    const year = 1 + (i % 4);
    const numStr = i.toString().padStart(3, '0');
    const id = `STU-${numStr}`;
    const name = `${firstNames[fIdx]} ${lastNames[lIdx]}`;
    
    // Status distribution: ~94% active, 4% inactive, 2% suspended
    let status: Student['status'] = 'active';
    if (i % 35 === 0) status = 'suspended';
    else if (i % 22 === 0) status = 'inactive';

    const phoneDigit = 9800000000 + i * 137;
    const email = `${firstNames[fIdx].toLowerCase()}.${lastNames[lIdx].toLowerCase()}${i}@hostel.edu`;

    students.push({
      id,
      name,
      department: departments[deptIdx],
      year,
      roomNumber: room,
      hostelBlock: blocks[blockIdx],
      phone: `+91 ${String(phoneDigit).slice(0, 5)} ${String(phoneDigit).slice(5)}`,
      email,
      status,
      barcode: `BRC-${id}-${1000 + i}`,
      creditLimit: 3000,
      monthlySpending: 0, // Will be computed from seeded bills
      totalSpending: 0,
      billsCount: 0,
      createdAt: new Date(Date.now() - (86400000 * (120 + (i % 60)))).toISOString(),
    });
  }

  return students;
}

// Generate realistic seeded bills across the past 30 days and today
export function generateSeededBills(students: Student[], products: Product[], cashiers: User[]): {
  bills: Bill[];
  stockMovements: StockMovement[];
  shifts: Shift[];
  auditLogs: AuditLog[];
} {
  const bills: Bill[] = [];
  const stockMovements: StockMovement[] = [];
  const now = new Date();

  // Create 150 realistic bills over the last 14 days, with highest concentration today & yesterday
  const billCount = 160;

  for (let b = 1; b <= billCount; b++) {
    // Pick student
    const student = students[(b * 3 + 17) % students.length];
    // Distribute timestamps: last 30 bills are today, previous are over last 14 days
    let billDate: Date;
    if (b > 125) {
      // Today (hours between 8am and 9pm)
      billDate = new Date(now);
      const hoursAgo = (billCount - b) * 0.25; // in last few hours
      billDate.setHours(now.getHours() - Math.floor(hoursAgo), Math.max(0, now.getMinutes() - (b % 50)));
    } else {
      // Days ago (1 to 14 days)
      const daysAgo = Math.floor((125 - b) / 9) + 1;
      billDate = new Date(now.getTime() - daysAgo * 86400000);
      billDate.setHours(8 + (b % 13), 10 + (b % 45), 0, 0);
    }

    const cashier = cashiers[b % 2 === 0 ? 1 : 2]; // cashier1 or cashier2
    const billNum = `BILL-2026-${(1000 + b).toString()}`;

    // Pick 1 to 3 items
    const itemCount = 1 + (b % 3);
    const billItems: Bill['items'] = [];
    let subtotal = 0;

    for (let it = 0; it < itemCount; it++) {
      const prod = products[(b * 2 + it * 5) % products.length];
      const qty = 1 + (it === 0 && b % 4 === 0 ? 1 : 0);
      const lineTotal = prod.price * qty;
      subtotal += lineTotal;
      billItems.push({
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        unitPrice: prod.price,
        quantity: qty,
        total: lineTotal,
      });
    }

    // Discount (occasional for demo: 5% or 0)
    const discount = b % 15 === 0 ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;

    // Payment method distribution: 55% UPI, 30% Cash, 15% Hostel Credit
    let paymentMethod: Bill['paymentMethod'] = 'upi';
    if (b % 5 === 0) paymentMethod = 'hostel_credit';
    else if (b % 3 === 0) paymentMethod = 'cash';

    // Status: mostly completed, a couple refunded, a couple cancelled, a few pending if credit
    let status: Bill['status'] = 'completed';
    let paymentStatus: Bill['paymentStatus'] = 'paid';
    let refundReason: string | undefined = undefined;

    if (b === 42) {
      status = 'cancelled';
      paymentStatus = 'pending';
      refundReason = 'Student ordered wrong thali by mistake; re-billed';
    } else if (b === 88) {
      status = 'refunded';
      paymentStatus = 'paid';
      refundReason = 'Beverage dispenser malfunction; amount refunded in cash';
    } else if (paymentMethod === 'hostel_credit' && b > 140) {
      // Recent hostel credit bill still pending payment
      paymentStatus = 'pending';
    }

    const bill: Bill = {
      id: billNum,
      billNumber: billNum,
      studentId: student.id,
      studentName: student.name,
      studentDepartment: student.department,
      studentRoom: student.roomNumber,
      cashierId: cashier.id,
      cashierName: cashier.name,
      timestamp: billDate.toISOString(),
      items: billItems,
      subtotal,
      discount,
      tax: 0,
      total,
      paymentMethod,
      paymentStatus,
      status,
      refundReason,
      notes: b % 20 === 0 ? 'Regular monthly hostel mess subscription patron' : undefined,
    };

    bills.push(bill);

    // Update student aggregates
    if (status === 'completed') {
      student.totalSpending += total;
      student.billsCount += 1;
      const isThisMonth = billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
      if (isThisMonth) {
        student.monthlySpending += total;
      }
    }
  }

  // Stock movements seed
  stockMovements.push(
    {
      id: 'SM-001',
      productId: 'PRD-101',
      productName: 'Special Royal Thali',
      type: 'in',
      quantity: 50,
      previousStock: 10,
      newStock: 60,
      reason: 'Morning raw materials cooking batch received',
      timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(),
      createdBy: 'Dr. R. Ramanathan',
    },
    {
      id: 'SM-002',
      productId: 'PRD-107',
      productName: 'Steamed Idli Sambar (2 pcs)',
      type: 'wastage',
      quantity: 4,
      previousStock: 12,
      newStock: 8,
      reason: 'Steam cooker temperature drop overnight',
      timestamp: new Date(now.getTime() - 86400000 * 1).toISOString(),
      createdBy: 'Ramesh Kumar',
    },
    {
      id: 'SM-003',
      productId: 'PRD-119',
      productName: 'Packaged Mineral Water (1L)',
      type: 'in',
      quantity: 100,
      previousStock: 35,
      newStock: 135,
      reason: 'Vendor Bisleri bulk crate shipment',
      timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(),
      createdBy: 'Dr. R. Ramanathan',
    }
  );

  // Shifts
  const shifts: Shift[] = [
    {
      id: 'SHF-2026-001',
      cashierId: 'USR-002',
      cashierName: 'Ramesh Kumar (Morning)',
      startTime: new Date(now.setHours(7, 30, 0, 0)).toISOString(),
      openingCash: 2000,
      cashReceived: 4250,
      upiReceived: 9800,
      creditReceived: 1250,
      refunds: 0,
      expectedClosingCash: 6250,
      status: 'open',
      billsCount: 28,
      notes: 'Morning breakfast and lunch rush',
    },
    {
      id: 'SHF-2026-000',
      cashierId: 'USR-003',
      cashierName: 'Suresh Patil (Evening)',
      startTime: new Date(now.getTime() - 86400000 + 15 * 3600000).toISOString(),
      endTime: new Date(now.getTime() - 86400000 + 22 * 3600000).toISOString(),
      openingCash: 2000,
      cashReceived: 6100,
      upiReceived: 14200,
      creditReceived: 2100,
      refunds: 88,
      expectedClosingCash: 8012,
      actualClosingCash: 8012,
      difference: 0,
      status: 'closed',
      billsCount: 44,
      notes: 'Dinner closing balanced without discrepancy',
    },
  ];

  // Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: 'AUD-001',
      timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(),
      userId: 'USR-001',
      userName: 'Dr. R. Ramanathan',
      userRole: 'admin',
      action: 'UPDATE_PRODUCT_PRICE',
      entityType: 'product',
      recordId: 'PRD-101',
      description: 'Updated Special Royal Thali selling price from ₹85 to ₹90 due to milk & dairy cost increase',
    },
    {
      id: 'AUD-002',
      timestamp: new Date(now.getTime() - 86400000 * 1).toISOString(),
      userId: 'USR-002',
      userName: 'Ramesh Kumar (Morning)',
      userRole: 'cashier',
      action: 'CANCEL_BILL',
      entityType: 'bill',
      recordId: 'BILL-2026-1042',
      description: 'Cancelled bill BILL-2026-1042: Student ordered wrong thali by mistake',
    },
    {
      id: 'AUD-003',
      timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(),
      userId: 'USR-001',
      userName: 'Dr. R. Ramanathan',
      userRole: 'admin',
      action: 'BULK_IMPORT_STUDENTS',
      entityType: 'student',
      recordId: 'BATCH-2026-SEM1',
      description: 'Imported 48 new student records from university academic ERP admission roster',
    },
    {
      id: 'AUD-004',
      timestamp: new Date(now.getTime() - 86400000 * 1).toISOString(),
      userId: 'USR-003',
      userName: 'Suresh Patil (Evening)',
      userRole: 'cashier',
      action: 'CLOSE_SHIFT',
      entityType: 'shift',
      recordId: 'SHF-2026-000',
      description: 'Closed evening shift with balanced cash drawer: ₹8,012.00',
    },
  ];

  return { bills, stockMovements, shifts, auditLogs };
}

export const INITIAL_SETTINGS: MessSettings = {
  messName: 'Kavery Central Mess & Dining Hall',
  instituteName: 'National Institute of Technology Campus',
  address: 'Block-C, Hostel Complex, Campus Main Road, City - 560012',
  phone: '+91 80 2899 4455',
  email: 'mess.admin@campus.edu.in',
  gstin: '29ABCDE1234F1Z5',
  receiptHeader: 'KAVERY CENTRAL HOSTEL MESS\nStudent Dining & Smart Billing POS',
  receiptFooter: 'Thank you for dining with us! Please return trays to cleaning counter.',
  currency: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata',
  billPrefix: 'BILL-2026-',
  allowNegativeStock: false,
  maxDiscountPercent: 15,
  categories: [
    'Meals & Thali',
    'Breakfast & Tiffin',
    'Snacks & Quick Bites',
    'Beverages',
    'Extras & Breads',
    'Desserts',
  ],
  paymentMethods: {
    cash: true,
    upi: true,
    hostel_credit: true,
  },
};
