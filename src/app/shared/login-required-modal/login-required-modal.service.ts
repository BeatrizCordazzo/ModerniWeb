import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoginPromptState {
  visible: boolean;
  message: string;
  redirectUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginRequiredModalService {
  private readonly defaultState: LoginPromptState = {
    visible: false,
    message: 'You need to be logged to do that.',
    redirectUrl: '/login',
  };

  private stateSubject = new BehaviorSubject<LoginPromptState>(this.defaultState);
  state$ = this.stateSubject.asObservable();

  open(message?: string, redirectUrl?: string): void {
    this.stateSubject.next({
      visible: true,
      message: message || this.defaultState.message,
      redirectUrl: redirectUrl || this.defaultState.redirectUrl,
    });
  }

  close(): void {
    this.stateSubject.next({
      ...this.defaultState,
      visible: false,
    });
  }
}
