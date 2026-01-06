import {Routes} from '@angular/router';
import {MainLayout} from './layout/components/main-layout/main-layout';
import {Home} from './features/home/home';
import {Lineup} from './features/lineup/lineup';
import {Artists} from './features/artists/artists';
import {ArtistDetail} from './features/artists/pages/artist-detail/artist-detail';
import {Purchase} from './features/purchase/purchase';
import {Login} from './features/auth/login/login';
import {authGuard} from './core/guards/auth.guard';
import {Checkout} from './features/purchase/pages/checkout/checkout';
import {Success} from './features/purchase/pages/success/success';
import {Cancel} from './features/purchase/pages/cancel/cancel';
import {MyOrders} from './features/profile/pages/my-orders/my-orders';
import {Register} from './features/auth/register/register';
import {Confirm} from './features/auth/confirm/confirm';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'confirm-registration',
    component: Confirm
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {path: '', component: Home},
      {path: 'lineup', component: Lineup},
      {path: 'artists', component: Artists},
      {path: 'artists/:id', component: ArtistDetail},
      {path: 'orders', component: MyOrders},
      {
        path: 'purchase',
        children: [
          {path: '', component: Purchase},
          {path: 'checkout', component: Checkout},
          {path: 'success', component: Success},
          {path: 'cancel', component: Cancel}
        ]
      },
    ]
  }
];
