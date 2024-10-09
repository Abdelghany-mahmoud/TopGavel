import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BidService } from '../../services/bid.service';
import { AuctionService } from '../../services/auction.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-bids',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './bids.component.html',
  styleUrls: ['./bids.component.css']
})
export class BidsComponent implements OnInit {
  @Input() auctionId: string = '';
  auction: any;
  lastBid: any;
  bidAmount: number = 0;
  message: string = '';
  hasPaid: boolean | null = null;

  constructor(
    private auctionService: AuctionService,
    private route: ActivatedRoute,
    private bidService: BidService,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.loadAuctionDetails();
    this.checkIfBidderPaid(this.auctionId);
  }

  checkIfBidderPaid(auctionId: any) {
    this.paymentService.checkPayment(auctionId).subscribe({
      next: (response) => {
        this.hasPaid = response.hasPaid;
        console.log(response);
      },
      error: (error) => {
        console.error('Error checking payment:', error);
        this.hasPaid = false;
      }
    });
  }
  
  loadAuctionDetails(): void {
    this.auctionService.getAuctionById(this.auctionId).subscribe({
      next: (response: any) => {
        this.auction = response;
        console.log(this.auction.bids);
        this.lastBid = this.auction.bids[1] || null;
      },
      error: (error: any) => {
        console.error('Error loading auction details:', error);
      },
    });
  }

  placeBid(): void {
    console.log(this.hasPaid);
    if (!this.hasPaid) {
      this.router.navigate(['/payment']);
    };
    localStorage.setItem('auctionIdToBidOn', this.auctionId);
    const bidInfo = {
      bid_amount: this.bidAmount,
    };
    this.message = '';
    this.bidService.placeBid(this.auctionId, this.bidAmount, bidInfo).subscribe({
      next: (response: any) => {
        this.message = 'Bid placed successfully!';
        this.loadAuctionDetails();
      },
      error: (error: any) => {
        console.log('Error placing bid:', error)
      }
    });
  }
}