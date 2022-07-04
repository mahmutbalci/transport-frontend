import {
	Component,
	OnInit,
	HostBinding,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuConfigService } from '@core/_base/layout/services/menu-config.service';

@Component({
	selector: 'kt-menu-section',
	templateUrl: './menu-section.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuSectionComponent implements OnInit {
	@Input() item: any;

	@HostBinding('class') classes = 'm-menu__section';

	constructor(
		private menuConfigService: MenuConfigService,
		private router: Router,
	) { }

	ngOnInit(): void { }

	openDashBoard() {
		this.menuConfigService.setDynamicMenu();
	}
}
