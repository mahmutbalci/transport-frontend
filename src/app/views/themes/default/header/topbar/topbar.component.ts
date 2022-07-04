// Angular
import { Component } from '@angular/core';

@Component({
	selector: 'kt-topbar',
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
	refreshData: boolean = false;

	notificationClick() {
		this.refreshData = true;
		setTimeout(() => {
			this.refreshData = false;
		}, 1000);
	}
}
