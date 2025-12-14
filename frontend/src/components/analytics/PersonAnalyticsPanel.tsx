import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PersonAnalyticsPanelProps {
  personId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PersonAnalyticsPanel: React.FC<PersonAnalyticsPanelProps> = ({
  personId,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Student Analytics</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-3xl font-bold text-primary mb-2">85%</div>
            <div className="text-sm text-muted-foreground">Attendance Rate</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};