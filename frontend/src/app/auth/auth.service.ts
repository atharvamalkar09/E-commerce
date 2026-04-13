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
      passwordHash: password,
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

  clearLocalSession() {
    localStorage.removeItem('currentUser'); 
    this.userSub.next(null);
  }
}
