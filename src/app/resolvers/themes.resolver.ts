import { ResolveFn } from '@angular/router';
import { UserProfile } from '../../model/user-profile';
import { inject } from '@angular/core';
import { MarathonService } from '../../services/marathon.service';
import { map } from 'rxjs/operators';
import {Theme} from '../../model/theme';

export const themesResolver: ResolveFn<Map<string, Theme[]>> = (route, state) => {
  const marathonService = inject(MarathonService);

  return marathonService.loadThemes(route.parent.paramMap.get('id'));
};
