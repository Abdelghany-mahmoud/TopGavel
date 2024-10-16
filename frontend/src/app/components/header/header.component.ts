
// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { Router, NavigationEnd } from '@angular/router';
// import { RouterLink, RouterLinkActive } from '@angular/router';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [RouterLink, RouterLinkActive, CommonModule],
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css']
// })
// export class HeaderComponent implements OnInit {
//   isLoginActive: boolean = false;
//   isSignupActive: boolean = false;
//   isLoggedIn: boolean = false;
//   isRegistered: boolean = false;
//   userName: string = '';
//   isAdmin:boolean=false;
//   userProfileImage: string = 'assets/images/user.jpeg'; 
//   showDropdown: boolean = false;
//   notificationCount: number = 0;  

//   addNotification() {
//     this.notificationCount += 1; // Increment notification count
//   }


//   clearNotifications() {
//     this.notificationCount = 0; // clear notifications when viewed
//   }

//   constructor(private router: Router) {}

//   // ngOnInit(): void {
//   //   this.router.events.subscribe(event => {
//   //     if (event instanceof NavigationEnd) {
//   //       this.isLoginActive = this.router.url === '/login';
//   //       this.isSignupActive = this.router.url === '/register';
//   //     }
//   //   });

//   //   const userData = localStorage.getItem('user');
//   //   console.log(userData)
//   //   if (userData) {
//   //     const user = JSON.parse(userData);
//   //     this.userName = user.name; 
//   //     this.isLoggedIn = true;  
//   //     this.isRegistered = true;
//   //     if(user.role=="admin"){
//   //       this.isAdmin=true;
//   //     }
//   //   }
//   //   console.log(this.isAdmin);
//   // }
//   ngOnInit(): void {
//     this.router.events.subscribe(event => {
//       if (event instanceof NavigationEnd) {
//         this.isLoginActive = this.router.url === '/login';
//         this.isSignupActive = this.router.url === '/register';
//       }
//     });
  
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const user = JSON.parse(userData);
//       this.userName = user.name; 
//       this.isLoggedIn = true;  
//       this.isRegistered = true;
  
//       if (user.role === "admin") {
//         this.isAdmin = true;
//       }
//     }
//     console.log('Is Admin:', this.isAdmin); 
//   }

//   toggleDropdown(event: Event): void {
//     event.stopPropagation();
//     this.showDropdown = !this.showDropdown;
//   }

//   closeDropdown(): void {
//     this.showDropdown = false;
//   }

//   logout(): void {
//     localStorage.removeItem('user'); 
//     this.isLoggedIn = false;
//     this.isRegistered = false;
//     this.router.navigate(['/']); 
//   }
// }

// import { NotificationService } from '../../services/notification.service';
// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { Router, NavigationEnd } from '@angular/router';
// import { RouterLink, RouterLinkActive } from '@angular/router';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [RouterLink, RouterLinkActive, CommonModule],
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css']
// })
// export class HeaderComponent implements OnInit {
//   isLoginActive: boolean = false;
//   isSignupActive: boolean = false;
//   isLoggedIn: boolean = false;
//   isRegistered: boolean = false;
//   userName: string = '';
//   isAdmin: boolean = false;
//   userProfileImage: string = 'assets/images/user.jpeg'; 
//   showDropdown: boolean = false;
//   showNotificationDropdown: boolean = false;
//   notificationCount: number = 0;
//   notifications: any[] = [];

//   constructor(private router: Router, private notificationService: NotificationService) {}

//   ngOnInit(): void {
//     this.router.events.subscribe(event => {
//       if (event instanceof NavigationEnd) {
//         this.isLoginActive = this.router.url === '/login';
//         this.isSignupActive = this.router.url === '/register';
//       }
//       this.notificationService.getNotifications().subscribe(data => {
//         this.notifications = data;
//         this.notificationCount = data.length; // Update the notification count
//       });
//     });

//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const user = JSON.parse(userData);
//       this.userName = user.name; 
//       this.isLoggedIn = true;  
//       this.isRegistered = true;

//       if (user.role === 'admin') {
//         this.isAdmin = true;
//       }
//     }
//     console.log('Is Admin:', this.isAdmin); 
//   }

//   toggleDropdown(event: Event): void {
//     event.stopPropagation();
//     this.showDropdown = !this.showDropdown;
//   }

//   toggleNotificationDropdown(event: Event): void {
//     event.stopPropagation();
//     this.showNotificationDropdown = !this.showNotificationDropdown;
//   }

//   closeDropdown(): void {
//     this.showDropdown = false;
//   }

//   logout(): void {
//     localStorage.removeItem('user');
//     this.isLoggedIn = false;
//     this.isRegistered = false;
//     this.router.navigate(['/']);
//   }
//   clearNotifications(): void {
//     this.notificationCount = 0;
//   }
// }

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService, PaginatedNotifications } from '../../services/notification.service'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoginActive: boolean = false;
  isSignupActive: boolean = false;
  isLoggedIn: boolean = false;
  isRegistered: boolean = false;
  userName: string = '';
  isAdmin: boolean = false;
  userProfileImage: string = 'assets/images/user.jpeg'; 
  showDropdown: boolean = false;
  showNotificationDropdown: boolean = false;
  notificationCount: number = 0;
  notifications: any[] = [];

  constructor(private router: Router, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginActive = this.router.url === '/login';
        this.isSignupActive = this.router.url === '/register';
      }
    });

    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.name; 
      this.isLoggedIn = true;  
      this.isRegistered = true;

      if (user.role === 'admin') {
        this.isAdmin = true;
      }
    }
    console.log('Is Admin:', this.isAdmin); 

    // Fetch notifications
    this.notificationService.getNotifications().subscribe({
      next: (data: PaginatedNotifications) => {
        this.notifications = data.data; // data.data is the array of notifications
        this.notificationCount = data.meta.total; // total number of notifications
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  toggleNotificationDropdown(event: Event): void {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  logout(): void {
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.isRegistered = false;
    this.router.navigate(['/']);
  }

  clearNotifications(): void {
    this.notificationCount = 0;
    this.notifications = []; 
  }

  removeNotification(notificationId: number): void {
    this.notifications = this.notifications.filter(notification => notification.data.auction_id !== notificationId);
    this.notificationCount = this.notifications.length; 
  }
}
