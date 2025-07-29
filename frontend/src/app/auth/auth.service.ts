import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8000/auth';
  token = signal(localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/login`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
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

  getAuthHeader() {
    return { Authorization: `Bearer ${this.token()}` };
  }
}
