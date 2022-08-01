import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { FormGroup, FormControl } from '@angular/forms';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import * as _ from 'lodash';
import { FrameworkApi } from '@services/framework.api';
import { WorkflowApproveComponent } from '@components/workflow-approve/workflow-approve.component';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowProcessModel } from '@common/workflow/workflowProcess.model';
import { WorkflowProcessService } from '@common/workflow/workflowProcess.service';

@Component({
	selector: 'kt-workflow-process-list',
	templateUrl: './workflow-process-list.component.html'
})
export class WorkflowProcessListComponent implements OnInit {
	dataSource: FilteredDataSource;
	dataSource2: FilteredDataSource;
	displayedColumns = ['choose', 'refNumber', 'menuId', 'apiMethod', 'processKey', 'stat', 'expireDate',
		'insertUser', 'insertDateTime', 'insertTime', 'actionBy', 'actionDateTime', 'actionTime'];

	@ViewChild('paginator1') paginator1: MatPaginator;
	@ViewChild('matSort1') matSort1: MatSort;

	@ViewChild('paginator2') paginator2: MatPaginator;
	@ViewChild('matSort2') matSort2: MatSort;

	processStats: any[] = [];
	entApiMethod: any[] = [];
	entMenuTree: any[] = [];
	filterForm: FormGroup = new FormGroup({});

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	workflowProcessModel: WorkflowProcessModel = new WorkflowProcessModel();
	hasFormErrors: boolean = false;
	selectedTab: number = 0;
	frmControlSearch: FormControl = new FormControl();

	maskNumber = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
	});

	constructor(private workflowProcessService: WorkflowProcessService,
		public dialog: MatDialog,
		private frameworkApi: FrameworkApi,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		Object.keys(this.workflowProcessModel).forEach(name => {
			this.filterForm.addControl(name, new FormControl(this.workflowProcessModel[name]));
		});

		this.frameworkApi.getLookups(['WorkflowProcessStats', 'EntApiMethod', 'EntMenuTree']).then(res => {
			this.processStats = res.find(x => x.name === 'WorkflowProcessStats').data;
			this.entApiMethod = res.find(x => x.name === 'EntApiMethod').data;
			this.entMenuTree = res.find(x => x.name === 'EntMenuTree').data;

			this.entMenuTree.forEach(element => {
				if (element.description && element.description.includes('.')) {
					element.description = this.translate.instant(element.description);
				}
			});
		});

		this.dataSource = new FilteredDataSource(this.workflowProcessService);
		this.dataSource2 = new FilteredDataSource(this.workflowProcessService);

		this.filterForm.controls['stat'].setValue(0);
	}

	filterConfiguration(): any {
		return this.filterForm.value;
	}

	getData() {
		if (this.selectedTab == 0) {
			this.paginator1.pageIndex = 0;
			this.loadDataSource1();
		}
		else if (this.selectedTab == 1) {
			this.paginator2.pageIndex = 0;
			this.loadDataSource2();
		}
	}

	changePaginator() {
		if (this.selectedTab == 0) {
			this.loadDataSource1();
		} else {
			this.loadDataSource2();
		}
	}

	loadDataSource1() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.matSort1.direction,
			this.matSort1.active,
			this.paginator1.pageIndex,
			this.paginator1.pageSize
		);

		this.dataSource.load(queryParams, 'getWaitingProcesses');
	}

	loadDataSource2() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.matSort2.direction,
			this.matSort2.active,
			this.paginator2.pageIndex,
			this.paginator2.pageSize
		);

		this.dataSource2.load(queryParams, 'getUserProcesses');
	}

	changeSort() {
		if (this.selectedTab == 0) {
			const queryParams = new QueryParamsModel(
				this.filterConfiguration(),
				this.matSort1.direction,
				this.matSort1.active,
				this.paginator1.pageIndex,
				this.paginator1.pageSize
			);

			this.dataSource.sort(queryParams);
		} else {
			const queryParams = new QueryParamsModel(
				this.filterConfiguration(),
				this.matSort2.direction,
				this.matSort2.active,
				this.paginator2.pageIndex,
				this.paginator2.pageSize
			);

			this.dataSource2.sort(queryParams);
		}

	}

	selectedTabChanged() {
		if (this.selectedTab == 1) {
			this.filterForm.get('insertUser').setValue('');
			this.filterForm.get('insertUser').disable();
		} else {
			this.filterForm.get('insertUser').enable();
		}
	}

	clearScreen() {
		this.filterForm.reset();
		this.dataSource.clear();
		this.dataSource2.clear();

		const controls = this.filterForm.controls;
		Object.keys(this.workflowProcessModel).forEach(name => {
			controls[name].setValue(this.workflowProcessModel[name]);
		});
	}

	dialogRef: MatDialogRef<WorkflowApproveComponent>;
	valueSelected(selectedProcess: WorkflowProcessModel, isAuthorizedUser: boolean = true) {
		this.dialogRef = this.dialog.open(WorkflowApproveComponent, {
			data: {
				processItem: selectedProcess,
				isAuthorizedUser: isAuthorizedUser,
			}
		});

		this.dialogRef.afterClosed().subscribe(() => {
			this.getData();
		});
	}
}
