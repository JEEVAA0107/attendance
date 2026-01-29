/**
 * SmartAttend Hub - API Client
 * Comprehensive API service for all backend interactions
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003/api';

// ============================================
// Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UniqueIdLoginRequest {
  unique_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  user_id: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // ============================================
  // Authentication
  // ============================================

  async loginHod(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/hod/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async loginFaculty(credentials: LoginRequest | UniqueIdLoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/faculty/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async loginStudent(credentials: LoginRequest | UniqueIdLoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    return this.handleResponse(response);
  }

  async verifyToken(): Promise<{ valid: boolean; user: any }> {
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // ============================================
  // HOD Endpoints
  // ============================================

  async getHodDashboard(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/hod/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getHodProfile(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/hod/profile`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Faculty Management (HOD)
  async getFaculty(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/hod/faculty`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createFaculty(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/hod/faculty`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateFaculty(id: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/hod/faculty/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteFaculty(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/hod/faculty/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(error.detail);
    }
  }

  // Student Management (HOD)
  async getStudents(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/hod/students`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createStudent(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/hod/students`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async createStudentsBulk(students: any[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/hod/students/bulk`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ students }),
    });
    return this.handleResponse(response);
  }

  async updateStudent(id: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/hod/students/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteStudent(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/hod/students/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(error.detail);
    }
  }

  // Assignments (HOD)
  async getAssignments(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/hod/assignments`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createAssignment(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/hod/assignments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getLowAttendanceStudents(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/hod/low-attendance`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // ============================================
  // Faculty Endpoints
  // ============================================

  async getFacultyDashboard(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/faculty/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getFacultyProfile(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/faculty/profile`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAssignedClasses(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/faculty/assigned-classes`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getClassStudents(classId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/faculty/classes/${classId}/students`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Attendance Sessions
  async getTodaySessions(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/faculty/sessions/today`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createSession(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/faculty/sessions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async completeSession(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/faculty/sessions/${sessionId}/complete`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Attendance Marking
  async markAttendance(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/faculty/attendance/mark`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getSessionAttendance(sessionId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/faculty/attendance/session/${sessionId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Leave Requests (Faculty)
  async getPendingLeaveRequests(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/faculty/leave-requests/pending`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async reviewLeaveRequest(id: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/faculty/leave-requests/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Corrections (Faculty)
  async getPendingCorrections(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/faculty/corrections/pending`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async reviewCorrection(id: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/faculty/corrections/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // ============================================
  // Student Endpoints
  // ============================================

  async getStudentDashboard(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/student/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getStudentProfile(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/student/profile`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAttendanceSummary(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/student/attendance/summary`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAttendanceHistory(limit: number = 50): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/student/attendance/history?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Leave Requests (Student)
  async getMyLeaveRequests(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/student/leave-requests`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async submitLeaveRequest(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/student/leave-requests`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async cancelLeaveRequest(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/student/leave-requests/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Cancel failed' }));
      throw new Error(error.detail);
    }
  }

  // Corrections (Student)
  async getMyCorrections(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/student/corrections`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async submitCorrection(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/student/corrections`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/student/notifications`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async markNotificationsRead(ids: string[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/student/notifications/mark-read`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notification_ids: ids }),
    });
    return this.handleResponse(response);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await fetch(`${this.baseUrl}/student/notifications/unread-count`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Timetable
  async getTimetable(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/student/timetable`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // ============================================
  // Analytics Endpoints
  // ============================================

  async getDepartmentOverview(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/analytics/department/overview`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getDepartmentTrends(days: number = 30): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/analytics/department/trends?days=${days}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getClassComparison(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/analytics/department/class-comparison`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getClassOverview(classId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/analytics/class/${classId}/overview`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getClassRankings(classId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/analytics/class/${classId}/rankings`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getStudentAnalytics(studentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/analytics/student/${studentId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAtRiskStudents(threshold: number = 75): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/analytics/department/at-risk?threshold=${threshold}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // ============================================
  // Attendance Endpoints
  // ============================================

  async verifyStudentId(sessionId: string, uniqueId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/attendance/verify-id?session_id=${sessionId}&unique_id=${uniqueId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getClassAttendanceHistory(classId: string, startDate?: string, endDate?: string): Promise<any[]> {
    let url = `${this.baseUrl}/attendance/history/class/${classId}`;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getClassSummary(classId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/attendance/summary/class/${classId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Legacy export for backward compatibility
export const api = {
  loginHod: (credentials: LoginRequest) => apiClient.loginHod(credentials),
  loginFaculty: (credentials: LoginRequest) => apiClient.loginFaculty(credentials),
  getFaculty: () => apiClient.getFaculty(),
  createFaculty: (data: any) => apiClient.createFaculty(data),
  updateFaculty: (id: string, data: any) => apiClient.updateFaculty(id, data),
  deleteFaculty: (id: string) => apiClient.deleteFaculty(id),
};