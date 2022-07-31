import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { CfgDashboardService } from '@common/member/cfgDashboard.Service';
import { CfgDashboardModel } from '@common/member/cfgDashboard.model';

@Component({
	selector: 'kt-cfg-dashboard-list',
	templateUrl: './cfg-dashboard-list.component.html',
})
export class CfgDashboardListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'contentHeader', 'startDate', 'endDate', 'highlight', 'insertUser', 'insertDateTime', 'updateUser', 'updateDateTime',];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	menuUrl: string = '/common/member/cfgDashboard';
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;

	cfgYesNoNumeric: any[] = [];

	constructor(
		private entityService: CfgDashboardService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngAfterViewInit(): void {
		this.entityService.api.getLookups(["CfgYesNoNumeric",]).then(res => {
			this.cfgYesNoNumeric = res.find(x => x.name === "CfgYesNoNumeric").data;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});


		const dynSub = this.route.queryParams.subscribe(() => {
			this.loadDataSource();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
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
		filter.contentHeader = searchText;
		filter.timelineContent = searchText;

		return filter;
	}

	delete(item: CfgDashboardModel) {
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
				className: 'CfgDashboard',
				key: key,
			}
		});
	}
}
