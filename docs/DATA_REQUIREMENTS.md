# SmartAttend Hub - Data Requirements & Storage

## Data Storage Requirements by Role

### HOD Portal Data Requirements

#### Faculty Management Data
- **Personal Information**: Name, Employee ID, Email, Phone, Address
- **Professional Details**: Designation, Department, Date of Joining, Qualifications
- **System Access**: Login credentials, Role permissions, Biometric ID
- **Assignment Data**: Subjects taught, Classes assigned, Timetable
- **Performance Metrics**: Teaching hours, Student feedback, Attendance marking accuracy

#### Student Management Data
- **Personal Information**: Name, Roll Number, Email, Phone, Parent Contact
- **Academic Details**: Department, Batch Year, Semester, Class Section
- **Biometric Data**: Fingerprint/Face recognition ID for attendance
- **Academic Records**: Grades, Attendance percentage, Performance trends
- **Behavioral Data**: Disciplinary records, Leave requests, Corrections

#### Department Analytics Data
- **Attendance Statistics**: Department-wide attendance trends
- **Performance Metrics**: Class-wise performance comparison
- **Resource Utilization**: Faculty workload, Classroom usage
- **Compliance Reports**: Regulatory compliance data

### Faculty Portal Data Requirements

#### Assigned Student Data
- **Class Lists**: Students in assigned classes only
- **Attendance Records**: Historical and current attendance data
- **Academic Performance**: Grades and assessment scores
- **Personal Information**: Contact details, emergency contacts
- **Behavioral Notes**: Classroom behavior, participation levels

#### Attendance Management Data
- **Daily Attendance**: Date, Time, Subject, Status (Present/Absent/Late)
- **Biometric Verification**: Fingerprint/Face match confirmation
- **Attendance Corrections**: Modification requests and approvals
- **Leave Records**: Approved leaves affecting attendance

#### Class Analytics Data
- **Attendance Trends**: Weekly/Monthly attendance patterns
- **Performance Analysis**: Subject-wise student performance
- **Engagement Metrics**: Participation and interaction data
- **Progress Tracking**: Individual student progress over time

### Student Portal Data Requirements

#### Personal Profile Data
- **Basic Information**: Name, Roll Number, Contact details
- **Academic Information**: Department, Semester, Subjects enrolled
- **Emergency Contacts**: Parent/Guardian contact information
- **Preferences**: Notification settings, Language preferences

#### Attendance Data (Read-Only)
- **Daily Records**: Date-wise attendance status
- **Subject-wise Summary**: Attendance percentage per subject
- **Monthly Reports**: Attendance trends and patterns
- **Alerts**: Low attendance warnings

#### Request Management Data
- **Leave Requests**: Date range, Reason, Approval status
- **Attendance Corrections**: Disputed attendance records
- **Academic Requests**: Grade reviews, Certificate requests
- **Communication**: Messages from faculty/administration

## Database Storage Structure

### Primary Data Tables

#### User Authentication
```sql
users: id, email, password_hash, role, is_active, created_at
user_sessions: user_id, token, expires_at, device_info
```

#### Organizational Structure
```sql
departments: id, name, code, hod_id
classes: id, name, department_id, batch_year, semester, section
subjects: id, name, code, department_id, semester, credits
```

#### Personnel Data
```sql
faculty: id, user_id, employee_id, name, designation, department_id, biometric_id
students: id, user_id, roll_number, name, department_id, class_id, biometric_id
```

#### Academic Operations
```sql
timetable: id, class_id, subject_id, faculty_id, day_of_week, start_time, end_time
faculty_subjects: faculty_id, subject_id, class_id, academic_year
attendance: id, student_id, subject_id, date, status, marked_by, biometric_verified
```

#### Administrative Data
```sql
leave_requests: id, student_id, start_date, end_date, reason, status, approved_by
attendance_corrections: id, attendance_id, requested_status, reason, status
notifications: id, recipient_id, title, message, type, is_read
events: id, title, description, event_type, start_date, department_id
```

### Data Relationships

#### HOD Access Hierarchy
```
HOD → All Departments → All Faculty → All Students
    → All Classes → All Subjects → All Attendance Records
    → System Analytics → Compliance Reports
```

#### Faculty Access Scope
```
Faculty → Assigned Subjects → Assigned Classes → Enrolled Students
        → Subject Attendance → Class Performance → Student Progress
```

#### Student Access Boundary
```
Student → Personal Profile → Own Attendance → Own Grades
        → Class Timetable → Leave Requests → Notifications
```

## Data Security & Privacy

### Sensitive Data Protection
- **Biometric Data**: Encrypted storage, Hash-based matching
- **Personal Information**: PII encryption, Access logging
- **Academic Records**: Integrity checks, Audit trails
- **Authentication**: Salted password hashing, JWT tokens

### Access Control Matrix
| Data Type | HOD | Faculty | Student |
|-----------|-----|---------|---------|
| All Faculty Data | Full CRUD | Read Own | None |
| All Student Data | Full CRUD | Read Assigned | Read Own |
| Attendance Records | Full Access | Assigned Classes | Own Records |
| Analytics | Department-wide | Class-specific | Personal Only |
| System Configuration | Full Control | Limited | None |

### Audit & Compliance
- **Data Access Logs**: Who accessed what data when
- **Modification Tracking**: All CRUD operations logged
- **Compliance Reports**: FERPA, GDPR compliance tracking
- **Backup & Recovery**: Automated backups, Point-in-time recovery

## Performance Optimization

### Database Indexing Strategy
```sql
-- Primary indexes for fast lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_faculty_employee_id ON faculty(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student_subject ON attendance(student_id, subject_id);
```

### Caching Strategy
- **User Sessions**: Redis cache for active sessions
- **Frequently Accessed Data**: Student lists, Faculty assignments
- **Analytics Data**: Pre-computed reports cached for 1 hour
- **Static Data**: Departments, Subjects cached for 24 hours

### Data Archival
- **Old Attendance Records**: Archive after 2 years
- **Graduated Students**: Move to archive database
- **Inactive Faculty**: Soft delete with retention period
- **System Logs**: Rotate logs monthly, keep 1 year

## Integration Requirements

### External System Connections
- **Biometric Devices**: Real-time attendance capture
- **Academic Management System**: Grade synchronization
- **Parent Portal**: Attendance notifications
- **Mobile App**: Push notifications for alerts

### API Data Exchange
```json
{
  "attendance_sync": {
    "student_id": "uuid",
    "subject_id": "uuid", 
    "timestamp": "datetime",
    "biometric_match": "boolean",
    "device_id": "string"
  },
  "notification_payload": {
    "recipient_role": "string",
    "message_type": "string",
    "data": "object",
    "priority": "enum"
  }
}
```

## Backup & Disaster Recovery

### Backup Strategy
- **Real-time Replication**: Master-slave database setup
- **Daily Backups**: Full database backup at midnight
- **Weekly Archives**: Compressed backups for long-term storage
- **Cross-region Backup**: Disaster recovery in different geographic location

### Recovery Procedures
- **RTO (Recovery Time Objective)**: 15 minutes maximum downtime
- **RPO (Recovery Point Objective)**: Maximum 1 hour data loss
- **Automated Failover**: Immediate switch to backup systems
- **Data Integrity Checks**: Automated verification after recovery