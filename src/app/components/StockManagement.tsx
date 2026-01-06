import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { getStock, addStockItem, updateStockItem, deleteStockItem, User } from '../utils/storage';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, Check, X } from 'lucide-react';

interface StockManagementProps {
  user: User;
}

export function StockManagement({ user }: StockManagementProps) {
  const [stock, setStock] = useState(getStock());
  const [specification, setSpecification] = useState<'new' | 'existing'>('new');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  const isBoss = user.role === 'BOSS';

  const refreshStock = () => {
    setStock(getStock());
  };

  useEffect(() => {
    const interval = setInterval(refreshStock, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (specification === 'existing' && selectedItemId) {
      const item = stock.find(s => s.id === selectedItemId);
      if (item) {
        setItemName(item.name);
        setBuyingPrice(item.buyingPrice.toString());
      }
    } else if (specification === 'new') {
      // Don't reset when switching to new - keep the values
      setSelectedItemId('');
    }
  }, [specification, selectedItemId, stock]);

  const resetForm = () => {
    setItemName('');
    setQuantity('');
    setBuyingPrice('');
    setSpecification('new');
    setSelectedItemId('');
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName || !quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    const qtyNum = parseInt(quantity);
    if (qtyNum <= 0 || isNaN(qtyNum)) {
      toast.error('Quantity must be a positive number');
      return;
    }

    if (specification === 'new') {
      if (!buyingPrice) {
        toast.error('Please enter buying price');
        return;
      }
      const priceNum = parseFloat(buyingPrice);
      if (priceNum <= 0 || isNaN(priceNum)) {
        toast.error('Buying price must be a positive number');
        return;
      }

      if (!isBoss) {
        toast.error('Only BOSS can add new items');
        return;
      }

      addStockItem({
        name: itemName,
        buyingPrice: priceNum,
        quantity: qtyNum,
        openingStock: qtyNum,
      });
      toast.success('New item added to stock');
    } else {
      const item = stock.find(s => s.id === selectedItemId);
      if (item) {
        updateStockItem(item.id, {
          quantity: item.quantity + qtyNum,
        });
        toast.success('Stock quantity updated');
      }
    }

    setIsAddDialogOpen(false);
    resetForm();
    refreshStock();
  };

  const handleStartEdit = (item: any) => {
    if (!isBoss) {
      toast.error('Only BOSS can edit stock');
      return;
    }
    setEditingItem(item.id);
    setEditName(item.name);
    setEditPrice(item.buyingPrice.toString());
    setEditQuantity(item.quantity.toString());
  };

  const handleSaveEdit = (itemId: string) => {
    const priceNum = parseFloat(editPrice);
    const qtyNum = parseInt(editQuantity);
    
    if (!editName || editName.trim() === '') {
      toast.error('Item name cannot be empty');
      return;
    }
    
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Buying price must be a positive number');
      return;
    }

    if (isNaN(qtyNum) || qtyNum < 0) {
      toast.error('Quantity must be a non-negative number');
      return;
    }

    updateStockItem(itemId, {
      name: editName,
      buyingPrice: priceNum,
      quantity: qtyNum,
    });
    
    setEditingItem(null);
    toast.success('Item updated successfully');
    refreshStock();
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
    setEditQuantity('');
  };

  const handleDelete = (itemId: string) => {
    if (!isBoss) {
      toast.error('Only BOSS can delete stock');
      return;
    }

    if (confirm('Are you sure you want to delete this item?')) {
      deleteStockItem(itemId);
      toast.success('Item deleted');
      refreshStock();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Stock Management</CardTitle>
              <CardDescription>
                Manage inventory and stock levels
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S/N</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Current Quantity</TableHead>
                  {isBoss && <TableHead>Buying Price</TableHead>}
                  <TableHead>Opening Stock</TableHead>
                  {isBoss && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isBoss ? 6 : 4} className="text-center text-gray-500">
                      <div className="py-8 flex flex-col items-center">
                        <Package className="h-12 w-12 mb-2 text-gray-300" />
                        <p>No stock items yet</p>
                        <p className="text-sm">Add your first item to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stock.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          item.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <Input
                            type="number"
                            min="0"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className="w-24"
                          />
                        ) : (
                          <span className={item.quantity < 10 ? 'text-red-500' : ''}>
                            {item.quantity}
                            {item.quantity < 10 && ' (Low stock)'}
                          </span>
                        )}
                      </TableCell>
                      {isBoss && (
                        <TableCell>
                          {editingItem === item.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24"
                            />
                          ) : (
                            `$${item.buyingPrice.toFixed(2)}`
                          )}
                        </TableCell>
                      )}
                      <TableCell>{item.openingStock}</TableCell>
                      {isBoss && (
                        <TableCell>
                          {editingItem === item.id ? (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveEdit(item.id)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Stock Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Add new items or update existing stock quantities
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div className="space-y-2">
              <Label>Specification</Label>
              <Select value={specification} onValueChange={(v) => setSpecification(v as 'new' | 'existing')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Item</SelectItem>
                  <SelectItem value="existing">Existing Item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {specification === 'existing' ? (
              <div className="space-y-2">
                <Label>Select Item</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose item" />
                  </SelectTrigger>
                  <SelectContent>
                    {stock.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} (Current: {item.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter item name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Quantity to Add</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            {specification === 'new' && (
              <div className="space-y-2">
                <Label>Buying Price (per unit)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={buyingPrice}
                  onChange={(e) => setBuyingPrice(e.target.value)}
                  placeholder="Enter buying price"
                  disabled={!isBoss}
                />
                {!isBoss && (
                  <p className="text-xs text-red-500">
                    Only BOSS can add new items
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">Add Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
