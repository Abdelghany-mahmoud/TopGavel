import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = 'http://localhost:8000/api';
  // private apiUrl = 'http://172.18.0.4:80/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

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

  createComment(auctionId: string, commentData: any): Observable<any> {
    // Check if the user is banned before allowing them to create a comment
    if (this.authService.isUserBanned()) {
      return throwError({ message: "You cannot create a comment because you are banned." });
    }

    const headers = this.getAuthHeaders();
    const options = headers ? { headers } : {};
    return this.http.post(`${this.apiUrl}/${auctionId}/comments`, commentData, options);
  }

  getCommentsByAuctionId(auctionId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const options = headers ? { headers } : {};
    return this.http.get(`${this.apiUrl}/${auctionId}/comments`, options);
  }

  updateComment(auctionId: string, commentId: string, commentData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const options = headers ? { headers } : {};
    return this.http.put(`${this.apiUrl}/${auctionId}/comments/${commentId}`, commentData, options);
  }

  deleteComment(auctionId: string, commentId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const options = headers ? { headers } : {};
    return this.http.delete(`${this.apiUrl}/${auctionId}/comments/${commentId}`, options);
  }
}
