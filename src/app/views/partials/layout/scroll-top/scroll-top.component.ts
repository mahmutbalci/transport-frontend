// Angular
import { Component } from '@angular/core';
// Trasport
import { ScrollTopOptions } from '@core/_base/metronic';

@Component({
	selector: 'kt-scroll-top',
	templateUrl: './scroll-top.component.html',
})
export class ScrollTopComponent {
	// Public properties
	scrollTopOptions: ScrollTopOptions = {
		offset: 300,
		speed: 600
	};
}
