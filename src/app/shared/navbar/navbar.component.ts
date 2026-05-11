import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);

  scrolled = signal(false);
  mobileOpen = signal(false);
  dropdownOpen = signal(false);
  isAdmin = signal(false);

  constructor() {
    this.authService.currentUser$.subscribe(async u => {
      if (u) {
        const role = await this.authService.getUserRole(u.uid);
        this.isAdmin.set(role === 'admin');
      } else {
        this.isAdmin.set(false);
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 40);
  }

  toggleMobile() {
    this.mobileOpen.set(!this.mobileOpen());
  }

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.nav-user-menu')) {
      this.dropdownOpen.set(false);
    }
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }

  async logout() {
    this.dropdownOpen.set(false);
    await this.authService.logout();
  }
}
