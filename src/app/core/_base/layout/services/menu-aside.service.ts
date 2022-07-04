// Angular
import { Injectable } from '@angular/core';
// RxJS
import { BehaviorSubject } from 'rxjs';
// Object path
import * as objectPath from 'object-path';
// Services
import { MenuConfigService } from './menu-config.service';

@Injectable()
export class MenuAsideService {
	// Public properties
	classes: string;
	menuList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	/**
	 * Service Constructor
	 *
	 * @param menuConfigService: MenuConfigService
	 * @param store: Store<AppState>
	 */
	constructor(
		private menuConfigService: MenuConfigService
	) {
		this.menuConfigService.onMenuUpdated$.subscribe(model => {
			this.menuList$.next(model.configs.aside.items);
		});
	}

	selectMenuItem() {
		this.menuConfigService.onMenuUpdated$.subscribe(model => {
			this.menuList$.next(model.configs.aside.items);
		});
	}
}
