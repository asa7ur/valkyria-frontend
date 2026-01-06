import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {OrderService} from '../../../../core/services/order.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './success.html'
})
export class Success implements OnInit {
  private orderService = inject(OrderService);

  ngOnInit() {
    // Limpiamos el pedido del estado global una vez completado
    // Necesitaremos añadir este método en el OrderService
    this.orderService.clearOrder();
  }
}
