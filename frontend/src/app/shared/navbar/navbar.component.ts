import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';
import { RouterLink, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  currentUser: User | null = null;

  constructor(private authService: AuthService){}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user=>
      this.currentUser = user
    )
  };

  logout(){
    this.authService.logout().subscribe({
      next: ()=>{
        console.log("logout success");
      },
      error: (err)=>{
        console.log("logout failed!", err);
      }
    }

      
    
    
    );
  }
}
