import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <div id="cart-toast" [class.show]="toastVisible">
      <i class="fa-solid fa-check"></i>
      <span>{{ toastMessage }}</span>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  toastVisible = false;
  toastMessage = '';

  showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 2500);
  }
}
