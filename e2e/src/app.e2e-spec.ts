import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';

const expectedH1 = 'Tour of Items';
const expectedTitle = `${expectedH1}`;
const targetItem = { id: 15, name: 'Magneta' };
const targetItemDashboardIndex = 3;
const nameSuffix = 'X';
const newItemName = targetItem.name + nameSuffix;

class Item {
  constructor(public id: number, public name: string) {}

  // Factory methods

  // Item from string formatted as '<id> <name>'.
  static fromString(s: string): Item {
    return new Item(
      +s.substr(0, s.indexOf(' ')),
      s.substr(s.indexOf(' ') + 1),
    );
  }

  // Item from hero list <li> element.
  static async fromLi(li: ElementFinder): Promise<Item> {
    const stringsFromA = await li.all(by.css('a')).getText();
    const strings = stringsFromA[0].split(' ');
    return { id: +strings[0], name: strings[1] };
  }

  // Item id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Item> {
    // Get hero id from the first <div>
    const id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    const name = await detail.element(by.css('h2')).getText();
    return {
      id: +id.substr(id.indexOf(' ') + 1),
      name: name.substr(0, name.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 6', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    const navElts = element.all(by.css('app-root nav a'));

    return {
      navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topItems: element.all(by.css('app-root app-dashboard > div a')),

      appItemsHref: navElts.get(1),
      appItems: element(by.css('app-root app-heroes')),
      allItems: element.all(by.css('app-root app-heroes li')),
      selectedItemSubview: element(by.css('app-root app-heroes > div:last-child')),

      heroDetail: element(by.css('app-root app-hero-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, async () => {
      expect(await browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, async () => {
      await expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Items'];
    it(`has views ${expectedViewNames}`, async () => {
      const viewNames = await getPageElts().navElts.map(el => el!.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', async () => {
      const page = getPageElts();
      expect(await page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top heroes', async () => {
      const page = getPageElts();
      expect(await page.topItems.count()).toEqual(4);
    });

    it(`selects and routes to ${targetItem.name} details`, dashboardSelectTargetItem);

    it(`updates hero name (${newItemName}) in details view`, updateItemNameInDetailView);

    it(`cancels and shows ${targetItem.name} in Dashboard`, async () => {
      await element(by.buttonText('go back')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetItemElt = getPageElts().topItems.get(targetItemDashboardIndex);
      expect(await targetItemElt.getText()).toEqual(targetItem.name);
    });

    it(`selects and routes to ${targetItem.name} details`, dashboardSelectTargetItem);

    it(`updates hero name (${newItemName}) in details view`, updateItemNameInDetailView);

    it(`saves and shows ${newItemName} in Dashboard`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetItemElt = getPageElts().topItems.get(targetItemDashboardIndex);
      expect(await targetItemElt.getText()).toEqual(newItemName);
    });

  });

  describe('Items tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Items view', async () => {
      await getPageElts().appItemsHref.click();
      const page = getPageElts();
      expect(await page.appItems.isPresent()).toBeTruthy();
      expect(await page.allItems.count()).toEqual(10, 'number of heroes');
    });

    it('can route to hero details', async () => {
      await getItemLiEltById(targetItem.id).click();

      const page = getPageElts();
      expect(await page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
      const hero = await Item.fromDetail(page.heroDetail);
      expect(hero.id).toEqual(targetItem.id);
      expect(hero.name).toEqual(targetItem.name.toUpperCase());
    });

    it(`updates hero name (${newItemName}) in details view`, updateItemNameInDetailView);

    it(`shows ${newItemName} in Items list`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular();
      const expectedText = `${targetItem.id} ${newItemName}`;
      expect(await getItemAEltById(targetItem.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newItemName} from Items list`, async () => {
      const heroesBefore = await toItemArray(getPageElts().allItems);
      const li = getItemLiEltById(targetItem.id);
      await li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(await page.appItems.isPresent()).toBeTruthy();
      expect(await page.allItems.count()).toEqual(9, 'number of heroes');
      const heroesAfter = await toItemArray(page.allItems);
      // console.log(await Item.fromLi(page.allItems[0]));
      const expectedItems =  heroesBefore.filter(h => h.name !== newItemName);
      expect(heroesAfter).toEqual(expectedItems);
      // expect(page.selectedItemSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetItem.name}`, async () => {
      const addedItemName = 'Alice';
      const heroesBefore = await toItemArray(getPageElts().allItems);
      const numItems = heroesBefore.length;

      await element(by.css('input')).sendKeys(addedItemName);
      await element(by.buttonText('Add hero')).click();

      const page = getPageElts();
      const heroesAfter = await toItemArray(page.allItems);
      expect(heroesAfter.length).toEqual(numItems + 1, 'number of heroes');

      expect(heroesAfter.slice(0, numItems)).toEqual(heroesBefore, 'Old heroes are still there');

      const maxId = heroesBefore[heroesBefore.length - 1].id;
      expect(heroesAfter[numItems]).toEqual({id: maxId + 1, name: addedItemName});
    });

    it('displays correctly styled buttons', async () => {
      const buttons = await element.all(by.buttonText('x'));

      for (const button of buttons) {
        // Inherited styles from styles.css
        expect(await button.getCssValue('font-family')).toBe('Arial, Helvetica, sans-serif');
        expect(await button.getCssValue('border')).toContain('none');
        expect(await button.getCssValue('padding')).toBe('1px 10px 3px');
        expect(await button.getCssValue('border-radius')).toBe('4px');
        // Styles defined in heroes.component.css
        expect(await button.getCssValue('left')).toBe('210px');
        expect(await button.getCssValue('top')).toBe('5px');
      }

      const addButton = element(by.buttonText('Add hero'));
      // Inherited styles from styles.css
      expect(await addButton.getCssValue('font-family')).toBe('Arial, Helvetica, sans-serif');
      expect(await addButton.getCssValue('border')).toContain('none');
      expect(await addButton.getCssValue('padding')).toBe('8px 24px');
      expect(await addButton.getCssValue('border-radius')).toBe('4px');
    });

  });

  describe('Progressive hero search', () => {

    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      await getPageElts().searchBox.sendKeys('Ma');
      await browser.sleep(1000);

      expect(await getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      await getPageElts().searchBox.sendKeys('g');
      await browser.sleep(1000);
      expect(await getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetItem.name}`, async () => {
      await getPageElts().searchBox.sendKeys('n');
      await browser.sleep(1000);
      const page = getPageElts();
      expect(await page.searchResults.count()).toBe(1);
      const hero = page.searchResults.get(0);
      expect(await hero.getText()).toEqual(targetItem.name);
    });

    it(`navigates to ${targetItem.name} details view`, async () => {
      const hero = getPageElts().searchResults.get(0);
      expect(await hero.getText()).toEqual(targetItem.name);
      await hero.click();

      const page = getPageElts();
      expect(await page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
      const hero2 = await Item.fromDetail(page.heroDetail);
      expect(hero2.id).toEqual(targetItem.id);
      expect(hero2.name).toEqual(targetItem.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetItem() {
    const targetItemElt = getPageElts().topItems.get(targetItemDashboardIndex);
    expect(await targetItemElt.getText()).toEqual(targetItem.name);
    await targetItemElt.click();
    await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    const page = getPageElts();
    expect(await page.heroDetail.isPresent()).toBeTruthy('shows hero detail');
    const hero = await Item.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetItem.id);
    expect(hero.name).toEqual(targetItem.name.toUpperCase());
  }

  async function updateItemNameInDetailView() {
    // Assumes that the current view is the hero details view.
    await addToItemName(nameSuffix);

    const page = getPageElts();
    const hero = await Item.fromDetail(page.heroDetail);
    expect(hero.id).toEqual(targetItem.id);
    expect(hero.name).toEqual(newItemName.toUpperCase());
  }

});

async function addToItemName(text: string): Promise<void> {
  const input = element(by.css('input'));
  await input.sendKeys(text);
}

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
  const hTag = `h${hLevel}`;
  const hText = await element(by.css(hTag)).getText();
  expect(hText).toEqual(expectedText, hTag);
}

function getItemAEltById(id: number): ElementFinder {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getItemLiEltById(id: number): ElementFinder {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toItemArray(allItems: ElementArrayFinder): Promise<Item[]> {
  return allItems.map(hero => Item.fromLi(hero!));
}
