import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { TranslateService } from '@ngx-translate/core';
import { FrameworkApi } from '@services/framework.api';
//Page
import { EntUserRoleDefService } from '@services/common/authority/entUserRoleDef.service';
import { EntUserRoleDefModel } from '@models/common/authority/entUserRoleDef.model';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

@Component({
	selector: 'kt-ent-user-role-def-list',
	templateUrl: './ent-user-role-def-list.component.html'
})
export class EntUserRoleDefListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'ticketType', 'description'];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';

	_selection = new SelectionModel<EntUserRoleDefModel>(true, []);
	_result: EntUserRoleDefModel[] = [];
	_filter: EntUserRoleDefModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	lookupObjectList: any[] = [];

	ticketTypes: any[] = [];
	entMenuTree: any[] = [];
	entApiDefs: any[] = [];
	entUserRoleDefs: any[] = [];
	dontShowApiRoles: boolean = true; //api definition disable

	constructor(private _service: EntUserRoleDefService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private frameworkApi: FrameworkApi,
	) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadList();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		if (this.dontShowApiRoles) {
			this.displayedColumns = ['actions', 'description'];
		}

		this.frameworkApi.getLookups(['EntUserTicketTypeDef', 'EntMenuTree', 'EntApiDef', 'EntUserRoleDef']).then(res => {
			this.ticketTypes = res.find(x => x.name === 'EntUserTicketTypeDef').data;
			this.entMenuTree = res.find(x => x.name === 'EntMenuTree').data;
			this.entApiDefs = res.find(x => x.name === 'EntApiDef').data;
			this.entUserRoleDefs = res.find(x => x.name === "EntUserRoleDef").data;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadList();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadList();
				})
			)
			.subscribe();

		this.dataSource = new ParameterDataSource(this._service);
		this.dataSource.entitySubject.subscribe(res => {
			this._result = res;
		});
	}

	loadList() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		let filtrationFields: string[] = [];
		if (this.filterStatus && this.filterStatus.length > 0) {
			filtrationFields = ['ticketType'];
		}

		this.dataSource.load(queryParams, filtrationFields);
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.description = searchText;
		filter.ticketType = this.dontShowApiRoles ? 'M' : this.filterStatus;
		return filter;
	}

	delete(_item: EntUserRoleDefModel) {
		const _title: string = this.translate.instant('General.DeleteConfirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this._service.delete(_item.guid.toString()).subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Delete);
				this.loadList();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	addLookupObject() {
		this.lookupObjectList.push({ key: 'ticketType', value: this.ticketTypes });
		this.lookupObjectList.push({ key: 'menuGuid', value: this.entMenuTree });
		this.lookupObjectList.push({ key: 'apiGuid', value: this.entApiDefs });
		this.lookupObjectList.push({ key: 'roleGuid', value: this.entUserRoleDefs });
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
