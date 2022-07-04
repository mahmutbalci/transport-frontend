// Angular
import { Component, OnInit } from '@angular/core';
// Aktifbank / Atlas
import { ToggleOptions } from '@core/_base/metronic';
// Layout
import { LayoutConfigService } from '@core/_base/layout';

@Component({
	selector: 'kt-header-mobile',
	templateUrl: './header-mobile.component.html'
})
export class HeaderMobileComponent implements OnInit {
	// Public properties
	headerLogo: string;
	asideDisplay: boolean;

	toggleOptions: ToggleOptions = {
		target: 'body',
		targetState: 'kt-header__topbar--mobile-on',
		togglerState: 'kt-header-mobile__toolbar-topbar-toggler--active'
	};

	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(private layoutConfigService: LayoutConfigService) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.headerLogo = this.layoutConfigService.getLogo();
		this.asideDisplay = this.layoutConfigService.getConfig('aside.self.display');
	}
}
