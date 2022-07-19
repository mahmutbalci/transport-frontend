import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatSort, MatPaginator, MatDialogRef } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { MsnMessagePoolDetailModel } from '@common/btc/msn-message-pool-model';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { MsnMessagePoolService } from '@common/framework/msn-message-pool.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TransportApi } from '@services/transport.api';

@Component({
	selector: 'm-message-pool-detail',
	templateUrl: './message-pool-detail.component.html',
	styleUrls: ['./../../../../../pages/monitoringStyle.scss']
})
export class MessagePoolDetailComponent implements OnInit {
	htmlContent = 'deneme';
	config: AngularEditorConfig = {
		editable: true,
		spellcheck: true,
		height: '15rem',
		minHeight: '5rem',
		placeholder: 'Enter text here...',
		translate: 'no',
		customClasses: [
			{
				name: 'quote',
				class: 'quote',
			},
			{
				name: 'redText',
				class: 'redText'
			},
			{
				name: 'titleText',
				class: 'titleText',
				tag: 'h1',
			},
		]
	}

	dataSource: FilteredDataSource;
	messageDetailForm: FormGroup = new FormGroup({});
	msnMessagePoolDetailModel: MsnMessagePoolDetailModel = new MsnMessagePoolDetailModel();
	messageTo: string = "";
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	templateCodes: any = [];
	messageTypes: any[];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { guid: number, showBatchCloseButton: boolean },
		private transportApi: TransportApi,
		private msnMessagePoolService: MsnMessagePoolService,
		private dialogRef: MatDialogRef<MessagePoolDetailComponent>,) { }

	ngOnInit() {

		this.transportApi.getLookups(["MsnMessageTemplateDef", "MsnMessageTypeDef"]).then(res => {
			this.templateCodes = res.find(x => x.name === "MsnMessageTemplateDef").data;
			this.messageTypes = res.find(x => x.name === "MsnMessageTypeDef").data;
		});

		this.messageDetailForm.addControl("htmlContent", new FormControl());
		this.GetDetail();
	}

	filterConfiguration(): any {
		let filter: any = {};
		filter.poolGuid = this.data.guid;
		return filter;
	}

	public GetDetail() {
		let query = new QueryParamsModel({ poolGuid: this.data.guid });
		query.useSubData = false;
		this.msnMessagePoolService.findFiltered(query, "GetMsnMessagePoolDetail").subscribe(res => {
			this.msnMessagePoolDetailModel = res.items;
			this.messageDetailForm.controls["htmlContent"].setValue(res.items.messageBody);
		});
	}

	cancel() {
		this.dialogRef.close();
	}
}
