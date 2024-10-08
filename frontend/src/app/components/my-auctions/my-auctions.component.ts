import { Component, OnInit } from '@angular/core';
import { AuctionService, Auction, PaginatedAuctions } from '../../services/auction.service';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-auctions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-auctions.component.html',
  styleUrl: './my-auctions.component.css'
})
export class MyAuctionsComponent implements OnInit {
  auctions: Auction[] = [];
  filteredAuctions: Auction[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  perPage: number = 10;
  constructor(
    private auctionService: AuctionService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadmyAuctions();
  }

  /**
 * 
 * @param page 
 */
  loadmyAuctions(page: number = 1): void {
    this.auctionService.getmyAuctions(page, this.perPage).subscribe({
      next: (response: PaginatedAuctions) => {
        this.auctions = response.data;
        this.filteredAuctions = [...this.auctions];
        this.currentPage = response.meta.current_page;
        this.totalPages = response.meta.last_page;
      },
      error: (err) => {
        console.error('Error loading approved auctions:', err);
      }
    });
  }

  goToAuctionDetails(auctionId: string): void {
    console.log(auctionId);
    this.router.navigate(['/auction', auctionId]);
  }

  /**
 */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  /**
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  /**
* @param page 
*/
  onPageChange(page: number): void {
    this.fetchAuctions(page);
  }
  /**
 * @param page 
 */
  fetchAuctions(page: number = 1): void {
    this.currentPage = page;
    this.auctionService.getmyAuctions(page, this.perPage).subscribe({
      next: (response: PaginatedAuctions) => {
        this.auctions = response.data;
        this.filteredAuctions = [...this.auctions];
        this.currentPage = response.meta.current_page;
        this.totalPages = response.meta.last_page;
      },
      error: (err) => {
        console.error('Error fetching auctions:', err);
      }
    });
  }

  updateAuction(id: any){
    console.log(id);
  }
  deleteAuction(id: any){
    console.log(id);
  }
}
