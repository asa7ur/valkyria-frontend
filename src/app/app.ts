import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ConfirmDialog} from './shared/components/confirm-dialog/confirm-dialog';
import {AuthManager} from './core/services/auth-manager';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  auth = inject(AuthManager);
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['es', 'en']);
  }

  ngOnInit() {
    const saved = localStorage.getItem('lang') || 'es';
    this.translate.use(saved);

    if (this.auth.isLoggedIn()) {
      this.auth.verifySessionFromServer().subscribe();
    }
  }
}
