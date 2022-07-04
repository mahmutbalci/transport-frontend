import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BtcJobChainDefModel } from '@common/btcJobChains/BtcJobChainDef.model';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { MessageType, LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { BtcJobChainDefService } from '@common/framework/btcJobChainDef.service'
import { TranslateService } from '@ngx-translate/core';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

@Component({
	selector: 'm-job-chain-list',
	templateUrl: './job-chain-list.component.html'
})

export class JobChainListComponent implements OnInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'guid', 'description'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	selection = new SelectionModel<BtcJobChainDefModel>(true, []);
	btcJobChainDefResult: BtcJobChainDefModel[] = [];
	btcJobChainDefFilter: BtcJobChainDefModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(private layoutUtilsService: LayoutUtilsService,
		private btcJobChainDefService: BtcJobChainDefService,
		public dialog: MatDialog,
		public translate: TranslateService) { }

	ngOnInit() {
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadBtcJobChainDefList();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadBtcJobChainDefList();
				})
			)
			.subscribe();

		this.dataSource = new ParameterDataSource(this.btcJobChainDefService);
	}

	ngAfterViewInit() {
		this.loadBtcJobChainDefList()
	}

	delete(_item: BtcJobChainDefModel) {
		const _title: string = this.translate.instant('General.Confirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.btcJobChainDefService.delete(_item.guid).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadBtcJobChainDefList();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		});
	}

	loadBtcJobChainDefList() {
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

		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.isOpen = (this.filterStatus == 'true');
		}

		return filter;
	}

	openHistory(key: string) {		
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'BtcJobChainDef',
				key: key
			}
		});
	}
}
