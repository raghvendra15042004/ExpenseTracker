import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private api = 'http://localhost:8000/db';
  categories = signal<any[]>([]);
  expenses = signal<any[]>([]);
  profile = signal<any>({});
  totalExpenseCount = signal(0); 
  constructor(private http: HttpClient, private auth: AuthService) {}

  // Categories
  loadCategories() {
    this.http
      .get<any[]>(`${this.api}/categories`, {
        headers: this.auth.getAuthHeader(),
      })
      .subscribe((data) => this.categories.set(data));
  }

  addCategory(title: string) {
    return this.http.post(
      `${this.api}/categories`,
      { title },
      {
        headers: this.auth.getAuthHeader(),
      }
    );
  }

  deleteCategory(id: string) {
    return this.http.delete(`${this.api}/categories/${id}`, {
      headers: this.auth.getAuthHeader(),
    });
  }

  // Expenses
  loadExpenses(page:number, pageSize:number) {
    this.http
      .get<any>(`${this.api}/expenses?page=${page}&pageSize=${pageSize}`, {
        headers: this.auth.getAuthHeader(),
      })
      .subscribe((res) => {
        this.expenses.set(res.data);
        this.totalExpenseCount.set(res.total);
      });
  }

  addExpense(data: any) {
    return this.http.post(`${this.api}/expenses`, data, {
      headers: this.auth.getAuthHeader(),
    });
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.api}/expenses/${id}`, {
      headers: this.auth.getAuthHeader(),
    });
  }

  // Profile
  loadProfile() {
    this.http
      .get(`${this.api}/profile`, {
        headers: this.auth.getAuthHeader(),
      })
      .subscribe((p) => this.profile.set(p || {}));
  }

  saveProfile(data: any) {
    return this.http.post(`${this.api}/profile`, data, {
      headers: this.auth.getAuthHeader(),
    });
    
  }

  // Derived value
  availableBalance = computed(() => {
    const total = this.profile()?.totalBudget || 0;
    const month = new Date().getMonth();
    const spent = this.expenses()
      .filter((e) => new Date(e.date).getMonth() === month)
      .reduce((sum, e) => sum + e.amount, 0);
    return total - spent;
  });


  updateProfile(data: any) {
    // console.log(this.auth.getAuthHeader().get('Authorization'));
  return this.http.put(`http://localhost:8000/db/profile`, data, {
    headers: this.auth.getAuthHeader(),
  });
}

}
