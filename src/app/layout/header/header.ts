import {Component, inject, signal, HostListener, ElementRef, LOCALE_ID, effect} from '@angular/core';
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

  // Signal para el estado del menú
  isMenuOpen = signal(false);

  constructor() {
    // Bloquea el scroll del fondo cuando el sidebar está abierto
    effect(() => {
      if (this.isMenuOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen.update(state => !state);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  // Cierra el menú si se hace clic fuera del sidebar
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isMenuOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  onLogout() {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  switchLanguage() {
    const newLocale = this.locale === 'es' ? 'en' : 'es';
    const currentPath = window.location.pathname;

    let newPath = currentPath;
    if (currentPath.startsWith('/es/')) {
      newPath = currentPath.replace('/es/', `/${newLocale}/`);
    } else if (currentPath.startsWith('/en/')) {
      newPath = currentPath.replace('/en/', `/${newLocale}/`);
    } else {
      newPath = `/${newLocale}${currentPath}`;
    }

    window.location.href = newPath;
  }
}
