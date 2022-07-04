// Angular
import { Injectable } from '@angular/core';
// RxJS
import { BehaviorSubject } from 'rxjs';
// Object-Path
import * as objectPath from 'object-path';
// Service
import { MenuConfigService } from './menu-config.service';
import { HtmlClassService } from 'app/views/themes/default/html-class.service';

@Injectable()
export class MenuHorizontalService {
	// Public properties
	menuList$: BehaviorSubject<any> = new BehaviorSubject({});
	attributes: any;
	menuClasses: string;
	/**
	 * Service constructor
	 *
	 * @param menuConfigService: MenuConfigServcie
	 */
	constructor(private menuConfigService: MenuConfigService,
		public htmlClassService: HtmlClassService) {

		this.loadMenu();
	}

	/**
	 * Load menu list
	 */
	loadMenu() {
		// get menu list
		// const menuItems = objectPath.get(this.menuConfigService.initialMenu(), 'header.items');
		// this.menuList$.next(menuItems);

		this.menuConfigService.onMenuUpdated$.subscribe(model => {
			this.menuList$.next(model.configs.header.items);
		});

		this.htmlClassService.onClassesUpdated$.subscribe(classes => {
			// default class
			this.menuClasses =
				'kt-header-menu kt-header-menu-mobile kt-header-menu--layout-default';
			// join the classes array and pass to variable
			// add classes to this host binding class
			// this.menuClasses += ' ' + classes.header_menu.join(' ');
		});

		// get attribute list for the horizontal menu
		this.htmlClassService.onAttributeUpdated$.subscribe(attributes => {
			this.attributes = attributes.header_menu;
		});
	}
}
