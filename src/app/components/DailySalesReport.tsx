import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { getTodayReport, getStock, deleteSaleEntry, deleteExpenseEntry, User } from '../utils/storage';
import { Button } from './ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DailySalesReportProps {
  user: User;
}

export function DailySalesReport({ user }: DailySalesReportProps) {
  const [, setRefresh] = useState(0);
  const report = getTodayReport();
  const stock = getStock();

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh(r => r + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const isBoss = user.role === 'BOSS';

  // Calculate metrics for each item
  const itemMetrics = stock.map(item => {
    const salesForItem = report.sales.filter(s => s.itemId === item.id);
    const quantitySold = salesForItem.reduce((sum, s) => sum + s.quantity, 0);
    const totalSales = salesForItem.reduce((sum, s) => sum + s.price, 0);
    const cogs = quantitySold * item.buyingPrice;
    const grossProfit = totalSales - cogs;
    const totalStock = item.openingStock + (item.quantity - item.openingStock + quantitySold);
    const closingStock = item.quantity;

    return {
      item,
      openingStock: item.openingStock,
      addedStock: item.quantity - item.openingStock + quantitySold,
      totalStock,
      quantitySold,
      closingStock,
      buyingPrice: item.buyingPrice,
      cogs,
      totalSales,
      grossProfit,
    };
  });

  const totalExpenses = report.expenses.reduce((sum, e) => sum + e.amount, 0);
  const overallTotalSales = itemMetrics.reduce((sum, m) => sum + m.totalSales, 0);
  const overallCOGS = itemMetrics.reduce((sum, m) => sum + m.cogs, 0);
  const overallGrossProfit = overallTotalSales - overallCOGS;
  const netProfit = overallGrossProfit - totalExpenses;
  const moneyInHand = overallTotalSales - totalExpenses;

  const handleDeleteSale = (id: string) => {
    deleteSaleEntry(id);
    toast.success('Sale deleted');
    setRefresh(r => r + 1);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseEntry(id);
    toast.success('Expense deleted');
    setRefresh(r => r + 1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daily Sales Report</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRefresh(r => r + 1)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Sales Table */}
          <div>
            <h3 className="mb-4">I. DAILY SALES</h3>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S/N</TableHead>
                    <TableHead>ITEM</TableHead>
                    <TableHead>OPENING STOCK</TableHead>
                    <TableHead>ADDED STOCK</TableHead>
                    <TableHead>TOTAL STOCK</TableHead>
                    <TableHead>QUANTITY SOLD</TableHead>
                    <TableHead>CLOSING STOCK</TableHead> {/* Moved outside isBoss check */}
                    {isBoss && (
                      <>
                        <TableHead>BUYING PRICE</TableHead>
                        <TableHead>COGS</TableHead>
                      </>
                    )}
                    <TableHead>TOTAL SALES</TableHead>
                    {isBoss && <TableHead>GROSS PROFIT</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemMetrics.map((metric, index) => (
                    <TableRow key={metric.item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{metric.item.name}</TableCell>
                      <TableCell>{metric.openingStock}</TableCell>
                      <TableCell>{metric.addedStock}</TableCell>
                      <TableCell>{metric.totalStock}</TableCell>
                      <TableCell>{metric.quantitySold}</TableCell>
                      <TableCell>{metric.closingStock}</TableCell> {/* Moved outside isBoss check */}
                      {isBoss && (
                        <>
                          <TableCell>${metric.buyingPrice.toFixed(2)}</TableCell>
                          <TableCell>${metric.cogs.toFixed(2)}</TableCell>
                        </>
                      )}
                      <TableCell>${metric.totalSales.toFixed(2)}</TableCell>
                      {isBoss && <TableCell>${metric.grossProfit.toFixed(2)}</TableCell>}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={isBoss ? 9 : 6}></TableCell>
                    <TableCell>
                      <strong>TOTAL: ${overallTotalSales.toFixed(2)}</strong>
                    </TableCell>
                    {isBoss && (
                      <TableCell>
                        <strong>${overallGrossProfit.toFixed(2)}</strong>
                      </TableCell>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h3 className="mb-4">II. EXPENSES</h3>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S/N</TableHead>
                    <TableHead>EXPENSES</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead>ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.expenses.map((expense, index) => (
                    <TableRow key={expense.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}><strong>TOTAL EXPENSES</strong></TableCell>
                    <TableCell colSpan={2}>
                      <strong>${totalExpenses.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="mb-4">III. SUMMARY</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>TOTAL SALES:</span>
                      <span>${overallTotalSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TOTAL EXPENSES:</span>
                      <span>${totalExpenses.toFixed(2)}</span>
                    </div>
                    {!isBoss && (
                      <div className="flex justify-between border-t pt-2">
                        <strong>MONEY IN HAND:</strong>
                        <strong>${moneyInHand.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {isBoss && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>GROSS PROFIT:</span>
                        <span>${overallGrossProfit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <strong>NET PROFIT:</strong>
                        <strong className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${netProfit.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Sales Entries */}
          {report.sales.length > 0 && (
            <div>
              <h3 className="mb-4">Recent Sales Entries</h3>
              <div className="border rounded-lg overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.sales.slice().reverse().slice(0, 10).map(sale => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.itemName}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>${sale.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(sale.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSale(sale.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}