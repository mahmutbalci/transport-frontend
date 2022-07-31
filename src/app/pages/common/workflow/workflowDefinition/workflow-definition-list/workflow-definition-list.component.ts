import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { AppApisService } from '@common/authority/appApis.service';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { FrameworkApi } from '@services/framework.api';
import { WorkflowDefinitionModel } from '@common/workflow/workflowDefinition.model';
import { WorkflowDefinitionService } from '@common/workflow/workflowDefinition.service';

@Component({
	selector: 'kt-workflow-definition-list',
	templateUrl: './workflow-definition-list.component.html'
})
export class WorkflowDefinitionListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'explanation', 'apiMethod', 'apiRoot'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	entApiDefs: any = [];
	entApiMethod: any[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	responsecodes: any = [];

	constructor(private workflowDefService: WorkflowDefinitionService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private appApisService: AppApisService,
		private frameworkApi: FrameworkApi) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(() => {
			this.loadDataSourceList();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		this.appApisService.getAll().subscribe((res: any) => {
			this.entApiDefs = res.result;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataSourceList();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadDataSourceList();
				})
			)
			.subscribe();

		this.frameworkApi.getLookups(['EntApiMethod']).then(res => {
			this.entApiMethod = res.find(x => x.name === 'EntApiMethod').data;
		});

		this.dataSource = new ParameterDataSource(this.workflowDefService);
	}

	loadDataSourceList() {
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
		filter.apiRoute = searchText;
		filter.explanation = searchText;

		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.apiMethod = this.filterStatus;
		}
		return filter;
	}

	delete(_item: WorkflowDefinitionModel) {
		const _title: string = this.translate.instant('General.Confirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElementWithInfo(_title, _description, _item.guid.toString(), _item.explanation, _waitDesciption);

		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.workflowDefService.delete(_item.guid.toString()).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadDataSourceList();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		});
	}

	getApiDesc(item): string {
		let _desc = '';
		this.entApiDefs.forEach(element => {
			if (element.apiRoute === item) {
				_desc = element.description + ' - ' + element.apiRoute;
			}
		});
		return _desc;
	}

	openHistory(key: string) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'WorkflowDefinition',
				key: key
			}
		});
	}
}
