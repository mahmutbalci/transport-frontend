import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'm-dynamic-spinner',
	templateUrl: './dynamic-spinner.component.html',
	styleUrls: ['./dynamic-spinner.component.scss']
})

export class DynamicSpinnerComponent implements OnInit {

	title: string = '';
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.title = data.title;
	}


	ngOnInit(): void { }
}
