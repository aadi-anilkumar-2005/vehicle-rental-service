import { useState } from 'react';
import { ArrowLeft, FileText, Upload, CheckCircle, AlertCircle, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';
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

export const KYCVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [kycData, setKycData] = useState({
    fullName: 'John Doe',
    dateOfBirth: '1990-05-15',
    address: '123 Main Street, Downtown, City 12345',
    phone: '+1 555-0400',
    email: 'john.doe@example.com',
    drivingLicenseNumber: '',
    drivingLicensePhoto: null as File | null,
    secondaryDocType: '',
    secondaryDocNumber: '',
    secondaryDocPhoto: null as File | null,
  });

  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'not_submitted'>('not_submitted');

  const handleKycChange = (field: string, value: string | File | null) => {
    setKycData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleKycChange(field, file);
  };

  const handleSubmitKYC = () => {
    if (!kycData.fullName || !kycData.dateOfBirth || !kycData.address || !kycData.phone || !kycData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all personal details.",
        variant: "destructive",
      });
      return;
    }
    if (!kycData.drivingLicenseNumber || !kycData.drivingLicensePhoto) {
      toast({
        title: "Missing Information",
        description: "Please provide driving license details and photo.",
        variant: "destructive",
      });
      return;
    }
    if (!kycData.secondaryDocType || !kycData.secondaryDocNumber || !kycData.secondaryDocPhoto) {
      toast({
        title: "Missing Information",
        description: "Please provide secondary document details and photo.",
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
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">KYC Verification</h1>
              <p className="text-xs text-muted-foreground">Required for booking vehicles</p>
            </div>
          </div>
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
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Personal Details */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name (as per documents) *
              </label>
              <Input
                value={kycData.fullName}
                onChange={(e) => handleKycChange('fullName', e.target.value)}
                placeholder="Enter full name"
                disabled={kycStatus !== 'not_submitted'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={kycData.dateOfBirth}
                  onChange={(e) => handleKycChange('dateOfBirth', e.target.value)}
                  disabled={kycStatus !== 'not_submitted'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone *
                </label>
                <Input
                  value={kycData.phone}
                  onChange={(e) => handleKycChange('phone', e.target.value)}
                  placeholder="Phone number"
                  disabled={kycStatus !== 'not_submitted'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address *
              </label>
              <Input
                type="email"
                value={kycData.email}
                onChange={(e) => handleKycChange('email', e.target.value)}
                placeholder="Email address"
                disabled={kycStatus !== 'not_submitted'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Full Address *
              </label>
              <Input
                value={kycData.address}
                onChange={(e) => handleKycChange('address', e.target.value)}
                placeholder="Enter complete address"
                disabled={kycStatus !== 'not_submitted'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Driving License */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Driving License
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">License Number *</label>
              <Input
                value={kycData.drivingLicenseNumber}
                onChange={(e) => handleKycChange('drivingLicenseNumber', e.target.value)}
                placeholder="Enter driving license number"
                disabled={kycStatus !== 'not_submitted'}
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
                  disabled={kycStatus !== 'not_submitted'}
                />
                <label htmlFor="license-upload" className={`cursor-pointer ${kycStatus !== 'not_submitted' ? 'pointer-events-none opacity-50' : ''}`}>
                  {kycData.drivingLicensePhoto ? (
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm">{kycData.drivingLicensePhoto.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tap to upload license photo</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary ID Proof */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Secondary ID Proof
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Document Type *</label>
              <Select
                value={kycData.secondaryDocType}
                onValueChange={(v) => handleKycChange('secondaryDocType', v)}
                disabled={kycStatus !== 'not_submitted'}
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
                disabled={kycStatus !== 'not_submitted'}
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
                  disabled={kycStatus !== 'not_submitted'}
                />
                <label htmlFor="secondary-doc-upload" className={`cursor-pointer ${kycStatus !== 'not_submitted' ? 'pointer-events-none opacity-50' : ''}`}>
                  {kycData.secondaryDocPhoto ? (
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm">{kycData.secondaryDocPhoto.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tap to upload document photo</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmitKYC}
          disabled={kycStatus === 'pending' || kycStatus === 'verified'}
        >
          {kycStatus === 'verified' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              KYC Verified
            </>
          ) : kycStatus === 'pending' ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Verification Pending
            </>
          ) : (
            'Submit KYC for Verification'
          )}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};
