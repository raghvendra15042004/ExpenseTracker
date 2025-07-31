import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../data.service';
import { AuthService } from '../auth/auth.service';
import { PopupService } from '../popup-message/popup.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './settings.html',
})
export class Settings {
  dataService = inject(DataService);
  auth = inject(AuthService);
  popup = inject(PopupService);

  newCategoryValue: string = '';

  constructor() {
    this.refreshCategories();
  }

  cat = this.dataService.categories;
  
  get categoryList() {
    return this.dataService.categories();
     // this is how you bind to a signal in template
  }


  refreshCategories() {
    this.dataService.loadCategories();
  }

  addCategory() {
    const title = this.newCategoryValue.trim();
    if (!title) return;

    this.dataService.addCategory(title).subscribe({
      next: () => {
        this.newCategoryValue = '';
        this.refreshCategories();
      },
      error: err => this.popup.show(err.error?.detail || 'Failed to add category', 'error'),
    });
  }

  deleteCategory(title: string) {
    this.dataService.deleteCategory(title).subscribe({
      next: () => this.refreshCategories(),
      error: err => this.popup.show(err.error?.detail || 'Failed to delete category', 'error'),
    });
  }

  logout() {
    this.auth.logout();
  }
}
