import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { EntryPanel } from './components/EntryPanel';
import { DailySalesReport } from './components/DailySalesReport';
import { HistoryPanel } from './components/HistoryPanel';
import { StockManagement } from './components/StockManagement';
import { SettingsPanel } from './components/SettingsPanel';
import { initializeStorage, User } from './utils/storage';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  History, 
  Package, 
  Settings, 
  LogOut,
  Menu,
  X 
} from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'entry' | 'report' | 'history' | 'stock' | 'settings'>('report');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initializeStorage();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('report');
    setMobileMenuOpen(false);
  };

  const canViewTab = (tab: string): boolean => {
    if (!currentUser) return false;
    
    // Employee cannot access stock management for buying prices
    // But can add stock quantities
    return true;
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={setCurrentUser} />
        <Toaster position="top-right" />
      </>
    );
  }

  const isBoss = currentUser.role === 'BOSS';
  const isEmployee = currentUser.role === 'EMPLOYEE';

  // Employee can only enter sales, not modify them from daily report
  const canEnterSales = isEmployee;

  const navigation = [
    { 
      id: 'report' as const, 
      label: 'Daily Report', 
      icon: FileText,
      show: true
    },
    { 
      id: 'entry' as const, 
      label: 'Entry Panel', 
      icon: Plus,
      show: isEmployee // Only employee can enter sales
    },
    { 
      id: 'history' as const, 
      label: 'History', 
      icon: History,
      show: true
    },
    { 
      id: 'stock' as const, 
      label: 'Stock', 
      icon: Package,
      show: true
    },
    { 
      id: 'settings' as const, 
      label: 'Settings', 
      icon: Settings,
      show: isBoss // Only boss has settings access for password management
    },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl">Revenue Management</h1>
                <p className="text-xs text-gray-600">
                  Logged in as: <span className="font-semibold">{currentUser.role}</span>
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'ghost'}
                    onClick={() => setActiveTab(item.id)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
              <Button variant="ghost" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'ghost'}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start gap-2 w-full"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="justify-start gap-2 w-full text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'entry' && <EntryPanel />}
        {activeTab === 'report' && <DailySalesReport user={currentUser} />}
        {activeTab === 'history' && <HistoryPanel user={currentUser} />}
        {activeTab === 'stock' && <StockManagement user={currentUser} />}
        {activeTab === 'settings' && <SettingsPanel user={currentUser} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-600">
            <p>Revenue Management System v1.0.0</p>
            <p className="text-xs mt-1">
              Offline PWA for Bars & Grocery Businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
