import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface AuthMeResponse {
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';

  private userSub = new BehaviorSubject<User | null>(null);

  public currentUser$ = this.userSub.asObservable();

  public get currentUserValue(): User | null {
    return this.userSub.value;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.checkSession().subscribe();
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      name,
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.userSub.next(res.user)));
  }

  checkSession(): Observable<User | null> {
    return this.http.get<AuthMeResponse>(`${this.apiUrl}/me`).pipe(
      map((res) => {
        // res IS the user object now, not res.session
        console.log('Data from Backend:', res);
        return res as unknown as User;
      }),
      tap((user) => {
        this.userSub.next(user);
      }),
      catchError(() => {
        this.userSub.next(null);
        return of(null);
      }),
    );
  }

  // checkSession():Observable<User | null>{
  //   return this.http.get<AuthMeResponse>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
  //   // tap(user => {
  //   //   console.log("Session restored:", user);
  //   //   this.userSub.next(user);
  //   // }),
  //   tap((res:AuthMeResponse) => {
  //     // If your backend returns { session: { role: 'customer' } }
  //     // We extract the inner 'session' object so the Navbar sees 'role' directly
  //     if (res && res.session) {
  //       console.log("Session data extracted:", res.session);
  //       this.userSub.next(res.session);
  //     }
  //   }),
  //   catchError(() => {
  //     // If 401 or error, just set user to null (Guest mode)
  //     this.userSub.next(null);
  //     return of(null);
  //   })
  // );
  //}

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.userSub.next(null);
        this.router.navigate(['auth/login']);
      }),
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  // auth.service.ts

  // ... inside the class
  clearLocalSession() {
    localStorage.removeItem('currentUser'); // Or whatever key you use
    this.userSub.next(null); // This triggers the UI toggle
  }
}
