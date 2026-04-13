import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { AuthResponse } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // private authService = inject(AuthService);
  // private router = inject(Router);

  constructor(private authService: AuthService, private router: Router){}

  credentials = {
    email: "",
    password: ""
  };
  
  errMessage: string = "";
  isLoading: boolean = false;
  login(loginForm: any) {
    this.errMessage = "";
    if (loginForm.invalid) {
      this.errMessage = "Please fill in all required fields correctly.";
      return;
    }
    this.isLoading = true;
    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (res: AuthResponse) => {
        setTimeout(() => {
          this.isLoading = false;
          const loggedUser = res.user;

          if (loggedUser.role === "admin") {
            this.router.navigate(["/products"]);
          } else {
            this.router.navigate(["/products"]);
          }
        }, 800);
      },
      error: (err) => {
        this.isLoading = false;
        this.errMessage = err.error?.message || "Login failed. Please check your credentials and try again.";
      }
    });
  }
}
