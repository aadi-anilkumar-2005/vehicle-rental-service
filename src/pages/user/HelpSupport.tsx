 import { useState } from 'react';
 import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, ChevronRight, Search, FileText, ExternalLink } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Textarea } from '@/components/ui/textarea';
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { useNavigate } from 'react-router-dom';
 import { useToast } from '@/hooks/use-toast';
 import { BottomNav } from '@/components/BottomNav';
 
 const faqs = [
   { question: 'How do I book a vehicle?', answer: 'Simply browse our available vehicles, select your preferred one, choose your dates and times, and complete the booking.' },
   { question: 'What documents do I need to rent a vehicle?', answer: 'You need a valid driving license, government ID proof (Aadhar/Passport/Voter ID), and to complete KYC verification.' },
   { question: 'Can I cancel my booking?', answer: 'Yes, you can cancel up to 24 hours before pickup time for a full refund. Cancellations within 24 hours may incur a fee.' },
   { question: 'How does home delivery work?', answer: 'Select "Home Delivery" during booking. Our staff will deliver the vehicle to your specified location.' },
   { question: 'What if the vehicle breaks down?', answer: 'Contact our 24/7 support immediately. We provide roadside assistance and will arrange a replacement vehicle if needed.' },
   { question: 'How do I extend my rental period?', answer: 'You can extend from the app under "My Bookings" if the vehicle is available.' },
   { question: 'Is fuel included in the rental price?', answer: 'Vehicles are provided with a certain fuel level. Please return with the same level, or fuel charges will apply.' },
   { question: 'What payment methods are accepted?', answer: 'We accept credit/debit cards, UPI, net banking, and cash on delivery for select bookings.' },
 ];
 
 export const HelpSupport = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [searchQuery, setSearchQuery] = useState('');
   const [showContactDialog, setShowContactDialog] = useState(false);
   const [contactForm, setContactForm] = useState({ subject: '', message: '' });
 
   const filteredFaqs = faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()));
 
   const handleSubmitTicket = () => {
     if (!contactForm.subject || !contactForm.message) { toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" }); return; }
     toast({ title: "Ticket Submitted", description: "Our support team will get back to you within 24 hours." });
     setShowContactDialog(false);
     setContactForm({ subject: '', message: '' });
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
         <div className="flex items-center gap-3 px-4 py-4">
           <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}><ArrowLeft className="h-5 w-5" /></Button>
           <h1 className="text-lg font-bold text-foreground">Help & Support</h1>
         </div>
       </header>
 
       <main className="px-4 py-6 space-y-6">
         <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input placeholder="Search for help..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
         </div>
 
         <div className="grid grid-cols-3 gap-3">
           <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => toast({ title: "Calling Support", description: "Dialing 1-800-RENTALS..." })}>
             <Phone className="h-5 w-5 text-green-500" /><span className="text-xs">Call Us</span>
           </Button>
           <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => toast({ title: "Starting Chat", description: "Connecting to support agent..." })}>
             <MessageCircle className="h-5 w-5 text-primary" /><span className="text-xs">Live Chat</span>
           </Button>
           <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => toast({ title: "Opening Email" })}>
             <Mail className="h-5 w-5 text-orange-500" /><span className="text-xs">Email</span>
           </Button>
         </div>
 
         <Card className="border-border">
           <CardContent className="p-4">
             <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowContactDialog(true)}>
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                 <div><p className="font-medium text-foreground">Submit a Ticket</p><p className="text-xs text-muted-foreground">Describe your issue in detail</p></div>
               </div>
               <ChevronRight className="h-5 w-5 text-muted-foreground" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-border">
           <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><HelpCircle className="h-4 w-4" />Frequently Asked Questions</CardTitle></CardHeader>
           <CardContent>
             <Accordion type="single" collapsible className="w-full">
               {filteredFaqs.map((faq, index) => (
                 <AccordionItem key={index} value={`item-${index}`}>
                   <AccordionTrigger className="text-left text-sm">{faq.question}</AccordionTrigger>
                   <AccordionContent className="text-muted-foreground text-sm">{faq.answer}</AccordionContent>
                 </AccordionItem>
               ))}
             </Accordion>
             {filteredFaqs.length === 0 && <p className="text-center text-muted-foreground py-4">No results found</p>}
           </CardContent>
         </Card>
 
         <Card className="border-border">
           <CardHeader className="pb-3"><CardTitle className="text-base">Resources</CardTitle></CardHeader>
           <CardContent className="space-y-3">
             <Button variant="ghost" className="w-full justify-between h-auto py-3"><span className="flex items-center gap-3"><FileText className="h-4 w-4 text-muted-foreground" />User Guide</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></Button>
             <Button variant="ghost" className="w-full justify-between h-auto py-3"><span className="flex items-center gap-3"><FileText className="h-4 w-4 text-muted-foreground" />Terms of Service</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></Button>
             <Button variant="ghost" className="w-full justify-between h-auto py-3"><span className="flex items-center gap-3"><FileText className="h-4 w-4 text-muted-foreground" />Refund Policy</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></Button>
           </CardContent>
         </Card>
 
         <Card className="border-border bg-secondary/30">
           <CardContent className="p-4 text-center">
             <p className="text-sm text-muted-foreground">24/7 Customer Support</p>
             <p className="text-lg font-bold text-foreground">1-800-RENTALS</p>
             <p className="text-sm text-muted-foreground mt-1">support@vehiclerental.com</p>
           </CardContent>
         </Card>
       </main>
 
       <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
         <DialogContent className="max-w-sm mx-4">
           <DialogHeader><DialogTitle>Submit a Support Ticket</DialogTitle></DialogHeader>
           <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Subject</label>
               <Input value={contactForm.subject} onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))} placeholder="Brief description of your issue" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Message</label>
               <Textarea value={contactForm.message} onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))} placeholder="Describe your issue in detail..." rows={5} />
             </div>
           </div>
           <DialogFooter className="flex gap-2">
             <Button variant="outline" onClick={() => setShowContactDialog(false)}>Cancel</Button>
             <Button onClick={handleSubmitTicket}>Submit Ticket</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
       <BottomNav />
     </div>
   );
 };