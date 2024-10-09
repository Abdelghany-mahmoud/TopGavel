import { Component, OnInit } from '@angular/core';
import { AuctionDetailsComponent } from "../auction-details/auction-details.component";
import { BidsComponent } from "../bids/bids.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommentsComponent } from "../comments/comments.component";
import { AuctionService } from '../../services/auction.service';

@Component({
  selector: 'app-auction',
  standalone: true,
  imports: [AuctionDetailsComponent, BidsComponent, RouterModule, FormsModule, ReactiveFormsModule, CommonModule, CommentsComponent],
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.css'] 
})
export class AuctionComponent implements OnInit {
  auctionId: string = '';
  auctionEndTime: Date | null = null; 
  isAuctionEnded: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private auctionService: AuctionService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.auctionId = params.get('id') || '';
      this.loadAuctionDetails(); 
    });
  }

  loadAuctionDetails() {
    this.auctionService.getAuctionById(this.auctionId).subscribe(auction => {
      this.auctionEndTime = new Date(auction.auction_end_time);
      this.checkAuctionStatus();
    });
  }

  checkAuctionStatus() {
    const currentTime = new Date();
    this.isAuctionEnded = this.auctionEndTime ? this.auctionEndTime < currentTime : false;
  }
}

