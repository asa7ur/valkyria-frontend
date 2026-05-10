import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ConfirmDialog} from './shared/components/confirm-dialog/confirm-dialog';
import {AuthManager} from './core/services/auth-manager';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  auth = inject(AuthManager);

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.auth.verifySessionFromServer().subscribe();
    }
  }
}
