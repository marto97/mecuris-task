import { Component, OnInit } from '@angular/core';
import { Item } from '../hero';
import { ItemService } from '../hero.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  heroes: Item[] = [];

  constructor(private heroService: ItemService) { }

  ngOnInit(): void {
    this.getItems();
  }

  getItems(): void {
    this.heroService.getItems()
      .subscribe(heroes => this.heroes = heroes.slice(1, 5));
  }
}
