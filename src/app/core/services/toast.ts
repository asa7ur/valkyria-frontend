import {Injectable, signal} from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({providedIn: 'root'})
export class ToastService {
  // Signal que contiene el mensaje actual
  message = signal<string | null>(null);
  type = signal<ToastType>('success');

  show(msg: string, type: ToastType = 'success') {
    this.message.set(msg);
    this.type.set(type);

    // Auto-ocultar tras 3 segundos
    setTimeout(() => {
      this.message.set(null);
    }, 3000);
  }
}
