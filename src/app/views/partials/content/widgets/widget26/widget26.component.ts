import { Component, Input, OnInit } from '@angular/core';
import { SparklineChartOptions } from '@core/_base/metronic';

@Component({
	selector: 'kt-widget26',
	templateUrl: './widget26.component.html'
})
export class Widget26Component implements OnInit {

	@Input() value: string | number;
	@Input() desc: string;
	@Input() options: SparklineChartOptions;

	constructor() {
	}

	ngOnInit() {
	}

}
