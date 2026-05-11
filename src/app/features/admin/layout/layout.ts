import { Component, computed, effect, inject, signal, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast';
import { AuthManager } from '../../../core/services/auth-manager';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html'
})
export class Layout {
  public toast = inject(ToastService);
  public auth = inject(AuthManager);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  // Inicializamos el signal con el valor de localStorage
  public isDark = signal<boolean>(localStorage.getItem('admin-theme') === 'dark');

  constructor() {
    // Sincroniza el estado del signal con el DOM y el LocalStorage automáticamente
    effect(() => {
      const mode = this.isDark() ? 'dark' : 'light';
      localStorage.setItem('admin-theme', mode);

      if (this.isDark()) {
        this.renderer.addClass(this.document.documentElement, 'dark');
      } else {
        this.renderer.removeClass(this.document.documentElement, 'dark');
      }
    });
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
  }

  public isAdmin = computed(() => {
    const user = this.auth.currentUser();
    return user?.roles.some(r => r.authority === 'ROLE_ADMIN') ?? false;
  });

  handleLogout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
