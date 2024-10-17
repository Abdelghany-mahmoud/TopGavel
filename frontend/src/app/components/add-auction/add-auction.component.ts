import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { AuthService } from '../../services/auth.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-auction',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-auction.component.html',
  styleUrls: ['./add-auction.component.css']
})
export class AddAuctionComponent implements OnInit {
  auctionForm: FormGroup;
  selectedFiles: File[] = [];
  categories: any[] = [];
  loading = false;
  serverErrorMessage: string = '';
  isBanned: boolean = false;
  isRegistered: boolean = false;
  userName: string = '';
  isAdmin: boolean = false;

  constructor(private fb: FormBuilder, private auctionService: AuctionService, private router: Router, private authService: AuthService) {
  
    this.auctionForm = this.fb.group({
      category_id: ['', Validators.required],
      item_name: ['', Validators.required],
      item_description: ['', [Validators.required, Validators.minLength(15)]],
      starting_bid: ['', Validators.required],
      bid_increment: ['', Validators.required],
      auction_start_time: ['', [Validators.required, this.startTimeAtLeast24HoursFromNow()]],
      auction_end_time: ['', [Validators.required, this.endTimeAfterStartTime()]],
      item_media: [null, Validators.required],
      item_country: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Fetch categories from the backend
    this.auctionService.getCategories().subscribe({
      next: (data) => {
        this.categories = data; // Bind the categories to the component
      },
      error: (error) => {
        console.error('Error fetching categories', error);
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

  // Validator to ensure end time is after start time
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
        console.log('bad date')
        return { startTimeLessThan24Hours: true };
      }
      console.log('good date')
      return null;
    };
  }

  onFileChange(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit() {
    this.loading = true;
    if (this.auctionForm.valid) {
      const formData = new FormData();
      Object.keys(this.auctionForm.value).forEach(key => {
        const value = this.auctionForm.get(key)?.value;
        if (key === 'item_media') {
          if (this.selectedFiles.length > 0) {
            this.selectedFiles.forEach(file => {
              formData.append('item_media[]', file, file.name); // Append files
            });
          }
        } else {
          formData.append(key, value || ''); // Append other form values
        }
      });

      // Send the formData to the backend
      this.auctionService.createAuction(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          if (error.error.auction_start_time) {
            this.serverErrorMessage = error.error.auction_start_time[0];
          }
        }
      });
    }
  }

}
