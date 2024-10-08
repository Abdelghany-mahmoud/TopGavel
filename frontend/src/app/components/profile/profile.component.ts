import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  selectedFile: File | null = null;
  profileImageUrl: string | ArrayBuffer | null = null;
  user: any = {}; // Initialize as empty object to prevent null
  message: string = '';
  error: string = '';
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phone_number: ['', Validators.required],
      address: ['', Validators.required],
      password: ['', [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      password_confirmation: [''],
      profile_picture: [null, Validators.pattern(/.(jpg|jpeg|png|gif)$/i)]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Custom validator to check if password and password_confirmation match
   */
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const password_confirmation = form.get('password_confirmation')?.value;
    if (password || password_confirmation) { // Only validate if one of them is filled
      return password === password_confirmation ? null : { 'mismatch': true };
    }
    return null;
  }

  /**
   * Load user profile data
   */
  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.user = response?.user || {};
        this.profileImageUrl = response?.profile_image_url || '';
        this.profileForm.patchValue({
          name: this.user?.name || '',
          email: this.user?.email || '',
          phone_number: this.user?.phone_number || '',
          address: this.user?.address || ''
        });
      },
      error: (err) => {
        this.error = err;
      }
    });
  }

  /**
   * Handle file selection for profile image
   */
  onFileSelect(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      this.selectedFile = file;
      this.profileForm.patchValue({ profile_picture: file });
      this.profileForm.get('profile_picture')?.updateValueAndValidity();

      // Display image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Submit the profile form
   */
  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    if (this.selectedFile) {
      // If a profile image is selected, use FormData to send the image
      const formData = new FormData();
      formData.append('name', this.profileForm.get('name')?.value);
      formData.append('email', this.profileForm.get('email')?.value);
      formData.append('phone_number', this.profileForm.get('phone_number')?.value);
      formData.append('address', this.profileForm.get('address')?.value);

      if (this.profileForm.get('password')?.value) {
        formData.append('password', this.profileForm.get('password')?.value);
        formData.append('password_confirmation', this.profileForm.get('password_confirmation')?.value);
      }

      formData.append('profile_picture', this.selectedFile);

      this.userService.updateUserProfileWithImage(formData).subscribe({
        next: (response) => {
          this.message = response.message;
          this.profileImageUrl = response.profile_image_url;
          this.isEditing = false;
          this.loadUserProfile(); // Reload user data
        },
        error: (err) => {
          this.error = err;
        }
      });
    } else {
      // If no profile image is selected, send JSON data
      const data = {
        name: this.profileForm.get('name')?.value,
        email: this.profileForm.get('email')?.value,
        phone_number: this.profileForm.get('phone_number')?.value,
        address: this.profileForm.get('address')?.value,
        password : this.profileForm.get('password')?.value,
        pconfirmation : this.profileForm.get('password_confirmation')?.value,


      };

      if (this.profileForm.get('password')?.value) {
        data.password = this.profileForm.get('password')?.value;
        data.pconfirmation = this.profileForm.get('password_confirmation')?.value;
      }

      this.userService.updateUserProfile(data).subscribe({
        next: (response) => {
          this.message = response.message;
          this.isEditing = false;
          this.loadUserProfile(); // Reload user data
        },
        error: (err) => {
          this.error = err;
        }
      });
    }
  }

  /**
   * Enable editing mode
   */
  enableEditing(): void {
    this.isEditing = true;
  }

  /**
   * Cancel editing mode and reload user data
   */
  cancelEditing(): void {
    this.isEditing = false;
    this.loadUserProfile();
  }
}