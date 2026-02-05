 import { useState } from 'react';
 import { ArrowLeft, Shield, Lock, Eye, EyeOff, Smartphone, Key, FileText, AlertTriangle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Switch } from '@/components/ui/switch';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { useNavigate } from 'react-router-dom';
 import { useToast } from '@/hooks/use-toast';
 import { BottomNav } from '@/components/BottomNav';
 
 export const PrivacySecurity = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [showPasswordDialog, setShowPasswordDialog] = useState(false);
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
   const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
   const [settings, setSettings] = useState({ twoFactorAuth: false, biometricLogin: true, loginAlerts: true, dataSharing: false, locationTracking: true, marketingEmails: false });
   const [sessions] = useState([
     { id: '1', device: 'iPhone 14 Pro', location: 'New York, US', lastActive: 'Active now', current: true },
     { id: '2', device: 'MacBook Pro', location: 'New York, US', lastActive: '2 hours ago', current: false },
     { id: '3', device: 'iPad Air', location: 'Boston, US', lastActive: '3 days ago', current: false },
   ]);
 
   const toggleSetting = (key: keyof typeof settings) => { setSettings(prev => ({ ...prev, [key]: !prev[key] })); toast({ title: "Setting Updated" }); };
 
   const handleChangePassword = () => {
     if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) { toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" }); return; }
     if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" }); return; }
     if (passwordForm.newPassword.length < 8) { toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" }); return; }
     toast({ title: "Password Changed", description: "Your password has been updated successfully." });
     setShowPasswordDialog(false);
     setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
   };
 
   const handleLogoutSession = (sessionId: string) => toast({ title: "Session Ended", description: "Device has been logged out." });
   const handleLogoutAll = () => toast({ title: "All Sessions Ended", description: "You've been logged out from all other devices." });
   const handleDeleteAccount = () => { toast({ title: "Account Scheduled for Deletion", variant: "destructive" }); setShowDeleteDialog(false); };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
         <div className="flex items-center gap-3 px-4 py-4">
           <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}><ArrowLeft className="h-5 w-5" /></Button>
           <h1 className="text-lg font-bold text-foreground">Privacy & Security</h1>
         </div>
       </header>
 
       <main className="px-4 py-6 space-y-6">
         <Card className="border-border">
           <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Security</CardTitle></CardHeader>
           <CardContent className="space-y-4">
             <Button variant="outline" className="w-full justify-between h-auto py-3" onClick={() => setShowPasswordDialog(true)}>
               <span className="flex items-center gap-3"><Key className="h-4 w-4 text-muted-foreground" />Change Password</span>
             </Button>
             <div className="flex items-center justify-between py-2">
               <div className="flex items-center gap-3"><Smartphone className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-foreground">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Add extra security</p></div></div>
               <Switch checked={settings.twoFactorAuth} onCheckedChange={() => toggleSetting('twoFactorAuth')} />
             </div>
             <div className="flex items-center justify-between py-2">
               <div className="flex items-center gap-3"><Eye className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-foreground">Biometric Login</p><p className="text-xs text-muted-foreground">Use fingerprint or face ID</p></div></div>
               <Switch checked={settings.biometricLogin} onCheckedChange={() => toggleSetting('biometricLogin')} />
             </div>
             <div className="flex items-center justify-between py-2">
               <div className="flex items-center gap-3"><AlertTriangle className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-foreground">Login Alerts</p><p className="text-xs text-muted-foreground">Get notified of new logins</p></div></div>
               <Switch checked={settings.loginAlerts} onCheckedChange={() => toggleSetting('loginAlerts')} />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-border">
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" />Active Sessions</CardTitle>
               <Button variant="ghost" size="sm" className="text-destructive" onClick={handleLogoutAll}>Logout All</Button>
             </div>
           </CardHeader>
           <CardContent className="space-y-3">
             {sessions.map(session => (
               <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                 <div className="flex items-center gap-3">
                   <Smartphone className="h-5 w-5 text-muted-foreground" />
                   <div>
                     <div className="flex items-center gap-2">
                       <p className="font-medium text-foreground text-sm">{session.device}</p>
                       {session.current && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">Current</span>}
                     </div>
                     <p className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</p>
                   </div>
                 </div>
                 {!session.current && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleLogoutSession(session.id)}>Logout</Button>}
               </div>
             ))}
           </CardContent>
         </Card>
 
         <Card className="border-border">
           <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Privacy</CardTitle></CardHeader>
           <CardContent className="space-y-4">
             <div className="flex items-center justify-between py-2"><div><p className="font-medium text-foreground">Data Sharing</p><p className="text-xs text-muted-foreground">Share data with partners for offers</p></div><Switch checked={settings.dataSharing} onCheckedChange={() => toggleSetting('dataSharing')} /></div>
             <div className="flex items-center justify-between py-2"><div><p className="font-medium text-foreground">Location Tracking</p><p className="text-xs text-muted-foreground">Allow location access for delivery</p></div><Switch checked={settings.locationTracking} onCheckedChange={() => toggleSetting('locationTracking')} /></div>
             <div className="flex items-center justify-between py-2"><div><p className="font-medium text-foreground">Marketing Emails</p><p className="text-xs text-muted-foreground">Receive promotional emails</p></div><Switch checked={settings.marketingEmails} onCheckedChange={() => toggleSetting('marketingEmails')} /></div>
           </CardContent>
         </Card>
 
         <Card className="border-border">
           <CardContent className="p-0">
             <Button variant="ghost" className="w-full justify-start h-auto py-4 px-4 border-b border-border rounded-none"><FileText className="h-4 w-4 mr-3 text-muted-foreground" />Privacy Policy</Button>
             <Button variant="ghost" className="w-full justify-start h-auto py-4 px-4 border-b border-border rounded-none"><FileText className="h-4 w-4 mr-3 text-muted-foreground" />Terms of Service</Button>
             <Button variant="ghost" className="w-full justify-start h-auto py-4 px-4 rounded-none"><FileText className="h-4 w-4 mr-3 text-muted-foreground" />Data Usage Policy</Button>
           </CardContent>
         </Card>
 
         <Card className="border-destructive/20 bg-destructive/5">
           <CardContent className="p-4">
             <div className="flex items-start gap-3">
               <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
               <div className="flex-1">
                 <p className="font-medium text-foreground">Delete Account</p>
                 <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data.</p>
                 <Button variant="destructive" size="sm" className="mt-3" onClick={() => setShowDeleteDialog(true)}>Delete My Account</Button>
               </div>
             </div>
           </CardContent>
         </Card>
       </main>
 
       <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
         <DialogContent className="max-w-sm mx-4">
           <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
           <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Current Password</label>
               <div className="relative">
                 <Input type={showPasswords.current ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} placeholder="Enter current password" />
                 <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}>
                   {showPasswords.current ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                 </button>
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">New Password</label>
               <div className="relative">
                 <Input type={showPasswords.new ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Enter new password" />
                 <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}>
                   {showPasswords.new ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                 </button>
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Confirm New Password</label>
               <div className="relative">
                 <Input type={showPasswords.confirm ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
                 <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}>
                   {showPasswords.confirm ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                 </button>
               </div>
             </div>
           </div>
           <DialogFooter className="flex gap-2">
             <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
             <Button onClick={handleChangePassword}>Update Password</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
         <DialogContent className="max-w-sm mx-4">
           <DialogHeader><DialogTitle className="text-destructive">Delete Account</DialogTitle></DialogHeader>
           <div className="space-y-4">
             <p className="text-muted-foreground">Are you sure you want to delete your account? This will:</p>
             <ul className="text-sm text-muted-foreground space-y-2">
               <li>• Remove all your personal data</li>
               <li>• Cancel any active bookings</li>
               <li>• Delete saved payment methods</li>
               <li>• This action cannot be undone</li>
             </ul>
           </div>
           <DialogFooter className="flex gap-2">
             <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
             <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
       <BottomNav />
     </div>
   );
 };