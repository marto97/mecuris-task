import { Component, Input, OnInit } from '@angular/core';


import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Item } from '../hero';
import { ItemService } from '../hero.service';
import { waitForAsync } from '@angular/core/testing';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: [ './hero-detail.component.css' ]
})
export class ItemDetailComponent implements OnInit {
  hero: Item | undefined;

  constructor(
    private route: ActivatedRoute,
    private heroService: ItemService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getItem();
  }

  getItem(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.heroService.getItem(id)
      .subscribe(hero => this.hero = hero);

  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (this.hero) {
      this.heroService.updateItem(this.hero)
        .subscribe(() => this.goBack());
    }
  }


}
