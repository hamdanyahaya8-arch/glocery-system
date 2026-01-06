import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getStock, addSaleEntry, addExpenseEntry } from '../utils/storage';
import { toast } from 'sonner';
import { Plus, ShoppingCart, Wallet } from 'lucide-react';

export function EntryPanel() {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const stock = getStock();

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || !quantity || !price) {
      toast.error('Please fill all fields');
      return;
    }

    const item = stock.find(s => s.id === selectedItem);
    if (!item) {
      toast.error('Item not found');
      return;
    }

    const qtyNum = parseInt(quantity);
    const priceNum = parseFloat(price);

    if (qtyNum <= 0 || priceNum <= 0) {
      toast.error('Quantity and price must be positive');
      return;
    }

    if (qtyNum > item.quantity) {
      toast.error(`Insufficient stock. Available: ${item.quantity}`);
      return;
    }

    addSaleEntry({
      itemId: item.id,
      itemName: item.name,
      quantity: qtyNum,
      price: priceNum,
    });

    toast.success(`Sale added: ${qtyNum} x ${item.name}`);
    setSelectedItem('');
    setQuantity('');
    setPrice('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseDesc || !expenseAmount) {
      toast.error('Please fill all fields');
      return;
    }

    const amountNum = parseFloat(expenseAmount);
    if (amountNum <= 0) {
      toast.error('Amount must be positive');
      return;
    }

    addExpenseEntry({
      description: expenseDesc,
      amount: amountNum,
    });

    toast.success('Expense added successfully');
    setExpenseDesc('');
    setExpenseAmount('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Entry Panel</CardTitle>
          <CardDescription>
            Record sales and expenses for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sales">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Sales
              </TabsTrigger>
              <TabsTrigger value="expenses">
                <Wallet className="h-4 w-4 mr-2" />
                Expenses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <form onSubmit={handleAddSale} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item">Item</Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item from stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {stock.filter(item => item.quantity > 0).map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Available: {item.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Sold</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Total Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expenseDesc">Expense Description</Label>
                  <Input
                    id="expenseDesc"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="e.g., Electricity bill"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenseAmount">Amount</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
