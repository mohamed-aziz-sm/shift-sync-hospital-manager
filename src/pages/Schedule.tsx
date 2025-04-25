
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isWeekend } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, Calendar, Loader2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ScheduleGenerator from '@/components/ScheduleGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Doctor {
  id: string;
  name: string;
  group_id: number;
}

interface Station {
  id: string;
  name: string;
  allowed_groups: number[];
}

interface Shift {
  id: string;
  station_id: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  type: 'weekday' | 'weekend';
  doctor?: Doctor;
  station?: Station;
}

// Define the props for a day cell in the calendar
interface DayProps {
  day: Date;
  displayMonth: Date;
  shifts: Shift[];
  doctors: Doctor[];
  stations: Station[];
}

const Schedule = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('id, name, group_id')
          .order('name');

        if (doctorsError) {
          toast.error('Failed to load doctors: ' + doctorsError.message);
          return;
        }

        // Fetch stations
        const { data: stationsData, error: stationsError } = await supabase
          .from('stations')
          .select('id, name, allowed_groups')
          .order('name');

        if (stationsError) {
          toast.error('Failed to load stations: ' + stationsError.message);
          return;
        }

        // Fetch shifts for current month
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // JavaScript months are 0-indexed
        
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .like('date', `${year}-${month.toString().padStart(2, '0')}-%`);

        if (shiftsError) {
          toast.error('Failed to load shifts: ' + shiftsError.message);
          return;
        }

        setDoctors(doctorsData || []);
        setStations(stationsData || []);
        setShifts(shiftsData || []);
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  // Handle refresh after schedule generation
  const handleScheduleGenerated = () => {
    // Refetch shifts data
    const fetchShifts = async () => {
      setIsLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        
        const { data, error } = await supabase
          .from('shifts')
          .select('*')
          .like('date', `${year}-${month.toString().padStart(2, '0')}-%`);

        if (error) {
          toast.error('Failed to refresh shifts: ' + error.message);
          return;
        }

        setShifts(data || []);
        setActiveTab('calendar');
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShifts();
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredShifts = selectedStation
    ? shifts.filter(shift => shift.station_id === selectedStation)
    : shifts;

  const getShiftsForDay = (day: Date): Shift[] => {
    const dateString = format(day, 'yyyy-MM-dd');
    return filteredShifts.filter(shift => shift.date === dateString);
  };

  // Function to determine the cell class based on the day
  const getDayClass = (day: Date, currentMonth: Date): string => {
    let classes = "h-24 border p-1 transition-all";
    
    if (!isSameMonth(day, currentMonth)) {
      classes += " bg-gray-100 text-gray-400";
    } else if (isWeekend(day)) {
      classes += " bg-blue-50";
    }
    
    if (isToday(day)) {
      classes += " border-2 border-primary";
    }
    
    return classes;
  };

  // Component for a single day cell
  const DayCell = ({ day, displayMonth, shifts, doctors, stations }: DayProps) => {
    const dayShifts = getShiftsForDay(day);
    const dayClass = getDayClass(day, displayMonth);
    
    return (
      <div className={dayClass}>
        <div className="flex justify-between">
          <span className="font-semibold">{format(day, 'd')}</span>
          {isToday(day) && (
            <span className="bg-primary text-white text-xs px-1 rounded">Today</span>
          )}
        </div>
        <div className="mt-1 space-y-1">
          {dayShifts.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">No shifts</div>
          ) : (
            dayShifts.map((shift) => {
              const station = stations.find(s => s.id === shift.station_id);
              const doctor = doctors.find(d => d.id === shift.doctor_id);
              
              return (
                <div 
                  key={shift.id} 
                  className="text-xs bg-blue-100 p-1 mb-1 rounded truncate"
                  title={`${station?.name || 'Unknown'} - ${doctor?.name || 'Unknown Doctor'}`}
                >
                  {station?.name || 'Unknown'}: {doctor?.name || 'Unknown'}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Export schedule as CSV
  const exportSchedule = () => {
    // Create CSV content
    let csvContent = "Date,Station,Doctor,Type,Start Time,End Time\n";
    
    filteredShifts.forEach((shift) => {
      const station = stations.find(s => s.id === shift.station_id)?.name || 'Unknown';
      const doctor = doctors.find(d => d.id === shift.doctor_id)?.name || 'Unknown';
      const startTime = new Date(shift.start_time).toLocaleString();
      const endTime = new Date(shift.end_time).toLocaleString();
      
      csvContent += `${shift.date},${station},${doctor},${shift.type},${startTime},${endTime}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `schedule-${format(currentMonth, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Schedule Management</h1>
        <Button variant="outline" className="flex items-center gap-2" onClick={exportSchedule}>
          <Download className="h-4 w-4" />
          Export Schedule
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="generate">Generate Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-semibold min-w-[140px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedStation === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStation(null)}
                  >
                    All Stations
                  </Button>
                  {stations.map((station) => (
                    <Button
                      key={station.id}
                      variant={selectedStation === station.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStation(station.id)}
                    >
                      {station.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="bg-white p-2 text-center font-semibold text-sm"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Generate empty cells for days not in the current month */}
                {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="bg-gray-50 h-24" />
                ))}
                
                {/* Generate cells for each day in the month */}
                {days.map((day) => (
                  <DayCell 
                    key={day.toISOString()} 
                    day={day} 
                    displayMonth={currentMonth} 
                    shifts={getShiftsForDay(day)}
                    doctors={doctors}
                    stations={stations}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Shifts List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No shifts found for the selected period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShifts.slice(0, 10).map((shift) => {
                      const station = stations.find(s => s.id === shift.station_id);
                      const doctor = doctors.find(d => d.id === shift.doctor_id);
                      
                      return (
                        <TableRow key={shift.id}>
                          <TableCell>{shift.date}</TableCell>
                          <TableCell>{station?.name || 'Unknown'}</TableCell>
                          <TableCell>{doctor?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              shift.type === 'weekend' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {shift.type === 'weekend' ? 'Weekend' : 'Weekday'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="generate">
          <ScheduleGenerator onScheduleGenerated={handleScheduleGenerated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
