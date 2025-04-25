import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Loader2, CalendarIcon } from 'lucide-react';
import ScheduleGenerator from '@/components/ScheduleGenerator';
import { Shift, ShiftType } from '@/types';

const Schedule = () => {
  const [activeTab, setActiveTab] = useState<string>('view');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to convert database shift to our Shift type
  const convertToShiftType = (type: string): ShiftType => {
    return type === 'weekday' || type === 'weekend' ? type : 'weekday';
  };

  // Fetch shifts for the selected date
  const fetchShifts = async (date: Date) => {
    setIsLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          id, 
          date, 
          start_time, 
          end_time, 
          type,
          station_id,
          doctor_id,
          created_at,
          updated_at,
          stations (name),
          doctors (name)
        `)
        .eq('date', formattedDate);
        
      if (error) {
        toast.error('Error fetching shifts: ' + error.message);
        return;
      }
      
      if (data) {
        const formattedShifts = data.map(shift => ({
          ...shift,
          type: convertToShiftType(shift.type)
        })) as unknown as Shift[];
        
        setShifts(formattedShifts);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      toast.error('An unexpected error occurred while fetching shifts');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch shifts when selected date changes
  useEffect(() => {
    if (activeTab === 'view') {
      fetchShifts(selectedDate);
    }
  }, [selectedDate, activeTab]);

  // Handle successful schedule generation
  const handleScheduleGenerated = async (generatedShifts: any[]) => {
    try {
      const formattedShifts = generatedShifts.map(shift => ({
        ...shift,
        type: convertToShiftType(shift.type)
      })) as unknown as Shift[];
      
      setShifts(formattedShifts);
      toast.success('Schedule generated successfully!');
      setActiveTab('view');
    } catch (error) {
      console.error('Error processing generated shifts:', error);
      toast.error('Error processing generated shifts');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-1">
          View and manage the hospital shift schedule
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="view">View Schedule</TabsTrigger>
          <TabsTrigger value="generate">Generate Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border mx-auto"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                Shifts for {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : shifts.length > 0 ? (
                <div className="space-y-4">
                  {shifts.map((shift) => (
                    <div 
                      key={shift.id} 
                      className="p-4 border rounded-lg bg-background"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {shift.stations?.name || 'Unknown Station'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Doctor: {shift.doctors?.name || 'Unassigned'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {format(parseISO(shift.start_time), 'h:mm a')} - {format(parseISO(shift.end_time), 'h:mm a')}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            shift.type === 'weekend' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {shift.type === 'weekend' ? 'Weekend' : 'Weekday'} Shift
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No shifts scheduled for this date.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleGenerator onScheduleGenerated={handleScheduleGenerated} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
