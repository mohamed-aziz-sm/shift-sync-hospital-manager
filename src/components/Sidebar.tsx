
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Users,
  User,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'admin';

  const menuItems = [
    { 
      name: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/',
      adminOnly: false
    },
    { 
      name: 'Doctors',
      icon: <Users className="h-5 w-5" />,
      path: '/doctors',
      adminOnly: true
    },
    { 
      name: 'Schedule',
      icon: <Calendar className="h-5 w-5" />,
      path: '/schedule',
      adminOnly: false
    },
    { 
      name: 'Shifts',
      icon: <Clock className="h-5 w-5" />,
      path: '/shifts',
      adminOnly: false
    },
    {
      name: 'Reports',
      icon: <FileText className="h-5 w-5" />,
      path: '/reports',
      adminOnly: true
    },
    {
      name: 'Profile',
      icon: <User className="h-5 w-5" />,
      path: '/profile',
      adminOnly: false
    }
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside 
      className={cn(
        "bg-white border-r border-border transition-all duration-300 h-screen flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center">
            <span className="font-semibold text-lg text-primary">ShiftSync</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-8 w-8",
            collapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-grow py-4">
        <nav className="space-y-1 px-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted",
                  collapsed ? "justify-center" : ""
                )}
              >
                <span className={isActive ? "text-primary" : ""}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>ShiftSync Hospital Manager</p>
            <p>Version 1.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
