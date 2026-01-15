import {Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet, RouterLink, RouterLinkActive, Router} from '@angular/router';
import {ToastService} from '../../../core/services/toast';
import {AuthManager} from '../../../core/services/auth-manager';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html'
})
export class Layout {
  public toast = inject(ToastService);
  public auth = inject(AuthManager);
  private router = inject(Router);

  /**
   * Verifica si el usuario actual tiene el rol de administrador.
   * Se asume que el rol es 'ROLE_ADMIN'.
   */
  public isAdmin = computed(() => {
    const user = this.auth.currentUser();
    return user?.roles.some(r => r.authority === 'ROLE_ADMIN') ?? false;
  });

  /**
   * Cierra la sesión del usuario y lo redirige a la página principal.
   */
  handleLogout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
