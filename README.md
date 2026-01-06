# Revenue Management System

A Progressive Web Application (PWA) designed specifically for bars and grocery businesses to manage sales, expenses, inventory, and generate daily reports offline.

## Features

### User Roles

#### BOSS
- **Default Login:** Username: `BOSS`, Password: `admin123`
- **Permissions:**
  - View detailed daily sales reports (including buying prices, COGS, gross profit, net profit)
  - View sales history with full details
  - Download reports as PDF (single or multiple days)
  - Add new stock items with buying prices
  - Modify stock (edit, delete, change prices)
  - Change own password
  - Change employee password
  - Add and modify expenses

#### EMPLOYEE
- **Default Login:** Username: `EMPLOYEE`, Password: `employee123`
- **Permissions:**
  - Enter daily sales transactions
  - View simplified daily sales report (no buying prices or profit calculations)
  - View sales history (simplified view)
  - Add stock quantities to existing items
  - Add expenses
  - Cannot change passwords
  - Cannot set or modify buying prices
  - Cannot download reports

### Core Functionality

#### 1. Entry Panel (Employee Only)
- **Sales Entry:**
  - Select item from available stock
  - Enter quantity sold
  - Enter total selling price
  - Real-time stock deduction
  
- **Expense Entry:**
  - Add expense description
  - Enter expense amount
  - Track all business expenses

#### 2. Daily Sales Report
- **For Boss:**
  - Complete item-wise breakdown showing:
    - Opening Stock
    - Added Stock
    - Total Stock
    - Quantity Sold
    - Closing Stock
    - Buying Price per unit
    - Cost of Goods Sold (COGS)
    - Total Sales
    - Gross Profit (Sales - COGS)
  - Expenses summary
  - Overall metrics:
    - Total Sales
    - Total Expenses
    - Gross Profit
    - Net Profit
  
- **For Employee:**
  - Simplified view showing:
    - Opening Stock
    - Added Stock
    - Total Stock
    - Quantity Sold
    - Total Sales
  - Expenses summary
  - Money in Hand (Sales - Expenses)

#### 3. Stock Management
- Add new items (Boss only)
- Update stock quantities (Both)
- Set/modify buying prices (Boss only)
- Edit item names (Boss only)
- Delete items (Boss only)
- Low stock warnings (< 10 units)
- Track opening and closing stock daily

#### 4. History Panel
- View all past daily reports
- Expandable accordion for each date
- Search and filter capabilities
- PDF export functionality (Boss only):
  - Download single day report
  - Download selected dates
  - Download all reports
- Maintains complete transaction history

#### 5. Settings
- Change own password (Both)
- Change employee password (Boss only)
- System information display
- Offline mode status

### Key Calculations

```
TOTAL STOCK = OPENING STOCK + ADDED STOCK
QUANTITY SOLD = Sum of all sales entries for the item
CLOSING STOCK = TOTAL STOCK - QUANTITY SOLD
COGS (Cost of Goods Sold) = QUANTITY SOLD × BUYING PRICE
TOTAL SALES = Sum of all selling prices
GROSS PROFIT = TOTAL SALES - COGS
NET PROFIT = GROSS PROFIT - TOTAL EXPENSES
MONEY IN HAND = TOTAL SALES - TOTAL EXPENSES
```

### Offline PWA Features

- **Local Storage:** All data persists in browser's localStorage
- **Works Offline:** Full functionality without internet connection
- **Progressive Web App:** Can be installed on desktop and mobile devices
- **Auto-refresh:** Real-time updates every 2 seconds
- **No Backend Required:** 100% client-side application

## Technical Stack

- **Frontend Framework:** React 18.3.1 with TypeScript
- **UI Components:** Radix UI + Custom components
- **Styling:** Tailwind CSS
- **PDF Generation:** jsPDF with jspdf-autotable
- **Icons:** Lucide React
- **Notifications:** Sonner (toast notifications)
- **Build Tool:** Vite
- **PWA Support:** Manifest.json for installation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Data Structure

### LocalStorage Schema

```typescript
// users
{
  name: "BOSS" | "EMPLOYEE",
  password: string,
  role: "BOSS" | "EMPLOYEE"
}

// stock
{
  id: string,
  name: string,
  buyingPrice: number,
  quantity: number,
  openingStock: number
}

// dailyReports
{
  date: string,
  sales: [{
    id: string,
    itemId: string,
    itemName: string,
    quantity: number,
    price: number,
    timestamp: Date
  }],
  expenses: [{
    id: string,
    description: string,
    amount: number,
    timestamp: Date
  }],
  stockSnapshot: StockItem[]
}
```

## Security Notes

⚠️ **Important:** This system is designed for offline use with basic password protection. For production use with sensitive data:

1. Implement proper authentication with encrypted passwords
2. Use a backend database for multi-user access
3. Add data encryption for sensitive information
4. Implement proper access controls and audit logs
5. Regular backups of localStorage data

## Usage Tips

1. **Daily Workflow:**
   - Employee logs in and enters sales throughout the day
   - Boss reviews daily report at end of day
   - System automatically carries closing stock to next day's opening stock

2. **Stock Management:**
   - Boss adds new products with buying prices
   - Employee can add quantities to existing stock
   - System tracks all stock movements automatically

3. **Report Generation:**
   - Boss can download PDF reports anytime
   - Select multiple dates for consolidated reports
   - All historical data is preserved

4. **Password Security:**
   - Change default passwords immediately
   - Boss should regularly update both passwords
   - Use strong passwords (minimum 6 characters)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Persistence

All data is stored locally in the browser's localStorage. To backup data:

1. Export/download reports as needed
2. Consider implementing regular localStorage backup to external storage
3. Data persists across browser sessions but may be cleared if:
   - Browser cache is cleared
   - localStorage is manually cleared
   - Private/Incognito mode is used

## Support

For issues or feature requests, please refer to the system documentation or contact the administrator.

## License

Proprietary - For internal use only

## Version

1.0.0 - Initial Release
