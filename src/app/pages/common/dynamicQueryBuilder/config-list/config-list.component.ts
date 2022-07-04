import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { ActivatedRoute } from '@angular/router';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { CfgExpressionConfigDefModel } from '@common/dynamicQueryBuilder/cfgExpressionConfigDef.model';
import { CfgExpressionConfigDefService } from '@common/framework/cfgExpressionConfigDef.service';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

@Component({
	selector: 'm-config-list',
	templateUrl: './config-list.component.html'
})

export class ConfigListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'name', 'description'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	selection = new SelectionModel<CfgExpressionConfigDefModel>(true, []);
	cfgExpressionDefResult: CfgExpressionConfigDefModel[] = [];
	cfgExpressionDefFilter: CfgExpressionConfigDefModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	lookupObjectList: any[] = [];
	configTypeDefs: any[] = [];

	constructor(private layoutUtilsService: LayoutUtilsService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private cfgExpressionConfigDefService: CfgExpressionConfigDefService) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadTxnFeeDefList();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadTxnFeeDefList();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadTxnFeeDefList();
				})
			)
			.subscribe();

		this.dataSource = new ParameterDataSource(this.cfgExpressionConfigDefService);
		this.dataSource.entitySubject.subscribe(res => {
			this.cfgExpressionDefResult = res;
		});
	}

	delete(_item: CfgExpressionConfigDefModel) {
		const _title: string = 'Profile Delete';
		const _description: string = 'Are you sure to permanently delete this Profile?';
		const _waitDesciption: string = 'Profile is being deleted...';
		const _deleteMessage = `Profile has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.cfgExpressionConfigDefService.delete(_item.guid).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadTxnFeeDefList();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		});
	}

	loadTxnFeeDefList() {
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
		filter.name = searchText;

		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.isOpen = (this.filterStatus === 'true');
		}

		return filter;
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.cfgExpressionDefResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.cfgExpressionDefResult.forEach(row => this.selection.select(row));
		}
	}

	fetch() {
		let messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.name} ${elem.description}`,
				id: elem.name
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	addLookupObject() {
		this.cfgExpressionConfigDefService.api.getLookup('CfgExpressionConfigType').then(res => {
			this.configTypeDefs = res;
			this.lookupObjectList.push({ key: 'configType', value: this.configTypeDefs });
		});
	}

	openHistory(key: string) {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'CfgExpressionConfigDef',
				key: key,
				lookupObjectList: this.lookupObjectList
			}
		});
	}
}
