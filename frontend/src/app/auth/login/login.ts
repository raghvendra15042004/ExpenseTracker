import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { PopupService } from '../../popup-message/popup.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
})
export class Login {
  username = '';
  password = '';

  // Forgot password state
  showForgot = false;
  forgotStep = 1;
  forgotEmail = '';
  otp = '';
  newPassword = '';

constructor(
  private auth: AuthService,
  private router: Router,
  private popup: PopupService
) {}
  onSubmit() {
    const data = { username: this.username, password: this.password };
    this.auth.login(data).subscribe({
      next: (res: any) => {
        this.auth.saveToken(res.access_token);
        this.popup.show('Login successful!', 'success');
        // Delay navigation to allow popup to show
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.popup.show('Login failed. Please check your credentials.', 'error');
      },
    });
  }

  // Forgot password logic
  sendOtp() {
    this.auth.sendPasswordResetOtp(this.forgotEmail).subscribe({
      next: () => {
        this.popup.show('OTP sent to your email', 'success');
        this.forgotStep = 2;
      },
      error: () => this.popup.show('Failed to send OTP. Please try again.', 'error'),
    });
  }

  resetPassword() {
    this.auth.verifyOtpAndResetPassword(this.forgotEmail, this.otp, this.newPassword).subscribe({
      next: () => {
        this.popup.show('Password reset successful!', 'success');
        this.closeForgot();
      },
      error: () => this.popup.show('Invalid OTP or error resetting password', 'error'),
    });
  }

  closeForgot() {
    this.showForgot = false;
    this.forgotStep = 1;
    this.forgotEmail = '';
    this.otp = '';
    this.newPassword = '';
  }
}
