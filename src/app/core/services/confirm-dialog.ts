import {Injectable, signal} from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  btnOkText?: string;
  btnCancelText?: string;
}

@Injectable({providedIn: 'root'})
export class ConfirmDialogService {
  isOpen = signal(false);
  options = signal<ConfirmOptions>({
    title: 'Confirmar',
    message: '¿Estás seguro?',
    btnOkText: 'Eliminar',
    btnCancelText: 'Cancelar'
  });

  private resolveConfirm: (value: boolean) => void = () => {
  };

  /**
   * Abre el diálogo y devuelve una Promesa que se resuelve con true o false
   */
  ask(options: ConfirmOptions): Promise<boolean> {
    this.options.set({
      btnOkText: 'Confirmar',
      btnCancelText: 'Cancelar',
      ...options
    });
    this.isOpen.set(true);

    return new Promise((resolve) => {
      this.resolveConfirm = resolve;
    });
  }

  confirm() {
    this.isOpen.set(false);
    this.resolveConfirm(true);
  }

  cancel() {
    this.isOpen.set(false);
    this.resolveConfirm(false);
  }
}
