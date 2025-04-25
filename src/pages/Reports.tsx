
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, BarChart2, Calendar, FileText } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  group_id: number;
}

interface ShiftSummary {
  doctor_id: string;
  doctor_name: string;
  group_id: number;
  total_shifts: number;
  weekday_shifts: number;
  weekend_shifts: number;
}

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [shiftStats, setShiftStats] = useState<ShiftSummary[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Generate years array (current year and 2 years back/forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name, group_id')
          .order('name');
          
        if (error) {
          toast.error('Failed to load doctors: ' + error.message);
          return;
        }
        
        setDoctors(data || []);
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error(error);
      }
    };
    
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchShiftStats = async () => {
      setIsLoading(true);
      
      try {
        // Format month for query
        const monthString = selectedMonth.padStart(2, '0');
        
        // Get shifts for the selected month/year
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .like('date', `${selectedYear}-${monthString}-%`);
          
        if (shiftsError) {
          toast.error('Failed to load shifts: ' + shiftsError.message);
          setIsLoading(false);
          return;
        }

        if (!shiftsData || shiftsData.length === 0) {
          setShiftStats([]);
          setIsLoading(false);
          return;
        }
        
        // Calculate statistics per doctor
        const doctorShiftMap: Record<string, ShiftSummary> = {};
        
        // Initialize with all doctors (even those with no shifts)
        doctors.forEach(doctor => {
          doctorShiftMap[doctor.id] = {
            doctor_id: doctor.id,
            doctor_name: doctor.name,
            group_id: doctor.group_id,
            total_shifts: 0,
            weekday_shifts: 0,
            weekend_shifts: 0
          };
        });
        
        // Count shifts
        shiftsData.forEach(shift => {
          if (doctorShiftMap[shift.doctor_id]) {
            doctorShiftMap[shift.doctor_id].total_shifts++;
            if (shift.type === 'weekday') {
              doctorShiftMap[shift.doctor_id].weekday_shifts++;
            } else {
              doctorShiftMap[shift.doctor_id].weekend_shifts++;
            }
          } else {
            // Handle case where doctor exists in shifts but not in doctors table
            const doctorName = `Unknown Doctor (${shift.doctor_id.slice(0, 8)}...)`;
            doctorShiftMap[shift.doctor_id] = {
              doctor_id: shift.doctor_id,
              doctor_name: doctorName,
              group_id: 0,
              total_shifts: 1,
              weekday_shifts: shift.type === 'weekday' ? 1 : 0,
              weekend_shifts: shift.type === 'weekend' ? 1 : 0
            };
          }
        });
        
        // Convert to array and sort by total shifts
        const statsArray = Object.values(doctorShiftMap)
          .sort((a, b) => b.total_shifts - a.total_shifts);
          
        setShiftStats(statsArray);
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (doctors.length > 0) {
      fetchShiftStats();
    }
  }, [selectedYear, selectedMonth, doctors]);
  
  // Prepare chart data
  const chartData = shiftStats
    .filter(stat => stat.total_shifts > 0)
    .map(stat => ({
      name: stat.doctor_name.split(' ')[0], // Use first name for shorter labels
      weekday: stat.weekday_shifts,
      weekend: stat.weekend_shifts,
      total: stat.total_shifts
    }));
    
  const groupChartData = Array.from({ length: 8 }, (_, i) => {
    const groupId = i + 1;
    const groupDoctors = shiftStats.filter(d => d.group_id === groupId);
    
    return {
      name: `Group ${groupId}`,
      doctors: groupDoctors.length,
      weekday: groupDoctors.reduce((sum, doc) => sum + doc.weekday_shifts, 0),
      weekend: groupDoctors.reduce((sum, doc) => sum + doc.weekend_shifts, 0),
      total: groupDoctors.reduce((sum, doc) => sum + doc.total_shifts, 0),
      average: groupDoctors.length > 0 
        ? parseFloat((groupDoctors.reduce((sum, doc) => sum + doc.total_shifts, 0) / groupDoctors.length).toFixed(2))
        : 0
    };
  }).filter(group => group.doctors > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          View shift assignment reports and statistics
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Schedule Reports
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col space-y-1 min-w-[120px]">
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1 min-w-[120px]">
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="doctors">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="doctors">By Doctor</TabsTrigger>
              <TabsTrigger value="groups">By Group</TabsTrigger>
            </TabsList>
            
            <TabsContent value="doctors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Doctor Shift Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No shift data available for this period.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 80,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="weekday" name="Weekday Shifts" fill="#3b82f6" />
                        <Bar dataKey="weekend" name="Weekend Shifts" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Shift Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Doctor</th>
                          <th className="px-6 py-3">Group</th>
                          <th className="px-6 py-3">Weekday Shifts</th>
                          <th className="px-6 py-3">Weekend Shifts</th>
                          <th className="px-6 py-3">Total Shifts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shiftStats.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                              No shift data available for this period.
                            </td>
                          </tr>
                        ) : (
                          shiftStats.map((stat) => (
                            <tr key={stat.doctor_id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{stat.doctor_name}</td>
                              <td className="px-6 py-4">Group {stat.group_id || 'N/A'}</td>
                              <td className="px-6 py-4">{stat.weekday_shifts}</td>
                              <td className="px-6 py-4">{stat.weekend_shifts}</td>
                              <td className="px-6 py-4 font-medium">{stat.total_shifts}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="groups" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Group Shift Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {groupChartData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No shift data available for this period.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={groupChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="weekday" name="Weekday Shifts" fill="#3b82f6" />
                        <Bar dataKey="weekend" name="Weekend Shifts" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Group Shift Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Group</th>
                          <th className="px-6 py-3">Doctors</th>
                          <th className="px-6 py-3">Weekday Shifts</th>
                          <th className="px-6 py-3">Weekend Shifts</th>
                          <th className="px-6 py-3">Total Shifts</th>
                          <th className="px-6 py-3">Average Per Doctor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupChartData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                              No shift data available for this period.
                            </td>
                          </tr>
                        ) : (
                          groupChartData.map((group) => (
                            <tr key={group.name} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{group.name}</td>
                              <td className="px-6 py-4">{group.doctors}</td>
                              <td className="px-6 py-4">{group.weekday}</td>
                              <td className="px-6 py-4">{group.weekend}</td>
                              <td className="px-6 py-4">{group.total}</td>
                              <td className="px-6 py-4">{group.average}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
