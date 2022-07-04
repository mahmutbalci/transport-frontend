import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { BtcJobChainFlowModel } from '@common/btcJobChains/BtcJobChainFlow.model';
import { FormGroup, FormControl } from '@angular/forms';
import { MessageType, LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { BtcJobChainDefService } from '@common/framework/btcJobChainDef.service'
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-job-chain-flow-def',
	templateUrl: './job-chain-flow-def.component.html'
})
export class JobChainFlowDefComponent implements OnInit {
	frmControlSearch: FormControl = new FormControl();
	btcJobChainFlowModel: BtcJobChainFlowModel = new BtcJobChainFlowModel();
	btcJobChainFlowDefForm: FormGroup = new FormGroup({});

	jobChainDefs: any[] = [];
	sourceTriggers: any[] = [];
	targetTriggers: any[] = [];
	isUpdate: boolean = false;
	triggerSelectDisable: boolean = false;

	@Output() saveEmitter = new EventEmitter();

	constructor(@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<JobChainFlowDefComponent>,
		private layoutUtilsService: LayoutUtilsService,
		private btcJobChainDefService: BtcJobChainDefService,
		public dialog: MatDialog,
		private translate: TranslateService) { }

	ngOnInit() {
		Object.keys(this.btcJobChainFlowModel).forEach(name => {
			this.btcJobChainFlowDefForm.addControl(name, new FormControl(this.btcJobChainFlowModel[name]));
		});
		this.btcJobChainDefService.api.getLookups(['BtcJobChainDef']).then(res => {
			this.jobChainDefs = res.find(x => x.name === 'BtcJobChainDef').data;

			this.btcJobChainFlowModel.chainGuid = this.data['chainGuid'];
			const flowGuid = this.data['flowGuid'];
			const targetTriggerGuid = this.data['targetTriggerGuid'];
			this.btcJobChainDefService.getTriggers(this.btcJobChainFlowModel.chainGuid).subscribe(triggers => {
				this.sourceTriggers = triggers.result;
				this.targetTriggers = triggers.result;
				if (flowGuid && flowGuid !== null) {
					this.btcJobChainDefService.getFlow(flowGuid).subscribe(flow => {
						this.btcJobChainFlowModel = flow.result;

						this.initForm();
					}, (error) => {
						this.layoutUtilsService.showError(error);
					});
					this.isUpdate = true;
				} else if (targetTriggerGuid && targetTriggerGuid !== null) {
					this.triggerSelectDisable = true;
					this.btcJobChainFlowModel.triggerGuid = targetTriggerGuid;
					this.initForm();
				} else {
					this.initForm();
				}
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		});
	}

	initForm() {
		const controls = this.btcJobChainFlowDefForm.controls;

		Object.keys(this.btcJobChainFlowModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.btcJobChainFlowModel[name]);
			}
		});
	}

	onSubmit() {
		if (this.btcJobChainFlowDefForm.invalid) {
			Object.keys(this.btcJobChainFlowDefForm.controls).forEach(controlName =>
				this.btcJobChainFlowDefForm.controls[controlName].markAsTouched()
			);
			return;
		}

		this.btcJobChainFlowModel = <BtcJobChainFlowModel>this.btcJobChainFlowDefForm.value;

		if (this.btcJobChainFlowModel.triggerGuid == this.btcJobChainFlowModel.prevTriggerGuid) {
			this.layoutUtilsService.showError(this.translate.instant('System.JobChain.TriggerMustNotSamePrevTrigger'));
			return;
		}

		if (this.isUpdate) {
			this.update(this.btcJobChainFlowModel);
		} else {
			this.create(this.btcJobChainFlowModel);
		}
	}

	create(model: BtcJobChainFlowModel) {
		this.btcJobChainDefService.saveFlow(model).subscribe(response => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Create, 10000, true, false);
			model.guid = response.result;
			this.saveEmitter.emit(model);
			this.dialogRef.close();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	update(model: BtcJobChainFlowModel) {
		this.btcJobChainDefService.updateFlow(model).subscribe(response => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Create, 10000, true, false);
			this.saveEmitter.emit(model);
			this.dialogRef.close();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	cancel() {
		this.dialogRef.close();
	}
}
