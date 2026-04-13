import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  constructor(private http: HttpClient) {}

  user = { name: '', email: '' };
  passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };
  message = '';
  isError = false;

  ngOnInit() {
    this.http.get<any>('http://localhost:4000/api/auth/me').subscribe({
      next: (data) => {
        this.user.name = data.name;
        this.user.email = data.email;
      },
      error: (err) => console.error('Could not fetch user data', err),
    });
  }

  updateProfile() {
    this.http.patch('http://localhost:4000/api/user/update-me', this.user).subscribe({
      next: () => {
        this.showMessage('Profile updated successfully!');
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Update failed', true);
      },
    });
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.showMessage('Passwords do not match!', true);
      return;
    }

    const payload = {
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    };

    console.log('Sending password change:', payload);

    this.http.post('http://localhost:4000/api/user/change-password', payload).subscribe({
      next: (res: any) => {
        this.showMessage(res.message || 'Password changed successfully!');
        this.passwordData = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
      },
      error: (err) => {
        console.error('Password change error:', err);
        this.showMessage(err.error?.message || 'Password change failed', true);
      },
    });
  }

  private showMessage(text: string, isError = false) {
    this.message = text;
    this.isError = isError;
    setTimeout(() => (this.message = ''), 3000);
  }
}