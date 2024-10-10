

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuctionService, Auction, PaginatedAuctions } from '../../services/auction.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-finished-auctions',
  standalone: true,
  imports: [CommonModule],  
  templateUrl: './finished-auctions.component.html',
  styleUrls: ['./finished-auctions.component.css']
})
export class FinishedAuctionsComponent implements OnInit {
  auctions: Auction[] = [];
  filteredAuctions: Auction[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  perPage: number = 10;

  constructor(
    private auctionService: AuctionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAuctions(this.currentPage);
  }

  loadAuctions(page: number): void {
    this.auctionService.getFinishedAuctions(page, this.perPage).subscribe({
      next: (response: PaginatedAuctions) => {
        this.auctions = response.data;
        this.filteredAuctions = [...this.auctions];  
        this.currentPage = response.meta.current_page;
        this.totalPages = response.meta.last_page;
      },
      error: (err) => {
        console.error('Error loading auctions:', err);
      }
    });
  }

  goToAuctionDetails(auctionId: number): void {
    this.router.navigate(['/auction-details', auctionId]);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadAuctions(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadAuctions(this.currentPage - 1);
    }
  }
}
