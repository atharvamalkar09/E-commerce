import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { AuthResponse } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  credentials = {
    email: "",
    password:""
  }
  errMessage:string = "";

  constructor(private authService:AuthService, private router: Router){}

  login(){
    this.errMessage = "";
    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next:(res: AuthResponse)=>{
        const loggedUser = res.user;

        if(loggedUser.role === "admin"){
          this.router.navigate(["/admin/dashboard"]);
        }
        else{
          this.router.navigate(["/products"]);
        }
      },
      error: (err) => {
      this.errMessage = err.error?.message || "An error occurred during login";
    }
    })
  }

}
