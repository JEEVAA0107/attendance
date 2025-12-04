import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  Shield,
  GraduationCap,
  Award,
  Search
} from 'lucide-react';

interface DocumentCenterProps {
  studentData: any;
}

const DocumentCenter: React.FC<DocumentCenterProps> = ({ studentData }) => {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRequest, setNewRequest] = useState({
    documentType: '',
    purpose: '',
    deliveryMethod: 'digital',
    urgency: 'normal'
  });

  const availableDocuments = [
    {
      id: 1,
      name: 'Student ID Card',
      type: 'identity',
      description: 'Digital student identification card',
      status: 'available',
      lastUpdated: '2024-01-15',
      downloadCount: 5,
      icon: <CreditCard className="h-6 w-6 text-blue-500" />
    },
    {
      id: 2,
      name: 'Attendance Certificate',
      type: 'academic',
      description: 'Official attendance certificate for current semester',
      status: 'available',
      lastUpdated: '2024-01-10',
      downloadCount: 2,
      icon: <Award className="h-6 w-6 text-green-500" />
    },
    {
      id: 3,
      name: 'Bonafide Certificate',
      type: 'academic',
      description: 'Certificate confirming student enrollment',
      status: 'request_required',
      lastUpdated: null,
      downloadCount: 0,
      icon: <FileText className="h-6 w-6 text-purple-500" />
    },
    {
      id: 4,
      name: 'Transcript',
      type: 'academic',
      description: 'Official academic transcript with grades',
      status: 'request_required',
      lastUpdated: null,
      downloadCount: 0,
      icon: <GraduationCap className="h-6 w-6 text-orange-500" />
    }
  ];

  const documentRequests = [
    {
      id: 1,
      documentType: 'Bonafide Certificate',
      purpose: 'Bank loan application',
      requestDate: '2024-01-12',
      status: 'processing',
      approvedBy: 'Academic Office',
      expectedDate: '2024-01-18',
      deliveryMethod: 'physical',
      urgency: 'normal',
      trackingId: 'DOC2024001'
    },
    {
      id: 2,
      documentType: 'Character Certificate',
      purpose: 'Job application',
      requestDate: '2024-01-08',
      status: 'ready',
      approvedBy: 'HOD',
      readyDate: '2024-01-15',
      deliveryMethod: 'digital',
      urgency: 'urgent',
      trackingId: 'DOC2024002'
    },
    {
      id: 3,
      documentType: 'Fee Receipt',
      purpose: 'Income tax filing',
      requestDate: '2024-01-05',
      status: 'delivered',
      approvedBy: 'Accounts Office',
      deliveredDate: '2024-01-06',
      deliveryMethod: 'digital',
      urgency: 'normal',
      trackingId: 'DOC2024003'
    }
  ];

  const documentTypes = [
    'Bonafide Certificate',
    'Character Certificate',
    'Conduct Certificate',
    'Transfer Certificate',
    'Migration Certificate',
    'Degree Certificate',
    'Provisional Certificate',
    'Fee Receipt',
    'No Dues Certificate',
    'Course Completion Certificate'
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'bg-green-100 text-green-800',
      request_required: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      available: 'Available',
      request_required: 'Request Required',
      pending: 'Pending',
      processing: 'Processing',
      ready: 'Ready',
      delivered: 'Delivered'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ready':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const submitRequest = () => {
    // Submit document request logic
    setShowRequestDialog(false);
    setNewRequest({
      documentType: '',
      purpose: '',
      deliveryMethod: 'digital',
      urgency: 'normal'
    });
  };

  const filteredDocuments = availableDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Request */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Request Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Document Type</Label>
                    <Select value={newRequest.documentType} onValueChange={(value) => setNewRequest({...newRequest, documentType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Purpose</Label>
                    <Textarea 
                      placeholder="Specify the purpose for requesting this document..."
                      value={newRequest.purpose}
                      onChange={(e) => setNewRequest({...newRequest, purpose: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Delivery Method</Label>
                      <Select value={newRequest.deliveryMethod} onValueChange={(value) => setNewRequest({...newRequest, deliveryMethod: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="digital">Digital Copy</SelectItem>
                          <SelectItem value="physical">Physical Copy</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Urgency</Label>
                      <Select value={newRequest.urgency} onValueChange={(value) => setNewRequest({...newRequest, urgency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal (5-7 days)</SelectItem>
                          <SelectItem value="urgent">Urgent (2-3 days)</SelectItem>
                          <SelectItem value="emergency">Emergency (1 day)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={submitRequest} className="flex-1">
                      Submit Request
                    </Button>
                    <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Available Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {document.icon}
                    <div>
                      <h3 className="font-semibold">{document.name}</h3>
                      <p className="text-sm text-gray-600">{document.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(document.status)}
                </div>

                {document.status === 'available' && (
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Last updated: {document.lastUpdated}</p>
                    <p>Downloaded: {document.downloadCount} times</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {document.status === 'available' ? (
                    <>
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowRequestDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Request Document
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Document Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-semibold">{request.documentType}</h3>
                      <p className="text-sm text-gray-600">Purpose: {request.purpose}</p>
                      <p className="text-sm text-gray-500">Tracking ID: {request.trackingId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(request.status)}
                    {request.urgency === 'urgent' && (
                      <Badge className="bg-red-100 text-red-800 ml-2">Urgent</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="font-medium">Request Date: </span>
                    {request.requestDate}
                  </div>
                  <div>
                    <span className="font-medium">Approved By: </span>
                    {request.approvedBy}
                  </div>
                  <div>
                    <span className="font-medium">Delivery: </span>
                    {request.deliveryMethod}
                  </div>
                  {request.expectedDate && (
                    <div>
                      <span className="font-medium">Expected: </span>
                      {request.expectedDate}
                    </div>
                  )}
                  {request.readyDate && (
                    <div>
                      <span className="font-medium">Ready Date: </span>
                      {request.readyDate}
                    </div>
                  )}
                  {request.deliveredDate && (
                    <div>
                      <span className="font-medium">Delivered: </span>
                      {request.deliveredDate}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Track Status
                  </Button>
                  {request.status === 'ready' && request.deliveryMethod === 'digital' && (
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {request.status === 'ready' && request.deliveryMethod === 'physical' && (
                    <Button size="sm">
                      <Truck className="h-4 w-4 mr-2" />
                      Collect from Office
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Document Request Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Processing Times</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Normal:</strong> 5-7 working days</li>
                <li>• <strong>Urgent:</strong> 2-3 working days (additional fee may apply)</li>
                <li>• <strong>Emergency:</strong> 1 working day (requires justification)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Important Notes</h4>
              <ul className="space-y-1 text-sm">
                <li>• All requests require approval from respective authorities</li>
                <li>• Physical documents must be collected within 30 days</li>
                <li>• Digital documents are available for download for 90 days</li>
                <li>• Some documents may require fee payment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentCenter;