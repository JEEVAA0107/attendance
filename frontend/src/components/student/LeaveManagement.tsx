import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  FileText,
  User,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface LeaveManagementProps {
  studentData: any;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ studentData }) => {
  const [showNewLeaveDialog, setShowNewLeaveDialog] = useState(false);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [newLeave, setNewLeave] = useState({
    leaveType: '',
    reason: '',
    documents: []
  });

  const leaveApplications = [
    {
      id: 1,
      leaveType: 'sick',
      fromDate: '2024-01-10',
      toDate: '2024-01-12',
      numberOfDays: 3,
      reason: 'Fever and flu symptoms, doctor advised rest',
      status: 'approved',
      appliedDate: '2024-01-09',
      approvedBy: 'Dr. Smith',
      approvalDate: '2024-01-09',
      remarks: 'Medical certificate verified. Leave approved.',
      supportingDocuments: ['medical_certificate.pdf']
    },
    {
      id: 2,
      leaveType: 'personal',
      fromDate: '2024-01-20',
      toDate: '2024-01-22',
      numberOfDays: 3,
      reason: 'Family function - sister\'s wedding',
      status: 'pending',
      appliedDate: '2024-01-15',
      approvedBy: null,
      approvalDate: null,
      remarks: null,
      supportingDocuments: ['invitation_card.pdf']
    },
    {
      id: 3,
      leaveType: 'emergency',
      fromDate: '2024-01-05',
      toDate: '2024-01-05',
      numberOfDays: 1,
      reason: 'Grandfather hospitalized, need to visit',
      status: 'rejected',
      appliedDate: '2024-01-04',
      approvedBy: 'Prof. Johnson',
      approvalDate: '2024-01-05',
      remarks: 'Insufficient notice period. Emergency leaves require immediate notification.',
      supportingDocuments: []
    }
  ];

  const leaveBalance = {
    totalAllowed: 15,
    used: 4,
    pending: 3,
    remaining: 8
  };

  const leaveTypes = [
    { value: 'sick', label: 'Sick Leave', requiresDocument: true },
    { value: 'personal', label: 'Personal Leave', requiresDocument: false },
    { value: 'emergency', label: 'Emergency Leave', requiresDocument: false },
    { value: 'bereavement', label: 'Bereavement Leave', requiresDocument: true },
    { value: 'other', label: 'Other', requiresDocument: false }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
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
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const calculateDays = () => {
    if (fromDate && toDate) {
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const submitLeaveApplication = () => {
    // Submit leave application logic
    setShowNewLeaveDialog(false);
    setFromDate(undefined);
    setToDate(undefined);
    setNewLeave({ leaveType: '', reason: '', documents: [] });
  };

  return (
    <div className="space-y-6">
      {/* Leave Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{leaveBalance.totalAllowed}</div>
            <div className="text-sm text-blue-600">Total Allowed</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{leaveBalance.used}</div>
            <div className="text-sm text-red-600">Used</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{leaveBalance.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{leaveBalance.remaining}</div>
            <div className="text-sm text-green-600">Remaining</div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Applications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Leave Applications
            </CardTitle>
            <Dialog open={showNewLeaveDialog} onOpenChange={setShowNewLeaveDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Leave Type</Label>
                      <Select value={newLeave.leaveType} onValueChange={(value) => setNewLeave({...newLeave, leaveType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Number of Days</Label>
                      <Input value={calculateDays()} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={setFromDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={setToDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label>Reason for Leave</Label>
                    <Textarea 
                      placeholder="Please provide detailed reason for your leave application..."
                      value={newLeave.reason}
                      onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Supporting Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">Medical certificates, invitations, etc. (PDF, JPG, PNG up to 5MB)</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={submitLeaveApplication} className="flex-1">
                      Submit Application
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewLeaveDialog(false)}>
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
            {leaveApplications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <h3 className="font-semibold capitalize">
                        {application.leaveType.replace('_', ' ')} Leave
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.fromDate} to {application.toDate} ({application.numberOfDays} days)
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                <div className="mb-3">
                  <p className="text-sm"><span className="font-medium">Reason: </span>{application.reason}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Applied Date: </span>
                    {application.appliedDate}
                  </div>
                  <div>
                    <span className="font-medium">Documents: </span>
                    {application.supportingDocuments.length} files
                  </div>
                  {application.approvedBy && (
                    <div>
                      <span className="font-medium">Approved By: </span>
                      {application.approvedBy}
                    </div>
                  )}
                  {application.approvalDate && (
                    <div>
                      <span className="font-medium">Decision Date: </span>
                      {application.approvalDate}
                    </div>
                  )}
                </div>

                {application.remarks && (
                  <div className={`p-3 rounded mb-3 ${
                    application.status === 'approved' ? 'bg-green-50 border border-green-200' :
                    application.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className="text-sm">
                      <span className="font-medium">Faculty Remarks: </span>
                      {application.remarks}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {application.supportingDocuments.length > 0 && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Documents
                    </Button>
                  )}
                  {application.status === 'pending' && (
                    <Button variant="outline" size="sm" className="text-red-600">
                      Cancel Application
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave Policy Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Leave Types & Requirements</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Sick Leave:</strong> Medical certificate required for 2+ days</li>
                  <li>• <strong>Personal Leave:</strong> Apply 3 days in advance</li>
                  <li>• <strong>Emergency Leave:</strong> Immediate notification required</li>
                  <li>• <strong>Bereavement Leave:</strong> Death certificate required</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Important Notes</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Maximum 15 days leave per semester</li>
                  <li>• Leave affects attendance calculation</li>
                  <li>• Faculty approval required for all leaves</li>
                  <li>• Medical leaves don't count towards attendance shortage</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;