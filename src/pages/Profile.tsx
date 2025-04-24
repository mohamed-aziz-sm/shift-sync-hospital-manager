
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { toast } from "sonner";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Profile = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [unavailableDates, setUnavailableDates] = useState<Date[]>([
    new Date(2025, 3, 5),
    new Date(2025, 3, 6),
    new Date(2025, 3, 7),
  ]);
  const [dateToAdd, setDateToAdd] = useState<Date>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // In a real app, we would make an API call to update the password
    toast.success('Password updated successfully');
    
    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const addUnavailableDate = () => {
    if (!dateToAdd) return;
    
    // Check if the date is already in the array
    const dateExists = unavailableDates.some(
      (d) => d.toDateString() === dateToAdd.toDateString()
    );
    
    if (!dateExists) {
      setUnavailableDates([...unavailableDates, dateToAdd]);
      toast.success(`Added ${format(dateToAdd, 'MMM d, yyyy')} as unavailable`);
    } else {
      toast.error('This date is already marked as unavailable');
    }
    
    setDateToAdd(undefined);
  };

  const removeUnavailableDate = (dateToRemove: Date) => {
    const updatedDates = unavailableDates.filter(
      (date) => date.toDateString() !== dateToRemove.toDateString()
    );
    
    setUnavailableDates(updatedDates);
    toast.success(`Removed ${format(dateToRemove, 'MMM d, yyyy')} from unavailable dates`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              {isDoctor && (
                <div className="pt-2">
                  <div className="text-sm font-medium">Group Assignment</div>
                  <div className="mt-1 px-3 py-2 bg-muted rounded-md">
                    Group 1
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Account Type</div>
                <div>{user?.role === 'admin' ? 'Administrator' : 'Doctor'}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div>{user?.email}</div>
              </div>
              
              {isDoctor && (
                <>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Specialty</div>
                    <div>Cardiology</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Shifts</div>
                    <div>5 shifts this month</div>
                  </div>
                </>
              )}
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Last Login</div>
                <div>Today at 9:30 AM</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {isDoctor && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Unavailability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateToAdd ? format(dateToAdd, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateToAdd}
                        onSelect={setDateToAdd}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    onClick={addUnavailableDate}
                    disabled={!dateToAdd}
                  >
                    Add Date
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Unavailable Dates:</h3>
                  {unavailableDates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No unavailable dates set</p>
                  ) : (
                    <ul className="space-y-2">
                      {unavailableDates.map((date, i) => (
                        <li key={i} className="flex justify-between items-center p-2 border rounded-md">
                          <span>{format(date, 'MMM d, yyyy')}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeUnavailableDate(date)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Important Notes:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Mark dates when you're not available for shifts</li>
                  <li>• Submit unavailability at least 2 weeks in advance</li>
                  <li>• Weekend unavailability may require additional approval</li>
                  <li>• You can mark up to 5 days per month as unavailable</li>
                </ul>
                
                <Separator className="my-4" />
                
                <div className="text-sm">
                  <p className="font-medium">Current Unavailable Days:</p>
                  <p className="text-muted-foreground">{unavailableDates.length} days this month</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    You can mark {5 - unavailableDates.length} more days as unavailable this month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
