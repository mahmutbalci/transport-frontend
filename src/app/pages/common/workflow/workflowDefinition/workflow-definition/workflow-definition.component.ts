import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MessageType, LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FrameworkApi } from '@services/framework.api';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { WorkflowStateExpressionComponent } from '@common/workflow/workflowDefinition/workflow-state-expression-def/workflow-state-expression-def.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CfgExpressionConfigDefService } from '@common/framework/cfgExpressionConfigDef.service';
import { EntApiDefService } from '@common/authority/entApiDef.service';
import { MMatTableDataSource } from '@core/models/mmat-table.datasource';
import { LangParserPipe } from 'app/pipes/lang-parser.pipe';
import { LookupPipe } from 'app/pipes/lookup.pipe';
import { WorkflowStateModel } from '@common/workflow/workflowState.model';
import { WorkflowStateOwnershipModel } from '@common/workflow/workflowStateOwnership.model';
import { WorkflowDefinitionModel } from '@common/workflow/workflowDefinition.model';
import { WorkflowDefinitionService } from '@common/workflow/workflowDefinition.service';

@Component({
	selector: 'kt-workflow-definition',
	templateUrl: './workflow-definition.component.html',
})
export class WorkflowDefinitionComponent implements OnInit {
	lookupPipe: LookupPipe = new LookupPipe(new LangParserPipe());
	frmControlSearch: FormControl = new FormControl();
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	dialogRef: MatDialogRef<WorkflowStateExpressionComponent>;
	selectedConfigName: any;
	isExpressionConfig: boolean = false;

	entApiDefs: any[] = [];
	entApiMethod: any[] = [];
	cfgConfigDefs: any[] = [];
	entUserRoleDefs: any[] = [];
	cfgYesNoNumeric: any[] = [];

	_form: FormGroup = new FormGroup({});
	entityModel: WorkflowDefinitionModel = new WorkflowDefinitionModel();

	dataSource = new MMatTableDataSource<WorkflowStateModel>();
	displayedColumns = ['actions', 'role', 'isFinalizeProcess', 'state'];
	query = {
		condition: 'and',
		rules: [
		]
	};

	ind: number = 1;
	isDisabled: boolean = false;
	isSaving: boolean = false;

	maskNumber = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
	});

	guidMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 16,
	});

	constructor(private activatedRoute: ActivatedRoute,
		private entityService: WorkflowDefinitionService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private frameworkApi: FrameworkApi,
		public cfgExpressionConfigDefService: CfgExpressionConfigDefService,
		private entApiDefService: EntApiDefService) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this._form.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.frameworkApi.getLookups(['CfgExpressionConfigDef', 'CfgYesNoNumeric', 'EntApiMethod', 'EntUserRoleDef']).then(res => {
			this.cfgConfigDefs = res.find(x => x.name === 'CfgExpressionConfigDef').data;
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
			this.entApiMethod = res.find(x => x.name === 'EntApiMethod').data;
			this.entUserRoleDefs = res.find(x => x.name === 'EntUserRoleDef').data;

			this.entApiDefService.getAll().subscribe((apiSer: any) => {
				this.entApiDefs = apiSer.result;

				const dynSub = this.activatedRoute.queryParams.subscribe(params => {
					const guid = params.guid;
					this.isDisabled = (params.type === 'show');
					if (guid && guid !== null) {
						this.entityService.get(guid).subscribe(entSer => {
							this.entityModel = entSer.result;
							this.dataSource.setData(_.orderBy(this.entityModel.workflowState, 'state', 'asc'));

							if (!this.isDisabled) {
								this.entityModel._isEditMode = true;
							}

							this.initForm();
						}, (error) => {
							this.layoutUtilsService.showError(error);
						});
					} else {
						this.entityModel = new WorkflowDefinitionModel();
						this.entityModel._isNew = true;
						this.initForm();
					}
				});
				dynSub.unsubscribe();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	initForm(): any {
		const controls = this._form.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});

		if (controls['expressionConfigGuid'].value) {
			this.getConfigCode(controls['expressionConfigGuid'].value);
		}

		if (this.entityModel.expression != null) {
			this.query = JSON.parse(this.entityModel.expression);
		}
	}

	goBack() {
		this.router.navigateByUrl('/common/workflow/workflowDefinition');
	}

	reset() {
		this.entityModel = new WorkflowDefinitionModel();
		this.entityModel._isNew = true;
		this.dataSource = new MMatTableDataSource<WorkflowStateModel>();
	}

	getComponentTitle() {
		if (this.isDisabled) {
			return this.translate.instant('General.View');
		} else if (!this.entityModel || !this.entityModel.guid) {
			return this.translate.instant('General.Add');
		} else if (!this.isDisabled) {
			return this.translate.instant('General.Edit');
		}

		return '';
	}

	save() {
		if (this._form.invalid) {
			Object.keys(this._form.controls).forEach(controlName =>
				this._form.controls[controlName].markAsTouched()
			);
			return;
		}

		this.isSaving = true;

		this.entityModel = <WorkflowDefinitionModel>this._form.value;
		this.entityModel.expression = JSON.stringify(this.query);
		let wfStates = this.dataSource.data;
		this.entityModel.workflowState = wfStates;

		if (this.entityModel._isNew) {
			this.create();
		} else {
			this.update();
		}
	}

	update() {
		this.entityService.update(this.entityModel).subscribe((response: any) => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Update, 5000, true, false)
				.afterClosed().subscribe(() => {
					this.router.navigate(['/common/workflow/workflowDefinition']);
				});
		}, (error) => {
			this.loading = false;
			this.isSaving = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.isSaving = false;
			this.loading = false;
		});
	}

	create() {
		this.entityService.create(this.entityModel)
			.subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false)
					.afterClosed().subscribe(() => {
						this.router.navigate(['/common/workflow/workflowDefinition']);
					});
			}, (error) => {
				this.loading = false;
				this.isSaving = false;
				this.layoutUtilsService.showError(error);
			}, () => {
				this.isSaving = false;
				this.loading = false;
			});
	}

	addStateExpressionButtonOnClick() {
		this.dialogRef = this.dialog.open(WorkflowStateExpressionComponent, {
			data: {
				workflowStateModel: new WorkflowStateModel(),
				selectedConfigName: this.selectedConfigName,
			}
		});

		const sub = this.dialogRef.componentInstance.saveEmitter.subscribe(result => {
			let index = this.dataSource.data.length + 1;
			result.state = index;
			this.entityModel.workflowState.push(result);
			this.dataSource.setData(this.entityModel.workflowState);
		});

		this.dialogRef.afterClosed().subscribe(() => {
			sub.unsubscribe();
		});
	}

	editStateExpressionButtonOnClick(workflowStateModel: WorkflowStateModel) {
		this.dialogRef = this.dialog.open(WorkflowStateExpressionComponent, {
			data: {
				workflowStateModel,
				selectedConfigName: this.selectedConfigName,
			}
		});
		const sub = this.dialogRef.componentInstance.saveEmitter.subscribe(result => {
			this.ind = 1;
			let index = this.entityModel.workflowState.indexOf(workflowStateModel);
			this.entityModel.workflowState[index] = result;
			this.entityModel.workflowState.forEach(el => { el.state = this.ind; this.ind = this.ind + 1; });
			this.dataSource.setData(this.entityModel.workflowState);
		});

		this.dialogRef.afterClosed().subscribe(() => {
			sub.unsubscribe();
		});
	}

	deleteStateExpressionButtonOnClick(selectedData: WorkflowStateModel) {
		this.ind = 1;
		const y = this.entityModel.workflowState.indexOf(selectedData);
		if (y !== -1) {
			this.entityModel.workflowState.splice(y, 1);
		}

		this.entityModel.workflowState.forEach(el => { el.state = this.ind; this.ind = this.ind + 1; });
		this.dataSource.setData(this.entityModel.workflowState);
	}

	dropped(event: CdkDragDrop<WorkflowStateModel[]>) {
		this.ind = 1;
		moveItemInArray(
			this.entityModel.workflowState,
			event.previousIndex,
			event.currentIndex
		);

		this.dataSource.setData(null);
		this.entityModel.workflowState.forEach(el => { el.state = this.ind; this.ind = this.ind + 1; });
		this.dataSource.setData(this.entityModel.workflowState);
	}

	cfgConfigChange(item: any) {
		this.getConfigCode(item.value);
	}

	getConfigCode(item: any) {
		const guid = item;
		if (guid && guid !== null) {
			this.cfgExpressionConfigDefService.get(guid).subscribe(res => {
				if (res && res.result) {
					this.selectedConfigName = res.result.name;
					this.isExpressionConfig = true;
				}
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		}
	}

	getRolDescription(entityOwnerShips: WorkflowStateOwnershipModel[]) {
		let description = '';
		entityOwnerShips.forEach(element => {
			description += this.lookupPipe.transform(element.roleGuid, this.entUserRoleDefs) + ',';
		});
		return description.length > 0 ? (description.length > 50 ? description.substr(0, 50) + '...' : description.substr(0, description.length - 1)) : description;
	}
}
