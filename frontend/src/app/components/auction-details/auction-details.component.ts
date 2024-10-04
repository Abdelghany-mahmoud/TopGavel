// import { Component, OnInit, Input } from '@angular/core';
// import { RouterModule, Router } from '@angular/router';
// import { ActivatedRoute } from '@angular/router';
// import { AuctionService } from '../../services/auction.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// @Component({
//     selector: 'app-auction-details',
//     standalone: true,
//     imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
//     templateUrl: './auction-details.component.html',
//     styleUrls: ['./auction-details.component.css']
// })
// export class AuctionDetailsComponent implements OnInit {
//     @Input() auctionId: string = '';
//     auction: any;
//     auctionEndTime: Date | null = null;
//     isAuctionEnded: boolean = false;
//     images: [string]=[''];
//     constructor(private auctionService: AuctionService, private route: ActivatedRoute, private router: Router) { }

//     ngOnInit(): void {
//         this.loadAuctionDetails();
//     }

//     loadAuctionDetails(): void {
//         this.auctionService.getAuctionById(this.auctionId).subscribe({
//             next: (response: any) => {
//                 this.auction = response;
//                 response.item_media.forEach((item: { path: any; }) => {                    
//                     this.images.push(item.path);
//                 });
//                 console.log(this.images);
//             },
//             error: (error: any) => {
//                 console.error('Error loading auction details:', error);
//             },
//         });
//     }
//     checkAuctionStatus(auctionEndTime: Date): string {
//         const currentTime = new Date();
//         return auctionEndTime && auctionEndTime < currentTime ? 'closed' : 'opened';
//     }

// }
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
             
                if (response.item_media.length > 0) {
                    this.selectedImage = response.item_media[0].path; 
                }

                response.item_media.forEach((item: { path: string; }) => {                    
                    this.images.push(item.path);
                });
                console.log(this.images);
            },
            error: (error: any) => {
                console.error('Error loading auction details:', error);
            },
        });
    }

    checkAuctionStatus(auctionEndTime: Date): string {
        const currentTime = new Date();
        return auctionEndTime && auctionEndTime < currentTime ? 'closed' : 'opened';
    }
    setMainImage(image: string): void {
        this.selectedImage = image;
    }
}
