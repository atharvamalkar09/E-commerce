import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';
import { NavigationEnd, Router, RouterLink, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { filter } from 'rxjs';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  currentUser: User | null = null;
  showLogoutConfirm = false;
  confirmMessage = 'Are you sure you want to log out?';

  constructor(
    private authService: AuthService,
    private router: Router, 
    private cartService: CartService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.currentUser) {
        this.cartService.loadCart();
      }
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user =>
      this.currentUser = user
    );
  }

  onLogoutClick() {
    this.showLogoutConfirm = true;
  }

  handleLogoutConfirmation(confirmed: boolean) {
    this.showLogoutConfirm = false;
    if (confirmed) {
      this.executeLogout();
    }
  }

  private executeLogout() {

    this.authService.logout().subscribe({
      next: () => {
        console.log("logout success");
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error("logout failed!", err);
      }
    });
  }
}

