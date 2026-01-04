import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-social-section',
  imports: [],
  templateUrl: './social-section.html',
  styles: ``,
})
export class SocialSection {
  protected readonly socialNetworks = signal([
    {name: 'Instagram', handle: '@valkyrfest', color: 'hover:text-pink-500'},
    {name: 'TikTok', handle: '@valkyrfest_oficial', color: 'hover:text-cyan-400'},
    {name: 'Facebook', handle: 'Valkyrfest Sevilla', color: 'hover:text-blue-600'},
    {name: 'Youtube', handle: 'Valkyrfest TV', color: 'hover:text-red-600'}
  ]);
}
