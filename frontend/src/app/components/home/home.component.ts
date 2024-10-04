import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  auctions: any[] = [];
  auctionId: string = '';
  auctionEndTime: Date | null = null;
  isAuctionEnded: boolean = false;
  auctionStatus: string = '';
  images: string[] = [];
  constructor(
    private fb: FormBuilder,
    private auctionService: AuctionService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAuctions();
  }

  loadAuctions() {
    this.auctionService.getAllAuctions().subscribe({
      next: (response: any) => {
        this.auctions = response;
        this.auctions.forEach((item) => {
          item.item_media.forEach((item: { path: any; }) => {
            this.images.push(item.path);
          });
        });

      },
      error: (error: any) => {
        console.error('Error loading auction details:', error);
      },
    });
  }

  checkAuctionStatus(auctionEndTime: string): string {
    const currentTime = new Date();
    const auctionEndDate = new Date(auctionEndTime);
    return auctionEndDate < currentTime ? 'closed' : 'opened';
  }

}


