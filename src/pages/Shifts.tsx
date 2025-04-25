import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Shifts = () => {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState([]);
  const [userShifts, setUserShifts] = useState([]);
  const [shiftDates, setShiftDates] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch shifts for the logged in doctor
  useEffect(() => {
    const fetchDoctorShifts = async () => {
      if (!user || !profile) return;
      
      try {
        setIsLoading(true);
        
        // First need to find if the user is associated with a doctor record
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (doctorError && doctorError.code !== 'PGRST116') {
          toast.error('Error fetching doctor data: ' + doctorError.message);
          return;
        }
        
        // If no doctor record found, show appropriate message
        if (!doctorData) {
          toast.info(`Welcome, ${profile.name}. You don't have any shifts assigned yet.`);
          setIsLoading(false);
          return;
        }
        
        // Fetch all shifts for this doctor
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select(`
            id, date, start_time, end_time, type,
            stations (id, name),
            doctors (id, name)
          `)
          .eq('doctor_id', doctorData.id)
          .order('date', { ascending: true });
          
        if (shiftsError) {
          toast.error('Error fetching shifts: ' + shiftsError.message);
          return;
        }
        
        // Process shifts data
        if (shiftsData) {
          const formattedShifts = shiftsData.map(shift => ({
            id: shift.id,
            date: shift.date,
            startTime: shift.start_time,
            endTime: shift.end_time,
            type: shift.type,
            stationName: shift.stations?.name || 'Unknown Station',
            doctorName: shift.doctors?.name || 'Unknown Doctor',
          }));
          
          setShifts(formattedShifts);
          
          // Extract shift dates for calendar highlights
          const dates = shiftsData.map(shift => shift.date);
          setShiftDates(dates);
          
          // Filter shifts for the selected date
          const selectedDateShifts = shiftsData.filter(shift => shift.date === format(selectedDate, 'yyyy-MM-dd'));
          setUserShifts(selectedDateShifts);
        }
        
      } catch (error) {
        console.error('An unexpected error occurred:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorShifts();
  }, [user, profile, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleShiftClick = (shift) => {
    setSelectedShift(shift);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedShift(null);
  };

  const isDateHighlighted = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return shiftDates.includes(dateString);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Shifts</h1>
        <p className="text-muted-foreground mt-1">
          View your upcoming and scheduled shifts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Calendar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-md p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              fromDate={new Date()}
              highlight={shiftDates.map(date => {
                const [year, month, day] = date.split('-').map(Number);
                return {
                  day: new Date(year, month - 1, day),
                  style: { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' },
                };
              })}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Shifts for {format(selectedDate, 'MMMM dd, yyyy')}
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userShifts.length > 0 ? (
              <ul className="space-y-2">
                {userShifts.map((shift) => (
                  <li
                    key={shift.id}
                    className="bg-white rounded-md shadow-sm p-3 border cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleShiftClick(shift)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{shift.stations?.name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(shift.start_time), 'hh:mm a')} -{' '}
                          {format(parseISO(shift.end_time), 'hh:mm a')}
                        </p>
                      </div>
                      <Badge variant="secondary">{shift.type}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Shifts Scheduled</AlertTitle>
                <AlertDescription>
                  There are no shifts scheduled for you on this day.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{selectedShift.stations?.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(parseISO(selectedShift.start_time), 'MMMM dd, yyyy hh:mm a')} -{' '}
                  {format(parseISO(selectedShift.end_time), 'hh:mm a')}
                </p>
                <p>
                  <Clock className="inline-block h-4 w-4 mr-1" />
                  {selectedShift.type} shift
                </p>
              </div>
            </div>
          )}
          <Button variant="outline" onClick={closeDialog}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shifts;
