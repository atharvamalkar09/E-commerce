import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, ConfirmDialogComponent,FormsModule,LoadingSpinnerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  errMessage: string = "";
  isLoading: boolean = false;
  showDialog: boolean = false;
  dialogMessage: string = '';
  
  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    const namePattern = /^[^\s]+(\s+[^\s]+)*$/;
    const passwordPattern = /^(?!\s*$).+/;

    this.registerForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.pattern(namePattern)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.pattern(namePattern)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6), 
        Validators.pattern(passwordPattern)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: [this.confirmpassword]    
    });
  }

  confirmpassword(cp: FormGroup) {
    const password = cp.get('password')?.value;
    const confirm = cp.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { name, email, password } = this.registerForm.value;
      
      this.authService.register(name, email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('User registered:', response);
          this.dialogMessage = response.message || 'User registered successfully!';
          this.showDialog = true;
        },
        error: (err) => {
          this.isLoading = false;
          this.errMessage = err.error?.message || 'An error occurred during registration';
        }
      });
    }
  }

  onDialogConfirm(confirmed: boolean) {
    this.showDialog = false;
    if (confirmed) {
      this.router.navigate(['/auth/login']);
    }
  }
}
