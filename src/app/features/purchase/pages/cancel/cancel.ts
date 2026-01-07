import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-cancel',
  imports: [CommonModule, RouterModule],
  templateUrl: './cancel.html'
})
export class Cancel {
  // No limpiamos el CheckoutLogic aquí para que el usuario pueda reintentar
}
