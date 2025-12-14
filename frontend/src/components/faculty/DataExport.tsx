import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Download, Settings, Zap } from 'lucide-react';
import { toast } from 'sonner';

const DataExport = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!webhookUrl) {
      toast.error('Please enter your n8n webhook URL');
      return;
    }

    setIsExporting(true);

    try {
      // Mock attendance data to send to n8n
      const attendanceData = {
        date: new Date().toISOString(),
        records: [
          { name: 'John Doe', rollNo: 'CS001', status: 'Present', department: 'Computer Science' },
          { name: 'Jane Smith', rollNo: 'CS002', status: 'Present', department: 'Computer Science' },
          { name: 'Mike Johnson', rollNo: 'CS003', status: 'Absent', department: 'Computer Science' },
        ],
        summary: {
          totalStudents: 3,
          present: 2,
          absent: 1,
          percentage: 66.67
        }
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(attendanceData),
      });

      toast.success('Export request sent to n8n! Check your workflow to download the Excel file.');
    } catch (error) {
      console.error('Error triggering n8n webhook:', error);
      toast.error('Failed to send export request. Please check your webhook URL.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-heading font-bold gradient-text">Data Export</h1>
        <p className="text-muted-foreground mt-2">Export attendance data to college Excel format via n8n automation</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              n8n Automation Agent
            </CardTitle>
            <CardDescription>
              Connect your n8n workflow to automatically format and export attendance data into your college's official Excel template.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhook">n8n Webhook URL</Label>
              <Input
                id="webhook"
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/attendance"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your n8n webhook URL that handles the Excel export workflow
              </p>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full btn-hero"
            >
              {isExporting ? (
                <>
                  <Settings className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Export to College Excel Format
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Configure n8n Workflow</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up an n8n workflow with a webhook trigger that accepts attendance data
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Enter Webhook URL</h4>
                  <p className="text-sm text-muted-foreground">
                    Paste your n8n webhook URL in the field above
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Click Export</h4>
                  <p className="text-sm text-muted-foreground">
                    SmartAttend sends attendance data to your n8n workflow
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Receive Excel File</h4>
                  <p className="text-sm text-muted-foreground">
                    n8n processes the data and returns a formatted .xlsx file matching your college template
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm">
                  <strong>Note:</strong> Your n8n workflow should format the data into your institution's Excel template 
                  structure and return a downloadable file. The template structure, columns, and formatting will be 
                  preserved exactly as required.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No exports yet. Click the button above to create your first export.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExport;
