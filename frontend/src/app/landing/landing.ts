// landing.ts
import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './landing.html',
})
export class Landing implements OnInit {
  dataService = inject(DataService);

  currentPage = 1;
  pageSize = 4;

  filterDate: string = '';
  filterCategory: string = '';
  filterAmount: string = '';

  ngOnInit() {
    
    this.loadExpenses();
  }

  loadExpenses() {
    this.dataService.loadExpenses(this.currentPage, this.pageSize);
  }

  get paginatedExpenses() {
    // filtering happens only on current page data
    return this.dataService.expenses().filter((exp) => {
      const matchesDate = this.filterDate ? exp.date.startsWith(this.filterDate) : true;
      const matchesCategory = this.filterCategory
        ? exp.category?.title.toLowerCase().includes(this.filterCategory.toLowerCase())
        : true;
      const matchesAmount = this.filterAmount
        ? exp.amount.toString().includes(this.filterAmount)
        : true;
      return matchesDate && matchesCategory && matchesAmount;
    });
  }

  get totalPages() {
    return Math.ceil(this.dataService.totalExpenseCount() / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadExpenses();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadExpenses();
    }
  }

  deleteExpense(id: string) {
    if (confirm("Are you sure you want to delete this expense?")) {
      this.dataService.deleteExpense(id).subscribe({
        next: () => this.loadExpenses(),
        error: err => alert(err.error.detail || 'Failed to delete expense'),
      });
    }
  }

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();

  monthlyTotal = computed(() =>
    this.dataService.expenses().reduce((sum, exp) => {
      const d = new Date(exp.date);
      return d.getMonth() === this.currentMonth && d.getFullYear() === this.currentYear
        ? sum + exp.amount
        : sum;
    }, 0)
  );

  annualTotal = computed(() =>
    this.dataService.expenses().reduce((sum, exp) => {
      const d = new Date(exp.date);
      return d.getFullYear() === this.currentYear ? sum + exp.amount : sum;
    }, 0)
  );

  categoryTotals = computed(() => {
    const totals: { [key: string]: number } = {};
    this.dataService.expenses().forEach((exp: any) => {
      const category = exp.category?.title || 'Uncategorized';
      totals[category] = (totals[category] || 0) + exp.amount;
    });
    return totals;
  });

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
