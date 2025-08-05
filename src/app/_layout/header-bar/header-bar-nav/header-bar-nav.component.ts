import { Component } from '@angular/core';
import {faBluesky, faDiscord, faGithub, faMastodon, faPatreon, faTwitter} from '@fortawesome/free-brands-svg-icons';
import { faBug, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../../../services/user.service';

@Component({
    selector: 'app-header-bar-nav',
    templateUrl: './header-bar-nav.component.html',
    styleUrls: ['./header-bar-nav.component.scss'],
    standalone: false
})
export class HeaderBarNavComponent {

  isNavbarActive = false;

  iconDiscord = faDiscord;
  iconBlueSky = faBluesky;

  constructor(public userService: UserService) { }

  get isActiveClass() {
    return {
      'is-active': this.isNavbarActive,
    };
  }

  toggleNavbarActive(): void {
    this.isNavbarActive = !this.isNavbarActive;
  }
}
