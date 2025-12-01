import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, LayoutDashboard, Shield, Users, BookOpen, Calendar, BarChart3, Download, Settings, Menu, X, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/timetable', label: 'Timetable', icon: Clock },
    { path: '/faculty', label: 'Faculty', icon: Shield },
    { path: '/attendance', label: 'Attendance', icon: Calendar },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/export', label: 'Data Export', icon: Download },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

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
      <div className={`fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col z-50 w-64 md:block ${
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
        <nav className="flex-1 p-2 space-y-1">
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
        <div className="p-2 border-t border-border space-y-1">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={`w-full ${isOpen ? 'justify-start' : 'justify-center'}`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Sun className="h-5 w-5 flex-shrink-0" />
            )}
            {isOpen && <span className="ml-3">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full ${isOpen ? 'justify-start' : 'justify-center'}`}
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