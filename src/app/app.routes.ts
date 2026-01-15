import {Routes} from '@angular/router';
import {adminGuard} from './core/guards/admin';

// Layouts y Páginas Principales
import {MainLayout} from './layout/components/main-layout/main-layout';
import {Home} from './features/home/home';
import {Lineup} from './features/lineup/lineup';
import {Artists} from './features/artists/artists';
import {ArtistDetail} from './features/artists/pages/artist-detail/artist-detail';

// Funcionalidades de Compra
import {Purchase} from './features/purchase/purchase';
import {Checkout} from './features/purchase/pages/checkout/checkout';
import {Success} from './features/purchase/pages/success/success';
import {Cancel} from './features/purchase/pages/cancel/cancel';

// Autenticación y Perfil
import {Login} from './features/auth/login/login';
import {Register} from './features/auth/register/register';
import {Confirm} from './features/auth/confirm/confirm';
import {MyOrders} from './features/profile/pages/my-orders/my-orders';
import {Layout} from './features/admin/layout/layout';
import {Dashboard} from './features/admin/dashboard/dashboard';
import {Users} from './features/admin/users/users';
import {UserEdit} from './features/admin/users/user-edit/user-edit';
import {roleGuard} from './core/guards/role';

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
    path: 'admin',
    canActivate: [adminGuard],
    component: Layout,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: Dashboard},
      {path: 'users', component: Users, canActivate: [roleGuard]},
      {path: 'users/edit/:id', component: UserEdit, canActivate: [roleGuard]}
    ]
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
