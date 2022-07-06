import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import * as _ from 'lodash';
import { FrameworkApi } from '@services/framework.api';
import { TranslateService } from '@ngx-translate/core';
import { LookupPipe } from 'app/pipes/lookup.pipe';
import { LangParserPipe } from 'app/pipes/lang-parser.pipe';
import { WorkflowProcessService } from '@common/workflow/workflowProcess.service';

@Component({
	selector: 'kt-workflow-item',
	templateUrl: './workflow-item.component.html',
	styleUrls: ['./workflow-item.component.scss']
})
export class WorkflowItemComponent implements OnInit {
	entApiMethod: any[] = [];
	entMenuTree: any[] = [];
	lookupPipe: LookupPipe = new LookupPipe(new LangParserPipe());
	loadLookup: boolean = false;

	@Input() refreshData: boolean = false;
	@Output() totalCount: EventEmitter<number> = new EventEmitter<number>();

	isInitialLoad: boolean = true;

	workflowProcessList: any[] = [];

	constructor(public dialog: MatDialog,
		private workflowProcessService: WorkflowProcessService,
		private frameworkApi: FrameworkApi,
		private translate: TranslateService
	) {
	}

	ngOnInit() {
		setInterval(() => {
			if (this.refreshData || this.isInitialLoad) {
				this.getWaitingWorkflow();
				this.isInitialLoad = false;
			}
		}, 3000);
	}

	getLookup() {
		if (!this.loadLookup) {
			this.frameworkApi.getLookups(['EntApiMethod', 'EntMenuTree']).then(res => {
				this.entApiMethod = res.find(x => x.name === 'EntApiMethod').data;
				this.entMenuTree = res.find(x => x.name === 'EntMenuTree').data;

				this.entMenuTree.forEach(element => {
					if (element.description && element.description.includes('.')) {
						element.description = this.translate.instant(element.description);
					}
				});
				this.loadLookup = true;
			});
		}
	}

	getWaitingWorkflow(): any {
		this.getLookup();
		setTimeout(() => {
			this.workflowProcessList = [];

			let workflowProcessModel = { stat: 0 };
			const queryParams = new QueryParamsModel(workflowProcessModel, '', '', 0, 10);
			this.workflowProcessService.findFiltered(queryParams, 'GetWaitingProcesses').subscribe(result => {
				if (result.items != null && result.items.length > 0) {
					result.items.forEach(element => {
						if (this.entMenuTree.length > 0 && element.menuGuid) {
							element.menuDescription = this.translate.instant(this.lookupPipe.transform(element.menuGuid, this.entMenuTree));
						}

						if (this.entApiMethod.length > 0 && element.apiMethod) {
							element.apiMethod = this.lookupPipe.transform(element.apiMethod, this.entApiMethod);
						}

						this.workflowProcessList.push(element);
					});
				}

				this.totalCount.emit(result.items.length);
			},
				() => {
					this.totalCount.emit(0);
				});
		});
	}

	valueSelected(selectedProcess: any) {
	}
}
