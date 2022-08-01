import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatSort, MatPaginator, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BtcJobChainTriggerStatModel } from '@common/btcJobChains/btcJobChainTriggerStat.model';
import { BehaviorSubject, merge } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BtcJobChainTriggerStatService } from '@common/framework/btcJobChainTriggerStat.service';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { BtcJobExecutionHistoryRequestModel } from '@common/btcJobChains/btcJobExecutionHistoryRequest.model';
import { isNullOrUndefined } from 'util';
import { BtcJobChainDefService } from '@common/framework/btcJobChainDef.service';
import { JobTriggerExecutorComponent } from '../job-trigger-executor/job-trigger-executor.component';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { UtilsService } from '@core/_base/crud/utils/utils.service';
import moment from 'moment';

@Component({
	selector: 'm-job-execution-history',
	templateUrl: './job-execution-history.component.html'
})
export class JobExecutionHistoryComponent implements OnInit {
	frmControlSearch: FormControl = new FormControl();
	btcExecutionHistoryFilterForm: FormGroup = new FormGroup({});
	// Table fields
	dataSource: FilteredDataSource;
	displayedColumns = ['actions', 'eodDate', 'chainGuid', 'triggerGuid', 'stat', 'startDateTime', 'endDateTime', 'duration', 'firstTriggerGuid', 'firstTriggerTime', 'triggeredBy', 'producedItemCount', 'processedCount', 'errorCount', 'exception', 'errorCode', 'errorDscr', 'parameters'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	filterStatus: string = '';
	filterType: string = '';
	// Selection
	selection = new SelectionModel<BtcJobChainTriggerStatModel>(true, []);
	jobChainStattxnFeeDefResult: BtcJobChainTriggerStatModel[] = [];
	jobChainStatFilter: BtcJobChainTriggerStatModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	jobChainDefs: any[] = [];
	jobTriggerDefs: any[] = [];
	jobStatDefs: any[] = [];
	filteredJobTriggerDefs: any[] = [];
	btcJobExecutionHistoryRequestModel: BtcJobExecutionHistoryRequestModel = new BtcJobExecutionHistoryRequestModel();

	triggerDialogRef: MatDialogRef<JobTriggerExecutorComponent>;
	isDialog: boolean = false;

	constructor(@Inject(MAT_DIALOG_DATA) public data: any[],
		public dialogRef: MatDialogRef<JobExecutionHistoryComponent>,
		private layoutUtilsService: LayoutUtilsService,
		private utilsService: UtilsService,
		private route: ActivatedRoute,
		private btcJobChainTriggerStatService: BtcJobChainTriggerStatService,
		private btcJobChainDefService: BtcJobChainDefService,
		public translate: TranslateService,
		public dialog: MatDialog, ) { }

	ngOnInit() {
		Object.keys(this.btcJobExecutionHistoryRequestModel).forEach(name => {
			this.btcExecutionHistoryFilterForm.addControl(name, new FormControl(this.btcJobExecutionHistoryRequestModel[name]));
		});

		if (!isNullOrUndefined(this.data["chainGuid"]) && !isNullOrUndefined(this.data["triggerGuid"])) {
			this.btcJobExecutionHistoryRequestModel.chainGuid = this.data["chainGuid"];
			this.btcJobExecutionHistoryRequestModel.triggerGuid = this.data["triggerGuid"];
			this.isDialog = true;
		}
		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.paginator.page)
			.pipe(
				tap(() => {
					this.loadExecutionHistory();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new FilteredDataSource(this.btcJobChainTriggerStatService);

		this.btcJobChainTriggerStatService.api.getLookups(["BtcJobChainDef", "BtcJobChainTrigger", "BtcJobStatDef"]).then(res => {
			this.jobChainDefs = this.utilsService.convertLookup(res.find(x => x.name === "BtcJobChainDef").data);
			this.jobTriggerDefs = this.utilsService.convertLookup(res.find(x => x.name === "BtcJobChainTrigger").data);
			this.filteredJobTriggerDefs = this.utilsService.convertLookup(res.find(x => x.name === "BtcJobChainTrigger").data);
			this.jobStatDefs = res.find(x => x.name === "BtcJobStatDef").data;
			this.init();
		});
	}

	init() {
		const controls = this.btcExecutionHistoryFilterForm.controls;
		Object.keys(this.btcJobExecutionHistoryRequestModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.btcJobExecutionHistoryRequestModel[name]);
			}
		});

		if (this.btcExecutionHistoryFilterForm.valid) {
			this.loadExecutionHistory();
		}
	}

	get() {
		if (this.btcExecutionHistoryFilterForm.valid)
			this.loadExecutionHistory();
		else {
			Object.keys(this.btcJobExecutionHistoryRequestModel).forEach(name =>
				this.btcExecutionHistoryFilterForm.controls[name].markAsTouched()
			);
		}
	}

	cancel() {
		this.dialogRef.close();
	}

	loadExecutionHistory() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			'desc',
			'startDateTime',
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.dataSource.load(queryParams, "GetExecutionHistory");
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		Object.keys(this.btcJobExecutionHistoryRequestModel).forEach(name => {
			if (!isNullOrUndefined(this.btcExecutionHistoryFilterForm.controls[name].value))
				filter[name] = this.btcExecutionHistoryFilterForm.controls[name].value;
		});

		return filter;
	}

	chainChange(value) {
		if (!isNullOrUndefined(value)) {
			this.btcJobChainDefService.getTriggers(value).subscribe((res: any) => {
				this.filteredJobTriggerDefs = this.jobTriggerDefs.filter(x => res.data.some(y => y.guid == x.code));
			});
		}
		else {
			this.filteredJobTriggerDefs = this.jobTriggerDefs;
		}
	}

	runTrigger(row: BtcJobChainTriggerStatModel) {
		this.triggerDialogRef = this.dialog.open(JobTriggerExecutorComponent, {
			data: {
				triggerGuid: row.triggerGuid,
				parameters: row.parameters
			}
		});
	}

	millisecondFormat(ms: any) {
		var date = moment.utc(ms);
		return date.format('HH:mm:ss:SSS');
	}
}
