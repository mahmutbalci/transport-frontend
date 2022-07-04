import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '@core/_base/layout/services/cache.service.ts';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BaseService } from '@core/_base/layout/services/base.service';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import { ODataDataSource } from '@core/_base/crud/models/odata-datasource';
import f from '@assets/lib/odata/ODataFilterBuilder.js';
import { IssuingApi } from '@services/issuing.api.js';

@Component({
	selector: 'm-dynamic-paramater-page',
	templateUrl: './dynamic-paramater-page.component.html',
	styleUrls: ['./dynamic-paramater-page.component.scss']
})
export class DynamicParamaterPageComponent implements OnInit {

	@Input() page:any = {};
	@Input() service: BaseService;

	dataSource: ODataDataSource;
	displayedColumns = [];
	selectBooleanFilter: boolean = true;

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	selection = new SelectionModel<any>(true, []);
	tableData: any[] = [];
	txnResponseCodeDef: any;

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private excelService: ExcelExportService,
		private issuingApi: IssuingApi,
		private cache: CacheService) { }

	ngOnInit() {
		this.paginator.pageSize = 5;
		this.page.table.columns.forEach(column => {
			this.displayedColumns.push(column.name);
		});
		this.displayedColumns.push('actions');

		this.issuingApi.getLookups(["TxnResponseCodeDef"]).then(res => {
			this.txnResponseCodeDef = res.find(x => x.name === "TxnResponseCodeDef").data;
		});

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadData();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadData();
				})
			)
			.subscribe();

		this.dataSource = new ODataDataSource(this.service);
		let queryParams = new ODataParamsModel();
		queryParams.filter = this.filterConfiguration();
		queryParams.skip = this.paginator.pageIndex * this.paginator.pageSize;
		queryParams.top = this.paginator.pageSize;

		const dynSub = this.route.queryParams.subscribe(params => {
			this.dataSource.load(queryParams);
		});
		dynSub.unsubscribe();

		this.dataSource.entitySubject.subscribe(res => {
			this.tableData = res;
		});
	}

	loadData() {
		const queryParams = new ODataParamsModel();
		queryParams.filter = this.filterConfiguration();
		queryParams.orderby = this.sort.active + " " + this.sort.direction;
		queryParams.skip = this.paginator.pageIndex * this.paginator.pageSize;
		queryParams.top = this.paginator.pageSize;
		this.dataSource.load(queryParams);
	}

	filterConfiguration(): any {
		const searchText: string = this.searchInput.nativeElement.value;

		const compare = f("or");

		if (searchText != null && searchText != "") {

		    compare.and(x => x.contains(x => x.toUpper('code'), searchText.toUpperCase()));
			compare.or(x => x.contains(x => x.toUpper('description'), searchText.toUpperCase()));

			this.txnResponseCodeDef.forEach(element => {
				if (element.description.toUpperCase().includes(searchText.toUpperCase())) {
					compare.or('responseCode', element.code);
				}
				});
			return compare.toString();
		}
	}

	delete(_item: any) {
		const _title: string = this.translate.instant(this.page.deleteTitle);
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.service.delete(_item.code).subscribe(() => {
				this.cache.delete(this.service.endpoint);
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadData();
			},
				(error) => {
					this.layoutUtilsService.showError(error);
				});
		});
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.tableData.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.tableData.forEach(row => this.selection.select(row));
		}
	}

	getItemStatusString(status: boolean = false, badgeTitle: any): string {
		switch (status) {
			case false:
				return this.translate.instant(badgeTitle.false);
			case true:
				return this.translate.instant(badgeTitle.true);
		}
		return '';
	}

	exportAsXLSX(exportAll: boolean): void {
		const queryParams = new ODataParamsModel();
		queryParams.filter = this.filterConfiguration();
		queryParams.orderby = this.sort.active + " " + this.sort.direction;
		queryParams.skip = (exportAll ? 0 : this.paginator.pageIndex * this.paginator.pageSize);
		queryParams.top = (exportAll ? -1 : this.paginator.pageSize);
		this.excelService.exportAsExcelFileParameter(this.service, queryParams, 'CustomerStatusList');
		this.loadData();
	}
}
