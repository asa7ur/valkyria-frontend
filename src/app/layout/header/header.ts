import {Component, inject, signal, HostListener, ElementRef, effect} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthManager} from '../../core/services/auth-manager';
import {CheckoutLogic} from '../../core/services/checkout-logic';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.html',
})
export class Header {
  public auth = inject(AuthManager);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  public cart = inject(CheckoutLogic);
  public translate = inject(TranslateService);

  isMenuOpen = signal(false);

  hasAdminAccess(): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    return user.roles?.some(r => r.authority === 'ROLE_ADMIN' || r.authority === 'ROLE_MANAGER') ?? false;
  }

  constructor() {
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

  switchLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  toggleLang() {
    const nextLang = this.translate.getCurrentLang() === 'es' ? 'en' : 'es';
    this.translate.use(nextLang);
    localStorage.setItem('lang', nextLang);
  }

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
}
