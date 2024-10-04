import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-auction',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './add-auction.component.html',
  styleUrls: ['./add-auction.component.css']
})
export class AddAuctionComponent {
  auctionForm: FormGroup;
  selectedFiles: File[] = [];


  constructor(private fb: FormBuilder, private auctionService: AuctionService, private router: Router) {
    this.auctionForm = this.fb.group({
      category_id: ['', Validators.required],
      item_name: ['', Validators.required],
      item_description: ['', Validators.required],
      starting_bid: ['', Validators.required],
      bid_increment: ['', Validators.required],
      auction_start_time: ['', Validators.required],
      auction_end_time: ['', Validators.required],
      item_media: [null, Validators.required],
      item_country: ['', Validators.required]
    });
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
              formData.append('item_media[]', file, file.name);
            });
          }
        } else {
          formData.append(key, value || '');
        }
      });
      this.auctionService.createAuction(formData).subscribe({
        next: (response) => {
          this.router.navigate(['/']);
          this.auctionForm.reset();
        },
        error: (error) => {
          console.log('Error:', error);
        }
      });
    }
  }
}
