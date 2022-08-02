import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { MessageType, LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BtcJobChainTriggerModel } from '@common/btcJobChains/btcJobChainTrigger.model';
import { FormGroup, FormControl } from '@angular/forms';
import { BtcJobChainDefService } from '@common/framework/btcJobChainDef.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { MMatTableDataSource } from '@core/models/mmat-table.datasource';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-job-chain-trigger-def',
	templateUrl: './job-chain-trigger-def.component.html'
})
export class JobChainTriggerDefComponent implements OnInit {
	succesMessage = this.translate.instant('General.Success');
	frmControlSearch: FormControl = new FormControl();
	btcJobChainTriggerModel: BtcJobChainTriggerModel = new BtcJobChainTriggerModel();
	btcJobChainTriggerDefForm: FormGroup = new FormGroup({});

	isDisabled: boolean = false;
	triggerGuidReadOnly: boolean = false;

	jobTypeDefs: any[] = [];
	jobChainDefs: any[] = [];
	triggers: any[] = [];
	chainGuid: number = 2;
	isUpdate: boolean = false;

	parameters: KeyValueParameter[] = [];
	dataSource = new MMatTableDataSource<KeyValueParameter>();
	displayedColumns = ['key', 'value'];
	classNameReadOnly: boolean = false;

	triggerGuidMaskNumber = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 16,
	});

	maskNumber = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
	});

	@Output() saveEmitter = new EventEmitter();

	constructor(@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<JobChainTriggerDefComponent>,
		private layoutUtilsService: LayoutUtilsService,
		private btcJobChainDefService: BtcJobChainDefService,
		private translate: TranslateService,
		public dialog: MatDialog
	) { }

	ngOnInit() {
		Object.keys(this.btcJobChainTriggerModel).forEach(name => {
			this.btcJobChainTriggerDefForm.addControl(name, new FormControl(this.btcJobChainTriggerModel[name]));
		});

		this.btcJobChainDefService.api.getLookups(['BtcJobChainDef', 'BtcJobTypeDef']).then(res => {
			this.jobTypeDefs = res.find(x => x.name === 'BtcJobTypeDef').data;
			this.jobChainDefs = res.find(x => x.name === 'BtcJobChainDef').data;
		});

		const chainGuid = this.data['chainGuid'];
		const triggerGuid = this.data['triggerGuid'];
		if (triggerGuid && triggerGuid != null) {
			this.btcJobChainDefService.getTrigger(triggerGuid).subscribe(trigger => {
				this.triggerGuidReadOnly = true;
				this.btcJobChainTriggerModel = trigger.data;
				let jsonParams = JSON.parse(this.btcJobChainTriggerModel.parameters);
				this.parameters = [];
				for (var key in jsonParams) {
					if (jsonParams.hasOwnProperty(key)) {
						let keyValueParam = new KeyValueParameter();
						keyValueParam.key = key;
						keyValueParam.value = jsonParams[key];
						this.parameters.push(keyValueParam);
					}
				}
				this.initForm();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
			this.isUpdate = true;
		}
		else {
			let jsonParams = JSON.parse(this.btcJobChainTriggerModel.parameters);
			this.parameters = [];
			for (var key in jsonParams) {
				if (jsonParams.hasOwnProperty(key)) {
					let keyValueParam = new KeyValueParameter();
					keyValueParam.key = key;
					keyValueParam.value = jsonParams[key];
					this.parameters.push(keyValueParam);
				}
			}
		}
		if (chainGuid && chainGuid !== null) {
			this.btcJobChainTriggerModel.chainGuid = chainGuid;
		} else {
			this.layoutUtilsService.showError('Ekranı açmak için chain guid gerekli.');
		}

		this.btcJobChainDefService.getTriggers(this.btcJobChainTriggerModel.chainGuid).subscribe(resTrigger => {
			this.triggers = resTrigger.data;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		this.initForm();
	}

	initForm(): any {
		const controls = this.btcJobChainTriggerDefForm.controls;

		Object.keys(this.btcJobChainTriggerModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.btcJobChainTriggerModel[name]);
			}
		});

		if (this.btcJobChainTriggerModel.type === 'G') {
			this.classNameReadOnly = true;
		}

		if (!this.parameters.some(x => x.key === '' && x.value === '')) {
			this.parameters.push(new KeyValueParameter());
			this.dataSource.setData(this.parameters);
		}
	}

	cancel() {
		this.dialogRef.close();
	}

	onSubmit() {
		if (this.btcJobChainTriggerDefForm.invalid) {
			Object.keys(this.btcJobChainTriggerDefForm.controls).forEach(controlName =>
				this.btcJobChainTriggerDefForm.controls[controlName].markAsTouched()
			);
			return;
		}

		this.btcJobChainTriggerModel = <BtcJobChainTriggerModel>this.btcJobChainTriggerDefForm.value;
		let paramObject: IDictionary = {};
		this.parameters.filter(x => x.key !== '' || x.value !== '').forEach(param => {
			paramObject[param.key] = param.value;
		});
		this.btcJobChainTriggerModel.parameters = JSON.stringify(paramObject);
		this.btcJobChainTriggerModel.className = this.btcJobChainTriggerModel.className.replace(/ /g, '');

		if (this.isUpdate) {
			this.update(this.btcJobChainTriggerModel);
		} else {
			this.create(this.btcJobChainTriggerModel);
		}
	}

	create(model: BtcJobChainTriggerModel) {
		this.btcJobChainDefService.saveTrigger(model).subscribe(response => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 10000, true, false);
			model.guid = response.data;
			this.saveEmitter.emit(model);
			this.dialogRef.close();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	update(model: BtcJobChainTriggerModel) {
		this.btcJobChainDefService.updateTrigger(model).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 10000, true, false);
			this.saveEmitter.emit(model);
			this.dialogRef.close();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	onChange(row: any) {
		if (row.key !== '' || row.value !== '') {
			if (!this.parameters.some(x => x.key === '' && x.value === '')) {
				this.parameters.push(new KeyValueParameter());
				this.dataSource.setData(this.parameters);
			}
		} else if (row.value === '' && row.key === '') {
			this.parameters.pop();
			this.dataSource.setData(this.parameters);
		}
	}

	jobTypeChange(jobType) {
		if (jobType === 'G') {
			this.btcJobChainTriggerModel.className = 'Framework.Batch.DefaultJobGroupBatch, Framework.Batch';
			this.btcJobChainTriggerDefForm.controls['className'].setValue(this.btcJobChainTriggerModel.className);
			this.classNameReadOnly = true;
		} else {
			this.btcJobChainTriggerModel.className = null;
			this.btcJobChainTriggerDefForm.controls['className'].setValue(this.btcJobChainTriggerModel.className);
			this.classNameReadOnly = false;
		}
	}

	pauseChange(checked) {
		if (checked && this.btcJobChainTriggerDefForm.controls['isSkip'].value) {
			this.btcJobChainTriggerDefForm.controls['isSkip'].setValue(false);
		}
	}

	skipChange(checked) {
		if (checked && this.btcJobChainTriggerDefForm.controls['isPause'].value) {
			this.btcJobChainTriggerDefForm.controls['isPause'].setValue(false);
		}
	}
}

export class KeyValueParameter {
	key: string = '';
	value: string = '';
}

export interface IDictionary {
	[index: string]: string;
}
