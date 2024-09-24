import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BidsComponent } from './bids/bids.component';
import { ContactComponent } from './contact/contact.component';
import { AuctionsComponent } from './auctions/auctions.component'; // تأكد من أن المسار صحيح
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';  // استيراد FormsModule
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    FooterComponent,
    FontAwesomeModule,
    BidsComponent,
    ContactComponent,
    HomeComponent,
    FormsModule,
    AuctionsComponent // تأكد من إدراج AuctionsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']  
})
export class AppComponent implements OnInit {
  showHeader: boolean = true;
  showFooter: boolean = true;  

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const hideHeaderFooterRoutes = ['/login', '/register'];  // تعريف المسارات لإخفاء كل من الهيدر والفوتر

        this.showHeader = !hideHeaderFooterRoutes.includes(this.router.url);
        this.showFooter = !hideHeaderFooterRoutes.includes(this.router.url);
      }
    });
  }
}

// لا تنسى استخدام AppProviders في main.ts
export const AppProviders = [provideHttpClient()];
