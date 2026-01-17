import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfirmDialogService} from '../../../core/services/confirm-dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styles: ``,
})
export class ConfirmDialog {
  confirmService = inject(ConfirmDialogService);
}
