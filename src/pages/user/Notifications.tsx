 import { useState } from 'react';
 import { ArrowLeft, Bell, BellOff, Car, CreditCard, Gift, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Switch } from '@/components/ui/switch';
 import { useNavigate } from 'react-router-dom';
 import { useToast } from '@/hooks/use-toast';
 import { BottomNav } from '@/components/BottomNav';
 
 interface Notification {
   id: string;
   type: 'booking' | 'payment' | 'promo' | 'alert' | 'success';
   title: string;
   message: string;
   time: string;
   isRead: boolean;
 }
 
 const initialNotifications: Notification[] = [
   { id: '1', type: 'success', title: 'Booking Confirmed', message: 'Your Toyota Camry booking for Feb 20 has been confirmed!', time: '2 hours ago', isRead: false },
   { id: '2', type: 'payment', title: 'Payment Successful', message: 'Payment of $89 received for booking #B4521', time: '5 hours ago', isRead: false },
   { id: '3', type: 'promo', title: 'Weekend Special! 🎉', message: 'Get 20% off on all car rentals this weekend. Use code: WEEKEND20', time: '1 day ago', isRead: true },
   { id: '4', type: 'booking', title: 'Upcoming Ride Reminder', message: 'Your BMW 3 Series rental starts tomorrow at 9:00 AM', time: '1 day ago', isRead: true },
   { id: '5', type: 'alert', title: 'Document Expiring Soon', message: 'Your driving license will expire in 30 days. Please update it.', time: '3 days ago', isRead: true },
 ];
 
 const getNotificationIcon = (type: string) => {
   switch (type) {
     case 'booking': return Car;
     case 'payment': return CreditCard;
     case 'promo': return Gift;
     case 'alert': return AlertCircle;
     case 'success': return CheckCircle;
     default: return Bell;
   }
 };
 
 const getIconColor = (type: string) => {
   switch (type) {
     case 'booking': return 'bg-primary/10 text-primary';
     case 'payment': return 'bg-green-500/10 text-green-500';
     case 'promo': return 'bg-purple-500/10 text-purple-500';
     case 'alert': return 'bg-orange-500/10 text-orange-500';
     case 'success': return 'bg-green-500/10 text-green-500';
     default: return 'bg-secondary text-muted-foreground';
   }
 };
 
 export const Notifications = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
   const [settings, setSettings] = useState({
     pushNotifications: true, emailNotifications: true, smsNotifications: false,
     bookingUpdates: true, paymentAlerts: true, promotions: true, reminders: true,
   });
 
   const unreadCount = notifications.filter(n => !n.isRead).length;
 
   const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
   const markAllAsRead = () => { setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); toast({ title: "All Read" }); };
   const deleteNotification = (id: string) => { setNotifications(prev => prev.filter(n => n.id !== id)); toast({ title: "Deleted" }); };
   const clearAll = () => { setNotifications([]); toast({ title: "Cleared" }); };
 
   const toggleSetting = (key: keyof typeof settings) => {
     setSettings(prev => ({ ...prev, [key]: !prev[key] }));
     toast({ title: "Settings Updated" });
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
         <div className="flex items-center justify-between px-4 py-4">
           <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <div>
               <h1 className="text-lg font-bold text-foreground">Notifications</h1>
               {unreadCount > 0 && <p className="text-xs text-muted-foreground">{unreadCount} unread</p>}
             </div>
           </div>
           {notifications.length > 0 && <Button variant="ghost" size="sm" onClick={markAllAsRead}>Mark all read</Button>}
         </div>
       </header>
 
       <main className="px-4 py-6 space-y-6">
         <Card className="border-border">
           <CardHeader className="pb-3"><CardTitle className="text-base">Notification Settings</CardTitle></CardHeader>
           <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
               <div><p className="font-medium text-foreground">Push Notifications</p><p className="text-xs text-muted-foreground">Receive push notifications</p></div>
               <Switch checked={settings.pushNotifications} onCheckedChange={() => toggleSetting('pushNotifications')} />
             </div>
             <div className="flex items-center justify-between">
               <div><p className="font-medium text-foreground">Email Notifications</p><p className="text-xs text-muted-foreground">Receive email updates</p></div>
               <Switch checked={settings.emailNotifications} onCheckedChange={() => toggleSetting('emailNotifications')} />
             </div>
             <div className="flex items-center justify-between">
               <div><p className="font-medium text-foreground">SMS Notifications</p><p className="text-xs text-muted-foreground">Receive SMS alerts</p></div>
               <Switch checked={settings.smsNotifications} onCheckedChange={() => toggleSetting('smsNotifications')} />
             </div>
             <div className="border-t border-border pt-4 space-y-4">
               <p className="text-sm font-medium text-muted-foreground">Notification Types</p>
               <div className="flex items-center justify-between"><p className="text-foreground">Booking Updates</p><Switch checked={settings.bookingUpdates} onCheckedChange={() => toggleSetting('bookingUpdates')} /></div>
               <div className="flex items-center justify-between"><p className="text-foreground">Payment Alerts</p><Switch checked={settings.paymentAlerts} onCheckedChange={() => toggleSetting('paymentAlerts')} /></div>
               <div className="flex items-center justify-between"><p className="text-foreground">Promotions & Offers</p><Switch checked={settings.promotions} onCheckedChange={() => toggleSetting('promotions')} /></div>
               <div className="flex items-center justify-between"><p className="text-foreground">Ride Reminders</p><Switch checked={settings.reminders} onCheckedChange={() => toggleSetting('reminders')} /></div>
             </div>
           </CardContent>
         </Card>
 
         <div className="space-y-3">
           <div className="flex items-center justify-between">
             <h2 className="font-semibold text-foreground">Recent Notifications</h2>
             {notifications.length > 0 && <Button variant="ghost" size="sm" className="text-destructive" onClick={clearAll}>Clear All</Button>}
           </div>
           {notifications.length === 0 ? (
             <Card className="border-border"><CardContent className="p-8 text-center"><BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No notifications yet</p></CardContent></Card>
           ) : (
             notifications.map(notification => {
               const Icon = getNotificationIcon(notification.type);
               const colorClass = getIconColor(notification.type);
               return (
                 <Card key={notification.id} className={`border-border cursor-pointer transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`} onClick={() => markAsRead(notification.id)}>
                   <CardContent className="p-4">
                     <div className="flex items-start gap-3">
                       <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass.split(' ')[0]}`}>
                         <Icon className={`h-5 w-5 ${colorClass.split(' ')[1]}`} />
                       </div>
                       <div className="flex-1">
                         <div className="flex items-start justify-between">
                           <div>
                             <p className={`font-medium text-foreground ${!notification.isRead ? 'font-semibold' : ''}`}>{notification.title}</p>
                             <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                             <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                           </div>
                           <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                             <Trash2 className="h-4 w-4 text-muted-foreground" />
                           </Button>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               );
             })
           )}
         </div>
       </main>
       <BottomNav />
     </div>
   );
 };