
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { MOCK_DOCTORS, STATIONS } from '@/types';

interface ShiftData {
  id: string;
  date: string;
  doctorId: string;
  doctorName: string;
  stationId: string;
  stationName: string;
  shiftType: 'weekday' | 'weekend';
  startTime: string;
  endTime: string;
}

const Shifts = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [filter, setFilter] = useState('all');
  const [station, setStation] = useState('all');
  
  // Mock shifts data
  const mockShifts: ShiftData[] = [
    {
      id: '1',
      date: '2025-04-15',
      doctorId: '1',
      doctorName: 'Dr. John Doe',
      stationId: '1',
      stationName: 'Réanimation',
      shiftType: 'weekday',
      startTime: '2025-04-15T16:00:00',
      endTime: '2025-04-16T09:00:00',
    },
    {
      id: '2',
      date: '2025-04-16',
      doctorId: '2',
      doctorName: 'Dr. Jane Smith',
      stationId: '2',
      stationName: 'Weaning',
      shiftType: 'weekday',
      startTime: '2025-04-16T16:00:00',
      endTime: '2025-04-17T09:00:00',
    },
    {
      id: '3',
      date: '2025-04-19',
      doctorId: '3',
      doctorName: 'Dr. Michael Johnson',
      stationId: '3',
      stationName: 'Urgence',
      shiftType: 'weekend',
      startTime: '2025-04-19T08:00:00',
      endTime: '2025-04-20T08:00:00',
    },
    {
      id: '4',
      date: '2025-04-20',
      doctorId: '4',
      doctorName: 'Dr. Sarah Williams',
      stationId: '4',
      stationName: 'Périphérie',
      shiftType: 'weekend',
      startTime: '2025-04-20T08:00:00',
      endTime: '2025-04-21T08:00:00',
    },
    {
      id: '5',
      date: '2025-04-22',
      doctorId: '1',
      doctorName: 'Dr. John Doe',
      stationId: '5',
      stationName: 'Visite MedI',
      shiftType: 'weekday',
      startTime: '2025-04-22T16:00:00',
      endTime: '2025-04-23T09:00:00',
    },
  ];

  // Filter shifts based on selected filters
  const filteredShifts = mockShifts.filter((shift) => {
    // Filter by type
    if (filter !== 'all' && shift.shiftType !== filter) {
      return false;
    }
    
    // Filter by station
    if (station !== 'all' && shift.stationId !== station) {
      return false;
    }
    
    // If not admin, only show shifts for current user
    if (!isAdmin && shift.doctorName !== user?.name) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shifts</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin 
            ? 'Manage and monitor all hospital shifts' 
            : 'View your assigned shifts'
          }
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <div className="col-span-1">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="weekday">Weekday</SelectItem>
                <SelectItem value="weekend">Weekend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-1">
            <Select value={station} onValueChange={setStation}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {STATIONS.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex-grow"></div>
        
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          April 2025
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredShifts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Station</TableHead>
                  {isAdmin && <TableHead>Doctor</TableHead>}
                  <TableHead>Hours</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      {format(parseISO(shift.date), 'MMM dd, yyyy')}
                      <span className="block text-xs text-muted-foreground">
                        {format(parseISO(shift.date), 'EEEE')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          shift.shiftType === 'weekend'
                          ? "bg-medical-amber/10 text-medical-amber border-medical-amber/20"
                          : "bg-medical-blue/10 text-medical-blue border-medical-blue/20"
                        }
                      >
                        {shift.shiftType === 'weekend' ? 'Weekend' : 'Weekday'}
                      </Badge>
                    </TableCell>
                    <TableCell>{shift.stationName}</TableCell>
                    {isAdmin && (
                      <TableCell>{shift.doctorName}</TableCell>
                    )}
                    <TableCell>
                      {format(parseISO(shift.startTime), 'HH:mm')} - {format(parseISO(shift.endTime), 'HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      {shift.shiftType === 'weekend' ? '24 hours' : '17 hours'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No shifts found with the current filters
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shift Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Total Shifts</div>
                  <div className="text-2xl font-bold">
                    {isAdmin ? mockShifts.length : filteredShifts.length}
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">This Month</div>
                  <div className="text-2xl font-bold">
                    {isAdmin ? mockShifts.length : filteredShifts.length}
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Weekday Shifts</div>
                  <div className="text-2xl font-bold">
                    {isAdmin 
                      ? mockShifts.filter(s => s.shiftType === 'weekday').length
                      : filteredShifts.filter(s => s.shiftType === 'weekday').length
                    }
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Weekend Shifts</div>
                  <div className="text-2xl font-bold">
                    {isAdmin 
                      ? mockShifts.filter(s => s.shiftType === 'weekend').length
                      : filteredShifts.filter(s => s.shiftType === 'weekend').length
                    }
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Doctors Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_DOCTORS.map((doctor) => {
                  const doctorShifts = mockShifts.filter(s => s.doctorId === doctor.id);
                  const weekdayShifts = doctorShifts.filter(s => s.shiftType === 'weekday').length;
                  const weekendShifts = doctorShifts.filter(s => s.shiftType === 'weekend').length;
                  const totalShifts = doctorShifts.length;
                  
                  return (
                    <div key={doctor.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{doctor.name}</div>
                        <Badge variant="outline">{totalShifts} shifts</Badge>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Weekday: {weekdayShifts}</span>
                          <span>Weekend: {weekendShifts}</span>
                        </div>
                        
                        <div className="w-full h-2 bg-muted mt-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-medical-blue"
                            style={{ width: `${(weekdayShifts / (totalShifts || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Shifts;
