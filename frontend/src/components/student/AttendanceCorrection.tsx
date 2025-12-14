import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  FileText,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceCorrectionProps {
  studentData: any;
}

const AttendanceCorrection: React.FC<AttendanceCorrectionProps> = ({ studentData }) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [correctionData, setCorrectionData] = useState({
    subject: '',
    timeSlot: '',
    currentStatus: '',
    requestedStatus: '',
    reason: '',
    evidence: ''
  });

  const subjects = [
    'Machine Learning',
    'Data Structures', 
    'Database Systems',
    'Web Development',
    'Software Engineering',
    'AI Ethics'
  ];

  const timeSlots = [
    '09:00-10:00 AM',
    '10:00-11:00 AM', 
    '11:00-12:00 PM',
    '02:00-03:00 PM',
    '03:00-04:00 PM',
    '04:00-05:00 PM'
  ];

  const correctionRequests = [
    {
      id: 1,
      date: '2024-01-10',
      subject: 'Database Systems',
      timeSlot: '11:00-12:00 PM',
      currentStatus: 'absent',
      requestedStatus: 'present',
      reason: 'Biometric scanner malfunction - was present but not recorded',
      evidence: 'Classmate witness, lab assignment submitted',
      status: 'pending',
      submittedOn: '2024-01-11',
      faculty: 'Dr. Brown',
      reviewComments: null
    },
    {
      id: 2,
      date: '2024-01-08',
      subject: 'Machine Learning',
      timeSlot: '09:00-10:00 AM',
      currentStatus: 'absent',
      requestedStatus: 'present',
      reason: 'Medical emergency - had to leave during class',
      evidence: 'Medical certificate attached',
      status: 'approved',
      submittedOn: '2024-01-09',
      faculty: 'Dr. Smith',
      reviewComments: 'Medical certificate verified. Attendance corrected.',
      approvedOn: '2024-01-10'
    },
    {
      id: 3,
      date: '2024-01-05',
      subject: 'Web Development',
      timeSlot: '02:00-03:00 PM',
      currentStatus: 'late',
      requestedStatus: 'present',
      reason: 'Traffic jam due to accident on main road',
      evidence: 'News report of accident, GPS location data',
      status: 'rejected',
      submittedOn: '2024-01-06',
      faculty: 'Prof. Davis',
      reviewComments: 'Insufficient evidence. Late arrival policy applies.',
      reviewedOn: '2024-01-07'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100';
      case 'absent':
        return 'text-red-600 bg-red-100';
      case 'late':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const submitCorrection = () => {
    // Submit attendance correction logic
    console.log('Submitting correction:', {
      date: selectedDate,
      ...correctionData
    });
  };

  return (
    <div className="space-y-6">
      {/* Correction Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Request Attendance Correction
          </CardTitle>
          <p className="text-sm text-gray-600">
            Submit a request to correct your attendance record with proper justification
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date of Class</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Subject</Label>
              <Select value={correctionData.subject} onValueChange={(value) => setCorrectionData({...correctionData, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Time Slot</Label>
              <Select value={correctionData.timeSlot} onValueChange={(value) => setCorrectionData({...correctionData, timeSlot: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Current Status</Label>
              <Select value={correctionData.currentStatus} onValueChange={(value) => setCorrectionData({...correctionData, currentStatus: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Current attendance status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Requested Status</Label>
              <Select value={correctionData.requestedStatus} onValueChange={(value) => setCorrectionData({...correctionData, requestedStatus: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Requested attendance status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <Label>Status Change</Label>
              <div className="flex items-center gap-2 p-2 border rounded">
                {correctionData.currentStatus && (
                  <Badge className={getAttendanceStatusColor(correctionData.currentStatus)}>
                    {correctionData.currentStatus}
                  </Badge>
                )}
                {correctionData.currentStatus && correctionData.requestedStatus && (
                  <span>→</span>
                )}
                {correctionData.requestedStatus && (
                  <Badge className={getAttendanceStatusColor(correctionData.requestedStatus)}>
                    {correctionData.requestedStatus}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label>Reason for Correction</Label>
            <Textarea 
              placeholder="Provide detailed explanation for the attendance correction request..."
              value={correctionData.reason}
              onChange={(e) => setCorrectionData({...correctionData, reason: e.target.value})}
              rows={3}
            />
          </div>

          <div>
            <Label>Supporting Evidence</Label>
            <Textarea 
              placeholder="Describe any evidence you have (witnesses, documents, etc.)..."
              value={correctionData.evidence}
              onChange={(e) => setCorrectionData({...correctionData, evidence: e.target.value})}
              rows={2}
            />
          </div>

          <div>
            <Label>Upload Documents (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload supporting documents</p>
              <p className="text-xs text-gray-500">Medical certificates, screenshots, etc. (PDF, JPG, PNG up to 5MB)</p>
            </div>
          </div>

          <Button onClick={submitCorrection} className="w-full">
            Submit Correction Request
          </Button>
        </CardContent>
      </Card>

      {/* Previous Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Correction Request History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correctionRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-semibold">{request.subject}</h3>
                      <p className="text-sm text-gray-600">
                        {request.date} • {request.timeSlot}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Status Change:</span>
                    <Badge className={getAttendanceStatusColor(request.currentStatus)}>
                      {request.currentStatus}
                    </Badge>
                    <span>→</span>
                    <Badge className={getAttendanceStatusColor(request.requestedStatus)}>
                      {request.requestedStatus}
                    </Badge>
                  </div>
                  <p className="text-sm"><span className="font-medium">Reason: </span>{request.reason}</p>
                  <p className="text-sm"><span className="font-medium">Evidence: </span>{request.evidence}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="font-medium">Submitted: </span>
                    {request.submittedOn}
                  </div>
                  <div>
                    <span className="font-medium">Faculty: </span>
                    {request.faculty}
                  </div>
                  {request.approvedOn && (
                    <div>
                      <span className="font-medium">Approved: </span>
                      {request.approvedOn}
                    </div>
                  )}
                  {request.reviewedOn && (
                    <div>
                      <span className="font-medium">Reviewed: </span>
                      {request.reviewedOn}
                    </div>
                  )}
                </div>

                {request.reviewComments && (
                  <div className={`p-3 rounded mb-3 ${
                    request.status === 'approved' ? 'bg-green-50 border border-green-200' :
                    request.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className="text-sm">
                      <span className="font-medium">Faculty Comments: </span>
                      {request.reviewComments}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Documents
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Correction Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Valid Reasons for Correction</h4>
              <ul className="space-y-1 text-sm">
                <li>• Biometric system malfunction</li>
                <li>• Medical emergency during class</li>
                <li>• Technical issues with attendance marking</li>
                <li>• Official college activities</li>
                <li>• Faculty error in marking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Important Notes</h4>
              <ul className="space-y-1 text-sm">
                <li>• Requests must be submitted within 48 hours</li>
                <li>• Provide detailed explanation and evidence</li>
                <li>• Faculty approval is required for all corrections</li>
                <li>• False requests may result in disciplinary action</li>
                <li>• Maximum 3 correction requests per month</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceCorrection;