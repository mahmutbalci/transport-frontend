import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
	selector: 'm-multi-all-select',
	templateUrl: './multi-all-select.component.html',
	styleUrls: ['./multi-all-select.component.scss']
})
export class MultiAllSelectComponent {

	constructor() { }
	@Input() selected: any[];
	@Input() selectPlaceHolder: string;
	@Input() items: any[] = [];
	@Output() selectedValue: EventEmitter<any> = new EventEmitter<any>();
	equals(objOne, objTwo) {
		if (typeof objOne !== 'undefined' && typeof objTwo !== 'undefined') {
			return objOne.code === objTwo.code;
		}
	}

	selectAll(select: NgModel, values) {
		select.update.emit(values);
		this.selectedValue.emit(this.selected);
	}

	deselectAll(select: NgModel) {
		select.update.emit([]);
		this.selectedValue.emit(this.selected);
	}

	change() {
		this.selectedValue.emit(this.selected);
	} 
}
