const API_BASE_URL = 'http://localhost:8003/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  biometric_id: string;
  department: string;
  email: string;
  created_at: string;
}

export interface FacultyCreate {
  name: string;
  designation: string;
  biometric_id: string;
  department?: string;
  email: string;
}

export interface FacultyUpdate {
  name?: string;
  designation?: string;
  biometric_id?: string;
  department?: string;
  email?: string;
}

export interface FacultyCredentials {
  name: string;
  email: string;
  password: string;
  message: string;
}

export const api = {
  async loginHod(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/hod/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  async loginFaculty(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/faculty/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  async getFaculty(): Promise<FacultyMember[]> {
    const response = await fetch(`${API_BASE_URL}/faculty/`);
    if (!response.ok) throw new Error('Failed to fetch faculty');
    return response.json();
  },

  async createFaculty(faculty: FacultyCreate): Promise<FacultyMember> {
    const response = await fetch(`${API_BASE_URL}/faculty/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faculty),
    });
    if (!response.ok) throw new Error('Failed to create faculty');
    return response.json();
  },

  async updateFaculty(id: string, faculty: FacultyUpdate): Promise<FacultyMember> {
    const response = await fetch(`${API_BASE_URL}/faculty/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faculty),
    });
    if (!response.ok) throw new Error('Failed to update faculty');
    return response.json();
  },

  async deleteFaculty(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/faculty/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete faculty');
  }
};