import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // ✅ add RouterModule
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ✅ add RouterModule here
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    const data = { email: this.email, password: this.password };
    console.log(data);
    this.auth.login(data).subscribe({
      next: (res: any) => {
        this.auth.saveToken(res.access_token);
        alert('Login successful!');
        this.router.navigate(['/dashboard']); // go to dashboard after login
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Login failed. Please check your credentials.');
      },
    });
  }

}
