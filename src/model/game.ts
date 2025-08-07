import { Category } from './category';

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

  constructor() {
    this.console = '';
    this.categories = [];
  }
}
