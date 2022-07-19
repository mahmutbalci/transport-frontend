import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { TxnMccDefService } from '@common/txn/txnMccDef.service';
import { TxnMccDefModel } from '@common/txn/txnMccDef.model';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { TransportApi } from '@services/transport.api';

@Component({
	selector: 'm-txn-mcc-def-list',
	templateUrl: './txn-mcc-def-list.component.html'
})

export class TxnMccDefListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	gridColumns = [
		{
			code: 'Acquiring.Merchant.Code',
			description: 'General.Description',
			terminalCategoryCode: 'Acquiring.Merchant.McTcc',
			mccGroupCode: 'Acquiring.Merchant.MccGroup',
			isVisa: 'Acquiring.Merchant.Visa',
			isMastercard: 'Acquiring.Merchant.MasterCard',
			isTax: 'Acquiring.Merchant.HasTax',
			taxRatio: 'Acquiring.Merchant.TaxRatio',
		}
	];
	displayedColumns = ['actions',];
	lookupObjectList: any[] = [];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	strFilter: string = '';

	trmCategoryDefs: any = [];
	txnMccGroupDefs: any = [];
	cfgYesNoNumeric: any[];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	responsecodes: any = [];

	constructor(private entityService: TxnMccDefService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private transportApi: TransportApi,
		private translate: TranslateService,
		private excelService: ExcelExportService,
	) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadPageData();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		Object.keys(this.gridColumns[0]).forEach(key => {
			this.displayedColumns.push(key);
		});

		this.transportApi.getLookups(['TrmCategoryDef', 'TxnMccGroupDef', 'CfgYesNoNumeric']).then(res => {
			this.trmCategoryDefs = res.find(x => x.name === 'TrmCategoryDef').data;
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
			this.txnMccGroupDefs = _.sortBy(res.find(x => x.name === 'TxnMccGroupDef').data, [function (o) { return o.description; }]);
		});

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadPageData();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadPageData();
				})
			)
			.subscribe();

		this.dataSource = new ParameterDataSource(this.entityService);
	}

	loadPageData() {
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
		filter.code = searchText;
		filter.description = searchText;
		filter.mccGroupCode = searchText;
		filter.taxRatio = searchText;

		if (this.strFilter && this.strFilter.length > 0) {
			filter.isOpen = (this.strFilter === 'true');
		}
		return filter;
	}

	delete(_item: TxnMccDefModel) {
		const _title: string = this.translate.instant('General.Confirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.entityService.delete(_item.code).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadPageData();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		});
	}

	exportAsXLSX(exportAll: boolean): void {
		if (this.dataSource && this.dataSource.hasItems) {
			if (this.lookupObjectList.length === 0) {
				this.addLookupObject();
			}

			const queryParams = new QueryParamsModel(this.filterConfiguration(), this.sort.direction, this.sort.active, (exportAll ? 0 : this.paginator.pageIndex), (exportAll ? -1 : this.paginator.pageSize));
			let _filtrationFields: string[] = [];
			this.excelService.exportAsExcelFileFilter(this.entityService, queryParams, _filtrationFields, 'MccDefinitionList', this.gridColumns, this.lookupObjectList);
		}
	}

	addLookupObject() {
		this.lookupObjectList.push({ key: 'terminalCategoryCode', value: this.trmCategoryDefs });
		this.lookupObjectList.push({ key: 'mccGroupCode', value: this.txnMccGroupDefs });
		this.lookupObjectList.push({ key: 'isVisa', value: this.cfgYesNoNumeric });
		this.lookupObjectList.push({ key: 'isMastercard', value: this.cfgYesNoNumeric });
		this.lookupObjectList.push({ key: 'isTax', value: this.cfgYesNoNumeric });
	}

	openHistory(key: string) {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'TxnMccDef',
				key: key,
				lookupObjectList: this.lookupObjectList
			}
		});
	}
}
