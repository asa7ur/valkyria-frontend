import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {CheckoutLogic} from '../../../../core/services/checkout-logic';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './success.html'
})
export class Success implements OnInit {
  private checkout = inject(CheckoutLogic);

  ngOnInit() {
    // Limpiamos el pedido del estado global una vez completado
    // Necesitaremos añadir este método en el CheckoutLogic
    this.checkout.clearOrder();
  }
}
