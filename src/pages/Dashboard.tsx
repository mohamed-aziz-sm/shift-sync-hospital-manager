import React from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfToday, endOfToday, addDays } from 'date-fns';
import { CalendarIcon, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [todayShifts, setTodayShifts] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [shiftCounts, setShiftCounts] = useState({ today: 0, upcoming: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch doctors count
        const { data: doctors, error: doctorsError } = await supabase
          .from('doctors')
          .select('id', { count: 'exact' });
          
        if (doctorsError) throw doctorsError;
        setDoctorsCount(doctors?.length || 0);
        
        // Fetch shifts for today and upcoming
        const today = format(startOfToday(), 'yyyy-MM-dd');
        const tomorrow = format(addDays(startOfToday(), 1), 'yyyy-MM-dd');
        const nextWeek = format(addDays(startOfToday(), 7), 'yyyy-MM-dd');
        
        const welcomeMessage = profile ? `Welcome, ${profile.name}! Here's your dashboard.` : 
          "Welcome to ShiftSync Hospital Manager!";
          
        toast.success(welcomeMessage);
        
        // Continue with fetching shift data
        const { data: todayShiftsData, error: todayShiftsError } = await supabase
          .from('shifts')
          .select(`
            id, date, start_time, end_time, type,
            stations (name),
            doctors (name)
          `)
          .eq('date', today);
          
        if (todayShiftsError) throw todayShiftsError;
        setTodayShifts(todayShiftsData || []);
        setShiftCounts(prev => ({ ...prev, today: todayShiftsData?.length || 0 }));
        
        const { data: upcomingShiftsData, error: upcomingShiftsError } = await supabase
          .from('shifts')
          .select(`
            id, date, start_time, end_time, type,
            stations (name),
            doctors (name)
          `)
          .gte('date', tomorrow)
          .lte('date', nextWeek)
          .order('date', { ascending: true });
          
        if (upcomingShiftsError) throw upcomingShiftsError;
        setUpcomingShifts(upcomingShiftsData || []);
        setShiftCounts(prev => ({ ...prev, upcoming: upcomingShiftsData?.length || 0 }));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [profile]);

  const renderShiftItem = (shift) => (
    <div key={shift.id} className="border rounded-md p-4 mb-2">
      <div className="flex justify-between items-center">
        <div className="font-semibold">{shift.stations?.name}</div>
        <div className="text-sm text-gray-500">{shift.type}</div>
      </div>
      <div className="text-sm">
        {format(parseISO(shift.start_time), 'HH:mm')} - {format(parseISO(shift.end_time), 'HH:mm')}
      </div>
      <div className="text-sm text-gray-600">Doctor: {shift.doctors?.name}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {profile ? `Welcome, ${profile.name}! Here's your dashboard.` : "Welcome to ShiftSync Hospital Manager!"}
        </p>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today" className="relative">
            Today <Badge className="ml-2 absolute -top-1 right-0">{shiftCounts.today}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="relative">
            Upcoming <Badge className="ml-2 absolute -top-1 right-0">{shiftCounts.upcoming}</Badge>
          </TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Today's Shifts</CardTitle>
              <CardDescription>Overview of shifts scheduled for today.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  Loading shifts...
                </div>
              ) : todayShifts.length > 0 ? (
                todayShifts.map(renderShiftItem)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No shifts scheduled for today.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> Upcoming Shifts</CardTitle>
              <CardDescription>Shifts scheduled for the next 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  Loading shifts...
                </div>
              ) : upcomingShifts.length > 0 ? (
                upcomingShifts.map(renderShiftItem)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming shifts scheduled.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-4 w-4" /> Total Doctors</CardTitle>
                <CardDescription>Number of doctors in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctorsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Today's Shifts</CardTitle>
                <CardDescription>Number of shifts scheduled for today.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shiftCounts.today}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> Upcoming Shifts</CardTitle>
                <CardDescription>Number of shifts in the next 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shiftCounts.upcoming}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
