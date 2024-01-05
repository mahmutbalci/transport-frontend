import { BaseService } from './../../core/_base/layout/services/base.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { Subscription } from 'rxjs';
@Component({
	selector: 'm-dynamic-spinner',
	templateUrl: './dynamic-spinner.component.html',
	styleUrls: ['./dynamic-spinner.component.scss']
})

export class DynamicSpinnerComponent implements OnInit {
	public dialogRef: MatDialogRef<DynamicSpinnerComponent>
	private apiSubscription: Subscription;
	title: string = '';
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dialog: MatDialog
	) {
		this.title = data.title;
	}


	ngOnInit(): void { }


 }