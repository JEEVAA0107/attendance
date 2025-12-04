import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen,
  Download,
  FileText,
  Video,
  Link,
  Search,
  Calendar,
  Clock,
  User,
  Star,
  Eye,
  Upload,
  Award,
  Briefcase,
  Users
} from 'lucide-react';

interface ResourceCenterProps {
  studentData: any;
}

const ResourceCenter: React.FC<ResourceCenterProps> = ({ studentData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const studyMaterials = [
    {
      id: 1,
      title: 'Machine Learning Fundamentals - Lecture Notes',
      subject: 'Machine Learning',
      type: 'pdf',
      faculty: 'Dr. Smith',
      uploadDate: '2024-01-15',
      size: '2.5 MB',
      downloads: 45,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Data Structures Lab Manual',
      subject: 'Data Structures',
      type: 'pdf',
      faculty: 'Prof. Johnson',
      uploadDate: '2024-01-12',
      size: '1.8 MB',
      downloads: 38,
      rating: 4.6
    },
    {
      id: 3,
      title: 'Database Design Tutorial Video',
      subject: 'Database Systems',
      type: 'video',
      faculty: 'Dr. Brown',
      uploadDate: '2024-01-10',
      size: '125 MB',
      downloads: 22,
      rating: 4.9
    }
  ];

  const assignments = [
    {
      id: 1,
      title: 'ML Project: Sentiment Analysis',
      subject: 'Machine Learning',
      dueDate: '2024-01-25',
      status: 'pending',
      faculty: 'Dr. Smith',
      description: 'Build a sentiment analysis model using Python and scikit-learn',
      maxMarks: 100,
      submissionFormat: 'PDF + Code'
    },
    {
      id: 2,
      title: 'Database Schema Design',
      subject: 'Database Systems',
      dueDate: '2024-01-22',
      status: 'submitted',
      faculty: 'Dr. Brown',
      description: 'Design a normalized database schema for an e-commerce system',
      maxMarks: 50,
      submissionFormat: 'SQL File'
    }
  ];

  const examSchedule = [
    {
      id: 1,
      subject: 'Machine Learning',
      date: '2024-02-15',
      time: '10:00 AM - 1:00 PM',
      venue: 'Exam Hall A',
      type: 'Mid-term',
      syllabus: 'Chapters 1-5'
    },
    {
      id: 2,
      subject: 'Database Systems',
      date: '2024-02-18',
      time: '2:00 PM - 5:00 PM',
      venue: 'Exam Hall B',
      type: 'Mid-term',
      syllabus: 'Normalization, SQL, Transactions'
    }
  ];

  const careerResources = [
    {
      id: 1,
      title: 'Software Engineer Internship - Google',
      type: 'internship',
      company: 'Google',
      deadline: '2024-02-01',
      location: 'Bangalore',
      stipend: '₹50,000/month'
    },
    {
      id: 2,
      title: 'Data Science Workshop',
      type: 'workshop',
      company: 'Microsoft',
      deadline: '2024-01-28',
      location: 'Online',
      stipend: 'Free'
    },
    {
      id: 3,
      title: 'Full Stack Developer - Startup',
      type: 'job',
      company: 'TechStart Inc.',
      deadline: '2024-02-10',
      location: 'Hyderabad',
      stipend: '₹8-12 LPA'
    }
  ];

  const skillCourses = [
    {
      id: 1,
      title: 'Advanced Python Programming',
      provider: 'Coursera',
      duration: '6 weeks',
      rating: 4.7,
      enrolled: 1250,
      price: 'Free'
    },
    {
      id: 2,
      title: 'React.js Complete Guide',
      provider: 'Udemy',
      duration: '40 hours',
      rating: 4.8,
      enrolled: 2100,
      price: '₹1,999'
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'link': return <Link className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="ml">Machine Learning</SelectItem>
                <SelectItem value="ds">Data Structures</SelectItem>
                <SelectItem value="db">Database Systems</SelectItem>
                <SelectItem value="web">Web Development</SelectItem>
                <SelectItem value="se">Software Engineering</SelectItem>
                <SelectItem value="ai">AI Ethics</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="materials">Study Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
          <TabsTrigger value="career">Career Hub</TabsTrigger>
          <TabsTrigger value="skills">Skill Development</TabsTrigger>
        </TabsList>

        {/* Study Materials */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Study Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyMaterials.map((material) => (
                  <div key={material.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getFileIcon(material.type)}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{material.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span>{material.subject}</span>
                            <span>By {material.faculty}</span>
                            <span>{material.size}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {material.uploadDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {material.downloads} downloads
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {material.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold mb-1">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Subject: </span>
                        {assignment.subject}
                      </div>
                      <div>
                        <span className="font-medium">Due Date: </span>
                        {assignment.dueDate}
                      </div>
                      <div>
                        <span className="font-medium">Max Marks: </span>
                        {assignment.maxMarks}
                      </div>
                      <div>
                        <span className="font-medium">Format: </span>
                        {assignment.submissionFormat}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {assignment.status === 'pending' && (
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam Schedule */}
        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Examination Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examSchedule.map((exam) => (
                  <div key={exam.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{exam.subject}</h3>
                        <Badge variant="outline" className="mt-1">{exam.type}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{exam.date}</div>
                        <div className="text-sm text-gray-600">{exam.time}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Venue: </span>
                        {exam.venue}
                      </div>
                      <div>
                        <span className="font-medium">Syllabus: </span>
                        {exam.syllabus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Hub */}
        <TabsContent value="career">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Career Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careerResources.map((opportunity) => (
                  <div key={opportunity.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{opportunity.title}</h3>
                        <p className="text-sm text-gray-600">{opportunity.company}</p>
                      </div>
                      <Badge 
                        className={
                          opportunity.type === 'job' ? 'bg-green-100 text-green-800' :
                          opportunity.type === 'internship' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }
                      >
                        {opportunity.type.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Location: </span>
                        {opportunity.location}
                      </div>
                      <div>
                        <span className="font-medium">Deadline: </span>
                        {opportunity.deadline}
                      </div>
                      <div>
                        <span className="font-medium">Compensation: </span>
                        {opportunity.stipend}
                      </div>
                    </div>

                    <Button size="sm">
                      Apply Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Development */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skill Development Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillCourses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">By {course.provider}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {course.rating}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Enrolled:</span>
                        <span>{course.enrolled} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-semibold text-green-600">{course.price}</span>
                      </div>
                    </div>

                    <Button className="w-full" size="sm">
                      Enroll Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceCenter;