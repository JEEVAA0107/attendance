# SmartAttend Hub - n8n Automation Workflows

Complete collection of n8n workflows for automating attendance management.

## Workflows Overview

| Workflow | Purpose | Trigger | Actions |
|----------|---------|---------|---------|
| [daily-report.json](./daily-report.json) | Send daily attendance summary | 6 PM Schedule | Fetch data → Generate HTML → Email HOD |
| [sms-processor.json](./sms-processor.json) | Process SMS queue | Every 5 min | Fetch queue → Send via Twilio → Mark sent |
| [low-attendance-alerts.json](./low-attendance-alerts.json) | Alert low attendance | Webhook | Check threshold → SMS parents → Create notification |
| [request-status.json](./request-status.json) | Notify leave/correction status | Webhook | Process status → Notify student → Update records |
| [weekly-digest.json](./weekly-digest.json) | Weekly analytics email | Sunday 9 AM | Aggregate data → Generate report → Email |
| [anomaly-alerts.json](./anomaly-alerts.json) | AI anomaly notifications | Daily | Fetch anomalies → Alert HOD → Create tasks |

## Setup Instructions

### 1. Import Workflows
1. Open n8n dashboard
2. Go to Workflows → Import from File
3. Select the JSON file for the workflow

### 2. Configure Credentials
Create the following credentials in n8n:

**HTTP Request (for API calls)**
- Name: `SmartAttend API`
- Base URL: `http://your-backend-url/api`
- No authentication (or add Bearer token if protected)

**Twilio (for SMS)**
- Account SID: Your Twilio SID
- Auth Token: Your Twilio token
- Phone Number: Your Twilio phone

**SMTP (for Email)**
- Host: `smtp.gmail.com` (or your SMTP)
- Port: 587
- Username: Your email
- Password: App password

### 3. Configure Environment Variables
In n8n Settings → Variables, add:

```
SMARTATTEND_API_URL = http://localhost:8003
TWILIO_PHONE = +1234567890
SMTP_FROM = noreply@smartattend.com
HOD_EMAIL = hod@example.com
ALERT_THRESHOLD = 75
```

### 4. Activate Workflows
1. Open each workflow
2. Click "Activate" toggle
3. Verify webhook URLs are correct

## API Endpoints Used

### Data Fetch Endpoints (GET)
| Endpoint | Returns |
|----------|---------|
| `/api/webhooks/data/daily-summary` | Daily attendance stats |
| `/api/webhooks/data/low-attendance-students` | Students below threshold |
| `/api/webhooks/data/pending-requests` | Pending leaves/corrections |
| `/api/webhooks/data/sms-queue` | Pending SMS messages |

### Webhook Endpoints (POST)
| Endpoint | Purpose |
|----------|---------|
| `/api/webhooks/attendance-complete` | After marking attendance |
| `/api/webhooks/low-attendance-alert` | Low attendance trigger |
| `/api/webhooks/request-status` | Leave/correction status change |

### Update Endpoints (PUT)
| Endpoint | Purpose |
|----------|---------|
| `/api/webhooks/data/sms-queue/{id}/sent` | Mark SMS as sent |

### Trigger Endpoints (POST)
| Endpoint | Purpose |
|----------|---------|
| `/api/webhooks/trigger/daily-report` | Trigger daily report generation |
| `/api/webhooks/trigger/low-attendance-alerts` | Trigger bulk alerts |

## Customization

### Modify Thresholds
Edit the `ALERT_THRESHOLD` variable or update in individual workflows.

### Add WhatsApp
Replace Twilio SMS with Twilio WhatsApp or add as parallel action.

### Custom Templates
Modify the Code nodes to customize email/notification templates.

## Troubleshooting

### Workflow Not Triggering
- Check if workflow is activated
- Verify schedule/webhook configuration
- Check n8n execution logs

### API Connection Failed
- Verify SMARTATTEND_API_URL is correct
- Check if API server is running
- Test endpoint manually

### SMS Not Sending
- Verify Twilio credentials
- Check phone number format (+country code)
- Monitor Twilio console for errors
