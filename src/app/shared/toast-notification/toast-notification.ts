import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastMessage {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Component({
  selector: 'app-toast-notification',
  imports: [CommonModule],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.scss'
})
export class ToastNotification implements OnInit {
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'success';
  @Input() duration = 3000;
  
  isVisible = false;
  isExiting = false;

  ngOnInit(): void {
    // Show toast after a brief delay for animation
    setTimeout(() => {
      this.isVisible = true;
    }, 10);

    // Auto-hide after duration
    setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  hide(): void {
    this.isExiting = true;
    setTimeout(() => {
      this.isVisible = false;
    }, 300); // Match animation duration
  }
}
