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
  serverErrorMessage: string = '';
  
  constructor(
    private fb: FormBuilder,
    private auctionService: AuctionService,
    private router: Router,
    private authService: AuthService 
  ) {
    this.auctionForm = this.fb.group({
      category_id: ['', Validators.required],
      item_name: ['', Validators.required],
      item_description: ['', [Validators.required, Validators.minLength(15)]],
      starting_bid: ['', Validators.required],
      bid_increment: ['', Validators.required],
      auction_start_time: ['', [Validators.required, this.startTimeValidator()]], 
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
  }

  // Validator to ensure start time is at least 24 hours from now
  startTimeValidator() {
    return (control: AbstractControl) => {
      const startTime = new Date(control.value);
      const currentTime = new Date();
      const minStartTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      return startTime < minStartTime ? { startTimeInvalid: true } : null;
    };
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

  onFileChange(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit() {
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
          this.router.navigate(['/']);
        },
        error: (error) => {
          if (error.error.auction_start_time) {
            this.serverErrorMessage = error.error.auction_start_time[0];
          }
        }
      });
    }
  }

}
