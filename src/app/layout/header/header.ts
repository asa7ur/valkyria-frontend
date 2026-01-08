import {Component, inject, signal, HostListener, ElementRef, LOCALE_ID} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthManager} from '../../core/services/auth-manager';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  public auth = inject(AuthManager);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  protected locale = inject(LOCALE_ID);

  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update(state => !state);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isMenuOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // Método para alternar entre idiomas redirigiendo la URL
  switchLanguage() {
    const newLocale = this.locale === 'es' ? 'en' : 'es';
    const currentPath = window.location.pathname;

    let newPath = currentPath;
    if (currentPath.startsWith('/es/')) {
      newPath = currentPath.replace('/es/', `/${newLocale}/`);
    } else if (currentPath.startsWith('/en/')) {
      newPath = currentPath.replace('/en/', `/${newLocale}/`);
    } else {
      // Caso base si no hay prefijo en la URL (ej: localhost:4200)
      newPath = `/${newLocale}${currentPath}`;
    }

    window.location.href = newPath;
  }
}
