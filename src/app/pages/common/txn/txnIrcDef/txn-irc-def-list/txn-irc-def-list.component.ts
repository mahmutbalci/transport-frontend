import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { TxnIrcDefService } from '@common/txn/txnIrcDef.service';
import { TransportApi } from '@services/transport.api';

@Component({
	selector: 'kt-txn-irc-def-list',
	templateUrl: './txn-irc-def-list.component.html'
})

export class TxnIrcDefListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['code', 'description', 'responseCode',];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	@ViewChild('searchInput') searchInput: ElementRef;
	strFilter: string = '';

	txnResponseCodeDefs: any[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	responsecodes: any = [];

	constructor(private entityService: TxnIrcDefService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private transportApi: TransportApi,
		private translate: TranslateService,) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadPageData();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		this.transportApi.getLookups(['TxnResponseCodeDef']).then(res => {
			this.txnResponseCodeDefs = res.find(x => x.name === 'TxnResponseCodeDef').data;
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
		const searchText: string = this.searchInput.nativeElement.value;

		const filter: any = {};
		filter.code = searchText;
		filter.description = searchText;
		filter.responseCode = searchText;

		if (this.strFilter && this.strFilter.length > 0) {
			filter.isOpen = (this.strFilter === 'true');
		}

		return filter;
	}
}
