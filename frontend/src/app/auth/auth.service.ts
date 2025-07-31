import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { decodeToken } from './token.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8000/auth';
  token = signal(localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { name: string; email: string; password: string }) {
    console.log('Registering user:', data);
    
    return this.http.post(`${this.baseUrl}/register`, data);
  }

   login(data: { username: string; password: string }) {
    // FastAPI expects form data, not JSON
    const body = new URLSearchParams();
    body.set('username', data.username);
    body.set('password', data.password);

    return this.http.post<{ access_token: string }>(
      `${this.baseUrl}/login`,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return !!this.token();
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.token.set(token);
  }

  getToken() {
    return this.token();
  }

getAuthHeader(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return new HttpHeaders(); // Always return a valid HttpHeaders instance
  }

  getUserInfo() {
    const token = this.getToken();
    return token ? decodeToken(token) : null;
  }

  getCurrentUser() {
    return this.http.get<{ name: string; email: string }>(
      `${this.baseUrl}/me`,
      { headers: this.getAuthHeader() }
    );
  }

  sendPasswordResetOtp(email: string) {
  return this.http.post(`${this.baseUrl}/send-otp`, { email });
}

verifyOtpAndResetPassword(email: string, otp: string, newPassword: string) {
  return this.http.post(`${this.baseUrl}/verify-reset-otp`, {
    email,
    otp,
    new_password: newPassword,
  });
}

}
