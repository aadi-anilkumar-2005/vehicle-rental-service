import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Navigation, CheckCircle, Clock, Truck, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface StaffTask {
  id: string;
  type: 'delivery' | 'pickup';
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  address: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

const mockTasks: StaffTask[] = [
  {
    id: 't1',
    type: 'delivery',
    vehicleName: 'Toyota Camry',
    customerName: 'John Davis',
    customerPhone: '+1 555-1234',
    address: '123 Main St, Downtown, Building A, Apt 4B',
    scheduledTime: '10:00 AM',
    status: 'pending',
    notes: 'Customer requested call before arrival',
  },
  {
    id: 't2',
    type: 'delivery',
    vehicleName: 'Honda Activa',
    customerName: 'Sarah Miller',
    customerPhone: '+1 555-5678',
    address: '456 Oak Ave, Midtown Business Center',
    scheduledTime: '11:30 AM',
    status: 'in_progress',
  },
  {
    id: 't3',
    type: 'pickup',
    vehicleName: 'BMW 3 Series',
    customerName: 'Mike Ross',
    customerPhone: '+1 555-9012',
    address: '789 Luxury Lane, Uptown Hotel Lobby',
    scheduledTime: '2:00 PM',
    status: 'pending',
    notes: 'Vehicle parked in guest parking lot',
  },
  {
    id: 't4',
    type: 'pickup',
    vehicleName: 'Royal Enfield Classic',
    customerName: 'Emily Chen',
    customerPhone: '+1 555-3456',
    address: '321 Green Street, Eco District',
    scheduledTime: '4:00 PM',
    status: 'pending',
  },
];

export const AssignedTasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<StaffTask[]>(mockTasks);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return task.status !== 'completed';
    if (activeTab === 'delivery') return task.type === 'delivery' && task.status !== 'completed';
    if (activeTab === 'pickup') return task.type === 'pickup' && task.status !== 'completed';
    if (activeTab === 'completed') return task.status === 'completed';
    return true;
  });

  const startTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, status: 'in_progress' } : t
      )
    );
    toast({
      title: "Task Started",
      description: "You've started this task. Navigate to the location.",
    });
  };

  const completeTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      )
    );
    const task = tasks.find(t => t.id === taskId);
    toast({
      title: task?.type === 'delivery' ? "Vehicle Delivered" : "Vehicle Picked Up",
      description: "Task completed successfully!",
    });
    setShowCompleteDialog(false);
    setShowTaskDetails(false);
  };

  const handleCall = (phone: string) => {
    toast({
      title: "Calling Customer",
      description: `Dialing ${phone}...`,
    });
  };

  const handleNavigate = (address: string) => {
    toast({
      title: "Opening Navigation",
      description: `Navigating to ${address}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-green-500/10 text-green-500';
      default: return 'bg-orange-500/10 text-orange-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/staff')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Assigned Tasks</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-foreground">
                {tasks.filter(t => t.status !== 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-primary">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-foreground">
                {tasks.filter(t => t.type === 'delivery' && t.status !== 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">Deliveries</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-foreground">
                {tasks.filter(t => t.type === 'pickup' && t.status !== 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">Pickups</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="pickup">Pickup</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {activeTab === 'completed' ? 'No completed tasks yet' : 'No pending tasks'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map(task => (
                <Card
                  key={task.id}
                  className="border-border cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDetails(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {task.type === 'delivery' ? (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-orange-500" />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase">
                            {task.type}
                          </span>
                          <p className="font-medium text-foreground">{task.vehicleName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {task.scheduledTime}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{task.customerName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm text-muted-foreground">{task.address}</span>
                      </div>
                    </div>

                    {task.status !== 'completed' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(task.customerPhone);
                          }}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate(task.address);
                          }}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                        {task.status === 'pending' ? (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              startTask(task.id);
                            }}
                          >
                            Start
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setShowCompleteDialog(true);
                            }}
                          >
                            {task.type === 'delivery' ? 'Delivered' : 'Picked Up'}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Map Preview */}
        <Card className="border-border overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Task Locations</p>
              <p className="text-xs text-muted-foreground">Tap to view full map</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div className="flex items-center gap-2">
                  {selectedTask.type === 'delivery' ? (
                    <Truck className="h-5 w-5 text-primary" />
                  ) : (
                    <Package className="h-5 w-5 text-orange-500" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{selectedTask.vehicleName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{selectedTask.type}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                <p className="font-medium text-foreground">{selectedTask.customerName}</p>
                <p className="text-sm text-muted-foreground">{selectedTask.customerPhone}</p>
              </div>

              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-foreground">{selectedTask.address}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Scheduled Time</p>
                <p className="font-medium text-foreground">{selectedTask.scheduledTime}</p>
              </div>

              {selectedTask.notes && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="text-xs font-medium text-orange-500 mb-1">Notes</p>
                  <p className="text-sm text-foreground">{selectedTask.notes}</p>
                </div>
              )}

              {selectedTask.status !== 'completed' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCall(selectedTask.customerPhone)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleNavigate(selectedTask.address)}
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Navigate
                  </Button>
                </div>
              )}

              {selectedTask.status === 'pending' && (
                <Button className="w-full" onClick={() => startTask(selectedTask.id)}>
                  Start Task
                </Button>
              )}

              {selectedTask.status === 'in_progress' && (
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowTaskDetails(false);
                    setShowCompleteDialog(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as {selectedTask.type === 'delivery' ? 'Delivered' : 'Picked Up'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Complete Task Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Confirm Completion</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to mark this {selectedTask.type} as completed?
              </p>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="font-medium text-foreground">{selectedTask.vehicleName}</p>
                <p className="text-sm text-muted-foreground">{selectedTask.customerName}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedTask && completeTask(selectedTask.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
