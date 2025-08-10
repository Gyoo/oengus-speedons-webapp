export class Incentive {
  id: number;
  name: string;
  description: string;
  incentiveType: string;
  durationHuman: string;
  duration: string;

  constructor() {
    this.incentiveType = 'BONUS_CONTENT';
  }
}
