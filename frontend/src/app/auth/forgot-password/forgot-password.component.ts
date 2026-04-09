import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email = '';
  generatedCode = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  sendCode() {
    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.generatedCode = res.code;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Email not found';
        this.loading = false;
      }
    });
  }

  goToReset() {
    this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email } });
  }
}
