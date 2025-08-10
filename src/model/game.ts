import { Category } from './category';
import {Incentive} from './incentive';

export class Game {
  id: number;
  name: string;
  description: string;
  themes: string[];
  console: string;
  contentWarnings: string;
  categories: Category[];
  emulated: boolean;
  visible: boolean;
  status: string;
  incentives: Incentive[];

  constructor() {
    this.console = '';
    this.categories = [];
    this.incentives = [];
  }
}
