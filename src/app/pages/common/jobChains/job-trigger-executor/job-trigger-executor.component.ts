import { Component, OnInit, Inject } from '@angular/core';
import { BtcJobChainService } from '@common/framework/btcJobChain.service';
import { MAT_DIALOG_DATA, MatTableDataSource, MatDialogRef } from '@angular/material';
import { KeyValueParameter, IDictionary } from '../job-chain-trigger-def/job-chain-trigger-def.component';
import { BtcJobChainTriggerModel } from '@common/btcJobChains/btcJobChainTrigger.model';
import { BtcJobChainDefService } from '@common/framework/btcJobChainDef.service';
import { FormGroup, FormControl } from '@angular/forms';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { MMatTableDataSource } from '@core/models/mmat-table.datasource';
import { LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';

@Component({
	selector: 'm-job-trigger-executor',
	templateUrl: './job-trigger-executor.component.html'
})
export class JobTriggerExecutorComponent implements OnInit {
	btcJobChainTriggerDefForm: FormGroup = new FormGroup({});

	btcJobChainTriggerModel: BtcJobChainTriggerModel = new BtcJobChainTriggerModel();

	triggerGuid: number = null;
	executedParameters: string = null;

	parameters: KeyValueParameter[] = [];
	dataSource = new MMatTableDataSource<KeyValueParameter>();
	displayedColumns = ['key', 'value'];
	jobTypeDefs: any[] = [];
	jobChainDefs: any[] = [];

	constructor(@Inject(MAT_DIALOG_DATA) public data: any,
		private btcJobChainService: BtcJobChainService,
		private layoutUtilsService: LayoutUtilsService,
		public dialogRef: MatDialogRef<JobTriggerExecutorComponent>,
		private btcJobChainDefService: BtcJobChainDefService) { }

	ngOnInit() {
		this.triggerGuid = this.data["triggerGuid"];
		this.executedParameters = this.data["parameters"];

		Object.keys(this.btcJobChainTriggerModel).forEach(name => {
			this.btcJobChainTriggerDefForm.addControl(name, new FormControl(this.btcJobChainTriggerModel[name]));
		});

		this.btcJobChainDefService.api.getLookups(["BtcJobChainDef", "BtcJobTypeDef"]).then(res => {
			this.jobTypeDefs = res.find(x => x.name === "BtcJobTypeDef").data;
			this.jobChainDefs = res.find(x => x.name === "BtcJobChainDef").data;
		});

		this.btcJobChainDefService.getTrigger(this.triggerGuid).subscribe(trigger => {
			this.btcJobChainTriggerModel = trigger.data;
			let jsonParams = JSON.parse(this.executedParameters);
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
		},
			(error) => {
				this.layoutUtilsService.showError(error);
			});
	}

	initForm(): any {
		const controls = this.btcJobChainTriggerDefForm.controls;

		Object.keys(this.btcJobChainTriggerModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.btcJobChainTriggerModel[name]);
			}
		});

		if (!this.parameters.some(x => x.key == "" && x.value == "")) {
			this.parameters.push(new KeyValueParameter());
			this.dataSource.setData(this.parameters);
		}
	}

	onChange(row: any) {
		if (row.key != "" || row.value != "") {
			if (!this.parameters.some(x => x.key == "" && x.value == "")) {
				this.parameters.push(new KeyValueParameter());
				this.dataSource.setData(this.parameters);
			}
		}
		else if (row.value == "" && row.key == "") {
			this.parameters.pop();
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

		const runDialogRef = this.layoutUtilsService.yesNoElement("Trigger Çalıştırma İsteği", this.triggerGuid + " - " + this.btcJobChainTriggerModel.description + " işi ekranda belirtilen parametreler ile çalıştırılacaktır. Onaylıyor musunuz?",
			'İş çalıştırılıyor, lütfen bekleyiniz.');
		runDialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.btcJobChainTriggerModel = <BtcJobChainTriggerModel>this.btcJobChainTriggerDefForm.value;
				let paramObject: IDictionary = {};
				this.parameters.filter(x => x.key != "" || x.value != "").forEach(param => {
					paramObject[param.key] = param.value;
				});
				this.btcJobChainTriggerModel.parameters = JSON.stringify(paramObject);
				this.btcJobChainTriggerModel.className = this.btcJobChainTriggerModel.className.replace(/ /g, "");

				this.btcJobChainService.scheduleTrigger(this.triggerGuid, this.btcJobChainTriggerModel.parameters).subscribe(res => {
					this.layoutUtilsService.showNotification("İş başarıyla çalıştırıldı.");
				},
					(error) => {
						this.layoutUtilsService.showError(error);
					});
			}
		});
	}

	maskNumber = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
	});
}
