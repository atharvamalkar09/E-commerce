import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',

})
export class ResetPasswordComponent implements OnInit {
  resetData = {
    email: '',
    code: '',
    newPassword: ''
  };
  error = '';

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Automatically grab email from URL if user clicked "Go to Reset Form"
    this.resetData.email = this.route.snapshot.queryParams['email'] || '';
  }

  submitReset() {
    this.authService.resetPassword(this.resetData).subscribe({
      next: () => {
        alert('Password changed successfully! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => this.error = err.error.message
    });
  }
}