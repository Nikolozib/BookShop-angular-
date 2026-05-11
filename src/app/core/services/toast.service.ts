import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal('');
  visible = signal(false);

  show(msg: string) {
    this.message.set(msg);
    this.visible.set(true);
    setTimeout(() => this.visible.set(false), 2500);
  }
}
