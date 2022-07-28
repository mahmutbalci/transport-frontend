import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { MenuConfig } from '@core/_config/default/menu.config';

declare let require: any


@Injectable()
export class MenuConfigService {
	public configModel: MenuConfig = new MenuConfig();
	public onMenuUpdated$: BehaviorSubject<MenuConfig> = new BehaviorSubject(this.initialMenu());

	constructor(private translate: TranslateService) {

	}

	lowerCaseTurkish(value) {
		if (value && value != null) {
			value = value.replace('İ', 'I').replace('Ş', 'S').replace('Ç', 'C').replace('Ğ', 'G').replace('Ü', 'U').replace('Ö', 'O').toLowerCase();
		}

		return value;
	}

	setModel(item) {
		let leftMenu: any[] = [];
		leftMenu.push(this.getSection(item.title));
		leftMenu.push.apply(leftMenu, item.aside.items);
		this.configModel.configs.aside.items = leftMenu;
		this.onMenuUpdated$.next(this.configModel);
	}

	searchModel(value: string) {
		if (value) {
			value = value.toLowerCase();
			let userMenus = JSON.parse(sessionStorage.getItem('userMenus'));
			let searchMenuList: any[] = this.getSearchList(value, userMenus);
			this.configModel.configs.aside.items = searchMenuList;
			this.onMenuUpdated$.next(this.configModel);
		}
	}

	getSearchList(value: string, userMenus) {
		let searchMenuList: any[] = [];
		if (userMenus) {
			userMenus.forEach(menu => {
				if (menu.routeUrl == null || menu.routeUrl === '') return;
				let menuName = this.normalize(this.translate.instant(menu.description));
				let search = this.normalize(value);

				if (menuName.search(search) != -1) {
					let item = this.convertToMenuItem(menu);
					searchMenuList.push(item);
				}
			});

		}
		return searchMenuList;
	}

	normalize(value: string): string {
		let charList = [];
		let replacedCharList = [];
		let i = 0;
		charList = unescape(value).toUpperCase().split('');
		charList.forEach(char => {
			if (char == null || char === '̇' || char == undefined) return;
			replacedCharList[i] = char.replace('Ç', 'C').replace('Ğ', 'G').replace('İ', 'I').replace('Ö', 'O').replace('Ş', 'S').replace('Ü', 'U');
			i++;
		});
		return replacedCharList.join('');
	}

	initialMenu(userMenus?): MenuConfig {
		if (!userMenus) {
			userMenus = JSON.parse(sessionStorage.getItem('userMenus'));
		}
		this.configModel.configs.aside.items = this.getLeftMenu(userMenus);
		this.configModel.configs.header.items = this.getTopMenu(userMenus);
		return this.configModel;
	}

	getLeftMenu(userMenus: any[]) {
		let leftMenu: any[] = [];
		leftMenu.push(this.getSection('Modules'));

		let menuList: any[] = [];
		if (userMenus) {
			userMenus.forEach(menu => {
				if (menu.parentMenuGuid == null) {
					let item = this.convertToMenuItem(menu);
					this.pushLeftNode(userMenus, item);
					item.submenu = _.orderBy(item.submenu, ['screenOrder'], ['asc']);
					menuList.push(item);
				}
			});
		}
		menuList = _.orderBy(menuList, ['screenOrder'], ['asc']);
		leftMenu.push.apply(leftMenu, menuList);

		return leftMenu;
	}


	getTopMenu(userMenus: any[]) {
		let topMenu =
		{
			title: 'Modules',
			root: true,
			icon: 'flaticon-squares-2',
			toggle: 'click',
			submenu: {
				type: 'mega',
				width: '1000px',
				alignment: 'left',
				columns: [
				]
			},
		}

		if (userMenus) {
			userMenus.forEach(menu => {
				if (menu.parentMenuGuid == null) {
					let item = {
						guid: menu.guid,
						heading: {
							heading: true,
							title: menu.description,
							translate: menu.description,
						},
						items: []
					};
					this.pushTopNode(userMenus, item);
					item.items = _.orderBy(item.items, ['screenOrder'], ['asc']);

					topMenu.submenu.columns.push(item);
				}
			});
		}

		let menuList: any[] = [];
		topMenu.submenu.columns = _.orderBy(topMenu.submenu.columns, ['screenOrder'], ['asc']);
		menuList.push(topMenu);
		return menuList;
	}

	pushTopNode(userMenus: any[], item: any) {
		userMenus.forEach(subMenu => {
			if (subMenu.parentMenuGuid === item.guid) {
				let subItem = this.convertToMenuItem(subMenu, true);
				subItem.aside = {
					self: {
						bullet: 'dot'
					},
					items: []
				};
				this.pushTopSubNode(userMenus, subItem);
				subItem.aside.items = _.orderBy(subItem.aside.items, ['screenOrder'], ['asc']);
				item.items.push(subItem);
			}
		});
	}

	pushTopSubNode(userMenus: any[], item: any) {
		userMenus.forEach(subMenu => {
			if (subMenu.parentMenuGuid === item.guid) {
				let subItem = this.convertToMenuItem(subMenu, true);
				this.pushTopSubNode(userMenus, subItem);
				if (item.aside) {
					item.aside.items.push(subItem);
				}
				else {
					item.aside = {
						self: {
							bullet: 'dot'
						},
						items: []
					};
					item.aside.items.push(subItem);
				}
			}
		});
	}
	pushLeftNode(userMenus: any[], item: any) {
		userMenus.forEach(subMenu => {
			if (subMenu.parentMenuGuid === item.guid) {
				let subItem = this.convertToMenuItem(subMenu, true);
				subItem.aside = {
					self: {
						bullet: 'dot'
					},
					items: []
				};

				this.pushTopSubNode(userMenus, subItem);
				subItem.aside.items = _.orderBy(subItem.aside.items, ['screenOrder'], ['asc']);
				item.submenu.push(subItem);
			}
		});
	}

	setDynamicMenu(userMenus?: any[]) {
		this.configModel = this.initialMenu(userMenus);
		this.onMenuUpdated$.next(this.configModel);
	}

	getSection(name: string) {
		let section: any = {};
		section.section = name;
		return section;
	}

	convertToMenuItem(menu: any, withoutSub: boolean = false): any {
		let item: any = {};
		item.guid = menu.guid;
		//leaf = false diye bir alan olsa iyi olur suan sadece iconPath den anlayabiliyoruz boşsa leaftir diye...
		if (menu.iconPath != null && menu.iconPath.length > 0) {
			item.root = true;
			item.institutionId = menu.institutionId;
			item.icon = menu.iconPath;
			item.desc = menu.description;

			if (withoutSub === false) {
				item.submenu = [];
			}
		}
		item.screenOrder = menu.screenOrder;
		item.page = menu.routeUrl;
		item.title = menu.description;
		item.translate = menu.description;
		return item;
	}
}
