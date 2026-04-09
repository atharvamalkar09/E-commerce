import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';
import { NavigationEnd, Router, RouterLink, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { filter } from 'rxjs';
// Shared Components
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
  
  // UI States
  // isLoading = false;
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

  // 1. Opens the confirmation dialog
  onLogoutClick() {
    this.showLogoutConfirm = true;
  }

  // 2. Handles the dialog response
  handleLogoutConfirmation(confirmed: boolean) {
    this.showLogoutConfirm = false;
    if (confirmed) {
      this.executeLogout();
    }
  }

  // 3. Performs the actual API call
  private executeLogout() {
    // this.isLoading = true;
    this.authService.logout().subscribe({
      next: () => {
        console.log("logout success");
        // this.isLoading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error("logout failed!", err);
        // this.isLoading = false;
        // Optionally show an error message here
      }
    });
  }
}












// import { Component, OnInit } from '@angular/core';
// import { User } from '../../models/user.model';
// import { AuthService } from '../../auth/auth.service';
// import { NavigationEnd, Router, RouterLink, RouterModule } from "@angular/router";
// import { CommonModule } from '@angular/common';
// import { CartService } from '../../cart/cart.service';
// import { filter } from 'rxjs';

// @Component({
//   selector: 'app-navbar',
//   imports: [RouterLink, CommonModule,RouterModule],
//   templateUrl: './navbar.component.html',
//   styleUrl: './navbar.component.css'
// })
// export class NavbarComponent implements OnInit {

//   currentUser: User | null = null;

//   constructor(private authService: AuthService,private router: Router, private cartService: CartService){
    
//     this.router.events.pipe(
//     filter(event => event instanceof NavigationEnd)
//   ).subscribe(() => {
//     if (this.currentUser) {
//       this.cartService.loadCart();
//     }
//   });
//   }

//   ngOnInit(): void {
//     this.authService.currentUser$.subscribe(user=>
//       this.currentUser = user
//     )
//   };

//   logout(){
//     this.authService.logout().subscribe({
//       next: ()=>{
//         console.log("logout success");
//       },
//       error: (err)=>{
//         console.log("logout failed!", err);
//       }
//     }

      
    
    
//     );
//   }
// }
