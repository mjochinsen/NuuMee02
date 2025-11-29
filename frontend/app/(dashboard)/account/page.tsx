'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Shield,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Download,
  Copy,
  Monitor,
  Smartphone,
  QrCode,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

type TabType = 'profile' | 'notifications' | 'security' | 'privacy' | 'delete';

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [fullName, setFullName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex.chen@email.com');
  const [username, setUsername] = useState('alexchen');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailVerified] = useState(true);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteFeedback, setDeleteFeedback] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [profileVisibility, setProfileVisibility] = useState('private');
  const [dataRetention, setDataRetention] = useState('30');

  // Modals
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    jobCompletion: true,
    jobFailure: true,
    lowCredit: true,
    billing: true,
    productUpdates: true,
    marketing: false,
  });

  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState({
    completed: true,
    failed: true,
    queued: false,
    processing: false,
  });

  const sessions: Session[] = [
    {
      id: '1',
      device: 'Chrome on macOS',
      location: 'San Francisco, CA',
      ip: '192.168.1.1',
      lastActive: 'Just now',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone 14 Pro',
      location: 'San Francisco, CA',
      ip: '192.168.1.5',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Firefox on Windows 11',
      location: 'Los Angeles, CA',
      ip: '10.0.0.123',
      lastActive: 'Yesterday',
      isCurrent: false,
    },
  ];

  const backupCodes = [
    'ABCD-1234-EFGH',
    'IJKL-5678-MNOP',
    'QRST-9012-UVWX',
    'YZAB-3456-CDEF',
    'GHIJ-7890-KLMN',
    'OPQR-1234-STUV',
    'WXYZ-5678-ABCD',
    'EFGH-9012-IJKL',
  ];

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 25) return { label: 'Weak', color: 'bg-red-500' };
    if (passwordStrength <= 50) return { label: 'Fair', color: 'bg-yellow-500' };
    if (passwordStrength <= 75) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const handleSaveProfile = () => {
    alert('Profile updated successfully');
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    alert('Password changed. Please log in again.');
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEndSession = (sessionId: string) => {
    alert('Session ended');
  };

  const handleEndAllSessions = () => {
    alert('All other sessions ended');
  };

  const handleRequestDataExport = () => {
    alert('Data export requested. Check your email in 10 minutes.');
  };

  const handleTestWebhook = () => {
    alert('Test webhook sent successfully');
  };

  const tabs = [
    { id: 'profile' as TabType, icon: User, label: 'Profile' },
    { id: 'notifications' as TabType, icon: Bell, label: 'Notifications' },
    { id: 'security' as TabType, icon: Lock, label: 'Security' },
    { id: 'privacy' as TabType, icon: Shield, label: 'Privacy' },
    { id: 'delete' as TabType, icon: Trash2, label: 'Delete Account' },
  ];

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⚙️</span>
          <h1 className="text-[#F1F5F9]">Account Settings</h1>
        </div>
      </div>

      <div className="h-px bg-[#334155] mb-8"></div>

      {/* Layout: Sidebar + Content */}
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0">
          <nav className="space-y-2 sticky top-24">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9] text-[#F1F5F9]'
                      : 'border border-transparent text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className={isActive ? 'font-medium' : ''}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-[#00F0D9]" />
                <h2 className="text-[#F1F5F9]">Profile</h2>
              </div>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-[#94A3B8] mb-2 block">Avatar</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                      <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500">
                        Remove
                      </Button>
                    </div>
                    <p className="text-[#94A3B8] text-sm mt-2">
                      JPG or PNG. Max size 2MB.
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[#94A3B8]">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#94A3B8]">Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] flex-1"
                    />
                    {emailVerified && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {!emailVerified && (
                    <Button variant="link" className="text-[#00F0D9] p-0 h-auto text-sm">
                      Resend Verification
                    </Button>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#94A3B8]">Username (optional)</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                    placeholder="@username"
                  />
                  <p className="text-[#94A3B8] text-sm">
                    Available at: nuumee.ai/@{username}
                  </p>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#94A3B8]">Company/Organization (optional)</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[#94A3B8]">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[#94A3B8]">Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 500))}
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] min-h-32"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-[#94A3B8] text-sm">
                    {bio.length}/500 characters
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-[#00F0D9]" />
                <h2 className="text-[#F1F5F9]">Notification Preferences</h2>
              </div>

              <div className="space-y-8">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Email Notifications</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    {[
                      { key: 'jobCompletion' as const, label: 'Job completion notifications' },
                      { key: 'jobFailure' as const, label: 'Job failure alerts' },
                      { key: 'lowCredit' as const, label: 'Low credit warnings (below 10 credits)' },
                      { key: 'billing' as const, label: 'Billing and payment receipts' },
                      { key: 'productUpdates' as const, label: 'Product updates and announcements' },
                      { key: 'marketing' as const, label: 'Marketing emails and promotions' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-3">
                        <Switch
                          checked={notifications[key]}
                          onCheckedChange={() => handleToggleNotification(key)}
                        />
                        <span className="text-[#F1F5F9]">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label className="text-[#94A3B8]">Notification Frequency</Label>
                    <Select defaultValue="instant">
                      <SelectTrigger className="w-64 bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-[#334155]">
                        <SelectItem value="instant" className="text-[#F1F5F9]">Instant</SelectItem>
                        <SelectItem value="daily" className="text-[#F1F5F9]">Daily Digest</SelectItem>
                        <SelectItem value="weekly" className="text-[#F1F5F9]">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Browser Notifications */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Browser Notifications</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={browserNotifications}
                        onCheckedChange={setBrowserNotifications}
                      />
                      <span className="text-[#F1F5F9]">Real-time job status updates</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={browserNotifications} />
                      <span className="text-[#F1F5F9]">System alerts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#94A3B8]">Status:</span>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Enabled
                      </Badge>
                    </div>
                    {browserNotifications && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500"
                      >
                        Disable Browser Notifications
                      </Button>
                    )}
                  </div>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Webhook Integration */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Webhook Integration (Developer)</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url" className="text-[#94A3B8]">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-server.com/webhook"
                        className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#94A3B8]">Events to send:</Label>
                      <div className="space-y-2">
                        {[
                          { key: 'completed', label: 'job.completed' },
                          { key: 'failed', label: 'job.failed' },
                          { key: 'queued', label: 'job.queued' },
                          { key: 'processing', label: 'job.processing' },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-3">
                            <Switch
                              checked={webhookEvents[key as keyof typeof webhookEvents]}
                              onCheckedChange={(checked) => {
                                setWebhookEvents(prev => ({ ...prev, [key]: checked }));
                              }}
                            />
                            <span className="text-[#F1F5F9] font-mono text-sm">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webhook-secret" className="text-[#94A3B8]">Secret Key (for verification)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="webhook-secret"
                          value="whsec_•••••••••••••••••••"
                          readOnly
                          className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] flex-1"
                        />
                        <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                          Regenerate
                        </Button>
                      </div>
                    </div>

                    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                      <p className="text-[#94A3B8] text-sm">
                        Webhooks send POST requests when events occur
                      </p>
                    </div>

                    <Button
                      onClick={handleTestWebhook}
                      variant="outline"
                      size="sm"
                      className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    >
                      Test Webhook
                    </Button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-[#00F0D9]" />
                <h2 className="text-[#F1F5F9]">Security</h2>
              </div>

              <div className="space-y-8">
                {/* Change Password */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Change Password</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-[#94A3B8]">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-[#94A3B8]">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Progress value={passwordStrength} className="h-2 flex-1" />
                            <span className={`text-sm ${
                              passwordStrength <= 25 ? 'text-red-500' :
                              passwordStrength <= 50 ? 'text-yellow-500' :
                              passwordStrength <= 75 ? 'text-blue-500' : 'text-green-500'
                            }`}>
                              {getPasswordStrengthLabel().label}
                            </span>
                          </div>
                          <ul className="space-y-1 text-sm">
                            <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-500' : 'text-[#94A3B8]'}`}>
                              <Check className="w-3 h-3" />
                              At least 8 characters
                            </li>
                            <li className={`flex items-center gap-2 ${/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-[#94A3B8]'}`}>
                              <Check className="w-3 h-3" />
                              Contains uppercase and lowercase
                            </li>
                            <li className={`flex items-center gap-2 ${/[0-9]/.test(newPassword) ? 'text-green-500' : 'text-[#94A3B8]'}`}>
                              <Check className="w-3 h-3" />
                              Contains numbers
                            </li>
                            <li className={`flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(newPassword) ? 'text-green-500' : 'text-[#94A3B8]'}`}>
                              <Check className="w-3 h-3" />
                              Contains special characters
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-[#94A3B8]">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleUpdatePassword}
                      className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Two-Factor Authentication */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Two-Factor Authentication (2FA)</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#94A3B8]">Status:</span>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Enabled via Authenticator App
                      </Badge>
                    </div>
                    <p className="text-[#94A3B8] text-sm">
                      Last verified: Nov 11, 2025 at 2:34 PM
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500"
                      >
                        Disable 2FA
                      </Button>
                      <Button
                        onClick={() => setShowBackupCodesModal(true)}
                        variant="outline"
                        size="sm"
                        className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                      >
                        View Backup Codes
                      </Button>
                      <Button
                        onClick={() => setShow2FAModal(true)}
                        variant="outline"
                        size="sm"
                        className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                      >
                        Reconfigure
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Active Sessions */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Active Sessions</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {session.device.includes('iPhone') ? (
                              <Smartphone className="w-5 h-5 text-[#00F0D9] mt-0.5" />
                            ) : (
                              <Monitor className="w-5 h-5 text-[#00F0D9] mt-0.5" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#F1F5F9]">{session.device}</span>
                                {session.isCurrent && (
                                  <Badge className="bg-[#00F0D9]/10 text-[#00F0D9] border-[#00F0D9]/20">
                                    CURRENT
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[#94A3B8] text-sm">
                                {session.location} • IP: {session.ip}
                              </p>
                              <p className="text-[#94A3B8] text-sm">
                                Last active: {session.lastActive}
                              </p>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <Button
                              onClick={() => handleEndSession(session.id)}
                              variant="outline"
                              size="sm"
                              className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500"
                            >
                              End Session
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={handleEndAllSessions}
                      variant="outline"
                      className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500"
                    >
                      End All Other Sessions
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-[#00F0D9]" />
                <h2 className="text-[#F1F5F9]">Privacy & Data</h2>
              </div>

              <div className="space-y-8">
                {/* Data Retention */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Data Retention</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8]">Keep completed jobs for:</Label>
                      <Select value={dataRetention} onValueChange={setDataRetention}>
                        <SelectTrigger className="w-64 bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E293B] border-[#334155]">
                          <SelectItem value="7" className="text-[#F1F5F9]">7 days</SelectItem>
                          <SelectItem value="30" className="text-[#F1F5F9]">30 days</SelectItem>
                          <SelectItem value="60" className="text-[#F1F5F9]">60 days</SelectItem>
                          <SelectItem value="90" className="text-[#F1F5F9]">90 days</SelectItem>
                          <SelectItem value="forever" className="text-[#F1F5F9]">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch defaultChecked />
                      <span className="text-[#F1F5F9]">Auto-delete failed jobs after 7 days</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch />
                      <span className="text-[#F1F5F9]">Save uploaded files indefinitely</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Usage Analytics */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Usage Analytics</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Switch defaultChecked />
                      <span className="text-[#F1F5F9]">Help improve NuuMee.AI by sharing anonymous usage data</span>
                    </div>
                    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                      <p className="text-[#94A3B8] text-sm">
                        We collect: feature usage, error reports, performance metrics
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Profile Visibility */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Profile Visibility</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <RadioGroup value={profileVisibility} onValueChange={setProfileVisibility}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="text-[#F1F5F9] cursor-pointer">
                          Public — Anyone can view your profile
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="text-[#F1F5F9] cursor-pointer">
                          Private — Only you can view your profile
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="unlisted" id="unlisted" />
                        <Label htmlFor="unlisted" className="text-[#F1F5F9] cursor-pointer">
                          Unlisted — Accessible via direct link only
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Data Export */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Data Export</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <p className="text-[#94A3B8]">
                      Download all your account data in JSON format
                    </p>
                    <p className="text-[#94A3B8] text-sm">
                      Includes: profile, jobs, billing history, settings
                    </p>
                    <Button
                      onClick={handleRequestDataExport}
                      variant="outline"
                      className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Request Data Export
                    </Button>
                    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                      <p className="text-[#94A3B8] text-sm">
                        Export will be ready in ~10 minutes. We'll email you a link.
                      </p>
                    </div>
                    <p className="text-[#94A3B8] text-sm">
                      Last export: Nov 5, 2025
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Cookie Preferences */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Cookie Preferences</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Switch checked disabled />
                      <span className="text-[#F1F5F9]">Essential cookies (required)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch defaultChecked />
                      <span className="text-[#F1F5F9]">Analytics cookies</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch />
                      <span className="text-[#F1F5F9]">Marketing cookies</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    >
                      Manage Cookie Settings
                    </Button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                    Save Privacy Settings
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Tab */}
          {activeTab === 'delete' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h2 className="text-[#F1F5F9]">Delete Account</h2>
              </div>

              <div className="space-y-6">
                {/* Warning Banner */}
                <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-500">
                      Warning: This action cannot be undone
                    </span>
                  </div>
                </div>

                {/* Consequences */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Deleting your account will:</h3>
                  <ul className="space-y-2 text-[#94A3B8]">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Permanently remove your profile and settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Delete all your jobs and generated videos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Cancel any active subscriptions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Revoke all API keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Remove all payment methods</span>
                    </li>
                  </ul>
                </div>

                {/* Before You Go */}
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Before you go:</h3>
                  <ul className="space-y-2 text-[#94A3B8] mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>Unused credits will not be refunded</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>Download any data you want to keep</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>Consider downgrading to the Free plan instead</span>
                    </li>
                  </ul>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download My Data
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    >
                      Downgrade to Free
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-[#334155]"></div>

                {/* Confirmation Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="delete-email" className="text-[#94A3B8]">
                      To confirm deletion, type your email address:
                    </Label>
                    <Input
                      id="delete-email"
                      type="email"
                      value={deleteEmail}
                      onChange={(e) => setDeleteEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delete-reason" className="text-[#94A3B8]">
                      Reason for leaving (optional):
                    </Label>
                    <Select value={deleteReason} onValueChange={setDeleteReason}>
                      <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-[#334155]">
                        <SelectItem value="expensive" className="text-[#F1F5F9]">Too expensive</SelectItem>
                        <SelectItem value="features" className="text-[#F1F5F9]">Missing features</SelectItem>
                        <SelectItem value="quality" className="text-[#F1F5F9]">Quality issues</SelectItem>
                        <SelectItem value="alternative" className="text-[#F1F5F9]">Found alternative</SelectItem>
                        <SelectItem value="other" className="text-[#F1F5F9]">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delete-feedback" className="text-[#94A3B8]">
                      Additional feedback:
                    </Label>
                    <Textarea
                      id="delete-feedback"
                      value={deleteFeedback}
                      onChange={(e) => setDeleteFeedback(e.target.value)}
                      className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] min-h-24"
                      placeholder="Let us know how we can improve..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirmModal(true)}
                    disabled={deleteEmail !== email}
                    className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9]">Set Up Two-Factor Authentication</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h4 className="text-[#F1F5F9] mb-3">Step 1: Scan QR Code</h4>
              <p className="text-[#94A3B8] text-sm mb-3">Use an authenticator app:</p>
              <ul className="text-[#94A3B8] text-sm space-y-1 mb-4">
                <li>• Google Authenticator</li>
                <li>• Authy</li>
                <li>• 1Password</li>
              </ul>

              <div className="flex justify-center mb-4">
                <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-black" />
                </div>
              </div>

              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-3">
                <p className="text-[#94A3B8] text-sm mb-2">Or enter this code manually:</p>
                <div className="flex items-center gap-2">
                  <code className="text-[#F1F5F9] font-mono">ABCD EFGH IJKL MNOP</code>
                  <Button variant="ghost" size="sm" className="text-[#00F0D9]">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[#F1F5F9] mb-3">Step 2: Enter Verification Code</h4>
              <Input
                placeholder="000000"
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] text-center text-xl tracking-widest"
                maxLength={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShow2FAModal(false)}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShow2FAModal(false);
                alert('Two-factor authentication enabled');
              }}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Modal */}
      <Dialog open={showBackupCodesModal} onOpenChange={setShowBackupCodesModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9]">Two-Factor Backup Codes</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Save these codes in a safe place. Each can be used once if you lose access to your authenticator app.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-[#F1F5F9] text-sm">
                  {index + 1}. {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Switch />
            <Label className="text-[#F1F5F9]">I've saved my backup codes</Label>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowBackupCodesModal(false)}
              className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Final Confirmation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-[#F1F5F9]">
              Are you absolutely sure you want to delete your account?
            </p>

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-[#F1F5F9] mb-2">This will:</p>
              <ul className="space-y-1 text-[#94A3B8] text-sm">
                <li>• Delete all your data permanently</li>
                <li>• Cancel your Creator subscription</li>
                <li>• Forfeit 25 remaining credits ($12.50)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-[#94A3B8]">
                Type DELETE to confirm:
              </Label>
              <Input
                id="confirm-delete"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirmModal(false);
                setDeleteConfirmText('');
              }}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                alert('Account deleted');
                setShowDeleteConfirmModal(false);
              }}
              disabled={deleteConfirmText !== 'DELETE'}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
