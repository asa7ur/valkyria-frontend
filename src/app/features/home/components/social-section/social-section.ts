// src/app/features/home/components/social-section/social-section.ts
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-social-section',
  templateUrl: './social-section.html',
})
export class SocialSection {
  protected readonly socialNetworks = signal([
    {
      name: 'Instagram',
      handle: '@valkyria',
      icon: 'fa-brands fa-instagram',
      hoverText: 'group-hover:text-pink-600',
      hoverIcon: 'group-hover:text-pink-600',
      hoverBorder: 'group-hover:border-pink-600/50',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(219,39,119,0.3)]'
    },
    {
      name: 'TikTok',
      handle: '@valkyria_oficial',
      icon: 'fa-brands fa-tiktok',
      hoverText: 'group-hover:text-cyan-400',
      hoverIcon: 'group-hover:text-cyan-400',
      hoverBorder: 'group-hover:border-cyan-400/50',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]'
    },
    {
      name: 'Facebook',
      handle: 'Valkyria Sevilla',
      icon: 'fa-brands fa-facebook-f',
      hoverText: 'group-hover:text-blue-600',
      hoverIcon: 'group-hover:text-blue-600',
      hoverBorder: 'group-hover:border-blue-600/50',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]'
    },
    {
      name: 'Youtube',
      handle: 'Valkyria TV',
      icon: 'fa-brands fa-youtube',
      hoverText: 'group-hover:text-red-600',
      hoverIcon: 'group-hover:text-red-600',
      hoverBorder: 'group-hover:border-red-600/50',
      hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]'
    }
  ]);
}
