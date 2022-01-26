import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ItemSearchComponent } from '../hero-search/hero-search.component';
import { ItemService } from '../hero.service';
import { ITEMS } from '../mock-heroes';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let heroService;
  let getItemsSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    heroService = jasmine.createSpyObj('ItemService', ['getItems']);
    getItemsSpy = heroService.getItems.and.returnValue(of(ITEMS));
    TestBed
        .configureTestingModule({
          declarations: [DashboardComponent, ItemSearchComponent],
          imports: [RouterTestingModule.withRoutes([])],
          providers: [{provide: ItemService, useValue: heroService}]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Top Items" as headline', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toEqual('Top Items');
  });

  it('should call heroService', waitForAsync(() => {
       expect(getItemsSpy.calls.any()).toBe(true);
     }));

  it('should display 4 links', waitForAsync(() => {
       expect(fixture.nativeElement.querySelectorAll('a').length).toEqual(4);
     }));
});
