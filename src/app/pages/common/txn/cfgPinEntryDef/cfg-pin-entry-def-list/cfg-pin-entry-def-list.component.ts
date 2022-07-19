import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { CfgPinEntryDefService } from '@common/txn/cfgPinEntryDef.service';
import { CfgPinEntryDefModel } from '@common/txn/cfgPinEntryDef.model';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { TranslateService } from '@ngx-translate/core';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

@Component({
	selector: 'm-cfg-pin-entry-def-list',
	templateUrl: './cfg-pin-entry-def-list.component.html'
})

export class CfgPinEntryDefListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['select', 'actions', 'code', 'description'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	strFilter: string = '';
	selection = new SelectionModel<CfgPinEntryDefModel>(true, []);
	cfgPinEntryDefResult: CfgPinEntryDefModel[] = [];
	cfgPinEntryDefFilter: CfgPinEntryDefModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	responsecodes: any = [];

	constructor(private entityService: CfgPinEntryDefService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadPageData();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
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
		this.dataSource.entitySubject.subscribe(res => {
			this.cfgPinEntryDefResult = res;
		});
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
		filter.description = searchText;
		filter.responseCode = searchText;
		filter.code = searchText;

		if (this.strFilter && this.strFilter.length > 0) {
			filter.isOpen = (this.strFilter === 'true');
		}
		return filter;
	}

	deleteEntity(_item: CfgPinEntryDefModel) {
		const _title: string = this.translate.instant('General.PinEntryMethodDelete');
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

	deleteCfgPinEntryDefs() {
		const _title: string = this.translate.instant('General.PinEntryMethodDelete');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const idsForDeletion: number[] = [];
			for (let i = 0; i < this.selection.selected.length; i++) {
				idsForDeletion.push(this.selection.selected[i].code);
			}

			this.entityService.deleteSelected(idsForDeletion).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadPageData();
				this.selection.clear();
			});
		});
	}

	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.cfgPinEntryDefResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.cfgPinEntryDefResult.forEach(row => this.selection.select(row));
		}
	}

	fetchCfgPinEntryDefs() {
		let messages = [];
		this.selection.selected.forEach(element => {
			messages.push({
				text: `${element.code} ${element.description}`,
				id: element.code
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	openHistory(key: string) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'CfgPinEntryDef',
				key: key
			}
		});
	}
}
