# n8n Workflow Guide for SmartAttend Hub

## Purpose of n8n Integration

n8n workflows automate critical attendance management tasks:

1. **Automated Report Generation** - Daily/weekly attendance reports
2. **Email Notifications** - Send reports to faculty and administration
3. **Excel Export Automation** - Generate and distribute Excel files
4. **Data Backup** - Automated database backups to cloud storage
5. **Alert System** - Low attendance warnings and notifications
6. **Integration Hub** - Connect with college ERP systems

## Required n8n Nodes

### Core Nodes
- **Cron** - Schedule automated tasks
- **Postgres** - Database operations with Neon DB
- **HTTP Request** - API calls to SmartAttend Hub
- **Code** - Custom JavaScript logic
- **IF** - Conditional logic
- **Set** - Data transformation

### Communication Nodes (FREE)
- **Gmail** - Email notifications (Free Gmail account)
- **Discord** - Team notifications (Free)
- **Telegram** - Mobile alerts (Free)

### File & Storage Nodes (FREE)
- **Spreadsheet File** - Excel generation (Built-in)
- **Google Drive** - File storage (15GB free)
- **GitHub** - Code/file backup (Free public repos)
- **FTP** - File transfer (Built-in)

### Integration Nodes (FREE)
- **Webhook** - Receive data from SmartAttend (Built-in)
- **Google Sheets** - Online spreadsheet sync (Free)
- **CSV** - Data export (Built-in)

## Workflow 1: Daily Attendance Report

### Purpose
Generate and email daily attendance reports to faculty and HOD.

### Nodes Setup (FREE TOOLS ONLY)
```
1. Cron (Daily 6 PM)
   ├── Postgres (Fetch attendance data)
   ├── Code (Calculate statistics)
   ├── Spreadsheet File (Generate Excel)
   ├── Gmail (Send to faculty - Free Gmail)
   └── Google Drive (Save backup - 15GB free)
```

### Configuration

#### 1. Cron Node
```json
{
  "mode": "everyDay",
  "hour": 18,
  "minute": 0,
  "timezone": "Asia/Kolkata"
}
```

#### 2. Postgres Node
```sql
SELECT 
  f.name as faculty_name,
  s.name as subject_name,
  COUNT(al.id) as total_classes,
  COUNT(CASE WHEN al.status = 'present' THEN 1 END) as present_count,
  ROUND(COUNT(CASE WHEN al.status = 'present' THEN 1 END) * 100.0 / COUNT(al.id), 2) as attendance_percentage
FROM attendance_logs al
JOIN faculty f ON f.id = al.faculty_id
JOIN subjects s ON s.id = al.subject_id
WHERE DATE(al.created_at) = CURRENT_DATE
GROUP BY f.name, s.name
ORDER BY f.name, s.name;
```

#### 3. Code Node (Statistics)
```javascript
const items = $input.all();
const stats = {
  totalClasses: items.length,
  avgAttendance: items.reduce((sum, item) => sum + item.json.attendance_percentage, 0) / items.length,
  lowAttendance: items.filter(item => item.json.attendance_percentage < 75),
  date: new Date().toLocaleDateString('en-IN')
};

return [{ json: { stats, data: items.map(item => item.json) } }];
```

#### 4. Gmail Node
```json
{
  "to": "hod.aids@college.edu,admin@college.edu",
  "subject": "Daily Attendance Report - {{ $json.stats.date }}",
  "emailType": "html",
  "message": "Please find attached the daily attendance report."
}
```

## Workflow 2: Weekly Excel Export

### Purpose
Generate comprehensive weekly attendance Excel reports with charts and analytics.

### Nodes Setup (FREE TOOLS ONLY)
```
1. Cron (Every Friday 5 PM)
   ├── Postgres (Weekly data)
   ├── Code (Process data)
   ├── Spreadsheet File (Generate Excel - Built-in)
   ├── Google Drive (Upload - Free 15GB)
   └── Discord (Notify completion - Free)
```

### Configuration

#### Excel Template Structure
```
Sheet 1: Summary
- Faculty-wise attendance summary
- Subject-wise statistics
- Department overview

Sheet 2: Detailed Data
- Day-wise attendance records
- Student-wise breakdown
- Time-based analysis

Sheet 3: Charts
- Attendance trends
- Faculty performance
- Subject-wise comparison
```

## Workflow 3: Low Attendance Alert System

### Purpose
Monitor attendance patterns and send alerts for students with low attendance.

### Nodes Setup (FREE TOOLS ONLY)
```
1. Cron (Daily 8 AM)
   ├── Postgres (Check attendance)
   ├── IF (Attendance < 75%)
   ├── Code (Format alert)
   ├── Gmail (Faculty notification - Free)
   └── Telegram (Parent notification - Free)
```

### Configuration

#### Alert Criteria
- Attendance below 75%
- 3+ consecutive absences
- Subject-specific low attendance

## Workflow 4: Database Backup Automation

### Purpose
Automated daily backup of attendance data to cloud storage.

### Nodes Setup (FREE TOOLS ONLY)
```
1. Cron (Daily 2 AM)
   ├── Postgres (Export data)
   ├── Code (Compress data)
   ├── Google Drive (Upload backup - Free 15GB)
   └── Gmail (Backup confirmation - Free)
```

## Setup Guide

### Step 1: n8n Installation (FREE)
```bash
# Install n8n Community Edition (FREE)
npm install n8n -g

# Or use Docker (FREE)
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# Start n8n
n8n start

# For production (FREE hosting options):
# - Railway.app (Free tier)
# - Render.com (Free tier)
# - Heroku (Free alternative: Railway)
```

### Step 2: Database Connection
1. Add Postgres credentials in n8n
2. Configure Neon DB connection string
3. Test database connectivity

### Step 3: Email Configuration
1. Setup Gmail App Password
2. Configure SMTP settings
3. Test email delivery

### Step 4: Free Cloud Storage Setup
1. Google Drive (15GB free)
   - Create Google account
   - Enable Google Drive API (Free)
   - Generate service account credentials
2. GitHub (Unlimited public repos)
   - Create GitHub account
   - Generate personal access token
3. Alternative: Dropbox (2GB free)

### Step 5: Webhook Integration
1. Create webhook endpoint in SmartAttend
2. Configure n8n webhook receiver
3. Test data flow

## Environment Variables

```env
# n8n Configuration (FREE)
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_password

# Database (Neon DB - FREE tier)
POSTGRES_HOST=your-neon-host
POSTGRES_DB=your-database
POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password

# Email (Gmail - FREE)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Cloud Storage (Google Drive - FREE 15GB)
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token

# Notifications (Telegram - FREE)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Integration Points

### SmartAttend → n8n
- Webhook triggers on attendance save
- Real-time data sync
- Event-driven automation

### n8n → External Systems
- College ERP integration
- Parent notification system
- Academic management system

## Monitoring & Maintenance

### Workflow Monitoring
- Setup execution logs
- Error notifications
- Performance metrics

### Data Validation
- Attendance data integrity
- Report accuracy checks
- Backup verification

### Security
- Encrypted connections
- Secure credential storage
- Access control

## Benefits

1. **Time Savings** - Automated report generation
2. **Accuracy** - Reduced manual errors
3. **Compliance** - Regular backup and reporting
4. **Insights** - Advanced analytics and trends
5. **Communication** - Automated notifications
6. **Integration** - Seamless system connectivity

## FREE Production Setup

### Hosting Options (FREE)
1. **Railway.app** - Free tier with 500 hours/month
2. **Render.com** - Free tier with auto-sleep
3. **Fly.io** - Free allowances for small apps
4. **Self-hosted** - VPS or local server

### Storage Limits (FREE)
- **Google Drive**: 15GB free
- **GitHub**: Unlimited public repositories
- **Neon DB**: 512MB free tier
- **Telegram**: Unlimited messages

### Cost Optimization
- Use n8n Community Edition (100% Free)
- Optimize workflow execution frequency
- Efficient database queries
- Compress files before storage
- Use free tier limits wisely

### Production Checklist (ALL FREE)
✅ n8n Community Edition
✅ Neon DB free tier
✅ Gmail for notifications
✅ Google Drive for storage
✅ Telegram for alerts
✅ Railway.app for hosting
✅ GitHub for backups

**Total Cost: $0/month**