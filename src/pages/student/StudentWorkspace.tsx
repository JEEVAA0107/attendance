import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Construction, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentWorkspace: React.FC = memo(() => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/', { replace: true });
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Top Header */}
        <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">Student Workspace</h1>
                <Badge variant="secondary" className="text-sm">Student Portal</Badge>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-white hover:bg-gray-50 text-red-600 border border-gray-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <Card className="text-center py-16">
            <CardHeader>
              <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Construction className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Student Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-lg mb-4">
                Welcome to your student portal!
              </p>
              <p className="text-gray-500">
                This workspace is currently under development and will be available soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
});

StudentWorkspace.displayName = 'StudentWorkspace';

export default StudentWorkspace;