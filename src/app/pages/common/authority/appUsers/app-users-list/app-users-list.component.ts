import { Component, OnInit, ViewChild } from '@angular/core';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
// RXJS
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { TranslateService } from '@ngx-translate/core';
//Page
import { AppUsersService } from '@common/authority/appUsers.service';
import { UserKey } from '@common/authority/appUsers.model';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { FormGroup, FormControl } from '@angular/forms';
import { AppUserDtoModel } from '@common/authority/appUserDto.model';
import emailMask from 'text-mask-addons/dist/emailMask';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { AppUserRoleRelsPopupComponent } from '../app-user-role-rels-popup/app-user-role-rels-popup.component';

@Component({
	selector: 'kt-app-users-list',
	templateUrl: './app-users-list.component.html',
})
export class AppUsersListComponent implements OnInit {
	dataSource: FilteredDataSource;
	gridColumns = [
		{
			clientId: 'Auth.Input.UserCode',
			name: 'General.Name',
			midname: 'General.Midname',
			surname: 'General.Surname',
			employeeId: 'General.EmployeeId',
			userStat: 'General.UserStat',
			email: 'General.Email',
			isBuiltInUser: 'General.IsBuiltInUser',
			channelCode: 'System.Member.ChannelCode',
			sessionDuration: 'General.SessionDuration',
			validPasswordRegex: 'General.ValidPasswordRegex',
			blockWrongPasswordCount: 'General.BlockWrongPasswordCount',
			incorrectPasswordEntries: 'General.IncorrectPasswordEntries',
		}
	];
	displayedColumns = ['actions',];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	menuUrl: string = '/common/authority/appUsers';
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	frmControlSearch: FormControl = new FormControl();
	filterForm: FormGroup = new FormGroup({});
	filterModel: AppUserDtoModel = new AppUserDtoModel();

	lookupObjectList: any[] = [];
	cfgYesNoNumeric: any = [];
	appChannelCodes: any = [];
	appUserStats: any = [];
	appRoles: any = [];

	emailMask = emailMask;
	phoneMask = [/[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];

	constructor(private entityService: AppUsersService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private excelService: ExcelExportService,
	) { }

	ngOnInit() {
		Object.keys(this.filterModel).forEach(name => {
			this.filterForm.addControl(name, new FormControl(this.filterModel[name]));
		});

		Object.keys(this.gridColumns[0]).forEach(key => {
			this.displayedColumns.push(key);
		});

		this.entityService.api.getLookups(['CfgYesNoNumeric', 'AppUserStats', 'AppChannelCodes', 'AppRoles']).then(res => {
			this.cfgYesNoNumeric = res.data.find(x => x.name === 'CfgYesNoNumeric').data;
			this.appUserStats = res.data.find(x => x.name === 'AppUserStats').data;
			this.appChannelCodes = res.data.find(x => x.name === 'AppChannelCodes').data;
			this.appRoles = res.data.find(x => x.name === 'AppRoles').data;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

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

		this.dataSource = new FilteredDataSource(this.entityService);
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

		let requestObj: AppUserDtoModel = <AppUserDtoModel>this.filterForm.value;
		requestObj.institutionId = parseInt(sessionStorage.getItem('institutionId'));
		if (this.filterForm.get('isBuiltInUser').value != null) {
			requestObj.isBuiltInUser = <any>this.filterForm.get('isBuiltInUser').value == 1;
		}

		return requestObj;
	}

	delete(item: AppUserDtoModel) {
		const _title: string = this.translate.instant('General.DeleteConfirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			let key: UserKey = new UserKey();
			key.clientId = item.clientId;
			key.institutionId = item.institutionId;

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
		this.lookupObjectList.push({ key: 'isBuiltInUser', value: this.cfgYesNoNumeric });
		this.lookupObjectList.push({ key: 'userStat', value: this.appUserStats });
		this.lookupObjectList.push({ key: 'roleGuid', value: this.appRoles });
	}

	addPipeObject() {
	}

	showUserRoles(item: AppUserDtoModel) {
		this.dialog.open(AppUserRoleRelsPopupComponent, {
			data: {
				userRoleIds: item.userRoleIds,
				lookup: this.appRoles,
				userId: item.clientId,
			},
			width: '30%',
		});
	}

	openHistory(item: AppUserDtoModel) {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		let userKey: UserKey = new UserKey();
		userKey.clientId = item.clientId;
		userKey.institutionId = item.institutionId;

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

		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			(exportAll ? 0 : this.paginator.pageIndex),
			(exportAll ? -1 : this.paginator.pageSize)
		);

		this.excelService.exportAsExcelFileRouting(this.entityService,
			queryParams,
			'getUsers',
			'UserList',
			this.gridColumns,
			this.lookupObjectList
		);

		this.loadDataSource();
	}
}
