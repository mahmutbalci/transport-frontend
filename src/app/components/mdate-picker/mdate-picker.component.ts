import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
	parse: {
		dateInput: 'DD/MM/YYYY',
	},
	display: {
		dateInput: 'DD/MM/YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	selector: 'm-date-picker',
	templateUrl: './mdate-picker.component.html',
	providers: [
		{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class MDatepickerComponent implements OnInit {
	@Input() incomingValue: EventEmitter<any> = new EventEmitter<any>();
	@Output() dateSelect: EventEmitter<any> = new EventEmitter<any>();
	date = new FormControl();

	constructor() { }

	ngOnInit() {
		if ((<_moment.Moment>(<unknown>this.incomingValue)).isValid) {
			this.date.setValue(this.incomingValue);			
		} else {
			this.date.setValue(new Date());
		}
		this.dateSelect.emit(this.date);		
	}

	change(dateEvent): any {
		return this.dateSelect.emit(dateEvent.value)
	}
}
