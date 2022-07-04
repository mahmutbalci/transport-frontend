import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { FrameworkApi } from '@services/framework.api';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { TranslateService } from '@ngx-translate/core';
import { EntApiDefModel } from '@common/authority/entApiDef.model';
import { EntApiDefService } from '@common/authority/entApiDef.service';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import f from '@assets/lib/odata/ODataFilterBuilder.js';

@Component({
	selector: 'kt-ent-api-def-list',
	templateUrl: './ent-api-def-list.component.html'
})
export class EntApiDefListComponent implements OnInit, AfterViewInit {
	// Table fields
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'parentApiGuid', 'apiRoute', 'description'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput') searchInput: ElementRef;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	parentApiDefs: any[] = [];

	constructor(private service: EntApiDefService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private frameworkApi: FrameworkApi,
		private translate: TranslateService) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadDataSourceList();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		let filter = f();
		filter.eq('apiRoute', null);
		let queryParams = new ODataParamsModel();
		queryParams.filter = filter.toString();
		this.service.api.getLookupOData("EntApiDef", queryParams).then(res => {
			this.parentApiDefs = res;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataSourceList();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadDataSourceList();
				})
			)
			.subscribe();
		this.dataSource = new ParameterDataSource(this.service);
	}

	loadDataSourceList() {
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
		filter.apiRoute = searchText;
		filter.parentApiGuid = searchText;
		return filter;
	}

	// /** Delete */
	delete(_item: EntApiDefModel) {
		const _title: string = this.translate.instant('General.Confirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.service.delete(_item.guid.toString()).subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Delete);
				this.loadDataSourceList();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		});
	}

	openHistory(key: string) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'EntApiDef',
				key: key
			}
		});
	}
}
