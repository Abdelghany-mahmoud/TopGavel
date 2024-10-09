import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private Url = 'http://172.18.0.3:80/api'; // ===> Docker URL
  private Url = 'http://localhost:8000/api'; // ===> Localhost URL

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.Url}/register`, userData).pipe(
      map((response: any) => {
        if (response && response.token) {
          const userData = {
            token: response.token,
            is_email_verified: response.user.is_email_verified,
            email: response.user.email,
            name: response.user.name
          };
          localStorage.setItem('user', JSON.stringify(userData));
        }
        return response;
      })
    );
  }


  logIn(userData: any): Observable<any> {
    return this.http.post(`${this.Url}/login`, userData).pipe(
      map((response: any) => {
        if (response && response.token) {
          const userData = {
            token: response.token,
            role: response.user.role,
            is_email_verified: response.user.is_email_verified,
            email: response.user.email,
            name: response.user.name
          };
          localStorage.setItem('user', JSON.stringify(userData));
        }
        return response;
      })
    );
  }

  logOut(): Observable<any> {
    const user = localStorage.getItem('user');
    if (user) {
      const token = JSON.parse(user).token; // Retrieve token from local storage
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}` // Add token to Authorization header
      });
  
      return this.http.get(`${this.Url}/logout`, { headers }).pipe(
        tap(() => {
          localStorage.removeItem('user'); // Clear local storage after successful logout
        }),
        catchError((error) => {
          console.error('Logout failed', error);
          return throwError(error); // Handle error accordingly
        })
      );
    } else {
      return of({ message: 'No user logged in' });
    }
  }



  verifyEmail(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.Url}/email_verify`, { email, otp });
  }

  is_email_verified(): boolean {
    const userJson = localStorage.getItem('user');
    if (userJson){
      const user = JSON.parse(userJson);
      return user.is_email_verified == 1;
    }
    return false;
  }

  is_admin(): boolean {
    const userJson = localStorage.getItem('user');
    if (userJson){
      const user = JSON.parse(userJson);
      return user.role == 'admin';
    }
    return false;
  }

  isLoggedIn(): boolean {
    const user = localStorage.getItem('user');
    return user !== null;
  }
}