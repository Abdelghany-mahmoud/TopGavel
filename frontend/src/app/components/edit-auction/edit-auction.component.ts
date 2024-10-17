import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-edit-auction',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './edit-auction.component.html',
  styleUrls: ['./edit-auction.component.css']
})
export class EditAuctionComponent implements OnInit {
  auctionForm: FormGroup;
  selectedFiles: File[] = [];
  categories: any[] = [];
  auctionId: string = '';
  auction: any;
  images: string[] = [];
  loading = false;
  isBanned: boolean = false;
  isRegistered: boolean = false;
  userName: string = '';
  isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auctionService: AuctionService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.auctionForm = this.fb.group({
      category_id: ['', Validators.required],
      item_name: ['', Validators.required],
      item_description: ['', [Validators.required, Validators.minLength(15)]],
      starting_bid: ['', Validators.required],
      bid_increment: ['', Validators.required],
      auction_start_time: ['', [Validators.required, this.startTimeAtLeast24HoursFromNow()]],
      auction_end_time: ['', [Validators.required, this.endTimeAfterStartTime()]],
      item_media: [null],
      item_country: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get auction ID from route parameters
    this.auctionId = this.route.snapshot.paramMap.get('id') || '';
    // Fetch categories from the backend
    this.auctionService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error fetching categories', error);
      }
    });

    // Fetch auction details by ID
    this.auctionService.getAuctionById(this.auctionId).subscribe({
      next: (auction) => {
        this.auction = auction
        if (auction.item_media && auction.item_media.length > 0) {
          auction.item_media.forEach((item: { path: string; }) => {
            this.images.push('http://localhost:8000/uploads/images/' + item.path);
          });
        }
        // this.auctionForm.patchValue(auction);
        this.auctionForm.patchValue({
          category_id: auction.category_id || '',
          item_name: auction.item_name || '',
          item_description: auction.item_description || '',
          starting_bid: auction.starting_bid || '',
          bid_increment: auction.bid_increment || '',
          auction_start_time: auction.auction_start_time || '',
          auction_end_time: auction.auction_end_time || '',
          item_country: auction.item_country || ''
        });
        if (auction.item_media) {
          this.selectedFiles = auction.item_media;
        }
      },
      error: (error) => {
        console.error('Error fetching auction details', error);
      }
    });
    const userData = this.authService.getUserData();
    
    if (userData) {
      this.userName = userData.name; 
      this.isRegistered = true;  
      this.isAdmin = this.authService.is_admin();
      this.isBanned = this.authService.isUserBanned();
    }
    
  }

  onFileChange(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  endTimeAfterStartTime() {
    return (control: AbstractControl) => {
      const formGroup = control.parent as FormGroup;
      if (!formGroup) {
        return null;
      }
      const startTime = formGroup.get('auction_start_time')?.value;
      const endTime = control.value;
      if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
        return { endTimeBeforeStartTime: true };
      }
      return null;
    };
  }

  startTimeAtLeast24HoursFromNow() {
    return (control: AbstractControl) => {
      const formGroup = control.parent as FormGroup;
      if (!formGroup) {
        return null;
      }
      const startTime = formGroup.get('auction_start_time')?.value;

      const now = new Date(); // Get current UTC time
      const futureDate = new Date(now.getTime() + 26 * 60 * 60 * 1000);
      const futureDate2 = futureDate.toISOString().slice(0, 16);
      if (startTime && futureDate2 && new Date(startTime) <= new Date(futureDate2)) {
        return { startTimeLessThan24Hours: true };
      }
      return null;
    };
  }

  onSubmit() {
    this.loading = true;
    if (this.auctionForm.valid) {
      const formData = new FormData();
      formData.append('category_id', this.auctionForm.get('category_id')?.value || '');
      formData.append('item_name', this.auctionForm.get('item_name')?.value || '');
      formData.append('item_description', this.auctionForm.get('item_description')?.value || '');
      formData.append('starting_bid', this.auctionForm.get('starting_bid')?.value || '');
      formData.append('bid_increment', this.auctionForm.get('bid_increment')?.value || '');
      formData.append('auction_start_time', this.auctionForm.get('auction_start_time')?.value || '');
      formData.append('auction_end_time', this.auctionForm.get('auction_end_time')?.value || '');
      formData.append('item_country', this.auctionForm.get('item_country')?.value || '');

      if (this.auctionForm.get('item_media')?.value) {
        console.log('images found')
        const files = this.auctionForm.get('item_media')?.value;
        if (this.selectedFiles.length > 0) {
          this.selectedFiles.forEach(file => {
            formData.append('item_media[]', file, file.name); // Append files
          });
        } else {
          formData.append('item_media[]', files, files.name); // Append single file if it's not an array
        }
      }

      console.log('Form data to be submitted:', formData);

      // Call update auction API
      this.auctionService.updateAuction(Number(this.auctionId), formData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/myauctions']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating auction', error);
        }
      });
    }
  }
}
