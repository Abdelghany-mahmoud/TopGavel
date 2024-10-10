import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,

  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],

})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe((data: any) => {
      this.notifications = data;
    });
  }
}
