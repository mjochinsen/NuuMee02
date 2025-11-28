'use client';

import { useState } from 'react';
import { User, Bell, Lock, Shield, Trash2, Upload, Eye, EyeOff, Check, AlertTriangle, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

type TabType = 'profile' | 'notifications' | 'security' | 'privacy' | 'delete';

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [fullName, setFullName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex.chen@email.com');
  const [username, setUsername] = useState('alexchen');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [notifications, setNotifications] = useState({ jobCompletion: true, jobFailure: true, lowCredit: true, billing: true, productUpdates: true, marketing: false });
  const [browserNotifications, setBrowserNotifications] = useState(true);

  const tabs = [
    { id: 'profile' as TabType, icon: User, label: 'Profile' },
    { id: 'notifications' as TabType, icon: Bell, label: 'Notifications' },
    { id: 'security' as TabType, icon: Lock, label: 'Security' },
    { id: 'privacy' as TabType, icon: Shield, label: 'Privacy' },
    { id: 'delete' as TabType, icon: Trash2, label: 'Delete Account' },
  ];

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2"><span className="text-2xl">⚙️</span><h1 className="text-[#F1F5F9]">Account Settings</h1></div>
      </div>
      <div className="h-px bg-[#334155] mb-8"></div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0">
          <nav className="space-y-2 sticky top-24">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9] text-[#F1F5F9]' : 'border border-transparent text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]'}`}>
                  <Icon className="w-5 h-5" /><span className={isActive ? 'font-medium' : ''}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6"><User className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Profile</h2></div>
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center"><User className="w-12 h-12 text-white" /></div>
                  <div className="flex-1">
                    <Label className="text-[#94A3B8] mb-2 block">Avatar</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"><Upload className="w-4 h-4 mr-2" />Upload</Button>
                      <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500">Remove</Button>
                    </div>
                    <p className="text-[#94A3B8] text-sm mt-2">JPG or PNG. Max size 2MB.</p>
                  </div>
                </div>
                <div className="space-y-2"><Label htmlFor="fullName" className="text-[#94A3B8]">Full Name</Label><Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" /></div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#94A3B8]">Email Address</Label>
                  <div className="flex gap-2">
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] flex-1" />
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1"><Check className="w-3 h-3" />Verified</Badge>
                  </div>
                </div>
                <div className="space-y-2"><Label htmlFor="username" className="text-[#94A3B8]">Username (optional)</Label><Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" placeholder="@username" /><p className="text-[#94A3B8] text-sm">Available at: nuumee.ai/@{username}</p></div>
                <div className="space-y-2"><Label htmlFor="bio" className="text-[#94A3B8]">Bio (optional)</Label><Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 500))} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] min-h-32" placeholder="Tell us about yourself..." /><p className="text-[#94A3B8] text-sm">{bio.length}/500 characters</p></div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">Cancel</Button>
                  <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Save Changes</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6"><Bell className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Notification Preferences</h2></div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Email Notifications</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <Switch checked={value} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))} />
                        <span className="text-[#F1F5F9]">{key === 'jobCompletion' ? 'Job completion notifications' : key === 'jobFailure' ? 'Job failure alerts' : key === 'lowCredit' ? 'Low credit warnings' : key === 'billing' ? 'Billing and payment receipts' : key === 'productUpdates' ? 'Product updates' : 'Marketing emails'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-[#334155]"></div>
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Browser Notifications</h3>
                  <div className="flex items-center gap-3">
                    <Switch checked={browserNotifications} onCheckedChange={setBrowserNotifications} />
                    <span className="text-[#F1F5F9]">Real-time job status updates</span>
                  </div>
                </div>
                <div className="pt-4"><Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Save Notification Settings</Button></div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6"><Lock className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Security</h2></div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Change Password</h3>
                  <div className="h-px bg-[#334155] mb-4"></div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8]">Current Password</Label>
                      <div className="relative">
                        <Input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] pr-10" />
                        <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]">{showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8]">New Password</Label>
                      <div className="relative">
                        <Input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] pr-10" />
                        <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                      {newPassword && <Progress value={getPasswordStrength(newPassword)} className="h-2" />}
                    </div>
                    <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Update Password</Button>
                  </div>
                </div>
                <div className="h-px bg-[#334155]"></div>
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Two-Factor Authentication (2FA)</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[#94A3B8]">Status:</span>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">✅ Enabled via Authenticator App</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500">Disable 2FA</Button>
                    <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">View Backup Codes</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6"><Shield className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Privacy & Data</h2></div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Data Retention</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8]">Keep completed jobs for:</Label>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-64 bg-[#1E293B] border-[#334155] text-[#F1F5F9]"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#1E293B] border-[#334155]">
                          <SelectItem value="7" className="text-[#F1F5F9]">7 days</SelectItem>
                          <SelectItem value="30" className="text-[#F1F5F9]">30 days</SelectItem>
                          <SelectItem value="90" className="text-[#F1F5F9]">90 days</SelectItem>
                          <SelectItem value="forever" className="text-[#F1F5F9]">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-[#334155]"></div>
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Data Export</h3>
                  <p className="text-[#94A3B8] mb-4">Download all your account data in JSON format</p>
                  <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"><Download className="w-4 h-4 mr-2" />Request Data Export</Button>
                </div>
                <div className="pt-4"><Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Save Privacy Settings</Button></div>
              </div>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
              <div className="flex items-center gap-2 mb-6"><Trash2 className="w-5 h-5 text-red-500" /><h2 className="text-[#F1F5F9]">Delete Account</h2></div>
              <div className="space-y-6">
                <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-4">
                  <div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><span className="text-red-500">Warning: This action cannot be undone</span></div>
                </div>
                <div>
                  <h3 className="text-[#F1F5F9] mb-4">Deleting your account will:</h3>
                  <ul className="space-y-2 text-[#94A3B8]">
                    <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span><span>Permanently remove your profile and settings</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span><span>Delete all your jobs and generated videos</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span><span>Cancel any active subscriptions</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span><span>Revoke all API keys</span></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2"><Label className="text-[#94A3B8]">To confirm deletion, type your email address:</Label><Input type="email" value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} placeholder="your@email.com" className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" /></div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">Cancel</Button>
                  <Button disabled={deleteEmail !== email} className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 className="w-4 h-4 mr-2" />Delete My Account</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
