export interface N8nWebhookData {
  reportType: 'daily' | 'weekly' | 'monthly';
  date: string;
  batch?: string;
  stats: {
    totalStudents: number;
    presentStudents: number;
    absentStudents: number;
    attendancePercentage: number;
  };
  studentRecords: any[];
}

export class N8nIntegration {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendAttendanceData(data: N8nWebhookData): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: 'SmartAttend Hub',
          ...data,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('N8n webhook failed:', error);
      return false;
    }
  }

  async sendDailyReport(reportData: any): Promise<boolean> {
    return this.sendAttendanceData({
      reportType: 'daily',
      date: reportData.dateRange.start,
      batch: reportData.batch,
      stats: reportData.stats,
      studentRecords: reportData.studentRecords,
    });
  }

  static createWebhookUrl(n8nInstance: string, webhookId: string): string {
    return `${n8nInstance}/webhook/${webhookId}`;
  }
}