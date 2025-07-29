import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../data.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './settings.html',
})
export class Settings {
  dataService = inject(DataService);
  auth = inject(AuthService);

  newCategoryValue: string = '';

  constructor() {
    this.refreshCategories();
  }

  
  myCategoryList:any={}
  get_categoryList() {
    this.myCategoryList=this.dataService.loadCategories(); // unwrap the signal for the template
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
      error: err => alert(err.error?.detail || 'Failed to add category'),
    });
  }

  deleteCategory(title: string) {
    this.dataService.deleteCategory(title).subscribe({
      next: () => this.refreshCategories(),
      error: err => alert(err.error?.detail || 'Failed to delete category'),
    });
  }

  logout() {
    this.auth.logout();
  }
}
