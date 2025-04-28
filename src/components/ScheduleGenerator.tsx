import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isWeekend, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Doctor, Station, Shift, ShiftType } from '@/types';
import { shiftsApi } from '@/services/api';

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
        
        const typedDoctors = (doctorsData || []).map(doc => ({
          ...doc,
          group_id: doc.group_id as any
        }));
        
        const typedStations = (stationsData || []).map(station => ({
          ...station,
          allowed_groups: station.allowed_groups as any[]
        }));
        
        setDoctors(typedDoctors);
        setStations(typedStations);
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
  
  const assignDoctorToShift = (
    availableDoctors: Doctor[],
    station: Station,
    assignedDoctors: Record<string, string[]>,
    date: Date
  ): Doctor | null => {
    const compatibleDoctors = availableDoctors.filter(doctor => 
      station.allowed_groups.includes(doctor.group_id as any)
    );
    
    if (compatibleDoctors.length === 0) return null;
    
    compatibleDoctors.sort((a, b) => {
      const aShifts = assignedDoctors[a.id] ? assignedDoctors[a.id].length : 0;
      const bShifts = assignedDoctors[b.id] ? assignedDoctors[b.id].length : 0;
      return aShifts - bShifts;
    });
    
    const assignedDoctor = compatibleDoctors[0];
    
    if (!assignedDoctors[assignedDoctor.id]) {
      assignedDoctors[assignedDoctor.id] = [];
    }
    assignedDoctors[assignedDoctor.id].push(format(date, 'yyyy-MM-dd'));
    
    return assignedDoctor;
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
    
    const availableDoctors = doctors.filter(d => !excludedDoctors.includes(d.id));
    
    if (availableDoctors.length === 0) {
      toast.error('No doctors are available for scheduling');
      return;
    }
    
    if (stations.length === 0) {
      toast.error('No stations are available for scheduling');
      return;
    }
    
    setIsGenerating(true);
  
    try {
      const assignedDoctors: Record<string, string[]> = {};
      
      const dates = eachDayOfInterval({ start: startDate, end: endDate });
      
      const generatedShifts: Array<Omit<Shift, 'id' | 'created_at' | 'updated_at'>> = [];
      
      for (const date of dates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isWeekendDay = isWeekend(date);
        const shiftType: ShiftType = isWeekendDay ? 'weekend' : 'weekday';
        
        for (const station of stations) {
          const startTime = isWeekendDay ? '08:00:00' : '16:00:00';
          const endTime = isWeekendDay ? '08:00:00' : '09:00:00';
          
          const assignedDoctor = assignDoctorToShift(
            availableDoctors, 
            station, 
            assignedDoctors, 
            date
          );
          
          if (assignedDoctor) {
            generatedShifts.push({
              doctor_id: assignedDoctor.id,
              station_id: station.id,
              date: dateStr,
              start_time: startTime,
              end_time: endTime,
              type: shiftType
            });
          } else {
            console.warn(`Could not find compatible doctor for ${station.name} on ${dateStr}`);
          }
        }
      }
      
      if (generatedShifts.length === 0) {
        toast.error('No shifts could be generated with the current settings');
        return;
      }
      
      const createdShifts = await shiftsApi.createMany(generatedShifts);
      
      if (onScheduleGenerated) {
        onScheduleGenerated(createdShifts);
      }
      
      toast.success(`Successfully generated ${createdShifts.length} shifts`);
    } catch (error: any) {
      console.error('Failed to generate schedule:', error);
      toast.error(`Failed to generate schedule: ${error.message}`);
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
            {stations.length > 0 ? (
              stations.map((station) => (
                <div key={station.id} className="rounded-md border p-3">
                  <p className="font-medium">{station.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Groups: {station.allowed_groups.map(g => `${g}`).join(', ')}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center p-4 border rounded-md text-muted-foreground flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No stations found. Please create stations first.
              </div>
            )}
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
          disabled={isGenerating || doctors.length === 0 || doctors.length === excludedDoctors.length || stations.length === 0}
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
