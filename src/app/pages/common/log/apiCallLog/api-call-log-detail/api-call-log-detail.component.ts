import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { ApiCallLogModel } from '@common/log/apiCallLog.model';
import { FormGroup, FormControl } from '@angular/forms';
import { FrameworkApi } from '@services/framework.api';
import { TranslateService } from '@ngx-translate/core';
import { JsonViewerComponent } from '@components/json-viewer/json-viewer.component';

@Component({
	selector: 'm-api-call-log-detail',
	templateUrl: './api-call-log-detail.component.html'
})

export class ApiCallLogDetailComponent implements OnInit {
	apiCallLogModel: ApiCallLogModel = new ApiCallLogModel();
	detailForm: FormGroup = new FormGroup({});

	cfgChannel: any[] = [];
	entMenuTree: any[] = [];
	ioFlagDef: any[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: ApiCallLogModel,
		private frameworkApi: FrameworkApi,
		private translate: TranslateService,
		private dialogRef: MatDialogRef<ApiCallLogDetailComponent>,
		private dialog: MatDialog) {

		this.apiCallLogModel = data;
	}

	ngOnInit(): void {
		Object.keys(this.apiCallLogModel).forEach(name => {
			if (name === 'elapsedMs') {
				this.detailForm.addControl(name, new FormControl(this.formatTime(this.apiCallLogModel[name])));
			} else {
				this.detailForm.addControl(name, new FormControl(this.apiCallLogModel[name]));
			}
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
	}

	cancel() {
		this.dialogRef.close();
	}

	jsonViewer(value) {
		this.dialog.open(JsonViewerComponent, {
			data: this.apiCallLogModel[value]
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
