import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
// RXJS
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { TranslateService } from '@ngx-translate/core';
//Page
import { FrameworkApi } from '@services/framework.api';
import { EntUserService } from '@common/authority/entUser.service';
import { UserKey } from '@common/authority/entUser.model';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { FormGroup, FormControl } from '@angular/forms';
import { EntUserDtoModel } from '@common/authority/entUserDto.model';
import emailMask from 'text-mask-addons/dist/emailMask';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { EntUserRolesPopupComponent } from '../ent-user-roles-popup/ent-user-roles-popup.component';

@Component({
	selector: 'kt-ent-user-def-list',
	templateUrl: './ent-user-def-list.component.html',
})
export class EntUserDefListComponent implements OnInit {
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	dataSource: FilteredDataSource;
	gridColumns = [
		{
			id: 'Auth.Input.UserCode',
			name: 'General.Name',
			midname: 'General.Midname',
			surname: 'General.Surname',
			employeeId: 'General.EmployeeId',
			userStat: 'General.UserStat',
			ticketType: 'General.TicketType',
			authType: 'General.AuthType',
			isBuiltInUser: 'General.IsBuiltInUser',
			email: 'General.Email',
			restrictionGuid: 'General.RestrictionProfile',
			lastLoginDateTime: 'General.LastLoginDateTime',
			incorrectPasswordEntries: 'General.IncorrectPasswordEntries',
			lastPasswordChangeDate: 'General.LastPasswordChangeDate',
			lastPasswordResetDate: 'General.LastPasswordResetDate',
		}
	];
	displayedColumns = ['actions',];

	dontShowApiRoles: boolean = true; //api definition disable
	frmControlSearch: FormControl = new FormControl();
	filterForm: FormGroup = new FormGroup({});
	filterModel: EntUserDtoModel = new EntUserDtoModel();

	lookupObjectList: any[] = [];
	pipeObjectList: any[] = [];

	cfgYesNoNumeric: any = [];
	entUserTicketTypeDefs: any = [];
	entUserStatDefs: any = [];
	entUserAuthTypeDefs: any = [];
	entUserRestrictionDefs: any = [];
	entUserRoleDefs: any = [];

	emailMask = emailMask;
	phoneMask = [/[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];

	constructor(private entityService: EntUserService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private frameworkApi: FrameworkApi,
		private excelService: ExcelExportService,
	) { }

	ngOnInit() {
		Object.keys(this.filterModel).forEach(name => {
			this.filterForm.addControl(name, new FormControl(this.filterModel[name]));
		});

		Object.keys(this.gridColumns[0]).forEach(key => {
			this.displayedColumns.push(key);
		});

		this.frameworkApi.getLookups(['CfgYesNoNumeric', 'EntUserTicketTypeDef', 'EntUserStatDef', 'EntUserAuthTypeDef', 'EntUserRestrictionDef', 'EntUserRoleDef']).then(res => {
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
			this.entUserTicketTypeDefs = res.find(x => x.name === 'EntUserTicketTypeDef').data;
			this.entUserStatDefs = res.find(x => x.name === "EntUserStatDef").data;
			this.entUserAuthTypeDefs = res.find(x => x.name === "EntUserAuthTypeDef").data;
			this.entUserRestrictionDefs = res.find(x => x.name === "EntUserRestrictionDef").data;
			this.entUserRoleDefs = res.find(x => x.name === "EntUserRoleDef").data;

			if (this.dontShowApiRoles) {
				this.frameworkApi.getFilteredLookup("EntUserRoleDef", 'ticketType', 'M').then(res => {
					this.entUserRoleDefs = res;
				});
			}
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		this.dataSource = new FilteredDataSource(this.entityService);

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataSource();
				})
			)
			.subscribe();

		this.paginator.page
			.pipe(
				tap(() => {
					this.loadDataSource();
				})
			)
			.subscribe();

		this.loadDataSource();
	}

	getData() {
		this.paginator.pageIndex = 0;
		this.loadDataSource();
	}

	loadDataSource() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		queryParams.useSubData = true;

		this.dataSource.load(queryParams, 'getUsers');
	}

	filterConfiguration(): any {
		const controls = this.filterForm.controls;
		if (this.filterForm.invalid) {
			Object.keys(this.filterModel).forEach(name =>
				controls[name].markAsTouched()
			);

			return;
		}

		let requestObj: EntUserDtoModel = <EntUserDtoModel>this.filterForm.value;
		requestObj.mbrId = parseInt(sessionStorage.getItem("mbrId"));
		requestObj.authType = "L";
		requestObj.ticketType = this.dontShowApiRoles ? 'M' : requestObj.ticketType;

		if (this.filterForm.get('isBuiltInUser').value != null) {
			requestObj.isBuiltInUser = <any>this.filterForm.get('isBuiltInUser').value == 1;
		}

		return requestObj;
	}

	delete(item: EntUserDtoModel) {
		const _title: string = this.translate.instant('General.DeleteConfirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			let key: UserKey = new UserKey();
			key.id = item.id;
			key.mbrId = item.mbrId;

			this.entityService.delete(key).subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Delete);
				this.loadDataSource();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	clearScreen() {
		this.paginator.pageIndex = 0;
		this.filterForm.reset();
		this.dataSource.clear();
	}

	addLookupObject() {
		this.lookupObjectList.push({ key: 'ticketType', value: this.entUserTicketTypeDefs });
		this.lookupObjectList.push({ key: 'isBuiltInUser', value: this.cfgYesNoNumeric });
		this.lookupObjectList.push({ key: 'userStat', value: this.entUserStatDefs });
		this.lookupObjectList.push({ key: 'authType', value: this.entUserAuthTypeDefs });
		this.lookupObjectList.push({ key: 'restrictionGuid', value: this.entUserRestrictionDefs });
		this.lookupObjectList.push({ key: 'roleGuid', value: this.entUserRoleDefs });
	}

	addPipeObject() {
		this.pipeObjectList.push({ key: "lastLoginDateTime", value: 'date', format: 'dd.MM.yyyy' });
		this.pipeObjectList.push({ key: "lastPasswordChangeDate", value: 'date', format: 'dd.MM.yyyy' });
		this.pipeObjectList.push({ key: "lastPasswordResetDate", value: 'date', format: 'dd.MM.yyyy' });
	}

	showUserRoles(item: EntUserDtoModel) {
		this.dialog.open(EntUserRolesPopupComponent, {
			data: {
				userRoleGuids: item.userRoleGuids,
				lookup: this.entUserRoleDefs,
				userId: item.id,
			},
			width: '30%',
		});
	}

	openHistory(item: EntUserDtoModel) {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		let userKey: UserKey = new UserKey();
		userKey.id = item.id;
		userKey.mbrId = item.mbrId;

		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'EntUser',
				key: userKey,
				lookupObjectList: this.lookupObjectList
			}
		});
	}

	exportAsXLSX(exportAll: boolean): void {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		if (this.pipeObjectList.length === 0) {
			this.addPipeObject();
		}

		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			(exportAll ? 0 : this.paginator.pageIndex),
			(exportAll ? -1 : this.paginator.pageSize)
		);

		this.excelService.exportAsExcelFileRouting(this.entityService, queryParams, "getUsers", 'UserList', this.gridColumns, this.lookupObjectList, this.pipeObjectList);

		this.loadDataSource();
	}
}
