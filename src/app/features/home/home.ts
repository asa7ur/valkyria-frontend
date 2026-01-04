import {Component} from '@angular/core';
import {HeroSection} from './components/hero-section/hero-section';
import {LineupSection} from './components/lineup-section/lineup-section';
import {InfoSection} from './components/info-section/info-section';
import {TicketsSection} from './components/tickets-section/tickets-section';
import {ExperienceSection} from './components/experience-section/experience-section';
import {SocialSection} from './components/social-section/social-section';
import {SponsorsSection} from './components/sponsors-section/sponsors-section';

@Component({
  selector: 'app-home',
  imports: [
    HeroSection,
    LineupSection,
    InfoSection,
    TicketsSection,
    ExperienceSection,
    SocialSection,
    SponsorsSection
  ],
  templateUrl: './home.html',
  styles: ``,
})
export class Home {

}
