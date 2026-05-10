import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ConfirmDialog} from './shared/components/confirm-dialog/confirm-dialog';
import {AuthManager} from './core/services/auth-manager';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [TranslateModule, RouterOutlet, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  auth = inject(AuthManager);
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['es', 'en']);
    this.translate.use('es'); // Idioma por defecto
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.auth.verifySessionFromServer().subscribe();
    }
  }
}
