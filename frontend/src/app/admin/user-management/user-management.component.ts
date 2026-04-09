import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {

  constructor(private http: HttpClient){}

  users: User[] = [];
  
  private apiURL = 'http://localhost:4000/api/admin';

  ngOnInit() {
    this.fetchCustomers();
  }

  fetchCustomers() {
    this.http.get<User[]>(`${this.apiURL}/customers`).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error("Could not load customers", err)
    });
  }

  toggleLock(user: User) {
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