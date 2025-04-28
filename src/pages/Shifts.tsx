import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Doctor, Shift, Station, ShiftType } from '@/types';
import { createShift } from '@/services/api';

const formatShiftTime = (startTime: string, endTime: string, type: ShiftType) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const shiftName = type === 'weekday' ? 'Day Shift' : 'Night Shift';
  return `${shiftName} (${format(start, 'HH:mm')} - ${format(end, 'HH:mm')})`;
};

const Shifts = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [stationId, setStationId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [shiftType, setShiftType] = useState<ShiftType>('weekday');
  const [highlightedDays, setHighlightedDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [
          { data: shiftsData, error: shiftsError },
          { data: doctorsData, error: doctorsError },
          { data: stationsData, error: stationsError },
        ] = await Promise.all([
          supabase
            .from('shifts')
            .select(`
              *,
              doctors (id, name, group_id),
              stations (id, name, allowed_groups)
            `),
          supabase.from('doctors').select('id, name, group_id').order('name'),
          supabase.from('stations').select('id, name, allowed_groups').order('name'),
        ]);

        if (shiftsError) throw shiftsError;
        if (doctorsError) throw doctorsError;
        if (stationsError) throw stationsError;

        setShifts(shiftsData as Shift[]);
        setDoctors(doctorsData as Doctor[]);
        setStations(stationsData as Station[]);
      } catch (error: any) {
        toast.error(`Failed to load data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const shiftsForDate = shifts.filter(shift => shift.date === formattedDate);
      setHighlightedDays([selectedDate]);
      setShiftsForSelectedDate(shiftsForDate);
    }
  }, [selectedDate, shifts]);

  const [shiftsForSelectedDate, setShiftsForSelectedDate] = useState<Shift[]>([]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setIsEditing(false);
    setSelectedShift(null);
    setStationId('');
    setDoctorId('');
    setStartTime('08:00');
    setEndTime('16:00');
    setShiftType('weekday');
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleEditShift = (shift: Shift) => {
    setIsDialogOpen(true);
    setIsEditing(true);
    setSelectedShift(shift);
    setStationId(shift.station_id);
    setDoctorId(shift.doctor_id);
    setStartTime(shift.start_time);
    setEndTime(shift.end_time);
    setShiftType(shift.type as ShiftType);
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      if (error) {
        toast.error(`Failed to delete shift: ${error.message}`);
        return;
      }

      setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
      toast.success('Shift deleted successfully');
    } catch (error: any) {
      toast.error(`An unexpected error occurred: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    if (!stationId || !doctorId) {
      toast.error('Please select a station and a doctor');
      return;
    }

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    try {
      if (isEditing && selectedShift) {
        const { data, error } = await supabase
          .from('shifts')
          .update({
            station_id: stationId,
            doctor_id: doctorId,
            date: formattedDate,
            start_time: startTime,
            end_time: endTime,
            type: shiftType,
          })
          .eq('id', selectedShift.id)
          .select()
          .single();

        if (error) {
          toast.error(`Failed to update shift: ${error.message}`);
          return;
        }

        setShifts(prevShifts =>
          prevShifts.map(shift => (shift.id === selectedShift.id ? data as Shift : shift))
        );
        toast.success('Shift updated successfully');
      } else {
        const newShift = await createShift(stationId, doctorId, formattedDate, startTime, endTime, shiftType);
        setShifts(prevShifts => [...prevShifts, newShift]);
        toast.success('Shift created successfully');
      }

      handleCloseDialog();
    } catch (error: any) {
      toast.error(`An unexpected error occurred: ${error.message}`);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Shifts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2>Select Date</h2>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Shift
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            fromDate={new Date()}
            modifiers={{
              highlighted: highlightedDays
            }}
            modifiersClassNames={{
              highlighted: "bg-primary/20 text-primary"
            }}
          />
          {selectedDate && (
            <div>
              <h3>Shifts for {format(selectedDate, 'PPP')}:</h3>
              {shiftsForSelectedDate.length === 0 ? (
                <p>No shifts for this date.</p>
              ) : (
                <ul>
                  {shiftsForSelectedDate.map(shift => (
                    <li key={shift.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatShiftTime(shift.start_time, shift.end_time, shift.type)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {shift.doctor?.name} at {shift.station?.name}
                        </span>
                      </div>
                      <div>
                        <Button variant="ghost" size="icon" onClick={() => handleEditShift(shift)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Shift' : 'Create Shift'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the shift details.' : 'Create a new shift for the selected date.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="station">Station</Label>
              <Select onValueChange={setStationId} defaultValue={stationId}>
                <SelectTrigger id="station" className="col-span-3">
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map(station => (
                    <SelectItem key={station.id} value={station.id}>{station.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctor">Doctor</Label>
              <Select onValueChange={setDoctorId} defaultValue={doctorId}>
                <SelectTrigger id="doctor" className="col-span-3">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                type="time"
                id="startTime"
                defaultValue={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                type="time"
                id="endTime"
                defaultValue={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shiftType">Shift Type</Label>
              <Select onValueChange={(value) => setShiftType(value as ShiftType)} defaultValue={shiftType}>
                <SelectTrigger id="shiftType" className="col-span-3">
                  <SelectValue placeholder="Select shift type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekday">Weekday</SelectItem>
                  <SelectItem value="weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? 'Update Shift' : 'Create Shift'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shifts;
