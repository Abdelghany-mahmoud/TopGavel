import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuctionService, Auction, PaginatedAuctions } from '../../services/auction.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-deleted-auctions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deleted-auctions.component.html',
  styleUrl: './deleted-auctions.component.css'
})
export class DeletedAuctionsComponent {




  auctions: Auction[] = [];
  filteredAuctions: Auction[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  perPage: number = 10;

  constructor(
    private fb: FormBuilder,
    private auctionService: AuctionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDeletedAuctions(this.currentPage);
  }

  /**
   * 
   * @param page 
   */
  loadDeletedAuctions(page: number = 1): void {
    this.auctionService.getDeletedAuctions(page, this.perPage).subscribe({
      next: (response: PaginatedAuctions) => {
        this.auctions = response.data;
        console.log(this.auctions);
        this.filteredAuctions = [...this.auctions];
        this.currentPage = response.meta.current_page;
        this.totalPages = response.meta.last_page;
      },
      error: (err) => {
        console.error('Error loading deleted auctions:', err);
      }
    });
  }

  restoreAuction(id: string) {
    this.auctionService.restoreAuction(id).subscribe({
      next: (response) => {
        this.loadDeletedAuctions(this.currentPage);
      },
      error: (error) => {
        console.error('Error restoring auction:', error);
      }
    });
  }

  goToAuctionDetails(auctionId: string): void {
    console.log(auctionId);
    this.router.navigate(['/auction_details', auctionId]);
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
    this.auctionService.getApprovedAuctions(page, this.perPage).subscribe({
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
}
