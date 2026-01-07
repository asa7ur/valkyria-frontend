import {Component, inject, signal, HostListener, ElementRef} from '@angular/core'; // Añadido HostListener y ElementRef
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthManager} from '../../core/services/auth-manager';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  public auth = inject(AuthManager);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update(state => !state);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  // Cierra el menú si se hace clic fuera del componente Header
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
}
