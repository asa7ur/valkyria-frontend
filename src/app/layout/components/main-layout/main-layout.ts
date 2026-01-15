import {Component} from '@angular/core';
import {Header} from '../../header/header';
import {RouterOutlet} from '@angular/router';
import {Footer} from '../../footer/footer';
import {ConfirmDialog} from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-main-layout',
  imports: [
    Header,
    RouterOutlet,
    Footer,
    ConfirmDialog
  ],
  templateUrl: './main-layout.html',
  styles: ``,
})
export class MainLayout {

}
