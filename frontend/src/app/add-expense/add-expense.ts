// src/app/add-expense/add-expense.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { MatButtonModule } from '@angular/material/button';
import { PopupService } from '../popup-message/popup.service';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './add-expense.html',
})
export class AddExpense {
  dataService = inject(DataService);
  popup = inject(PopupService);

  desc = '';
  amount: number | null = null;
  date = '';
  category = '';

  constructor() {
    this.dataService.loadCategories(); // Load categories for dropdown
  }

  addExpense() {
  if (!this.desc || !this.amount || !this.date) {
    this.popup.show('Please fill all required fields', 'error');
    return;
  }

  const expense = {
    description: this.desc.trim(), // ✅ changed key from 'desc' to 'description'
    amount: this.amount,
    date: new Date(this.date).toISOString(),
    category: this.category ? { title: this.category } : undefined
  };


  this.dataService.addExpense(expense).subscribe({
    next: () => {
        this.popup.show('Expense added successfully!', 'success');
        this.desc = '';
        this.amount = null;
        this.date = '';
        this.category = '';
      },
      error: err => {
        const message = err.error?.detail || JSON.stringify(err.error);
        this.popup.show(`Error: ${message}`, 'error');
      }
    });
  }

}
