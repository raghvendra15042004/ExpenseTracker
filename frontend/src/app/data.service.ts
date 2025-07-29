import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DataService {
  private baseUrl = 'http://localhost:8000';

  expenses = signal<any[]>([]);
  categories = signal<string[]>([]);
  profile = signal<any>(null);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // 💸 Expenses
  loadExpenses() {
    this.http.get<any[]>(`${this.baseUrl}/expenses`, { headers: this.getAuthHeaders() }).subscribe({
      next: (data) => this.expenses.set(data),
      error: (err) => console.error('Failed to load expenses:', err),
    });
  }

  addExpense(expense: any) {
    return this.http.post(`${this.baseUrl}/expenses`, expense, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.baseUrl}/expenses/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // 📂 Categories
  loadCategories() {
    this.http.get<any[]>(`${this.baseUrl}/categories`, {
      headers: this.getAuthHeaders(),
    }).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.categories.set(data.map(c => c.title));
        } else {
          console.error('Unexpected categories response:', data);
        }
      },
      error: (err) => console.error('Failed to load categories:', err),
    });
  }

  addCategory(category: string) {
    return this.http.post(`${this.baseUrl}/categories`, { title: category }, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCategory(title: string) {
    return this.http.delete(`${this.baseUrl}/categories/${title}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // 👤 Profile
  loadProfile() {
    this.http.get(`${this.baseUrl}/profile`, {
      headers: this.getAuthHeaders(),
    }).subscribe({
      next: (data) => this.profile.set(data),
      error: () => {
        console.warn('No profile found or unauthorized.');
        this.profile.set(null);
      },
    });
  }

  saveProfile(profileData: any) {
    return this.http.post(`${this.baseUrl}/profile`, profileData, {
      headers: this.getAuthHeaders(),
    });
  }

  // 💰 Computed Balance
  availableBalance = computed(() => {
    const prof = this.profile();
    const exp = this.expenses();
    if (!prof) return 0;

    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const lastMonthExpenses = exp
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    return prof.totalBudget - lastMonthExpenses;
  });
}
