import {Routes} from '@angular/router';
import {MainLayout} from './layout/components/main-layout/main-layout';
import {Home} from './features/home/home';
import {Lineup} from './features/lineup/lineup';
import {Artists} from './features/artists/artists';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {path: '', component: Home},
      {path: 'lineup', component: Lineup},
      {path: 'artists', component: Artists},
    ]
  }
];
