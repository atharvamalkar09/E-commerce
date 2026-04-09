import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private authService: AuthService){}
  
  ngOnInit(): void {
    this.authService.checkSession().subscribe()
  }
}
