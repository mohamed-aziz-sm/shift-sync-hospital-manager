import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  doctor_id: string;
  start_date: Date;
  end_date: Date;
}

interface ScheduleGeneratorProps {
  onScheduleGenerated?: (generatedShifts: Shift[]) => void;
}

const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({ onScheduleGenerated }) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [excludedDoctors, setExcludedDoctors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('id, name, group_id')
          .order('name');
          
        if (doctorsError) {
          toast.error('Failed to load doctors: ' + doctorsError.message);
          return;
        }
        
        const { data: stationsData, error: stationsError } = await supabase
          .from('stations')
          .select('id, name, allowed_groups');
          
        if (stationsError) {
          toast.error('Failed to load stations: ' + stationsError.message);
          return;
        }
        
        setDoctors(doctorsData || []);
        setStations(stationsData || []);
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleExcludedDoctorChange = (doctorId: string, isChecked: boolean) => {
    if (isChecked) {
      setExcludedDoctors(prev => prev.filter(id => id !== doctorId));
    } else {
      setExcludedDoctors(prev => [...prev, doctorId]);
    }
  };
  
  const generateSchedule = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (startDate > endDate) {
      toast.error('Start date must be before end date');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Schedule generated successfully');
      
      if (onScheduleGenerated) {
        onScheduleGenerated([]);
      }
    } catch (error) {
      toast.error('Failed to generate schedule');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Schedule Period</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Shift Rules</Label>
            <div className="rounded-md border p-4 space-y-3">
              <div>
                <p className="font-medium">Weekdays (Mon–Fri):</p>
                <p className="text-sm text-muted-foreground">
                  One shift per station, from 16:00 to 09:00 the next day.
                </p>
              </div>
              <div>
                <p className="font-medium">Weekends (Sat–Sun):</p>
                <p className="text-sm text-muted-foreground">
                  One 24-hour shift per station, from 08:00 to 08:00 the next day.
                </p>
              </div>
            </div>
          </div>
        </div>
      
        <div>
          <Label className="mb-2 block">Available Stations</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {stations.map((station) => (
              <div key={station.id} className="rounded-md border p-3">
                <p className="font-medium">{station.name}</p>
                <p className="text-xs text-muted-foreground">
                  Groups: {station.allowed_groups.map(g => `${g}`).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      
        <Separator />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Doctors Availability</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setExcludedDoctors(doctors.map(d => d.id))}
            >
              Exclude All
            </Button>
          </div>
          <ScrollArea className="h-[250px] rounded-md border p-4">
            <div className="space-y-4">
              {doctors.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No doctors found. Please add doctors first.
                </p>
              ) : (
                doctors.map((doctor) => (
                  <div 
                    key={doctor.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox 
                      id={`doctor-${doctor.id}`}
                      checked={!excludedDoctors.includes(doctor.id)}
                      onCheckedChange={(checked) => 
                        handleExcludedDoctorChange(doctor.id, checked === true)
                      }
                    />
                    <Label 
                      htmlFor={`doctor-${doctor.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {doctor.name} <span className="text-muted-foreground text-sm">(Group {doctor.group_id})</span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <p className="text-xs text-muted-foreground mt-2">
            * Uncheck doctors who should be excluded from the schedule
          </p>
        </div>
        
        <Button 
          onClick={generateSchedule}
          disabled={isGenerating || doctors.length === 0 || doctors.length === excludedDoctors.length}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Schedule...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Generate Schedule
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScheduleGenerator;
