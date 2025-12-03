import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Shield, Users, BookOpen, Calendar, BarChart3, Download, X, Clock, CalendarDays, Activity, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't render sidebar for students
  if (user?.role === 'student') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navLinks = useMemo(() => {
    if (user?.role === 'hod') {
      return [
        { path: '/hod-workspace?tab=overview', label: 'Overview', icon: LayoutDashboard },
        { path: '/hod-workspace?tab=realtime', label: 'Real-Time', icon: Activity },
        { path: '/faculty', label: 'Faculty', icon: Users },
        { path: '/hod-workspace?tab=faculty', label: 'Faculty Surveillance', icon: Shield },
        { path: '/hod-workspace?tab=students', label: 'Student Monitoring', icon: Users },
        { path: '/hod-workspace?tab=analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/hod-workspace?tab=events', label: 'Events', icon: CalendarDays },
        { path: '/hod-workspace?tab=batches', label: 'Batches', icon: GraduationCap },
      ];
    }

    const baseLinks = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/students', label: 'Students', icon: Users },
      { path: '/subjects', label: 'Subjects', icon: BookOpen },
      { path: '/timetable', label: 'Timetable', icon: Clock },
      { path: '/faculty', label: 'Faculty', icon: Shield },
      { path: '/attendance', label: 'Attendance', icon: Calendar },
    ];

    if (user?.role === 'faculty') {
      baseLinks.push({ path: '/events', label: 'Events', icon: CalendarDays });
    }

    baseLinks.push(
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/export', label: 'Data Export', icon: Download }
    );

    return baseLinks;
  }, [user?.role]);

  const isActive = useMemo(() => {
    const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';
    return (path: string) => {
      if (user?.role === 'hod') {
        // Handle HoD workspace tabs
        if (path.includes('/hod-workspace?tab=')) {
          const linkTab = new URL(path, window.location.origin).searchParams.get('tab') || 'overview';
          return location.pathname === '/hod-workspace' && currentTab === linkTab;
        }
        // Handle direct paths (like /faculty)
        return location.pathname === path && !location.search;
      }
      return location.pathname === path;
    };
  }, [location.pathname, location.search, user?.role]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50 w-64 md:block ${
        isOpen ? 'block' : 'hidden'
      }`}>
        {/* Header with Toggle */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading text-lg font-bold gradient-text">SmartAttend</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 pb-16">
          {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span>{link.label}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-14 left-0 right-0 p-2 border-t border-border bg-card">
          <Button
            onClick={handleLogout}
            className={`w-full bg-white hover:bg-gray-50 text-red-600 border border-gray-200 ${isOpen ? 'justify-start' : 'justify-center'}`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;