import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { getAllReports, User, DailyReport } from '../utils/storage';
import { Download, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface HistoryPanelProps {
  user: User;
}

export function HistoryPanel({ user }: HistoryPanelProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const reports = getAllReports().sort((a, b) => b.date.localeCompare(a.date));
  const isBoss = user.role === 'BOSS';

  const toggleDateSelection = (date: string) => {
    setSelectedDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const generatePDF = (reports: DailyReport[]) => {
    if (!isBoss) {
      toast.error('Only BOSS can download reports');
      return;
    }

    const doc = new jsPDF();
    
    reports.forEach((report, reportIndex) => {
      if (reportIndex > 0) {
        doc.addPage();
      }

      // Title
      doc.setFontSize(16);
      doc.text('DAILY SALES REPORT', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(new Date(report.date).toLocaleDateString(), 105, 22, { align: 'center' });

      // Sales Table
      doc.setFontSize(12);
      doc.text('I. DAILY SALES', 14, 30);

      const salesData = report.stockSnapshot.map((item, index) => {
        const salesForItem = report.sales.filter(s => s.itemId === item.id);
        const quantitySold = salesForItem.reduce((sum, s) => sum + s.quantity, 0);
        const totalSales = salesForItem.reduce((sum, s) => sum + s.price, 0);
        const cogs = quantitySold * item.buyingPrice;
        const grossProfit = totalSales - cogs;
        const addedStock = item.quantity - item.openingStock + quantitySold;

        return [
          index + 1,
          item.name,
          item.openingStock,
          addedStock,
          item.openingStock + addedStock,
          quantitySold,
          item.quantity,
          `$${item.buyingPrice.toFixed(2)}`,
          `$${cogs.toFixed(2)}`,
          `$${totalSales.toFixed(2)}`,
          `$${grossProfit.toFixed(2)}`
        ];
      });

      autoTable(doc, {
        startY: 35,
        head: [[
          'S/N', 'ITEM', 'OPENING', 'ADDED', 'TOTAL', 'QTY SOLD',
          'CLOSING', 'BUYING PRICE', 'COGS', 'SALES', 'GROSS PROFIT'
        ]],
        body: salesData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      // Expenses Table
      const finalY = (doc as any).lastAutoTable.finalY || 35;
      doc.setFontSize(12);
      doc.text('II. EXPENSES', 14, finalY + 10);

      const expensesData = report.expenses.map((expense, index) => [
        index + 1,
        expense.description,
        `$${expense.amount.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: finalY + 15,
        head: [['S/N', 'EXPENSES', 'AMOUNT']],
        body: expensesData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      // Summary
      const totalSales = salesData.reduce((sum, row) => {
        const value = parseFloat(row[9].replace('$', ''));
        return sum + value;
      }, 0);
      const totalExpenses = report.expenses.reduce((sum, e) => sum + e.amount, 0);
      const grossProfit = salesData.reduce((sum, row) => {
        const value = parseFloat(row[10].replace('$', ''));
        return sum + value;
      }, 0);
      const netProfit = grossProfit - totalExpenses;

      const summaryY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('III. SUMMARY', 14, summaryY);

      autoTable(doc, {
        startY: summaryY + 5,
        body: [
          ['TOTAL SALES:', `$${totalSales.toFixed(2)}`],
          ['TOTAL EXPENSES:', `$${totalExpenses.toFixed(2)}`],
          ['GROSS PROFIT:', `$${grossProfit.toFixed(2)}`],
          ['NET PROFIT:', `$${netProfit.toFixed(2)}`],
        ],
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold' }
        },
      });
    });

    const filename = selectedDates.length === 1
      ? `daily_report_${reports[0].date}.pdf`
      : `daily_reports_${reports.length}_days.pdf`;

    doc.save(filename);
    toast.success('PDF downloaded successfully');
  };

  const handleDownloadSelected = () => {
    if (selectedDates.length === 0) {
      toast.error('Please select at least one report');
      return;
    }

    const selectedReports = reports.filter(r => selectedDates.includes(r.date));
    generatePDF(selectedReports);
  };

  const handleDownloadAll = () => {
    if (reports.length === 0) {
      toast.error('No reports available');
      return;
    }
    generatePDF(reports);
  };

  const calculateReportMetrics = (report: DailyReport) => {
    const totalSales = report.sales.reduce((sum, s) => sum + s.price, 0);
    const totalExpenses = report.expenses.reduce((sum, e) => sum + e.amount, 0);
    
    let grossProfit = 0;
    if (isBoss) {
      report.stockSnapshot.forEach(item => {
        const salesForItem = report.sales.filter(s => s.itemId === item.id);
        const quantitySold = salesForItem.reduce((sum, s) => sum + s.quantity, 0);
        const itemSales = salesForItem.reduce((sum, s) => sum + s.price, 0);
        const cogs = quantitySold * item.buyingPrice;
        grossProfit += itemSales - cogs;
      });
    }

    const netProfit = grossProfit - totalExpenses;
    const moneyInHand = totalSales - totalExpenses;

    return { totalSales, totalExpenses, grossProfit, netProfit, moneyInHand };
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle>Sales History</CardTitle>
              <CardDescription>
                View and download past daily reports
              </CardDescription>
            </div>
            {isBoss && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadSelected}
                  disabled={selectedDates.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected ({selectedDates.length})
                </Button>
                <Button onClick={handleDownloadAll} disabled={reports.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>No reports available yet</p>
              <p className="text-sm">Reports will appear here after you record sales</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {reports.map((report) => {
                const metrics = calculateReportMetrics(report);
                return (
                  <AccordionItem key={report.date} value={report.date}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex items-center gap-3">
                          {isBoss && (
                            <input
                              type="checkbox"
                              checked={selectedDates.includes(report.date)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleDateSelection(report.date);
                              }}
                              className="h-4 w-4"
                            />
                          )}
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(report.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span>Sales: ${metrics.totalSales.toFixed(2)}</span>
                          {isBoss && (
                            <span className={metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              Profit: ${metrics.netProfit.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        {/* Sales Table */}
                        <div>
                          <h4 className="mb-2">Daily Sales</h4>
                          <div className="border rounded-lg overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead>Opening</TableHead>
                                  <TableHead>Sold</TableHead>
                                  <TableHead>Closing</TableHead>
                                  {isBoss && <TableHead>Buying Price</TableHead>}
                                  <TableHead>Sales</TableHead>
                                  {isBoss && <TableHead>Profit</TableHead>}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {report.stockSnapshot.map((item) => {
                                  const salesForItem = report.sales.filter(s => s.itemId === item.id);
                                  const qtySold = salesForItem.reduce((sum, s) => sum + s.quantity, 0);
                                  const sales = salesForItem.reduce((sum, s) => sum + s.price, 0);
                                  const cogs = qtySold * item.buyingPrice;
                                  const profit = sales - cogs;

                                  return (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{item.openingStock}</TableCell>
                                      <TableCell>{qtySold}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      {isBoss && <TableCell>${item.buyingPrice.toFixed(2)}</TableCell>}
                                      <TableCell>${sales.toFixed(2)}</TableCell>
                                      {isBoss && <TableCell>${profit.toFixed(2)}</TableCell>}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Expenses */}
                        {report.expenses.length > 0 && (
                          <div>
                            <h4 className="mb-2">Expenses</h4>
                            <div className="border rounded-lg overflow-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {report.expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                      <TableCell>{expense.description}</TableCell>
                                      <TableCell>${expense.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600">Total Sales</p>
                            <p>${metrics.totalSales.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Expenses</p>
                            <p>${metrics.totalExpenses.toFixed(2)}</p>
                          </div>
                          {isBoss ? (
                            <>
                              <div>
                                <p className="text-sm text-gray-600">Gross Profit</p>
                                <p>${metrics.grossProfit.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Net Profit</p>
                                <p className={metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  ${metrics.netProfit.toFixed(2)}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-600">Money in Hand</p>
                              <p>${metrics.moneyInHand.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
