import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, updatePassword } from '../utils/storage';
import { toast } from 'sonner';
import { Lock, Shield } from 'lucide-react';

interface SettingsPanelProps {
  user: User;
}

export function SettingsPanel({ user }: SettingsPanelProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');

  const isBoss = user.role === 'BOSS';

  const handleChangeOwnPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (currentPassword !== user.password) {
      toast.error('Current password is incorrect');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    updatePassword(user.role, newPassword);
    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangeEmployeePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeePassword) {
      toast.error('Please enter new password');
      return;
    }

    if (employeePassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    updatePassword('EMPLOYEE', employeePassword);
    toast.success('Employee password changed successfully');
    setEmployeePassword('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage account passwords and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Own Password */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5" />
              <h3>Change Your Password</h3>
            </div>
            <form onSubmit={handleChangeOwnPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button type="submit">
                Change Password
              </Button>
            </form>
          </div>

          {/* Boss can change employee password */}
          {isBoss && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5" />
                <h3>Change Employee Password</h3>
              </div>
              <form onSubmit={handleChangeEmployeePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeePassword">New Employee Password</Label>
                  <Input
                    id="employeePassword"
                    type="password"
                    value={employeePassword}
                    onChange={(e) => setEmployeePassword(e.target.value)}
                    placeholder="Enter new password for employee (min 6 characters)"
                  />
                </div>

                <Button type="submit">
                  Update Employee Password
                </Button>
              </form>
            </div>
          )}

          {/* System Information */}
          <div className="border-t pt-6">
            <h3 className="mb-4">System Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Logged in as:</span>
                <span>{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span>System Version:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Offline Mode:</span>
                <span className="text-green-600">Enabled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
