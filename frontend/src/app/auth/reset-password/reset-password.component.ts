import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetData = {
    email: '',
    code: '',
    newPassword: ''
  };
  error = '';
  showDialog = false;
  dialogMessage = '';

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.resetData.email = this.route.snapshot.queryParams['email'] || '';
  }

  submitReset() {
    this.authService.resetPassword(this.resetData).subscribe({
      next: () => {
        this.dialogMessage = 'Password changed successfully!';
        this.showDialog = true;
      },
      error: (err) => this.error = err.error.message
    });
  }

  onDialogConfirm(confirmed: boolean) {
    this.showDialog = false;
    if (confirmed) {
      this.router.navigate(['/auth/login']);
    }
  }
}