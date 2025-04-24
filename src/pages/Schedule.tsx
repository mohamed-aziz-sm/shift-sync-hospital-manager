
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { toast } from "sonner";
import { format } from 'date-fns';
import { CalendarIcon, FileText, RefreshCw } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Schedule = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [monthDate, setMonthDate] = useState<Date>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSchedule = () => {
    setIsGenerating(true);
    
    // Simulate schedule generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Schedule generated successfully');
    }, 1500);
  };

  // Mock shifts for the selected month
  const mockShifts = [
    { date: new Date(2025, 3, 15), station: 'Réanimation', type: 'weekday' },
    { date: new Date(2025, 3, 18), station: 'Weaning', type: 'weekday' },
    { date: new Date(2025, 3, 22), station: 'Visite MedI', type: 'weekend' },
  ];

  // Function to check if a date has a shift
  const hasShift = (date: Date) => {
    return mockShifts.some(shift => 
      shift.date.getDate() === date.getDate() && 
      shift.date.getMonth() === date.getMonth() &&
      shift.date.getFullYear() === date.getFullYear()
    );
  };

  const getShiftType = (date: Date) => {
    const shift = mockShifts.find(shift => 
      shift.date.getDate() === date.getDate() && 
      shift.date.getMonth() === date.getMonth() &&
      shift.date.getFullYear() === date.getFullYear()
    );
    
    return shift?.type;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? 'Manage and generate hospital shift schedules'
              : 'View your shift calendar and manage availability'
            }
          </p>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={generateSchedule} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Schedule
                </>
              )}
            </Button>
          )}
          
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {monthDate ? format(monthDate, 'MMMM yyyy') : 'Pick a month'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={monthDate}
                onSelect={(date) => date && setMonthDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly View - {format(monthDate, 'MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-1 border rounded-md">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                month={monthDate}
                onMonthChange={setMonthDate}
                modifiers={{
                  hasShift: (date) => hasShift(date),
                }}
                modifiersClassNames={{
                  hasShift: "bg-primary text-primary-foreground",
                }}
                components={{
                  Day: ({ day, ...props }) => {
                    const isShiftDay = hasShift(day);
                    const shiftType = getShiftType(day);
                    
                    return (
                      <Button
                        {...props}
                        variant="ghost"
                        className={cn(
                          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          props.className,
                          isShiftDay && shiftType === 'weekend' ? "bg-medical-amber/20 hover:bg-medical-amber/30 text-foreground" : "",
                          isShiftDay && shiftType === 'weekday' ? "bg-medical-blue/20 hover:bg-medical-blue/30 text-foreground" : ""
                        )}
                      >
                        {format(day, "d")}
                      </Button>
                    );
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {date ? (
                <>Shifts for {format(date, 'MMMM d, yyyy')}</>
              ) : (
                <>Select a date</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {date && hasShift(date) ? (
              <div className="space-y-4">
                {mockShifts
                  .filter(shift => 
                    shift.date.getDate() === date.getDate() && 
                    shift.date.getMonth() === date.getMonth() &&
                    shift.date.getFullYear() === date.getFullYear()
                  )
                  .map((shift, index) => (
                    <div 
                      key={index} 
                      className="border rounded-md p-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{shift.station}</div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          shift.type === 'weekend' 
                            ? "bg-medical-amber/10 text-medical-amber"
                            : "bg-medical-blue/10 text-medical-blue"
                        )}>
                          {shift.type === 'weekend' ? 'Weekend' : 'Weekday'}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {shift.type === 'weekend' 
                          ? '08:00 - 08:00 (24h)'
                          : '16:00 - 09:00'
                        }
                      </div>
                      <div className="text-sm mt-2">
                        <span className="font-medium">Assigned doctor:</span> {user?.name || 'Dr. John Doe'}
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {date ? 'No shifts scheduled for this date' : 'Select a date to view shifts'}
              </div>
            )}
            
            {!isAdmin && date && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    toast.success(`Marked ${format(date, 'MMM d, yyyy')} as unavailable`);
                  }}
                >
                  Mark as Unavailable
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Hospital Stations Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Réanimation', 'Weaning', 'Urgence', 'Périphérie', 'Visite MedI', 'Visite MedH'].map((station) => (
                  <div key={station} className="border rounded-md p-3">
                    <div className="font-medium">{station}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      4 shifts this month
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-medical-blue mr-1"></span>
                        Weekday: 3
                      </div>
                      <div className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-medical-amber mr-1"></span>
                        Weekend: 1
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Schedule;
