import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { TranslateService } from '@ngx-translate/core';
//Page
import { AppRolesService } from '@services/common/authority/appRoles.service';
import { AppRolesModel } from '@models/common/authority/appRoles.model';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

@Component({
	selector: 'kt-app-roles-list',
	templateUrl: './app-roles-list.component.html'
})
export class AppRolesListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'roleType', 'description'];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	menuUrl: string = '/common/authority/appRoles';
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';

	lookupObjectList: any[] = [];
	appRoleTypes: any[] = [];
	showApiRoles: boolean = true; //api definition disable

	constructor(private entityService: AppRolesService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngAfterViewInit(): void {
		this.entityService.api.getLookups(['AppRoleTypes',]).then(res => {
			this.appRoleTypes = res.find(x => x.name === 'AppRoleTypes').data;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		const dynSub = this.route.queryParams.subscribe(() => {
			this.loadDataSource();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		if (!this.showApiRoles) {
			this.displayedColumns = ['actions', 'description'];
		}

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataSource();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadDataSource();
				})
			)
			.subscribe();

		this.dataSource = new ParameterDataSource(this.entityService);
	}

	loadDataSource() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.dataSource.load(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.description = searchText;
		filter.ticketType = !this.showApiRoles ? 'M' : this.filterStatus;

		return filter;
	}

	delete(item: AppRolesModel) {
		const _title: string = this.translate.instant('General.DeleteConfirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.entityService.delete(item.roleId).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadDataSource();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	addLookupObject() {
		this.lookupObjectList.push({ key: 'roleType', value: this.appRoleTypes });
	}

	openHistory(key: string) {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'EntUserRoleDef',
				key: key,
				lookupObjectList: this.lookupObjectList
			}
		});
	}
}
