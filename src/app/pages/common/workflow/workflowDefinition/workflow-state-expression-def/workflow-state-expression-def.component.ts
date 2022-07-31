import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as _ from 'lodash';
import { FormGroup, FormControl } from '@angular/forms';
import { AppRolesService } from '@common/authority/appRoles.service';
import f from '@assets/lib/odata/ODataFilterBuilder.js';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import { LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { WorkflowStateModel } from '@common/workflow/workflowState.model';
import { WorkflowStateOwnershipModel } from '@common/workflow/workflowStateOwnership.model';

@Component({
	selector: 'kt-workflow-state-expression-def',
	templateUrl: './workflow-state-expression-def.component.html'
})
export class WorkflowStateExpressionComponent implements OnInit {
	frmControlSearch: FormControl = new FormControl();
	isDisabled: boolean = false;
	entUserRoleDefs: any[] = [];
	state: any;

	@Output() saveEmitter = new EventEmitter();

	data: WorkflowStateModel = new WorkflowStateModel();
	dataConfigName: string = '';
	wfStates: WorkflowStateModel[] = [];
	_form: FormGroup = new FormGroup({});
	query = { condition: 'and', rules: [] };

	constructor(@Inject(MAT_DIALOG_DATA) public gridData: any,
		public dialogRef: MatDialogRef<WorkflowStateExpressionComponent>,
		private appRolesService: AppRolesService,
		private layoutUtilsService: LayoutUtilsService,) { }

	ngOnInit() {
		this._form.addControl('isFinalizeProcess', new FormControl([]));
		this._form.addControl('roleGuid', new FormControl([]));

		let filter = f();
		filter.eq('ticketType', 'M');
		let queryParams = new ODataParamsModel();
		queryParams.select = 'guid, description';
		queryParams.filter = filter.toString();
		queryParams.orderby = 'guid asc';

		this.appRolesService.findOData(queryParams).subscribe((result: any) => {
			this.entUserRoleDefs = result.items;

			this.initForm();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	initForm() {
		Object.keys(this.data).forEach(name => {
			if (this._form.controls[name]) {
				this._form.controls[name].setValue(this.data[name]);
			}
		});

		this.data = _.cloneDeep(this.gridData.workflowStateModel);
		this.dataConfigName = this.gridData.selectedConfigName;

		if (this.data.expression !== '') {
			this.query = JSON.parse(this.data.expression);
		}

		this._form.controls['isFinalizeProcess'].setValue(this.data.isFinalizeProcess);
		this.state = this.data.state;
		if (this.data.isFinalizeProcess === true) {
			this.getConfigData(true);
		}

		if (this.data.workflowStateOwnership !== undefined) {
			let selectedItems: number[] = [];
			this.data.workflowStateOwnership.forEach(element => {
				if (!selectedItems.includes(element.roleGuid)) {
					selectedItems.push(element.roleGuid);
				}
			});
			this._form.controls['roleGuid'].setValue(selectedItems);
		}
	}

	save() {
		let wfOwnerShips: WorkflowStateOwnershipModel[] = [];
		let roleGuidData = this._form.controls['roleGuid'].value;
		const isFinalizeProcess = this._form.controls['isFinalizeProcess'].value;

		roleGuidData.forEach(roleGuidItem => {
			const findIndex = this.gridData.workflowStateModel.workflowStateOwnership.findIndex(f => f.roleGuid === roleGuidItem);
			if (findIndex < 0) {
				let wfOwnerShip = new WorkflowStateOwnershipModel();
				wfOwnerShip.roleGuid = roleGuidItem;
				wfOwnerShip.stateGuid = this.gridData.workflowStateModel.guid;

				wfOwnerShips.push(wfOwnerShip);
			} else {
				wfOwnerShips.push(this.gridData.workflowStateModel.workflowStateOwnership[findIndex]);
			}
		});

		this.data.isFinalizeProcess = isFinalizeProcess;
		this.data.workflowStateOwnership = wfOwnerShips;
		this.data.expression = JSON.stringify(this.query);

		this.saveEmitter.emit(this.data);
		this.dialogRef.close();
	}

	cancel() {
		this.dialogRef.close();
	}

	getConfigSettings(event) {
		let item = event.checked;
		this.getConfigData(item);
	}

	getConfigData(event) {
		if (event && this.dataConfigName !== undefined) {
			this.isDisabled = true;
			return;
		}
		this.isDisabled = false;
	}
}
