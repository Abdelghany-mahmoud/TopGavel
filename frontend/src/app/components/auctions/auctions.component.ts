import { Component, OnInit } from '@angular/core';
import { AuctionService, Auction, PaginatedAuctions } from '../../services/auction.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [
    CommonModule 
  ],
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.css']
})
export class AuctionsComponent implements OnInit {
  auctions: Auction[] = [];
  currentPage: number = 1; 
  totalPages: number = 1; 
  errorMessage: string = '';

  constructor(private auctionService: AuctionService, private router: Router) {}

  ngOnInit(): void {
    this.loadActiveAuctions(this.currentPage); 
  }

  loadActiveAuctions(page: number): void {
    this.auctionService.getActiveAuctions(page).subscribe({
      next: (response: PaginatedAuctions) => {
        this.auctions = response.data; 
        this.totalPages = response.meta.last_page;
        this.currentPage = page;
      },
      error: (err) => {
        console.error('Error loading auctions:', err);
        this.errorMessage = 'Error loading auctions, please try again later.';
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadActiveAuctions(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadActiveAuctions(this.currentPage - 1);
    }
  }

  goToAuctionDetails(auctionId: string): void {
    this.router.navigate(['/auction', auctionId]);
  }
}
