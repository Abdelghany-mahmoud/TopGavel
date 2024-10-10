// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';

// export interface Image {
//   id: number;
//   auction_id: number;
//   path: string;
// }

// export interface Auction {
//   auction_id: string;
//   // category_id: number;
//   item_name: string;
//   item_category: any;
//   item_description: string;
//   starting_bid: number;
//   bid_increment: number;
//   auction_start_time: string;
//   auction_end_time: string;
//   item_country: string;
//   creator: { name: string };
//   item_media: Image[];
//    auction_status: string;
//   approval_status: string;
//   winning_bidder: { name: string } | null;
//   'winning bid': number | null; 
// }

// export interface PaginatedAuctions {
//   data: Auction[];
//   meta: {
//     current_page: number;
//     last_page: number;
//     per_page: number;
//     total: number;
//   };
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AuctionService {
//   private apiUrl = 'http://localhost:8000/api/auction';

//   constructor(private http: HttpClient) { }

//   /**
//    * @param includeContentType 
//    * @returns 
//    */
//   private getAuthHeaders(includeContentType: boolean = true): HttpHeaders | undefined {
//     const userJson = localStorage.getItem('user');
//     if (userJson) {
//       const user = JSON.parse(userJson);
//       let headersConfig: { [header: string]: string } = {
//         'Authorization': `Bearer ${user.token}`
//       };
//       if (includeContentType) {
//         headersConfig['Content-Type'] = 'application/json';
//       }
//       return new HttpHeaders(headersConfig);
//     }
//     return undefined;
//   }

//   /**
//    * @param error 
//    * @returns 
//    */
//   private handleError(error: HttpErrorResponse) {
//     let errorMessage = 'An error occurred.';

//     if (error.error instanceof ErrorEvent) {
//       errorMessage = `Error: ${error.error.message}`;
//     } else {
//       if (error.status === 401) {
//         errorMessage = 'Authentication error: Token is missing or invalid. Please log in again.';
//       } else {
//         errorMessage = `Error code: ${error.status}, Message: ${error.message}`;
//       }
//     }
//     return throwError(errorMessage);
//   }

//   /**
//    * @param auctionData 
//    * @returns 
//    */
//   createAuction(auctionData: FormData): Observable<Auction> {
//     const headers = this.getAuthHeaders(false);
//     const options = headers ? { headers } : {};

//     return this.http.post<Auction>(this.apiUrl, auctionData, options)
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * @param page 
//    * @param perPage 
//    * @returns 
//    */
//   getAuctions(page: number = 1, perPage: number = 10,): Observable<PaginatedAuctions> {
//     let params = new HttpParams()
//       .set('page', page.toString())
//       .set('per_page', perPage.toString());

//     return this.http.get<PaginatedAuctions>(`${this.apiUrl}/`, { params }).pipe(
//       catchError(this.handleError)
//     );
//   }


//   /**
//    * @param page 
//    * @param perPage 
//    * @returns 
//    */
//   getActiveAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
//     let params = new HttpParams()
//       .set('page', page.toString())
//       .set('per_page', perPage.toString());

//     return this.http.get<PaginatedAuctions>(`${this.apiUrl}/active-auctions`, { params ,headers: this.getAuthHeaders()})
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * @param page 
//    * @param perPage 
//    * @returns 
//    */
//   getPendingAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
//     let params = new HttpParams()
//       .set('page', page.toString())
//       .set('per_page', perPage.toString());

//     return this.http.get<PaginatedAuctions>(`${this.apiUrl}/pending`, { params, headers: this.getAuthHeaders() })
//       .pipe(catchError(this.handleError));
//   }
//   /**
//  * @param id 
//  * @returns 
//  */
//   getApprovedAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
//     let params = new HttpParams()
//       .set('page', page.toString())
//       .set('per_page', perPage.toString());

//     return this.http.get<PaginatedAuctions>(`${this.apiUrl}/approved`, { params, headers: this.getAuthHeaders()  })
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * @param searchTerm 
//    * @param page 
//    * @param perPage 
//    * @returns
//    */
//   searchAuctions(searchTerm: string, page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
//     let httpParams = new HttpParams()
//       .set('search', searchTerm)
//       .set('page', page.toString())
//       .set('per_page', perPage.toString());

//     return this.http.get<PaginatedAuctions>(`${this.apiUrl}/search`, { params: httpParams })
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * @param id 
//    * @returns 
//    */
//   getAuctionById(id: string): Observable<any> {
//     const headers = this.getAuthHeaders();
//     if (!headers) {
//       return throwError('Token is missing. Please log in.'); // Return error if token is missing
//     }
//     return this.http.get<any>(`${this.apiUrl}/${id}`, { headers })
//       .pipe(
//         map(response => response.data || []),
//         catchError(this.handleError)
//       );
//   }

//   /**
//    * @param id 
//    * @param auctionData 
//    * @returns 
//    */
//   updateAuction(id: number, auctionData: FormData | any): Observable<Auction> {
//     const isFormData = auctionData instanceof FormData;
//     const headers = this.getAuthHeaders(!isFormData);
//     const options = headers ? { headers } : {};

//     return this.http.put<Auction>(`${this.apiUrl}/${id}`, auctionData, options)
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * @param id 
//    * @returns 
//    */
//   deleteAuction(id: number): Observable<any> {
//     const headers = this.getAuthHeaders();
//     if (!headers) {
//       return throwError('Token is missing. Please log in.');
//     }
//     return this.http.delete(`${this.apiUrl}/${id}`, { headers })
//       .pipe(catchError(this.handleError));
//   }

//   approveAuction(id: number): Observable<any> {
//     const headers = this.getAuthHeaders();
//     if (!headers) {
//       return throwError('Token is missing. Please log in.');
//     }
//     return this.http.post(`${this.apiUrl}/${id}/approve`, {}, { headers })
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * @param id 
//    * @returns 
//    */
//   rejectAuction(id: number): Observable<any> {
//     const headers = this.getAuthHeaders();
//     if (!headers) {
//       return throwError('Token is missing. Please log in.');
//     }
//     return this.http.post(`${this.apiUrl}/${id}/reject`, {}, { headers })
//       .pipe(catchError(this.handleError));
//   }

//   getFinishedAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
//     let params = new HttpParams()
//       .set('page', page.toString())
//       .set('per_page', perPage.toString());

//     return this.http.get<PaginatedAuctions>(`${this.apiUrl}/finished`, { params, headers: this.getAuthHeaders() })
//       .pipe(catchError(this.handleError));
//   }

// }


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Image {
  id: number;
  auction_id: number;
  path: string;
}

export interface Auction {
  auction_id: string;
  item_name: string;
  item_category: any;
  item_description: string;
  starting_bid: number;
  bid_increment: number;
  auction_start_time: string;
  auction_end_time: string;
  item_country: string;
  creator: { name: string };
  item_media: Image[];
  auction_status: string;
  approval_status: string;
  winning_bidder: { name: string } | null;
  'winning bid': number | null; 
}

export interface PaginatedAuctions {
  data: Auction[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuctionService {
  private apiUrl = 'http://localhost:8000/api/auction';

  constructor(private http: HttpClient) { }

  /**
   * @param error 
   * @returns 
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error code: ${error.status}, Message: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  /**
   * Get all auctions with pagination
   * @param page 
   * @param perPage 
   * @returns 
   */
  getAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedAuctions>(`${this.apiUrl}/`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get active auctions with pagination
   * @param page 
   * @param perPage 
   * @returns 
   */
  getActiveAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedAuctions>(`${this.apiUrl}/active-auctions`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get pending auctions with pagination
   * @param page 
   * @param perPage 
   * @returns 
   */
  getPendingAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedAuctions>(`${this.apiUrl}/pending`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get approved auctions with pagination
   * @param page 
   * @param perPage 
   * @returns 
   */
  getApprovedAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedAuctions>(`${this.apiUrl}/approved`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Search auctions by a term
   * @param searchTerm 
   * @param page 
   * @param perPage 
   * @returns 
   */
  searchAuctions(searchTerm: string, page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
    let httpParams = new HttpParams()
      .set('search', searchTerm)
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedAuctions>(`${this.apiUrl}/search`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get auction details by ID without requiring authentication
   * @param id 
   * @returns 
   */
  getAuctionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Create an auction (requires authentication)
   * @param auctionData 
   * @returns 
   */
  createAuction(auctionData: FormData): Observable<Auction> {
    const headers = this.getAuthHeaders();
    const options = headers ? { headers } : {};

    return this.http.post<Auction>(this.apiUrl, auctionData, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update auction (requires authentication)
   * @param id 
   * @param auctionData 
   * @returns 
   */
  updateAuction(id: number, auctionData: FormData | any): Observable<Auction> {
    const isFormData = auctionData instanceof FormData;
    const headers = this.getAuthHeaders(!isFormData);
    const options = headers ? { headers } : {};

    return this.http.put<Auction>(`${this.apiUrl}/${id}`, auctionData, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete auction (requires authentication)
   * @param id 
   * @returns 
   */
  deleteAuction(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError('Token is missing. Please log in.');
    }
    return this.http.delete(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Approve auction (requires authentication)
   * @param id 
   * @returns 
   */
  approveAuction(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError('Token is missing. Please log in.');
    }
    return this.http.post(`${this.apiUrl}/${id}/approve`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Reject auction (requires authentication)
   * @param id 
   * @returns 
   */
  rejectAuction(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError('Token is missing. Please log in.');
    }
    return this.http.post(`${this.apiUrl}/${id}/reject`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get finished auctions with pagination
   * @param page 
   * @param perPage 
   * @returns 
   */
  getFinishedAuctions(page: number = 1, perPage: number = 10): Observable<PaginatedAuctions> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedAuctions>(`${this.apiUrl}/finished`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get authorization headers if the user is logged in
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
}
