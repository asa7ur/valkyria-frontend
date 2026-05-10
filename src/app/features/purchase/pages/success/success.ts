import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CheckoutLogic } from '../../../../core/services/checkout-logic';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './success.html'
})
export class Success implements OnInit {
  private checkout = inject(CheckoutLogic);

  ngOnInit() {
    // Aseguramos que el usuario empiece desde arriba de la página
    window.scrollTo(0, 0);

    // Limpiamos el estado del pedido para evitar duplicados si el usuario retrocede
    this.checkout.clearOrder();
  }
}
