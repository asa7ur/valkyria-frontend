import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-info-section',
  templateUrl: './info-section.html',
  imports: [
    TranslatePipe
  ]
})
export class InfoSection {
}
