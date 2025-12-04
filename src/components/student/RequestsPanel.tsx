import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';

interface RequestsPanelProps {
  studentData: any;
}

const RequestsPanel: React.FC<RequestsPanelProps> = ({ studentData }) => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      type: 'attendance_correction',
      subject: 'Database Systems',
      date: '2024-01-10',
      reason: 'Biometric system malfunction during class',
      status: 'pending',
      submittedOn: '2024-01-11',
      faculty: 'Dr. Brown',
      documents: ['medical_certificate.pdf']
    },
    {
      id: 2,
      type: 'medical_leave',
      subject: 'All Subjects',
      date: '2024-01-08',
      reason: 'Fever and flu symptoms',
      status: 'approved',
      submittedOn: '2024-01-09',
      faculty: 'Class Coordinator',
      documents: ['doctor_note.pdf']
    },
    {
      id: 3,
      type: 'event_participation',
      subject: 'Technical Symposium',
      date: '2024-01-15',
      reason: 'Participating in inter-college coding competition',
      status: 'rejected',
      submittedOn: '2024-01-05',
      faculty: 'HoD',
      documents: ['event_invitation.pdf'],
      rejectionReason: 'Attendance already below minimum threshold'
    }
  ]);

  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: '',
    subject: '',
    date: '',
    reason: '',
    documents: []
  });

  const requestTypes = [
    { value: 'attendance_correction', label: 'Attendance Correction' },
    { value: 'medical_leave', label: 'Medical Leave' },
    { value: 'event_participation', label: 'Event Participation' },
    { value: 'exam_rescheduling', label: 'Exam Rescheduling' },
    { value: 'other', label: 'Other' }
  ];

  const subjects = [
    'Machine Learning',
    'Data Structures',
    'Database Systems',
    'Web Development',
    'Software Engineering',
    'AI Ethics'
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
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const submitRequest = () => {
    const request = {
      id: requests.length + 1,
      ...newRequest,
      status: 'pending',
      submittedOn: new Date().toISOString().split('T')[0],
      faculty: 'Pending Assignment'
    };
    setRequests([request, ...requests]);
    setNewRequest({ type: '', subject: '', date: '', reason: '', documents: [] });
    setShowNewRequestDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Request Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
            <div className="text-sm text-blue-600">Total Requests</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-green-600">Approved</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-red-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* New Request Button */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Requests
            </CardTitle>
            <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit New Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Request Type</Label>
                    <Select value={newRequest.type} onValueChange={(value) => setNewRequest({...newRequest, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Subject</Label>
                    <Select value={newRequest.subject} onValueChange={(value) => setNewRequest({...newRequest, subject: value})}>
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
                    <Label>Date</Label>
                    <Input 
                      type="date" 
                      value={newRequest.date}
                      onChange={(e) => setNewRequest({...newRequest, date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Reason</Label>
                    <Textarea 
                      placeholder="Explain your request in detail..."
                      value={newRequest.reason}
                      onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Supporting Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={submitRequest} className="flex-1">
                      Submit Request
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-semibold">
                        {requestTypes.find(t => t.value === request.type)?.label}
                      </h3>
                      <p className="text-sm text-gray-600">{request.subject}</p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Date: </span>
                    {request.date}
                  </div>
                  <div>
                    <span className="font-medium">Submitted: </span>
                    {request.submittedOn}
                  </div>
                  <div>
                    <span className="font-medium">Faculty: </span>
                    {request.faculty}
                  </div>
                  <div>
                    <span className="font-medium">Documents: </span>
                    {request.documents?.length || 0} files
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm"><span className="font-medium">Reason: </span>{request.reason}</p>
                </div>

                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Rejection Reason: </span>
                      {request.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {request.documents && request.documents.length > 0 && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Documents
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestsPanel;