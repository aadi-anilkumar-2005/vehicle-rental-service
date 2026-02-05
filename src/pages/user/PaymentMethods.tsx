 import { useState } from 'react';
 import { ArrowLeft, CreditCard, Plus, MoreVertical, Trash2, CheckCircle, Wallet } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent } from '@/components/ui/card';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
 import { useNavigate } from 'react-router-dom';
 import { useToast } from '@/hooks/use-toast';
 import { BottomNav } from '@/components/BottomNav';
 
 interface PaymentMethod {
   id: string;
   type: 'card' | 'upi' | 'wallet';
   name: string;
   details: string;
   isDefault: boolean;
 }
 
 const initialPaymentMethods: PaymentMethod[] = [
   { id: '1', type: 'card', name: 'Visa ending in 4242', details: 'Expires 12/26', isDefault: true },
   { id: '2', type: 'card', name: 'Mastercard ending in 8888', details: 'Expires 08/25', isDefault: false },
   { id: '3', type: 'upi', name: 'Google Pay', details: 'john@oksbi', isDefault: false },
 ];
 
 export const PaymentMethods = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
   const [showAddDialog, setShowAddDialog] = useState(false);
   const [formData, setFormData] = useState({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
 
   const resetForm = () => setFormData({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
 
   const handleAddCard = () => {
     if (!formData.cardNumber || !formData.cardHolder || !formData.expiryDate) {
       toast({ title: "Error", description: "Please fill in all card details.", variant: "destructive" });
       return;
     }
     const lastFour = formData.cardNumber.slice(-4);
     const newMethod: PaymentMethod = {
       id: Date.now().toString(),
       type: 'card',
       name: `Card ending in ${lastFour}`,
       details: `Expires ${formData.expiryDate}`,
       isDefault: paymentMethods.length === 0,
     };
     setPaymentMethods(prev => [...prev, newMethod]);
     toast({ title: "Card Added", description: "Your payment method has been saved." });
     setShowAddDialog(false);
     resetForm();
   };
 
   const setAsDefault = (id: string) => {
     setPaymentMethods(prev => prev.map(pm => ({ ...pm, isDefault: pm.id === id })));
     toast({ title: "Default Updated", description: "This is now your default payment method." });
   };
 
   const deletePaymentMethod = (id: string) => {
     const method = paymentMethods.find(pm => pm.id === id);
     if (method?.isDefault && paymentMethods.length > 1) {
       toast({ title: "Cannot Delete", description: "Please set another payment method as default first.", variant: "destructive" });
       return;
     }
     setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
     toast({ title: "Payment Method Removed", description: `${method?.name} has been removed.` });
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
         <div className="flex items-center justify-between px-4 py-4">
           <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <h1 className="text-lg font-bold text-foreground">Payment Methods</h1>
           </div>
           <Button size="sm" onClick={() => setShowAddDialog(true)}>
             <Plus className="h-4 w-4 mr-1" />Add
           </Button>
         </div>
       </header>
 
       <main className="px-4 py-6 space-y-4">
         {paymentMethods.length === 0 ? (
           <Card className="border-border">
             <CardContent className="p-8 text-center">
               <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
               <p className="text-muted-foreground">No payment methods saved</p>
               <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                 <Plus className="h-4 w-4 mr-1" />Add Payment Method
               </Button>
             </CardContent>
           </Card>
         ) : (
           paymentMethods.map(method => (
             <Card key={method.id} className={`border-border ${method.isDefault ? 'ring-2 ring-primary' : ''}`}>
               <CardContent className="p-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                       method.type === 'card' ? 'bg-primary/10' : method.type === 'upi' ? 'bg-purple-500/10' : 'bg-green-500/10'
                     }`}>
                       {method.type === 'card' ? <CreditCard className="h-6 w-6 text-primary" /> : <Wallet className="h-6 w-6 text-purple-500" />}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <p className="font-medium text-foreground">{method.name}</p>
                         {method.isDefault && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Default</span>}
                       </div>
                       <p className="text-sm text-muted-foreground">{method.details}</p>
                     </div>
                   </div>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                       {!method.isDefault && (
                         <DropdownMenuItem onClick={() => setAsDefault(method.id)}>
                           <CheckCircle className="h-4 w-4 mr-2" />Set as Default
                         </DropdownMenuItem>
                       )}
                       <DropdownMenuItem className="text-destructive" onClick={() => deletePaymentMethod(method.id)}>
                         <Trash2 className="h-4 w-4 mr-2" />Remove
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
               </CardContent>
             </Card>
           ))
         )}
 
         <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" onClick={() => {
           const newUPI: PaymentMethod = { id: Date.now().toString(), type: 'upi', name: 'UPI Payment', details: 'Pay using any UPI app', isDefault: false };
           setPaymentMethods(prev => [...prev, newUPI]);
           toast({ title: "UPI Added", description: "UPI payment option has been added." });
         }}>
           <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
             <Wallet className="h-5 w-5 text-purple-500" />
           </div>
           <div className="text-left">
             <p className="font-medium">Add UPI</p>
             <p className="text-sm text-muted-foreground">Pay using Google Pay, PhonePe, etc.</p>
           </div>
         </Button>
       </main>
 
       <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
         <DialogContent className="max-w-sm mx-4">
           <DialogHeader><DialogTitle>Add New Card</DialogTitle></DialogHeader>
           <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Card Number</label>
               <Input value={formData.cardNumber} onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))} placeholder="1234 5678 9012 3456" maxLength={19} />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Cardholder Name</label>
               <Input value={formData.cardHolder} onChange={(e) => setFormData(prev => ({ ...prev, cardHolder: e.target.value }))} placeholder="John Doe" />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Expiry Date</label>
                 <Input value={formData.expiryDate} onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))} placeholder="MM/YY" maxLength={5} />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">CVV</label>
                 <Input type="password" value={formData.cvv} onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))} placeholder="***" maxLength={4} />
               </div>
             </div>
           </div>
           <DialogFooter className="flex gap-2">
             <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
             <Button onClick={handleAddCard}>Add Card</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       <BottomNav />
     </div>
   );
 };