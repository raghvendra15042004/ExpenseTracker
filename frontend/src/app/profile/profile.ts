import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { DataService } from '../data.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private data = inject(DataService);

  name = signal('');
  email = signal('');
  password = signal('');
  loading = signal(true);

  categories = this.data.categories;
  expenses = this.data.expenses;

  totalCategories = computed(() => this.categories().length);
  totalEntries = computed(() => this.expenses().length);

  lastMonthTotal = computed(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return this.expenses().reduce((sum, exp) => {
      const date = new Date(exp.date);
      if (date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()) {
        return sum + exp.amount;
      }
      return sum;
    }, 0);
  });

  ngOnInit() {
    this.auth.getCurrentUser().subscribe({
      next: (user) => {
        this.name.set(user.name);
        this.email.set(user.email);
        this.loading.set(false);
        this.renderChart(); // after data loads
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  renderChart() {
    const ctx = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!ctx) return;

    const monthly = Array(12).fill(0);
    this.expenses().forEach((exp) => {
      const date = new Date(exp.date);
      const month = date.getMonth();
      monthly[month] += exp.amount;
    });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
        datasets: [
          {
            label: 'Monthly Expenses (₹)',
            data: monthly,
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `₹${val}`
            }
          }
        }
      }
    });
  }



  showEditModal = signal(false);

form: {
  name?: string;
  avatar?: string;
  totalBudget?: number;
  password?: string;
} = {};



openEditModal() {
  const current = this.data.profile();
  this.form = {
    name: current.name || '',
    avatar: current.avatar || '',
    totalBudget: current.totalBudget || 0,
    password: ''
  };
  this.showEditModal.set(true);
}

closeEditModal() {
  this.showEditModal.set(false);
}

submitProfileUpdate() {
  console.log(this.auth.getAuthHeader().get('Authorization'));
  const payload = { ...this.form };
  if (!payload.password) delete payload.password; // send only if updated

  this.data.updateProfile(payload).subscribe({
    next: () => {
      this.data.loadProfile(); // Refresh view
      this.showEditModal.set(false);
    },
    error: (err) => {
      console.error('Update failed:', err);
    },
  });
}

}
