import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-cancel',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './cancel.html'
})
export class Cancel {
  // No limpiamos el CheckoutLogic aquí para que el usuario pueda reintentar
}
