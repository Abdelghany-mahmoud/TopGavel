import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public apiUrl = 'http://localhost:8000/api'; 
  /*   private apiUrl = 'http://172.18.0.4:80/api'; */

  constructor(private http: HttpClient) { }

  /**
   * @param includeContentType 
   * @returns
   */
  private getAuthHeaders(includeContentType: boolean = true): HttpHeaders | undefined {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      let headersConfig: { [header: string]: string } = {
        'Authorization': `Bearer ${user.token}`
      };
      if (includeContentType) {
        headersConfig['Content-Type'] = 'application/json';
      }
      return new HttpHeaders(headersConfig);
    }
    return undefined;
  }

  /**
   * @param error 
   * @returns 
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Authentication error: Token is missing or invalid. Please log in again.';
      } else {
        errorMessage = `Error code: ${error.status}, Message: ${error.message}`;
      }
    }
    return throwError(errorMessage);
  }

  /**
   * Retrieve user profile data
   * @returns
   */
  getUserProfile(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/profile`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update user profile data without image (using JSON)
   * @param data 
   * @returns 
   */
  updateUserProfile(data: any): Observable<any> {
    const headers = this.getAuthHeaders(); 
    return this.http.put(`${this.apiUrl}/edit_profile`, data, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update user profile data with image (using FormData)
   * @param formData 
   * @returns
   */
  updateUserProfileWithImage(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders(false); // Don't include 'Content-Type' when using FormData
    return this.http.put(`${this.apiUrl}/edit_profile`, formData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }
}
