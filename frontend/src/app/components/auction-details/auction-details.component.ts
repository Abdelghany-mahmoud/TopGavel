

import { Component, OnInit, Input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-auction-details',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
    templateUrl: './auction-details.component.html',
    styleUrls: ['./auction-details.component.css']
})
export class AuctionDetailsComponent implements OnInit {
    @Input() auctionId: string = '';
    auction: any;
    auctionEndTime: Date | null = null;
    isAuctionEnded: boolean = false;
    images: string[] = [];
    selectedImage: string = '';

    constructor(private auctionService: AuctionService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        this.loadAuctionDetails();
    }

    loadAuctionDetails(): void {
        this.auctionService.getAuctionById(this.auctionId).subscribe({
            next: (response: any) => {
                this.auction = response;
                console.log(this.auction);
                
                // Load the auction images
                if (response.item_media && response.item_media.length > 0) {
                    // Set the first image as the selected image
                    this.selectedImage = 'http://localhost:8000/uploads/images/' + response.item_media[0].path;
                    
                    // Add all the image paths to the images array
                    response.item_media.forEach((item: { path: string; }) => {
                        this.images.push('http://localhost:8000/uploads/images/' + item.path);
                    });
                }
                console.log(this.images);
            },
            error: (error: any) => {
                console.error('Error loading auction details:', error);
            },
        });
    }

    checkAuctionStatus(auctionEndTime: Date): string {
        const currentTime = new Date();
        return auctionEndTime && auctionEndTime < currentTime ? 'closed' : 'open';
    }

    setMainImage(image: string): void {
        this.selectedImage = image;
    }
}
