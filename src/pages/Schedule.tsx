
import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isWeekend } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, Calendar } from 'lucide-react';
import { STATIONS, Shift, MOCK_DOCTORS } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the props for a day cell in the calendar
interface DayProps {
  day: Date;
  displayMonth: Date;
  shifts: Shift[];
}

// Mock data for shifts
const generateMockShifts = (): Shift[] => {
  const shifts: Shift[] = [];
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Generate 20 random shifts for the current month
  for (let i = 0; i < 20; i++) {
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const randomStationIndex = Math.floor(Math.random() * STATIONS.length);
    const randomDoctorIndex = Math.floor(Math.random() * MOCK_DOCTORS.length);
    
    const date = new Date(year, month, randomDay);
    const isWeekendShift = isWeekend(date);
    
    let startTime, endTime;
    if (isWeekendShift) {
      startTime = `${year}-${month + 1}-${randomDay}T08:00:00`;
      endTime = `${year}-${month + 1}-${randomDay + 1}T08:00:00`;
    } else {
      startTime = `${year}-${month + 1}-${randomDay}T16:00:00`;
      endTime = `${year}-${month + 1}-${randomDay + 1}T09:00:00`;
    }

    shifts.push({
      id: `shift-${i}`,
      stationId: STATIONS[randomStationIndex].id,
      doctorId: MOCK_DOCTORS[randomDoctorIndex].id,
      date: `${year}-${month + 1}-${randomDay}`,
      startTime,
      endTime,
      type: isWeekendShift ? 'weekend' : 'weekday',
    });
  }

  return shifts;
};

const mockShifts = generateMockShifts();

const Schedule = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredShifts = selectedStation
    ? mockShifts.filter(shift => shift.stationId === selectedStation)
    : mockShifts;

  const getShiftsForDay = (day: Date) => {
    const dateString = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
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
  const DayCell = ({ day, displayMonth, shifts }: DayProps) => {
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
        <div className="mt-1">
          {dayShifts.map((shift) => {
            const station = STATIONS.find(s => s.id === shift.stationId);
            const doctor = MOCK_DOCTORS.find(d => d.id === shift.doctorId);
            
            return (
              <div 
                key={shift.id} 
                className="text-xs bg-blue-100 p-1 mb-1 rounded truncate"
                title={`${station?.name} - ${doctor?.name}`}
              >
                {station?.name}: {doctor?.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Schedule Management</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Schedule
        </Button>
      </div>
      
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
              {STATIONS.map((station) => (
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
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
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
              {filteredShifts.slice(0, 10).map((shift) => {
                const station = STATIONS.find(s => s.id === shift.stationId);
                const doctor = MOCK_DOCTORS.find(d => d.id === shift.doctorId);
                
                return (
                  <TableRow key={shift.id}>
                    <TableCell>{shift.date}</TableCell>
                    <TableCell>{station?.name}</TableCell>
                    <TableCell>{doctor?.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        shift.type === 'weekend' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {shift.type === 'weekend' ? 'Weekend' : 'Weekday'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;
