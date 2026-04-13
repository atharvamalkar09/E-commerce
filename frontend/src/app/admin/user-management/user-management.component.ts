import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule,ConfirmDialogComponent,LoadingSpinnerComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {

  isLoading = false; 
  showConfirm = false;
  confirmMessage = '';
  selectedUser: User | null = null;

  constructor(private http: HttpClient){}

  users: User[] = [];
  
  private apiURL = 'http://localhost:4000/api/admin';

  ngOnInit() {
    this.fetchCustomers();
  }

 fetchCustomers() {
  this.isLoading = true;
  
  this.http.get<User[]>(`${this.apiURL}/customers`).subscribe({
    next: (data) => {
      this.users = data;
      setTimeout(() => {
        this.isLoading = false;
      }, 800); 
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
    }
  });
}

  showLoader() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }
  openLockModal(user: User) {
    this.selectedUser = user;
    const action = user.isLocked ? 'Unlock' : 'Lock';
    this.confirmMessage = `Are you sure you want to ${action} ${user.name}?`;
    this.showConfirm = true;
  }
  handleConfirmation(confirmed: boolean) {
    this.showConfirm = false;
    if (confirmed && this.selectedUser) {
      this.toggleLock(this.selectedUser);
    }
    this.selectedUser = null;
  }

  toggleLock(user: User) {
    this.showLoader();
    const newStatus = !user.isLocked;
    
    this.http.post(`${this.apiURL}/lock`, { 
      userId: user.id, 
      isLocked: newStatus 
    }).subscribe({
      next: () => {
        user.isLocked = newStatus;
      },
      error: (err) => alert("Error updating lock status")
    });
  }
}