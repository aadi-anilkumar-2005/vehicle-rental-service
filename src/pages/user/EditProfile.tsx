 import { useState } from 'react';
 import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Save, Camera, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { useNavigate } from 'react-router-dom';
 import { useToast } from '@/hooks/use-toast';
 import { BottomNav } from '@/components/BottomNav';
 
 export const EditProfile = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
 
   const [profileData, setProfileData] = useState({
     name: 'John Doe',
     email: 'john.doe@example.com',
     phone: '+1 555-0400',
     dateOfBirth: '1990-05-15',
     address: '123 Main Street, Downtown, City 12345',
   });
 
   const [kycData, setKycData] = useState({
     fullName: 'John Doe',
     dateOfBirth: '1990-05-15',
     address: '123 Main Street, Downtown, City 12345',
     phone: '+1 555-0400',
     email: 'john.doe@example.com',
     drivingLicenseNumber: 'DL-1234567890',
     drivingLicensePhoto: null as File | null,
     secondaryDocType: 'aadhar',
     secondaryDocNumber: 'XXXX-XXXX-1234',
     secondaryDocPhoto: null as File | null,
   });
 
   const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'not_submitted'>('not_submitted');
   const [isEditing, setIsEditing] = useState(false);
 
   const handleProfileChange = (field: string, value: string) => {
     setProfileData(prev => ({ ...prev, [field]: value }));
   };
 
   const handleKycChange = (field: string, value: string | File | null) => {
     setKycData(prev => ({ ...prev, [field]: value }));
   };
 
   const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0] || null;
     handleKycChange(field, file);
   };
 
   const handleSaveProfile = () => {
     toast({
       title: "Profile Updated",
       description: "Your profile has been saved successfully.",
     });
     setIsEditing(false);
   };
 
   const handleSubmitKYC = () => {
     if (!kycData.fullName || !kycData.dateOfBirth || !kycData.drivingLicenseNumber) {
       toast({
         title: "Missing Information",
         description: "Please fill in all required KYC fields.",
         variant: "destructive",
       });
       return;
     }
     setKycStatus('pending');
     toast({
       title: "KYC Submitted",
       description: "Your documents are being verified. This may take 24-48 hours.",
     });
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
         <div className="flex items-center gap-3 px-4 py-4">
           <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
             <ArrowLeft className="h-5 w-5" />
           </Button>
           <h1 className="text-lg font-bold text-foreground">Edit Profile</h1>
         </div>
       </header>
 
       <main className="px-4 py-6 space-y-6">
         <div className="flex flex-col items-center gap-4">
           <div className="relative">
             <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
               JD
             </div>
             <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
               <Camera className="h-4 w-4 text-primary-foreground" />
             </button>
           </div>
           <p className="text-sm text-muted-foreground">Tap to change photo</p>
         </div>
 
         <Card className="border-border">
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <CardTitle className="text-base">Personal Information</CardTitle>
               <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                 {isEditing ? 'Cancel' : 'Edit'}
               </Button>
             </div>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground flex items-center gap-2">
                 <User className="h-4 w-4 text-muted-foreground" />
                 Full Name
               </label>
               <Input
                 value={profileData.name}
                 onChange={(e) => handleProfileChange('name', e.target.value)}
                 disabled={!isEditing}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground flex items-center gap-2">
                 <Mail className="h-4 w-4 text-muted-foreground" />
                 Email Address
               </label>
               <Input
                 type="email"
                 value={profileData.email}
                 onChange={(e) => handleProfileChange('email', e.target.value)}
                 disabled={!isEditing}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground flex items-center gap-2">
                 <Phone className="h-4 w-4 text-muted-foreground" />
                 Phone Number
               </label>
               <Input
                 value={profileData.phone}
                 onChange={(e) => handleProfileChange('phone', e.target.value)}
                 disabled={!isEditing}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground flex items-center gap-2">
                 <Calendar className="h-4 w-4 text-muted-foreground" />
                 Date of Birth
               </label>
               <Input
                 type="date"
                 value={profileData.dateOfBirth}
                 onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                 disabled={!isEditing}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground flex items-center gap-2">
                 <MapPin className="h-4 w-4 text-muted-foreground" />
                 Address
               </label>
               <Input
                 value={profileData.address}
                 onChange={(e) => handleProfileChange('address', e.target.value)}
                 disabled={!isEditing}
               />
             </div>
             {isEditing && (
               <Button className="w-full" onClick={handleSaveProfile}>
                 <Save className="h-4 w-4 mr-2" />
                 Save Changes
               </Button>
             )}
           </CardContent>
         </Card>
 
         <Card className="border-border">
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <CardTitle className="text-base flex items-center gap-2">
                 <FileText className="h-4 w-4" />
                 KYC Verification
               </CardTitle>
               {kycStatus === 'verified' && (
                 <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
                   <CheckCircle className="h-3 w-3" /> Verified
                 </span>
               )}
               {kycStatus === 'pending' && (
                 <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 flex items-center gap-1">
                   <AlertCircle className="h-3 w-3" /> Pending
                 </span>
               )}
             </div>
             <p className="text-xs text-muted-foreground mt-1">
               Complete KYC verification to book vehicles
             </p>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Full Name (as per documents) *</label>
               <Input
                 value={kycData.fullName}
                 onChange={(e) => handleKycChange('fullName', e.target.value)}
                 placeholder="Enter full name"
               />
             </div>
 
             <div className="grid grid-cols-2 gap-3">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Date of Birth *</label>
                 <Input
                   type="date"
                   value={kycData.dateOfBirth}
                   onChange={(e) => handleKycChange('dateOfBirth', e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Phone *</label>
                 <Input
                   value={kycData.phone}
                   onChange={(e) => handleKycChange('phone', e.target.value)}
                   placeholder="Phone number"
                 />
               </div>
             </div>
 
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Email Address *</label>
               <Input
                 type="email"
                 value={kycData.email}
                 onChange={(e) => handleKycChange('email', e.target.value)}
                 placeholder="Email address"
               />
             </div>
 
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Full Address *</label>
               <Input
                 value={kycData.address}
                 onChange={(e) => handleKycChange('address', e.target.value)}
                 placeholder="Enter complete address"
               />
             </div>
 
             <div className="p-4 rounded-xl bg-secondary/50 space-y-4">
               <h4 className="font-medium text-foreground">Driving License</h4>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">License Number *</label>
                 <Input
                   value={kycData.drivingLicenseNumber}
                   onChange={(e) => handleKycChange('drivingLicenseNumber', e.target.value)}
                   placeholder="Enter driving license number"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Upload License Photo *</label>
                 <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => handleFileChange('drivingLicensePhoto', e)}
                     className="hidden"
                     id="license-upload"
                   />
                   <label htmlFor="license-upload" className="cursor-pointer">
                     {kycData.drivingLicensePhoto ? (
                       <div className="flex items-center justify-center gap-2 text-green-500">
                         <CheckCircle className="h-5 w-5" />
                         <span className="text-sm">{kycData.drivingLicensePhoto.name}</span>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center gap-2">
                         <Upload className="h-8 w-8 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">Tap to upload</span>
                       </div>
                     )}
                   </label>
                 </div>
               </div>
             </div>
 
             <div className="p-4 rounded-xl bg-secondary/50 space-y-4">
               <h4 className="font-medium text-foreground">Secondary ID Proof</h4>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Document Type *</label>
                 <Select
                   value={kycData.secondaryDocType}
                   onValueChange={(v) => handleKycChange('secondaryDocType', v)}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select document type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="aadhar">Aadhar Card</SelectItem>
                     <SelectItem value="voter_id">Voter ID</SelectItem>
                     <SelectItem value="passport">Passport</SelectItem>
                     <SelectItem value="pan_card">PAN Card</SelectItem>
                     <SelectItem value="national_id">National ID</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Document Number *</label>
                 <Input
                   value={kycData.secondaryDocNumber}
                   onChange={(e) => handleKycChange('secondaryDocNumber', e.target.value)}
                   placeholder="Enter document number"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Upload Document Photo *</label>
                 <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => handleFileChange('secondaryDocPhoto', e)}
                     className="hidden"
                     id="secondary-doc-upload"
                   />
                   <label htmlFor="secondary-doc-upload" className="cursor-pointer">
                     {kycData.secondaryDocPhoto ? (
                       <div className="flex items-center justify-center gap-2 text-green-500">
                         <CheckCircle className="h-5 w-5" />
                         <span className="text-sm">{kycData.secondaryDocPhoto.name}</span>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center gap-2">
                         <Upload className="h-8 w-8 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">Tap to upload</span>
                       </div>
                     )}
                   </label>
                 </div>
               </div>
             </div>
 
             <Button 
               className="w-full" 
               onClick={handleSubmitKYC}
               disabled={kycStatus === 'pending' || kycStatus === 'verified'}
             >
               {kycStatus === 'verified' ? 'KYC Verified' : kycStatus === 'pending' ? 'Verification Pending' : 'Submit KYC'}
             </Button>
           </CardContent>
         </Card>
       </main>
 
       <BottomNav />
     </div>
   );
 };