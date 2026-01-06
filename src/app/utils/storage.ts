// Local storage utilities for offline PWA
export interface User {
  name: string;
  password: string;
  role: 'BOSS' | 'EMPLOYEE';
}

export interface StockItem {
  id: string;
  name: string;
  buyingPrice: number;
  quantity: number;
  openingStock: number;
}

export interface SaleEntry {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface ExpenseEntry {
  id: string;
  description: string;
  amount: number;
  timestamp: Date;
}

export interface DailyReport {
  date: string;
  sales: SaleEntry[];
  expenses: ExpenseEntry[];
  stockSnapshot: StockItem[];
}

// Initialize default data
export const initializeStorage = () => {
  if (!localStorage.getItem('users')) {
    const users: User[] = [
      { name: 'BOSS', password: 'admin123', role: 'BOSS' },
      { name: 'EMPLOYEE', password: 'employee123', role: 'EMPLOYEE' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
  }

  if (!localStorage.getItem('stock')) {
    localStorage.setItem('stock', JSON.stringify([]));
  }

  if (!localStorage.getItem('dailyReports')) {
    localStorage.setItem('dailyReports', JSON.stringify([]));
  }

  if (!localStorage.getItem('currentDate')) {
    localStorage.setItem('currentDate', new Date().toISOString().split('T')[0]);
  }
};

// User authentication
export const authenticateUser = (name: string, password: string): User | null => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find(u => u.name === name && u.password === password) || null;
};

export const updatePassword = (role: 'BOSS' | 'EMPLOYEE', newPassword: string) => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.role === role);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
  }
};

// Stock management
export const getStock = (): StockItem[] => {
  return JSON.parse(localStorage.getItem('stock') || '[]');
};

export const saveStock = (stock: StockItem[]) => {
  localStorage.setItem('stock', JSON.stringify(stock));
};

export const addStockItem = (item: Omit<StockItem, 'id'>) => {
  const stock = getStock();
  const newItem: StockItem = {
    ...item,
    id: Date.now().toString(),
  };
  stock.push(newItem);
  saveStock(stock);
  return newItem;
};

export const updateStockItem = (id: string, updates: Partial<StockItem>) => {
  const stock = getStock();
  const index = stock.findIndex(item => item.id === id);
  if (index !== -1) {
    stock[index] = { ...stock[index], ...updates };
    saveStock(stock);
  }
};

export const deleteStockItem = (id: string) => {
  const stock = getStock().filter(item => item.id !== id);
  saveStock(stock);
};

// Daily reports
export const getTodayReport = (): DailyReport => {
  const today = new Date().toISOString().split('T')[0];
  const reports: DailyReport[] = JSON.parse(localStorage.getItem('dailyReports') || '[]');
  const todayReport = reports.find(r => r.date === today);
  
  if (!todayReport) {
    // Create new report for today with opening stock from yesterday's closing
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayReport = reports.find(r => r.date === yesterday);
    
    const stock = getStock();
    if (yesterdayReport && yesterdayReport.stockSnapshot.length > 0) {
      // Use yesterday's closing stock as today's opening stock
      stock.forEach(item => {
        const yesterdayItem = yesterdayReport.stockSnapshot.find(s => s.id === item.id);
        if (yesterdayItem) {
          item.openingStock = yesterdayItem.quantity;
        }
      });
      saveStock(stock);
    } else {
      // First day - set opening stock to current quantity
      stock.forEach(item => {
        item.openingStock = item.quantity;
      });
      saveStock(stock);
    }
    
    const newReport: DailyReport = {
      date: today,
      sales: [],
      expenses: [],
      stockSnapshot: JSON.parse(JSON.stringify(stock)),
    };
    reports.push(newReport);
    localStorage.setItem('dailyReports', JSON.stringify(reports));
    return newReport;
  }
  
  return todayReport;
};

export const saveTodayReport = (report: DailyReport) => {
  const reports: DailyReport[] = JSON.parse(localStorage.getItem('dailyReports') || '[]');
  const index = reports.findIndex(r => r.date === report.date);
  
  if (index !== -1) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  
  localStorage.setItem('dailyReports', JSON.stringify(reports));
};

export const getAllReports = (): DailyReport[] => {
  return JSON.parse(localStorage.getItem('dailyReports') || '[]');
};

export const addSaleEntry = (sale: Omit<SaleEntry, 'id' | 'timestamp'>) => {
  const report = getTodayReport();
  const newSale: SaleEntry = {
    ...sale,
    id: Date.now().toString(),
    timestamp: new Date(),
  };
  report.sales.push(newSale);
  
  // Update stock quantity
  const stock = getStock();
  const itemIndex = stock.findIndex(item => item.id === sale.itemId);
  if (itemIndex !== -1) {
    stock[itemIndex].quantity -= sale.quantity;
    saveStock(stock);
  }
  
  // Update stock snapshot
  report.stockSnapshot = JSON.parse(JSON.stringify(stock));
  saveTodayReport(report);
  return newSale;
};

export const addExpenseEntry = (expense: Omit<ExpenseEntry, 'id' | 'timestamp'>) => {
  const report = getTodayReport();
  const newExpense: ExpenseEntry = {
    ...expense,
    id: Date.now().toString(),
    timestamp: new Date(),
  };
  report.expenses.push(newExpense);
  saveTodayReport(report);
  return newExpense;
};

export const deleteSaleEntry = (id: string) => {
  const report = getTodayReport();
  const sale = report.sales.find(s => s.id === id);
  if (sale) {
    // Restore stock
    const stock = getStock();
    const itemIndex = stock.findIndex(item => item.id === sale.itemId);
    if (itemIndex !== -1) {
      stock[itemIndex].quantity += sale.quantity;
      saveStock(stock);
    }
    
    report.sales = report.sales.filter(s => s.id !== id);
    report.stockSnapshot = JSON.parse(JSON.stringify(stock));
    saveTodayReport(report);
  }
};

export const deleteExpenseEntry = (id: string) => {
  const report = getTodayReport();
  report.expenses = report.expenses.filter(e => e.id !== id);
  saveTodayReport(report);
};
