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

  isLoading = false;      // Controls the spinner
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
  this.isLoading = true; // Hide component, show spinner
  
  this.http.get<User[]>(`${this.apiURL}/customers`).subscribe({
    next: (data) => {
      this.users = data;
      // Small timeout to ensure the UI doesn't "flicker" too fast
      setTimeout(() => {
        this.isLoading = false; // Hide spinner, show component
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
    }, 1500); // 1.5 seconds delay as requested
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
    
    // Matches your Backend: router.post("/lock", updateLockStatus)
    // updateLockStatus expects: { userId, isLocked }
    this.http.post(`${this.apiURL}/lock`, { 
      userId: user.id, 
      isLocked: newStatus 
    }).subscribe({
      next: () => {
        user.isLocked = newStatus; // Update UI locally
        alert(`User ${user.name} is now ${newStatus ? 'Locked' : 'Unlocked'}`);
      },
      error: (err) => alert("Error updating lock status")
    });
  }
}