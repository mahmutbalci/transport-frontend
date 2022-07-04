import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { MMatTableDataSource } from '@core/models/mmat-table.datasource';

@Component({
	selector: 'kt-ent-user-roles-popup',
	templateUrl: './ent-user-roles-popup.component.html',
})
export class EntUserRolesPopupComponent implements OnInit {
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	entUserRoleDefs: any = [];
	userId: string = "";

	dataSource = new MMatTableDataSource<number>();
	displayedColumns = ['userRoleGuid'];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { lookup: any[], userRoleGuids: number[], userId: string, },
		public dialogRef: MatDialogRef<EntUserRolesPopupComponent>,
	) { }

	ngOnInit() {
		let dataList: any[] = [];
		this.data.userRoleGuids.forEach(roleGuid => {
			dataList.push({ userRoleGuid: roleGuid, })
		});

		this.entUserRoleDefs = this.data.lookup;
		this.dataSource.setData(dataList);
		this.userId = this.data.userId;
	}

	close() {
		this.dialogRef.close();
	}
}
