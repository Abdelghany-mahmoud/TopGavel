import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-email-verfication',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-verfication.component.html',
  styleUrl: './email-verfication.component.css'
})
export class EmailVerficationComponent implements OnInit {
  email: string = '';
  otp: any;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.email = user.email
    }
  }

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  verify() {
    this.authService.verifyEmail(this.email, this.otp).subscribe({
      next: (response) => {
        this.successMessage = 'Email verified successfully.';
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          userData.is_email_verified = 1;
          localStorage.setItem('user', JSON.stringify(userData));
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.errorMessage = 'Invalid OTP. Please try again.';
      }
    });
  }
}

