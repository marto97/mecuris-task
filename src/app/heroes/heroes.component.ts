import { Component, OnInit } from '@angular/core';

import { Item } from '../hero';
import { ItemService } from '../hero.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class ItemsComponent implements OnInit {
  heroes: Item[] = [];

  constructor(private heroService: ItemService) { }

  ngOnInit(): void {
    this.getItems();
  }

  getItems(): void {
    this.heroService.getItems()
    .subscribe(heroes => this.heroes = heroes);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.heroService.addItem({ name } as Item)
      .subscribe(hero => {
        this.heroes.push(hero);
      });
  }

  delete(hero: Item): void {
    this.heroes = this.heroes.filter(h => h !== hero);
    this.heroService.deleteItem(hero.id).subscribe();
  }

}
