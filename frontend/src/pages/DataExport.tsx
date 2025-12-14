import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Download, Calendar, Users, BarChart3, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const DataExport = () => {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { id: 'college-template', name: 'College Official Template', description: 'Standard institutional format' },
    { id: 'detailed-report', name: 'Detailed Attendance Report', description: 'Comprehensive analysis with charts' },
    { id: 'summary-report', name: 'Summary Report', description: 'Quick overview for management' },
    { id: 'student-wise', name: 'Student-wise Report', description: 'Individual student attendance records' }
  ];

  const timePeriods = [
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'semester', name: 'Current Semester' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'aids', name: 'AI & Data Science' },
    { id: 'cse', name: 'Computer Science' },
    { id: 'ece', name: 'Electronics & Communication' },
    { id: 'mech', name: 'Mechanical Engineering' }
  ];

  const handleExport = async () => {
    if (!selectedFormat || !selectedPeriod || !selectedDepartment) {
      toast.error('Please select all required fields');
      return;
    }

    setIsExporting(true);

    try {
      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful export
      toast.success('Export completed successfully! File will be downloaded shortly.');
      
      // Simulate file download
      const fileName = `attendance-report-${selectedFormat}-${new Date().toISOString().split('T')[0]}.xlsx`;
      toast.info(`Downloading: ${fileName}`);
      
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const recentExports = [
    { id: 1, name: 'Monthly Report - December 2024', date: '2024-12-28', status: 'completed', size: '2.4 MB' },
    { id: 2, name: 'Weekly Summary - Week 51', date: '2024-12-22', status: 'completed', size: '856 KB' },
    { id: 3, name: 'Student-wise Report - AI&DS', date: '2024-12-20', status: 'completed', size: '1.2 MB' }
  ];

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Data Export</h1>
        <p className="text-gray-600 mt-2">Export attendance data in various formats for reporting and analysis</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Export Configuration
            </CardTitle>
            <CardDescription>
              Configure your export settings and generate professional reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report format" />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div>
                        <div className="font-medium">{format.name}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <BarChart3 className="h-5 w-5 mr-2 animate-pulse" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Generate & Download Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Export Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">Reports Generated</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-gray-600">Total Downloads</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Popular Formats</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">College Template</span>
                  <Badge variant="secondary">68%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Detailed Report</span>
                  <Badge variant="secondary">22%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Summary Report</span>
                  <Badge variant="secondary">10%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Recent Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExports.map((export_item) => (
              <div key={export_item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium">{export_item.name}</h4>
                    <p className="text-sm text-gray-600">{export_item.date} • {export_item.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {export_item.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExport;