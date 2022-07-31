import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { MMatTableDataSource } from '@core/models/mmat-table.datasource';

@Component({
	selector: 'kt-app-user-role-rels-popup',
	templateUrl: './app-user-role-rels-popup.component.html',
})
export class AppUserRoleRelsPopupComponent implements OnInit {
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	entUserRoleDefs: any = [];
	userId: string = '';

	dataSource = new MMatTableDataSource<number>();
	displayedColumns = ['roleId'];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { lookup: any[], userRoleIds: number[], userId: string, },
		public dialogRef: MatDialogRef<AppUserRoleRelsPopupComponent>,
	) { }

	ngOnInit() {
		let dataList: any[] = [];
		this.data.userRoleIds.forEach(roleId => {
			dataList.push({ roleId: roleId, })
		});

		this.entUserRoleDefs = this.data.lookup;
		this.dataSource.setData(dataList);
		this.userId = this.data.userId;
	}

	close() {
		this.dialogRef.close();
	}
}
