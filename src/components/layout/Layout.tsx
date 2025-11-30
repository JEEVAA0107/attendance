import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <main className={`min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;