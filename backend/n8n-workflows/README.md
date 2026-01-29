# SmartAttend Hub - n8n Workflow Templates

This directory contains n8n workflow JSON files that can be imported into n8n for automation.

## Workflows

### 1. Daily Attendance Report (`daily-report.json`)
- **Trigger**: Schedule (6 PM daily)
- **Actions**: 
  - Fetch daily summary from API
  - Generate HTML report
  - Send email to HOD

### 2. Low Attendance Alerts (`low-attendance-alerts.json`)
- **Trigger**: Webhook from API
- **Actions**:
  - Check students below 75% attendance
  - Send SMS to parents via Twilio/WhatsApp
  - Create notification in system

### 3. Leave Request Notification (`leave-request-notify.json`)
- **Trigger**: Webhook when leave status changes
- **Actions**:
  - Send SMS to student
  - Send email notification
  - Update request status

### 4. SMS Queue Processor (`sms-queue-processor.json`)
- **Trigger**: Schedule (every 5 minutes)
- **Actions**:
  - Fetch pending SMS from queue
  - Send via Twilio
  - Mark as sent

## Setup Instructions

1. Import the JSON file into n8n
2. Configure credentials:
   - Twilio/SMS API
   - SMTP for email
   - API endpoint URL
3. Update webhook URLs in SmartAttend `.env`:
   ```
   SMS_WEBHOOK_URL=https://your-n8n.instance/webhook/xxx
   ```
4. Activate workflows

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/webhooks/data/daily-summary` | Daily analytics |
| `GET /api/webhooks/data/low-attendance-students` | At-risk students |
| `GET /api/webhooks/data/sms-queue` | Pending SMS |
| `PUT /api/webhooks/data/sms-queue/{id}/sent` | Mark SMS sent |
| `POST /api/webhooks/attendance-complete` | After attendance marked |
| `POST /api/webhooks/low-attendance-alert` | Low attendance trigger |
