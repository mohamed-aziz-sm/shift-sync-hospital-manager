
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, Users, Calendar, Clock, BedDouble } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_DOCTORS, STATIONS } from '@/types';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Stats for admin dashboard
  const stats = [
    {
      title: 'Total Doctors',
      value: MOCK_DOCTORS.length,
      icon: <Users className="h-8 w-8 text-medical-blue" />,
      description: 'Registered medical staff'
    },
    {
      title: 'Total Stations',
      value: STATIONS.length,
      icon: <Hospital className="h-8 w-8 text-medical-teal" />,
      description: 'Active hospital stations'
    },
    {
      title: 'Upcoming Shifts',
      value: 12, // Mock value
      icon: <Clock className="h-8 w-8 text-medical-amber" />,
      description: 'In the next 7 days'
    },
    {
      title: 'Total Beds',
      value: 120, // Mock value
      icon: <BedDouble className="h-8 w-8 text-medical-red" />,
      description: 'Available hospital beds'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin 
            ? 'Manage your hospital resources and staff schedules'
            : 'View your upcoming shifts and manage your availability'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
              <div>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <CardDescription>{stat.description}</CardDescription>
            </CardContent>
          </Card>
        ))}

        {!isAdmin && (
          <>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">Your Next Shift</CardTitle>
                <div><Calendar className="h-8 w-8 text-medical-blue" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Tomorrow</div>
                <CardDescription>Réanimation - 16:00 to 09:00</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">Upcoming Weekend</CardTitle>
                <div><Calendar className="h-8 w-8 text-medical-amber" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Not Scheduled</div>
                <CardDescription>You have no weekend shifts this week</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">Monthly Shifts</CardTitle>
                <div><Clock className="h-8 w-8 text-medical-teal" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <CardDescription>Total shifts this month</CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">Unavailability</CardTitle>
                <div><Calendar className="h-8 w-8 text-medical-red" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 Days</div>
                <CardDescription>Marked as unavailable this month</CardDescription>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Admin only content */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Dr. Jane Smith updated availability</p>
                    <p className="text-sm text-muted-foreground">Marked 3 days as unavailable</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </li>
                <li className="flex items-start justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Schedule generated</p>
                    <p className="text-sm text-muted-foreground">May 2025 schedule created</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </li>
                <li className="flex items-start justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Dr. John Doe added</p>
                    <p className="text-sm text-muted-foreground">New doctor in Group 1</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </li>
                <li className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">Shift swap requested</p>
                    <p className="text-sm text-muted-foreground">Between Dr. Johnson and Dr. Williams</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3 days ago</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Station Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {STATIONS.map((station) => (
                  <li key={station.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-medical-blue mr-2"></div>
                      <span>{station.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Groups: {station.allowedGroups.join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Doctor specific content */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Your Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="border-b pb-2">
                <div className="font-medium">Tuesday, April 26, 2025</div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Réanimation</span>
                    <span className="text-xs text-muted-foreground ml-2">16:00 - 09:00</span>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-medical-blue/10 text-medical-blue">Weekday</div>
                </div>
              </div>
              
              <div className="border-b pb-2">
                <div className="font-medium">Friday, April 29, 2025</div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Weaning</span>
                    <span className="text-xs text-muted-foreground ml-2">16:00 - 09:00</span>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-medical-blue/10 text-medical-blue">Weekday</div>
                </div>
              </div>
              
              <div>
                <div className="font-medium">Sunday, May 8, 2025</div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Visite MedI</span>
                    <span className="text-xs text-muted-foreground ml-2">08:00 - 08:00</span>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-medical-amber/10 text-medical-amber">Weekend</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
