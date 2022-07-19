import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { TxnMccGroupDefService } from '@common/txn/txnMccGroupDef.service';
import { TxnMccGroupDefModel } from '@common/txn/txnMccGroupDef.model';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { TransportApi } from '@services/transport.api';

@Component({
	selector: 'm-txn-mcc-group-def-list',
	templateUrl: './txn-mcc-group-def-list.component.html'
})
export class TxnMccGroupDefListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'code', 'description', 'qualifierCode', 'isContactless'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	strFilter: string = '';
	txnQualifierDefs: any = [];
	cfgYesNoNumeric: any[];
	lookupObjectList: any[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	responsecodes: any = [];

	constructor(private entityService: TxnMccGroupDefService,
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
		this.transportApi.getLookups(['TxnQualifierDef', 'CfgYesNoNumeric']).then(res => {
			this.txnQualifierDefs = res.find(x => x.name === 'TxnQualifierDef').data;
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
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

		if (this.strFilter && this.strFilter.length > 0) {
			filter.isOpen = (this.strFilter === 'true');
		}

		return filter;
	}

	delete(_item: TxnMccGroupDefModel) {
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

	addLookupObject() {
		this.lookupObjectList.push({ key: 'qualifierCode', value: this.txnQualifierDefs });
	}

	openHistory(key: string) {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'TxnMccGroupDef',
				key: key,
				lookupObjectList: this.lookupObjectList
			}
		});
	}
}
