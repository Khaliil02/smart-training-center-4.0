import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, request).pipe(
      tap(response => this.storeUser(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, request).pipe(
      tap(response => this.storeUser(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.API}/refresh`, { refreshToken } as RefreshTokenRequest).pipe(
      tap(response => this.storeUser(response))
    );
  }

  logout(): void {
    localStorage.removeItem('stc_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    const user = this.getStoredUser();
    return user?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    const user = this.getStoredUser();
    return user?.refreshToken ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.roles?.includes('ROLE_' + role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  getRoles(): string[] {
    const user = this.getStoredUser();
    return user?.roles ?? [];
  }

  getUserEmail(): string | null {
    const user = this.getStoredUser();
    return user?.email ?? null;
  }

  private storeUser(response: AuthResponse): void {
    localStorage.setItem('stc_user', JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem('stc_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }
}
