import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContactComponent } from './components/contact/contact.component';
import { HomeComponent } from './components/home/home.component';
import { CommentsComponent } from './components/comments/comments.component';
import { AuctionsComponent } from './components/auctions/auctions.component'; 
import { AdminDashboardComponent } from './components/adminDashboard/adminDashboard.component';
import { GuidesComponent } from './components/guides/guides.component';
import { EmailVerficationComponent } from './components/email-verfication/email-verfication.component';
import { FinishedAuctionsComponent } from './components/finished-auctions/finished-auctions.component';
import { NotificationComponent } from './components/notifications/notifications.component';
import { CustomersComponent } from './components/customers/customers.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    FooterComponent,
    FontAwesomeModule,
    ContactComponent,
    HomeComponent,
    AuctionsComponent,
    FormsModule,
    GuidesComponent,
    AdminDashboardComponent,
    EmailVerficationComponent,
    CommentsComponent,
    NotificationComponent,
    FinishedAuctionsComponent,
    CustomersComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']  ,
  template: `
  <app-header></app-header>
  <router-outlet></router-outlet>
`,
})
export class AppComponent implements OnInit {
  showHeader: boolean = true;
  showFooter: boolean = true;  
  isAdminRoute: boolean = false;

  constructor(private router: Router) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isAdminRoute = this.router.url.includes('/admin');
      }
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const hideHeaderFooterRoutes = ['/login', '/register','/errors'];  

        this.showHeader = !hideHeaderFooterRoutes.includes(this.router.url);
        this.showFooter = !hideHeaderFooterRoutes.includes(this.router.url);
      }
    });
  }
}

export const AppProviders = [provideHttpClient()];