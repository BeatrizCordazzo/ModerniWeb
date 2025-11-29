import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginRequiredModalService, LoginPromptState } from './login-required-modal.service';

@Component({
  selector: 'app-login-required-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-required-modal.html',
  styleUrls: ['./login-required-modal.scss'],
})
export class LoginRequiredModalComponent implements OnDestroy {
  state: LoginPromptState = {
    visible: false,
    message: 'You need to be logged to do that.',
    redirectUrl: '/login',
  };

  private sub: Subscription;

  constructor(private modalService: LoginRequiredModalService, private router: Router) {
    this.sub = this.modalService.state$.subscribe((state) => {
      this.state = state;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  close(): void {
    this.modalService.close();
  }

  goToLogin(): void {
    const target = this.state.redirectUrl || '/login';
    this.close();
    this.router.navigate([target]);
  }
}
