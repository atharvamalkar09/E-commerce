import { Component, OnInit, inject } from '@angular/core';
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

  // User details
  user = { name: '', email: '' };

  // Password change fields
  passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };

  message = '';
  isError = false;

  ngOnInit() {
    this.http.get<any>('http://localhost:4000/api/auth/me').subscribe({
      next: (data) => {
        // This fills the object that [(ngModel)] is watching
        this.user.name = data.name;
        this.user.email = data.email;
      },
      error: (err) => {
        console.error('Could not fetch user data', err);
      },
    });
  }

  //   updateProfile() {
  //   // Logic to call PATCH /api/auth/update-me
  //   this.http.patch('http://localhost:4000/api/auth/update-me', this.user).subscribe({
  //     next: () => this.showMessage("Profile updated successfully!"),
  //     error: (err) => this.showMessage(err.error.message, true)
  //   });
  // }

  updateProfile() {
    const url = 'http://localhost:4000/api/user/update-me';

    this.http.patch(url, this.user).subscribe({
      next: (res) => {
        this.message = 'Profile updated successfully!';
        this.isError = false;
      },
      error: (err) => {
        console.error('Patch Error:', err);
        this.message = err.error?.message || 'Update failed';
        this.isError = true;
      },
    });
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      return this.showMessage('Passwords do not match!', true);
    }
    // Logic to call POST /api/auth/change-password
    this.http
      .post('http://localhost:4000/api/user/change-password', this.passwordData)
      .subscribe({
        next: () => {
          this.showMessage('Password changed!');
          this.passwordData = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
        },
        error: (err) => this.showMessage(err.error.message, true),
      });
  }

  private showMessage(text: string, isError = false) {
    this.message = text;
    this.isError = isError;
    setTimeout(() => (this.message = ''), 3000);
  }
}
