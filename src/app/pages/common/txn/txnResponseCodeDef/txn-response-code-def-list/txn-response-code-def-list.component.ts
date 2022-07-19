import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TxnResponseCodeDefModel } from '@common/txn/txnResponseCodeDef.model';
import { TxnResponseCodeDefService } from '@common/txn/txn-response-code-def.service';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { FrameworkApi } from '@services/framework.api';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

@Component({
	selector: 'm-txn-response-code-def-list',
	templateUrl: './txn-response-code-def-list.component.html'
})
export class TxnResponseCodeDefListComponent implements OnInit, AfterViewInit {
	moduleRootUrl = '/common/txn';
	currentUrl = '/common/txn/txnResponseCodeDef';
	backUrl = '/common/txn';

	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'code', 'description', 'isApproved'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	selection = new SelectionModel<TxnResponseCodeDefModel>(true, []);
	txnResponseCodeDefResult: TxnResponseCodeDefModel[] = [];
	txnResponseCodeDefFilter: TxnResponseCodeDefModel[] = [];

	cfgYesNoNumeric: any[];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(private txnResponseCodeDefService: TxnResponseCodeDefService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private frameworkApi: FrameworkApi
	) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadTxnResponseCodeDefList();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		this.frameworkApi.getLookup('CfgYesNoNumeric').then(res => {
			this.cfgYesNoNumeric = res;
		});

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadTxnResponseCodeDefList();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadTxnResponseCodeDefList();
				})
			)
			.subscribe();

		this.dataSource = new ParameterDataSource(this.txnResponseCodeDefService);
		this.dataSource.entitySubject.subscribe(res => {
			this.txnResponseCodeDefResult = res;
		});
	}

	loadTxnResponseCodeDefList() {
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
		filter.code = searchText;

		return filter;
	}

	deleteTxnResponseCodeDef(_item: TxnResponseCodeDefModel) {
		const _title: string = this.translate.instant('System.Transaction.ResponseCodeDelete');
		const _description: string = this.translate.instant('System.Transaction.AreYouSureToPermanentlyDeleteThisResponseCode');
		const _waitDesciption: string = this.translate.instant('System.Transaction.ResponseCodeIsBeingDeleted');
		const _deleteMessage = this.translate.instant('System.Transaction.ResponseCodeHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.txnResponseCodeDefService.delete(_item.code).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadTxnResponseCodeDefList();
			},
				(error) => {
					this.layoutUtilsService.showError(error);
				});
		});
	}

	openHistory(key: string) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'TxnResponseCodeDef',
				key: key
			}
		});
	}
}
