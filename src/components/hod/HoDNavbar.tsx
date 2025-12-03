import React from 'react';
import { cn } from '@/lib/utils';

interface HoDNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const HoDNavbar: React.FC<HoDNavbarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'realtime', label: 'Real-Time' },
    { id: 'faculty', label: 'Faculty Surveillance' },
    { id: 'students', label: 'Student Monitoring' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'events', label: 'Events' },
    { id: 'batches', label: 'Batches' },
    { id: 'admin', label: 'Admin' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                activeTab === item.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default HoDNavbar;