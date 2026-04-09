import { Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { AuthResponse } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    email: "",
    password: ""
  };
  
  errMessage: string = "";
  isLoading: boolean = false; // Control the spinner

  login() {
    this.errMessage = "";
    this.isLoading = true; // Start loading immediately

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (res: AuthResponse) => {
        // We keep the spinner visible for a split second for a smooth transition
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
        this.isLoading = false; // Stop loading on error
        this.errMessage = err.error?.message || "An error occurred during login";
      }
    });
  }
}










// import { Component, OnInit } from '@angular/core';
// import { AuthService } from '../auth.service';
// import { Router, RouterModule } from '@angular/router';
// import { AuthResponse } from '../../models/user.model';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-login',
//   imports: [CommonModule,FormsModule,RouterModule],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css'
// })
// export class LoginComponent {

//   credentials = {
//     email: "",
//     password:""
//   }
//   errMessage:string = "";

//   constructor(private authService:AuthService, private router: Router){}

//   login(){
//     this.errMessage = "";
//     this.authService.login(this.credentials.email, this.credentials.password).subscribe({
//       next:(res: AuthResponse)=>{
//         const loggedUser = res.user;

//         if(loggedUser.role === "admin"){
//           this.router.navigate(["/products"]);   ///admin/dashboard
//         }
//         else{
//           this.router.navigate(["/products"]);
//         }
//       },
//       error: (err) => {
//       this.errMessage = err.error?.message || "An error occurred during login";
//     }
//     })
//   }

// }
