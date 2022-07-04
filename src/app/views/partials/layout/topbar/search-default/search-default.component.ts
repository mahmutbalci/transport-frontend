// Angular
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MenuConfigService } from '@core/_base/layout/services/menu-config.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
	selector: 'kt-search-default',
	templateUrl: './search-default.component.html',
})
export class SearchDefaultComponent implements OnInit {
	// Public properties

	// Set icon class name
	@Input() icon: string = 'flaticon2-search-1';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	@ViewChild('m_quicksearch_input') searchInput: ElementRef;

	data: any[];
	result: any[];
	loading: boolean;

	constructor(
		private menuConfigService: MenuConfigService
	) {

	}

	ngOnInit(): void {
		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.search(this.searchInput.nativeElement.value);
				})
			)
			.subscribe();
	}

	ngOnDestroy() {

	}

	search(text) {
		if (text.length === 0) {
			this.menuConfigService.setDynamicMenu();
		} else {
			this.menuConfigService.searchModel(text);
		}
	}
}
