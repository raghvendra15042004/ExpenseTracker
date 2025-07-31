import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { PopupService } from '../../popup-message/popup.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router, private popup: PopupService) {}

  onSubmit() {
    const data = { name: this.name, email: this.email, password: this.password };
    this.auth.register(data).subscribe({
      next: () => {
        this.popup.show('Registration successful! Please login.', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.popup.show('Registration failed. Please try again.', 'error');
      }
    });
  }
}
