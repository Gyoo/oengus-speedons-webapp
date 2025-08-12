import { Component, OnInit } from '@angular/core';
import { SubmissionService } from '../../../services/submission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Submission } from '../../../model/submission';
import { MarathonService } from '../../../services/marathon.service';
import { faCheck, faClone, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Game } from '../../../model/game';
import { Category } from '../../../model/category';
import moment from 'moment-timezone';
import { Availability } from '../../../model/availability';
import { Answer } from '../../../model/answer';
import { environment } from '../../../environments/environment';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { CategoryService } from '../../../services/category.service';
import { NwbAlertConfig, NwbAlertService } from '@wizishop/ng-wizi-bulma';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import gameConsoles from '../../../assets/consoles.json';
import { firstValueFrom } from 'rxjs';
import { Opponent } from '../../../model/opponent';
import possibleConsoles from '../../../assets/consoles.json';
import {Incentive} from '../../../model/incentive';

@Component({
    selector: 'app-submit',
    templateUrl: './submit.component.html',
    standalone: false
})
export class SubmitComponent implements OnInit {

  public submission: Submission;
  public faTimes = faTimes;
  public faPlus = faPlus;
  public faClone = faClone;
  public moment = moment;
  public timezone = moment.tz.guess();
  public loading = false;
  public localStorage = localStorage;
  public possibleConsoles: string[] = gameConsoles;
  public deleteConfirm = false;
  public themesOptions = [];

  public code: string;

  public isDiscordCheckLoading = false;
  private showDiscordRequirement = true;
  public discordErrors = {
    userNotInGuild: false,
    botNotInGuild: false,
  };

  constructor(public submissionService: SubmissionService,
              public marathonService: MarathonService,
              private translateService: TranslateService,
              private userService: UserService,
              private toastr: NwbAlertService,
              private route: ActivatedRoute,
              private http: HttpClient,
              private location: Location,
              private router: Router) {
    if (this.route.snapshot.data.submission) {
      this.initSubmission(this.route.snapshot.data.submission);
    } else {
      this.initSubmission(new Submission());
    }
  }

  initSubmission(submission: Submission) {
    delete this.submission;
    this.submission = {...submission};
    this.submission.games.forEach(game => {
      game.categories.forEach(category => {
        const duration = moment.duration(category.estimate);
        const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
        const minutes = duration.minutes().toString().padStart(2, '0');
        const seconds = duration.seconds().toString().padStart(2, '0');
        category.estimateHuman = '' + hours + ':' + minutes + ':' + seconds;
      });
      if (!game.incentives) {
        game.incentives = [];
      }
      game.incentives.forEach(incentive => {
        const duration = moment.duration(incentive.duration);
        const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
        const minutes = duration.minutes().toString().padStart(2, '0');
        const seconds = duration.seconds().toString().padStart(2, '0');
        incentive.durationHuman = '' + hours + ':' + minutes + ':' + seconds;
      });
    });
    if (this.marathonService.marathon.questions.length > 0) {
      if (!this.submission.answers || this.submission.answers.length === 0) {
        this.submission.answers = [];
        this.marathonService.marathon.questions.forEach(question => {
          // @ts-ignore
          if (question.questionType === 'SUBMISSION') {
            const answer = new Answer();
            answer.question = question;
            if (question.fieldType === 'CHECKBOX') {
              answer.answer = false;
            }
            this.submission.answers.push(answer);
          }
        });
      } else {
        this.marathonService.marathon.questions.forEach(question => {
          // @ts-ignore
          if (question.questionType === 'SUBMISSION') {
            let found = false;
            this.submission.answers.forEach(existingAnswer => {
              if (existingAnswer.question.id === question.id) {
                found = true;
              }
            });

            if (!found) {
              const answer = new Answer();
              answer.question = question;
              if (question.fieldType === 'CHECKBOX') {
                answer.answer = false;
              }
              this.submission.answers.push(answer);
            }
          }
        });
        this.submission.answers.forEach(answer => {
          if (answer.question.fieldType === 'CHECKBOX') {
            answer.answer = answer.answer === 'true';
          }
        });
      }
    }
    if (!this.submission.opponents || this.submission.opponents.length === 0) {
      this.submission.opponents = [];
    }
  }

  ngOnInit() {
    this.marathonService.marathon.themes.forEach((list, key) => {
      list.forEach(theme => {
        this.themesOptions.push({'group': key, 'value': theme.name});
      });
    });
  }

  goBack() {
    this.location.back();
  }

  get maxCategoriesPerGame(): number {
    return this.marathonService.marathon.maxCategoriesPerGame;
  }

  addGame() {
    const game = new Game();
    game.id = -1;
    game.console = '';
    game.categories.push(new Category());
    this.submission.games.push(game);
  }

  addCategory(index: number) {
    this.submission.games[index].categories.push(new Category());
  }

  addIncentive(index: number) {
    this.submission.games[index].incentives.push(new Incentive());
  }

  minToAvailability(availability: Availability): Date {
    if (availability.from) {
      const fromDate = new Date(availability.from);

      fromDate.setMinutes(fromDate.getMinutes() + 1);

      return fromDate;
    }

    return this.marathonService.marathon.startDate;
  }

  addAvailability() {
    this.submission.availabilities.push(new Availability());
  }

  duplicateAvailabilityToNextDay(index: number) {
    const endDate = this.marathonService.marathon.endDate;
    const availability = {...this.submission.availabilities[index]};
    const fromMoment = moment.tz(availability.from, this.timezone);
    const toMoment = moment.tz(availability.to, this.timezone);
    const duration = moment.duration(toMoment.diff(fromMoment));
    let tmpFrom = moment.tz(availability.to, this.timezone);

    // only add one day if we're not in midnight on the to day
    if (!(toMoment.hour() >= 0 && toMoment.hour() <= 5)) {
      tmpFrom = tmpFrom.add(1, 'days');
    }

    availability.from = tmpFrom.hour(fromMoment.hour())
      .minute(fromMoment.minute())
      .toDate();

    availability.to = moment.tz(availability.from, this.timezone).add(duration).toDate();

    if (moment.tz(availability.to, this.timezone).isAfter(moment.tz(endDate, this.timezone))) {
      availability.to = moment.tz(endDate, this.timezone).toDate();
    }

    this.submission.availabilities.push(availability);
  }

  removeGame(index: number) {
    this.submission.games.splice(index, 1);
  }

  removeCategory(gameIndex: number, categoryIndex: number) {
    this.submission.games[gameIndex].categories.splice(categoryIndex, 1);
  }

  removeIncentive(gameIndex: number, incentiveIndex: number) {
    this.submission.games[gameIndex].incentives.splice(incentiveIndex, 1);
  }

  removeAvailability(index: number) {
    this.submission.availabilities.splice(index, 1);
  }

  submit() {
    if (this.submission.games.find(g => !g.console)) {
      alert('One of your submitted games is missing a console!!');
      return;
    }

    if (!this.checkValidityUrlInputs()) {
      return;
    }

    // ignore double clicks
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.submission.games.forEach(game => {
      game.categories.forEach(category => {
        category.estimate = moment.duration(category.estimateHuman).toISOString();

        // Help the user a little bit
        if (category.type !== 'SINGLE' && category.expectedRunnerCount < 2) {
          category.expectedRunnerCount = 2;
        }
      });
      game.incentives.forEach(incentive => {
        incentive.duration = moment.duration(incentive.durationHuman).toISOString();
      });
    });

    // @ts-ignore
    delete this.submission.opponentDtos;

    if (this.submission.id < 1) {
      this.submissionService.create(this.marathonService.marathon.id, this.submission).add(() => {
        this.refresh();
        this.loading = false;
        this.marathonService.marathon.hasSubmitted = true;
      });
    } else {
      this.submissionService.update(this.marathonService.marathon.id, this.submission).add(() => {
        this.refresh();
        this.loading = false;
        this.marathonService.marathon.hasSubmitted = true;
      });
    }
  }

  refresh() {
    this.submissionService.mine(this.marathonService.marathon.id).then(response => {
      this.initSubmission(response);
    });
  }

  get gameNames() {
    return this.submission.games.map(game => game.name).join(',');
  }

  get categoriesLength() {
    return this.submission.games.map(game => game.categories.length).reduce((acc, element) => acc + element, 0)
      + this.submission.opponents.length;
  }

  addOpponent(opponent: Opponent) {
    this.submission.opponents.push(opponent);
  }

  removeOpponent(index: number) {
    this.submission.opponents.splice(index, 1);
  }

  deleteSubmission(marathonId: string, submissionId: number) {
    this.submissionService.delete(marathonId, submissionId, () => this.router.navigate(['/marathon', this.marathonService.marathon.id]));
  }

  async checkUserInDiscord() {
    if (!this.userHasDiscord) {
      return;
    }

    this.discordErrors.botNotInGuild = false;
    this.discordErrors.userNotInGuild = false;
    this.isDiscordCheckLoading = true;

    const marathonId = this.marathonService.marathon.id;
    const discordUserId = this.userService.user.discordId;

    // TODO: why is this not in the marathon service?
    try {
      const resp = await firstValueFrom(this.http.get<string>(
        `${environment.api}/v1/marathons/${marathonId}/discord/in-guild/${discordUserId}`,
      ));

      this.showDiscordRequirement = false;

      this.translateService.get('alert.submit.DISCORD_VERIFIED').subscribe((res: string) => {
        const alertConfig: NwbAlertConfig = {
          message: res,
          duration: 3000,
          position: 'is-right',
          color: 'is-success',
        };
        this.toastr.open(alertConfig);
      });
    } catch (error: any) {
      console.log(error);

      if (error.status === 404) { // user not in guild
        this.discordErrors.userNotInGuild = true;
      } else if (error.status === 403) { // bot not in guild
        this.discordErrors.botNotInGuild = true;
      }
    } finally {
      this.isDiscordCheckLoading = false;
    }
  }

  get discordRequired(): boolean {
    const marathon = this.marathonService.marathon;

    return !marathon.discordPrivacy && marathon.discordRequired && !marathon.hasSubmitted && this.showDiscordRequirement;
  }

  get userHasDiscord(): boolean {
    const user = this.userService.user;

    return user && Boolean(user.discordId);
  }

  get marathonDiscord(): string {
    return `https://discord.gg/${this.marathonService.marathon.discord}`;
  }

  get title(): string {
    return 'Submit';
  }

  clickEmulatorButton(game: Game, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    game.emulated = !game.emulated;
  }

  checkValidityUrlInputs(): boolean {
    const inputs: Array<HTMLInputElement> = Array.from(document.querySelectorAll('input[type=url]'));
    let result = true;

    for (const input of inputs) {
      result &&= input.reportValidity();
    }

    return result;
  }
}
