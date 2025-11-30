import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Calendar, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { handleExcelUpload } from '@/lib/uploadUtils';

interface TimetableEntry {
  day: string;
  period: number;
  time: string;
  subject: string;
  faculty: string;
  room?: string;
}

const Timetable = () => {
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleExcelUpload(file, (jsonData) => {
      const parsedTimetable: TimetableEntry[] = [];
      
      jsonData.forEach((row, index) => {
        if (index === 0 || !row || row.length < 4) return; // Skip header
        
        const entry: TimetableEntry = {
          day: String(row[0] || '').trim(),
          period: parseInt(String(row[1] || '1')),
          time: String(row[2] || '').trim(),
          subject: String(row[3] || '').trim(),
          faculty: String(row[4] || '').trim(),
          room: String(row[5] || '').trim()
        };
        
        if (entry.day && entry.subject) {
          parsedTimetable.push(entry);
        }
      });

      setTimetableData(parsedTimetable);
      toast.success(`${parsedTimetable.length} timetable entries loaded`);
    });
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  const getTimetableEntry = (day: string, period: number) => {
    return timetableData.find(entry => 
      entry.day.toLowerCase() === day.toLowerCase() && entry.period === period
    );
  };

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-heading font-bold gradient-text">Timetable</h1>
        <p className="text-muted-foreground mt-2">Upload and manage class timetable</p>
      </div>

      {/* Upload Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timetable-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Click to upload timetable</p>
                <p className="text-xs text-muted-foreground">Excel (.xlsx, .xls) files supported</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Format: Day | Period | Time | Subject | Faculty | Room
                </p>
              </div>
            </Label>
            <Input
              id="timetable-upload"
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          
          {timetableData.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const worksheet = XLSX.utils.json_to_sheet(timetableData);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');
                  XLSX.writeFile(workbook, `Timetable_${new Date().toISOString().split('T')[0]}.xlsx`);
                  toast.success('Timetable exported');
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setTimetableData([]);
                  toast.success('Timetable cleared');
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timetable Display */}
      {timetableData.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-3 bg-muted font-semibold">Period</th>
                    {days.map(day => (
                      <th key={day} className="border border-border p-3 bg-muted font-semibold min-w-[150px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map(period => (
                    <tr key={period}>
                      <td className="border border-border p-3 bg-muted font-medium text-center">
                        <div className="flex flex-col items-center">
                          <span>P{period}</span>
                          <Clock className="h-3 w-3 mt-1 text-muted-foreground" />
                        </div>
                      </td>
                      {days.map(day => {
                        const entry = getTimetableEntry(day, period);
                        return (
                          <td key={`${day}-${period}`} className="border border-border p-2">
                            {entry ? (
                              <div className="space-y-1">
                                <div className="font-semibold text-sm text-primary">{entry.subject}</div>
                                <div className="text-xs text-muted-foreground">{entry.faculty}</div>
                                <div className="text-xs text-muted-foreground">{entry.time}</div>
                                {entry.room && (
                                  <div className="text-xs text-muted-foreground">Room: {entry.room}</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground text-sm">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {timetableData.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Timetable Uploaded</h3>
            <p className="text-muted-foreground mb-4">
              Upload an Excel file with your class timetable to get started
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Timetable
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Timetable;