import { useState } from 'react';
import { ArrowLeft, Bell, Mail, MessageSquare, Car, CreditCard, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { BottomNav } from '@/components/BottomNav';

export const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    bookingUpdates: true,
    paymentAlerts: true,
    promotions: true,
    reminders: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Settings Updated" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Notification Channels */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive push notifications on your device</p>
                </div>
              </div>
              <Switch 
                checked={settings.pushNotifications} 
                onCheckedChange={() => toggleSetting('pushNotifications')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch 
                checked={settings.emailNotifications} 
                onCheckedChange={() => toggleSetting('emailNotifications')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive SMS alerts</p>
                </div>
              </div>
              <Switch 
                checked={settings.smsNotifications} 
                onCheckedChange={() => toggleSetting('smsNotifications')} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notification Types</CardTitle>
            <p className="text-xs text-muted-foreground">Choose what you want to be notified about</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Booking Updates</p>
                  <p className="text-xs text-muted-foreground">Status changes, confirmations</p>
                </div>
              </div>
              <Switch 
                checked={settings.bookingUpdates} 
                onCheckedChange={() => toggleSetting('bookingUpdates')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Payment Alerts</p>
                  <p className="text-xs text-muted-foreground">Payment confirmations, refunds</p>
                </div>
              </div>
              <Switch 
                checked={settings.paymentAlerts} 
                onCheckedChange={() => toggleSetting('paymentAlerts')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Promotions & Offers</p>
                  <p className="text-xs text-muted-foreground">Deals, discounts, special offers</p>
                </div>
              </div>
              <Switch 
                checked={settings.promotions} 
                onCheckedChange={() => toggleSetting('promotions')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ride Reminders</p>
                  <p className="text-xs text-muted-foreground">Upcoming bookings, returns</p>
                </div>
              </div>
              <Switch 
                checked={settings.reminders} 
                onCheckedChange={() => toggleSetting('reminders')} 
              />
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};
