import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { TranslateService } from '@ngx-translate/core';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { TxnTransactionService } from '@services/transport/txn/txnTransaction-service';
import { MappingMerchantComponent } from '../mapping-merchant/mapping-merchant.component';
import { MappingMerchantModel } from '@models/transport/txn/mappingMerchant.model';
import { MappingMerchantService } from '@services/transport/txn/mappingMerchant-service';

@Component({
  selector: 'kt-mapping-merchant-list',
  templateUrl: './mapping-merchant-list.component.html',
})
export class MappingMerchantListComponent implements OnInit {

	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'bankCode', 'd042SourceAcqId', 'd042DestAcqId', 'd042AcqId'];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	menuUrl: string = '/transport/txn/mappingMerchant';
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;

	cfgYesNoNumeric: any = [];

	constructor(private entityService: MappingMerchantService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(() => {
			this.loadDataSource();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		this.entityService.api.getLookups(['CfgYesNoNumeric',]).then(res => {
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
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
		 filter.code = searchText;

		return filter;
	}

	delete(item: MappingMerchantModel) {
		
		
		const _title: string = this.translate.instant('General.DeleteConfirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			
			this.entityService.delete(item.guid).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadDataSource();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	openHistory(key: string) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'MappingMerchant',
				key: key,
			}
		});
	}

}
