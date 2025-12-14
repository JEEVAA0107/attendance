import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MockComponentProps {
  title: string;
  description?: string;
}

const MockComponent: React.FC<MockComponentProps> = ({ title, description }) => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {description || `This is a mock ${title} page for frontend development. Database functionality will be implemented later.`}
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-sm">
              🚧 Frontend-only mode: This page is currently showing mock data for design purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockComponent;