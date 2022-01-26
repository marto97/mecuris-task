import { Component, Input, OnInit } from '@angular/core';


import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Item } from '../item';
import { ItemService } from '../item.service';
import { waitForAsync } from '@angular/core/testing';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: [ './item-detail.component.scss' ]
})
export class ItemDetailComponent implements OnInit {
  item: Item | undefined;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getItem();
  }

  getItem(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.itemService.getItem(id)
      .subscribe(item => this.item = item);

  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (this.item) {
      this.itemService.updateItem(this.item)
        .subscribe(() => this.goBack());
    }
  }


}
