import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiCallLogService } from '@common/log/apiCallLog.service';
import { FrameworkApi } from '@services/framework.api';
import { FormControl, FormGroup } from '@angular/forms';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { LayoutUtilsService } from '@core/_base/crud';
import { ApiCallLogRequestDto } from '@common/log/apiCallLogRequestDto.model';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { ApiCallLogDetailComponent } from '../api-call-log-detail/api-call-log-detail.component';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
	selector: 'm-api-call-log-list',
	templateUrl: './api-call-log-list.component.html' ,
	styleUrls: ['api-call-log-list.component.scss'],
	animations: [
	  trigger('detailExpand', [
		state('collapsed', style({height: '0px', minHeight: '0'})),
		state('expanded', style({height: '*'})),
		transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
	  ]),
	],
})

export class ApiCallLogListComponent implements OnInit {
	dataSource: FilteredDataSource;

	displayedColumns = ['actions', 'guid',
		'applicationName', 'actionName', 'requestKey', 'apiRoute', 'direction', 'httpStatusCode', 'elapsedMs', 'requestDate', 'requestTime',
		'userCode', 'operatorId', 'menuId', 'channel'];

	frmControlSearch: FormControl = new FormControl();
	filterForm: FormGroup = new FormGroup({});
	apiCallLogRequestDto: ApiCallLogRequestDto = new ApiCallLogRequestDto();

	cfgChannel: any[] = [];
	entMenuTree: any[] = [];
	ioFlagDef: any[] = [];
	dateDiff: number = 30;
	expandedElement: any;

	@ViewChild('headerScroller') headerScroller: ElementRef;
	@ViewChild('tableScroller') tableScroller: ElementRef;
	scrollWidth: number = 0;

	@ViewChild('paginator') private paginator: MatPaginator;
	@ViewChild('nationSort') nationSort: MatSort;

	constructor(private translate: TranslateService,
		private apiCallLogService: ApiCallLogService,
		private frameworkApi: FrameworkApi,
		private layoutUtilsService: LayoutUtilsService,
		private dialog: MatDialog
	) {
	}

	scrollHead() {
		this.tableScroller.nativeElement.scrollTo(this.headerScroller.nativeElement.scrollLeft, 0);
		this.scrollWidth = this.tableScroller.nativeElement.scrollWidth;
	}

	scrollFoot() {
		this.headerScroller.nativeElement.scrollTo(this.tableScroller.nativeElement.scrollLeft, 0);
		this.scrollWidth = this.tableScroller.nativeElement.scrollWidth;
	}

	ngOnInit() {
		this.paginator.pageSize = 500;
		this.nationSort.active = 'requestDate';
		this.nationSort.direction = 'desc';

		Object.keys(this.apiCallLogRequestDto).forEach(name => {
			this.filterForm.addControl(name, new FormControl(this.apiCallLogRequestDto[name]));
		});

		this.frameworkApi.getLookups(['CfgChannelCodeDef', 'EntMenuTree', 'IoFlagDef']).then(res => {
			this.cfgChannel = res.find(x => x.name === 'CfgChannelCodeDef').data;
			this.entMenuTree = res.find(x => x.name === 'EntMenuTree').data;
			this.ioFlagDef = res.find(x => x.name === 'IoFlagDef').data;

			this.entMenuTree.forEach(element => {
				if (element.description && element.description.includes('.')) {
					element.description = this.translate.instant(element.description);
				}
			});
		});

		this.nationSort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.nationSort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataSource();
				})
			)
			.subscribe();

		this.dataSource = new FilteredDataSource(this.apiCallLogService);

		setInterval(() => {
			this.scrollWidth = this.tableScroller.nativeElement.scrollWidth;
		}, 3000);
	}

	loadDataSource() {
		if (!this.validation()) {
			return;
		}

		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.nationSort.direction,
			this.nationSort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.dataSource.load(queryParams, 'GetApiCallLog');
	}

	validation(): boolean {
		if (!this.filterForm.value.requestDateStart || !this.filterForm.value.requestDateEnd) {
			if (this.filterForm.value.guid) {
				return true;
			} else {
				this.layoutUtilsService.showError(this.translate.instant('System.Member.Exception.PlaseEntryStartAndEndDate'));
				return false;
			}
		} else {
			const startTime = this.filterForm.value.requestDateStart['_d'] ? this.filterForm.value.requestDateStart['_d'].getTime() : this.filterForm.value.requestDateStart.getTime();
			const endTime = this.filterForm.value.requestDateEnd['_d'] ? this.filterForm.value.requestDateEnd['_d'].getTime() : this.filterForm.value.requestDateEnd.getTime();
			let dateAbs = endTime - startTime;
			let diffFloor = Math.floor(dateAbs / (1000 * 3600 * 24));
			if (diffFloor < 0) {
				this.layoutUtilsService.showError(this.translate.instant('System.Member.Exception.StartDateCanotBeGretarThanEndDate'));
				return false;
			} else if (diffFloor > this.dateDiff) {
				if (this.filterForm.value.guid) {
					return true;
				} else {
					let description: string = this.translate.instant('System.Member.Exception.DifferenceBetweenDatesCannotExeedDays');
					this.layoutUtilsService.showError(description.replace('{1}', this.dateDiff.toString()));
					return false;
				}
			} else {
				return true;
 }
		}
	}

	filterConfiguration(): any {
		return this.filterForm.value;
	}

	openHistory(guid) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				referenceId: guid
			}
		});
	}

	openDetail(row) {
		this.dialog.open(ApiCallLogDetailComponent, {
			data: row
		});
	}

	formatTime(time) {
		if (time) {
			time = time.toString().padStart(9, '0');
			return time.substr(0, 2) + ':' + time.substr(2, 2) + ':' + time.substr(4, 2) + ':' + time.substr(6, 9);
		} else {
			return '';
		}
	}
}
