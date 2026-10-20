import { Bill, Product, Student, Shift } from '../types';
import { getTodayDateString } from './date';

export interface ProductTodaySale {
  productId: string;
  code: string;
  name: string;
  category: string;
  mealSlot: 'morning' | 'afternoon' | 'evening' | 'all_day';
  price: number;
  quantitySoldToday: number;
  todayRevenue: number;
  unit: string;
  imageEmoji?: string;
  imageUrl?: string;
  contributionPercent: number;
}

export interface DashboardMetrics {
  todaySales: number;
  todayBillsCount: number;
  todayItemsCount: number;
  activeStudentsCount: number;
  avgBillValue: number;
  pendingAmount: number;
  completedRevenueTotal: number;
  refundedTotal: number;
  cancelledTotal: number;
  totalProductsCount: number;
  activeProductsSoldTodayCount: number;
  topProductToday: ProductTodaySale | null;
  todayProductSales: ProductTodaySale[];
  paymentBreakdown: {
    cash: number;
    upi: number;
    hostelCredit: number;
  };
  topProducts: Array<{
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
  cashierSummaries: Array<{
    cashierName: string;
    billsCount: number;
    totalSales: number;
  }>;
  lowStockProducts: Product[];
  recentTransactions: Bill[];
}

export function computeDashboardMetrics(
  bills: Bill[],
  products: Product[],
  students: Student[]
): DashboardMetrics {
  const todayStr = getTodayDateString();

  let todaySales = 0;
  let todayBillsCount = 0;
  let todayItemsCount = 0;
  let completedRevenueTotal = 0;
  let pendingAmount = 0;
  let refundedTotal = 0;
  let cancelledTotal = 0;

  const paymentBreakdown = {
    cash: 0,
    upi: 0,
    hostelCredit: 0,
  };

  const productStats: { [name: string]: { category: string; quantity: number; revenue: number } } = {};
  const todayProductQtyMap: { [key: string]: number } = {};
  const cashierStats: { [name: string]: { billsCount: number; totalSales: number } } = {};

  bills.forEach((bill) => {
    const isToday = bill.timestamp.startsWith(todayStr);

    if (bill.status === 'completed') {
      completedRevenueTotal += bill.total;

      if (isToday) {
        todaySales += bill.total;
        todayBillsCount += 1;
        bill.items.forEach((item) => {
          todayItemsCount += item.quantity;
          const k = item.productId || item.productName;
          todayProductQtyMap[k] = (todayProductQtyMap[k] || 0) + item.quantity;
          todayProductQtyMap[item.productName] = (todayProductQtyMap[item.productName] || 0) + item.quantity;
        });
      }

      // Payment breakdown (all completed bills)
      if (bill.paymentMethod === 'cash') paymentBreakdown.cash += bill.total;
      else if (bill.paymentMethod === 'upi') paymentBreakdown.upi += bill.total;
      else if (bill.paymentMethod === 'hostel_credit') paymentBreakdown.hostelCredit += bill.total;

      // Product sales accumulation
      bill.items.forEach((item) => {
        if (!productStats[item.productName]) {
          productStats[item.productName] = {
            category: item.category,
            quantity: 0,
            revenue: 0,
          };
        }
        productStats[item.productName].quantity += item.quantity;
        productStats[item.productName].revenue += item.total;
      });

      // Cashier stats
      if (!cashierStats[bill.cashierName]) {
        cashierStats[bill.cashierName] = { billsCount: 0, totalSales: 0 };
      }
      cashierStats[bill.cashierName].billsCount += 1;
      cashierStats[bill.cashierName].totalSales += bill.total;
    } else if (bill.status === 'refunded') {
      refundedTotal += bill.total;
    } else if (bill.status === 'cancelled') {
      cancelledTotal += bill.total;
    }

    if (bill.paymentStatus === 'pending') {
      pendingAmount += bill.total;
    }
  });

  const activeStudentsCount = students.filter((s) => s.status === 'active').length;
  const avgBillValue = todayBillsCount > 0 ? todaySales / todayBillsCount : 0;

  // Compute breakdown for EVERY product in the menu
  const todayProductSales: ProductTodaySale[] = products.map((p) => {
    const qty = todayProductQtyMap[p.id] || todayProductQtyMap[p.name] || 0;
    const rev = qty * p.price;
    const contributionPercent = todaySales > 0 ? Math.round((rev / todaySales) * 1000) / 10 : 0;

    return {
      productId: p.id,
      code: p.code,
      name: p.name,
      category: p.category,
      mealSlot: (p.mealSlot as any) || 'all_day',
      price: p.price,
      quantitySoldToday: qty,
      todayRevenue: rev,
      unit: p.unit,
      imageEmoji: p.imageEmoji,
      imageUrl: p.imageUrl,
      contributionPercent,
    };
  }).sort((a, b) => b.quantitySoldToday - a.quantitySoldToday || b.todayRevenue - a.todayRevenue);

  const topProductToday = todayProductSales.find((p) => p.quantitySoldToday > 0) || todayProductSales[0] || null;
  const activeProductsSoldTodayCount = todayProductSales.filter((p) => p.quantitySoldToday > 0).length;

  // Top 5 products by lifetime quantity
  const topProducts = Object.entries(productStats)
    .map(([name, stat]) => ({
      name,
      category: stat.category,
      quantity: stat.quantity,
      revenue: stat.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const cashierSummaries = Object.entries(cashierStats).map(([cashierName, stat]) => ({
    cashierName,
    billsCount: stat.billsCount,
    totalSales: stat.totalSales,
  }));

  // Low stock products
  const lowStockProducts = products.filter(
    (p) => p.isStockTracked && p.stockQuantity <= p.minStockThreshold
  );

  const recentTransactions = bills.slice(0, 8);

  return {
    todaySales,
    todayBillsCount,
    todayItemsCount,
    activeStudentsCount,
    avgBillValue,
    pendingAmount,
    completedRevenueTotal,
    refundedTotal,
    cancelledTotal,
    totalProductsCount: products.length,
    activeProductsSoldTodayCount,
    topProductToday,
    todayProductSales,
    paymentBreakdown,
    topProducts,
    cashierSummaries,
    lowStockProducts,
    recentTransactions,
  };
}
