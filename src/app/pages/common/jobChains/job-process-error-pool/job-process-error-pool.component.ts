import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { MatPaginator, MatSort, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BtcProcessErrorPoolModel } from '@common/btcJobChains/btcProcessErrorPool.model';
import { BehaviorSubject, merge } from 'rxjs';
import { BtcProcessErrorPoolRequestModel } from '@common/btcJobChains/btcProcessErrorPoolRequest.model';
import { LayoutUtilsService } from "@core/_base/crud/utils/layout-utils.service";
import { UtilsService } from '@core/_base/crud/utils/utils.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { isNullOrUndefined } from 'util';
import { tap } from 'rxjs/operators';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { BtcProcessErrorPoolService } from '@common/framework/btcProcessErrorPool.service';
import { BtcJobChainDefService } from '@common/framework/btcJobChainDef.service';

@Component({
	selector: 'm-job-process-error-pool',
	templateUrl: './job-process-error-pool.component.html'
})
export class JobProcessErrorPoolComponent implements OnInit {
	frmControlSearch: FormControl = new FormControl();
	btcProcessErrorPoolForm: FormGroup = new FormGroup({});
	// Table fields
	dataSource: FilteredDataSource;
	displayedColumns = ['eodDate', 'chainGuid', 'triggerGuid', 'uniqueKey', 'errorCode', 'errorDscr'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	filterStatus: string = '';
	filterType: string = '';
	// Selection
	selection = new SelectionModel<BtcProcessErrorPoolModel>(true, []);
	jobChainStattxnFeeDefResult: BtcProcessErrorPoolModel[] = [];
	jobChainStatFilter: BtcProcessErrorPoolModel[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	jobChainDefs: any[] = [];
	jobTriggerDefs: any[] = [];
	filteredJobTriggerDefs: any[] = [];
	btcProcessErrorPoolRequestModel: BtcProcessErrorPoolRequestModel = new BtcProcessErrorPoolRequestModel();
	isDialog: boolean = false;

	constructor(@Inject(MAT_DIALOG_DATA) public data: any[],
		public dialogRef: MatDialogRef<JobProcessErrorPoolComponent>,
		private layoutUtilsService: LayoutUtilsService,
		private utilsService: UtilsService,
		private route: ActivatedRoute,
		private btcProcessErrorPoolService: BtcProcessErrorPoolService,
		private btcJobChainDefService: BtcJobChainDefService,
		public translate: TranslateService,
		public dialog: MatDialog, ) { }

	ngOnInit() {
		Object.keys(this.btcProcessErrorPoolRequestModel).forEach(name => {
			this.btcProcessErrorPoolForm.addControl(name, new FormControl(this.btcProcessErrorPoolRequestModel[name]));
		});

		if (!isNullOrUndefined(this.data["chainGuid"]) && !isNullOrUndefined(this.data["triggerGuid"])) {
			this.btcProcessErrorPoolRequestModel.chainGuid = this.data["chainGuid"];
			this.btcProcessErrorPoolRequestModel.triggerGuid = this.data["triggerGuid"];
			this.isDialog = true;
		}
		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.paginator.page)
			.pipe(
				tap(() => {
					this.loadProcessErrorPool();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new FilteredDataSource(this.btcProcessErrorPoolService);

		this.btcProcessErrorPoolService.api.getLookups(["BtcJobChainDef", "BtcJobChainTrigger"]).then(res => {
			this.jobChainDefs = this.utilsService.convertLookup(res.find(x => x.name === "BtcJobChainDef").data);
			this.jobTriggerDefs = this.utilsService.convertLookup(res.find(x => x.name === "BtcJobChainTrigger").data);
			this.filteredJobTriggerDefs = this.utilsService.convertLookup(res.find(x => x.name === "BtcJobChainTrigger").data);
			this.init();
		});
	}

	init() {
		const controls = this.btcProcessErrorPoolForm.controls;
		Object.keys(this.btcProcessErrorPoolRequestModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.btcProcessErrorPoolRequestModel[name]);
			}
		});

		if (this.btcProcessErrorPoolForm.valid) {
			this.loadProcessErrorPool();
		}
	}

	get() {
		if (this.btcProcessErrorPoolForm.valid)
			this.loadProcessErrorPool();
		else {
			Object.keys(this.btcProcessErrorPoolRequestModel).forEach(name =>
				this.btcProcessErrorPoolForm.controls[name].markAsTouched()
			);
		}
	}

	cancel() {
		this.dialogRef.close();
	}

	loadProcessErrorPool() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			'desc',
			'eodDate',
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.dataSource.load(queryParams, "GetProcessErrorPool");
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		Object.keys(this.btcProcessErrorPoolRequestModel).forEach(name => {
			if (!isNullOrUndefined(this.btcProcessErrorPoolForm.controls[name].value))
				filter[name] = this.btcProcessErrorPoolForm.controls[name].value;
		});

		return filter;
	}

	chainChange(value) {
		if (!isNullOrUndefined(value)) {
			this.btcJobChainDefService.getTriggers(value).subscribe((res: any) => {
				this.filteredJobTriggerDefs = this.jobTriggerDefs.filter(x => res.result.some(y => y.guid == x.code));
			});
		}
		else {
			this.filteredJobTriggerDefs = this.jobTriggerDefs;
		}
	}

	showRowError(row) {
		this.layoutUtilsService.showError(row.errorDscr);
	}

}
