import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  errMessage:string = "";
  isLoading: boolean = false;
  
  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router){}


  ngOnInit(): void {
  const namePattern = /^[^\s]+(\s+[^\s]+)*$/;
  const passwordPattern = /^(?!\s*$).+/;

  this.registerForm = this.fb.group({
    // Correct Order: [initialValue, [syncValidators], [asyncValidators]]
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
    // This is the options object for the entire group
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
          console.log('User registered:', response.user);
          alert(response.message); // "Registration successful" from backend
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errMessage = err.error?.message || 'An error occurred during registration';
        }
      });
    }
  }





}
