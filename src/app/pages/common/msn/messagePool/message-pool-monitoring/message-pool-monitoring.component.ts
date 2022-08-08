import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSort, MatPaginator, MatDialogRef, MatDialog } from '@angular/material';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessagePoolDetailComponent } from '../message-pool-detail/message-pool-detail.component';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { MsnMessagePoolService } from '@common/framework/msn-message-pool.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { LayoutUtilsService } from '@core/_base/crud';
import { TranslateService } from '@ngx-translate/core';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { MsnMessageTemplateDefService } from '@common/framework/msn-message-template-def.service';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import f from '@assets/lib/odata/ODataFilterBuilder.js';
import { TransportApi } from '@services/transport.api';

@Component({
	selector: 'm-message-pool-monitoring',
	templateUrl: './message-pool-monitoring.component.html'
})
export class MessagePoolMonitoringComponent implements OnInit {
	dataSource: FilteredDataSource;
	displayedColumns = ['actions', 'templateCode', 'key', 'messageType', 'messageTo', 'dueDateTime', 'channelCode', 'processedStatus', 'processDate', 'processTime', 'errorCode'];
	templateCodes: any = [];
	filteredTemplateCodes: any = [];
	templateTypes: any = [];
	messageTypes: any[];
	cfgYesNoNumeric: any[];
	dialogRef: MatDialogRef<MessagePoolDetailComponent>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	isOpenDialog: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	messageMonitoringForm: FormGroup = new FormGroup({});
	isGetClicked: boolean = false;
	lookupObjectList: any[] = [];
	gridColumns = [
		{
			templateCode: 'Issuing.Customer.TemplateCode',
			key: 'Acquiring.Pos.Key',
			messageType: 'Issuing.Customer.MessageType',
			messageTo: 'Issuing.Customer.MessageTo',
			dueDateTime: 'Issuing.Customer.DueDateTime',
			channelCode: 'System.Member.ChannelCode',
			isProcessed: 'Issuing.Customer.ProcessedStatus',
			processDate: 'Issuing.Customer.ProcessDate',
			processTime: 'Issuing.Customer.ProcessTime',
			errorCode: 'General.ErrorCode',
		}
	];

	constructor(
		private transportApi: TransportApi,
		private msnMessagePoolService: MsnMessagePoolService,
		private msnMessageTemplateService: MsnMessageTemplateDefService,
		public dialog: MatDialog,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private excelService: ExcelExportService) { }

	ngOnInit() {
		this.messageMonitoringForm.addControl('key', new FormControl());
		this.messageMonitoringForm.addControl('templateType', new FormControl());
		this.messageMonitoringForm.addControl('templateCode', new FormControl());
		this.messageMonitoringForm.addControl('messageType', new FormControl());
		this.messageMonitoringForm.addControl('messageTo', new FormControl());
		this.messageMonitoringForm.addControl('startDate', new FormControl());
		this.messageMonitoringForm.addControl('endDate', new FormControl());
		this.messageMonitoringForm.addControl('isProcessed', new FormControl());

		var today = new Date();

		this.messageMonitoringForm.controls['startDate'].setValue(today);
		this.messageMonitoringForm.controls['endDate'].setValue(today);

		this.dataSource = new FilteredDataSource(this.msnMessagePoolService);

		this.transportApi.getLookups(['MsnMessageTemplateTypeDef', 'MsnMessageTemplateDef', 'MsnMessageTypeDef', 'CfgYesNoNumeric']).then(res => {
			this.templateCodes = res.find(x => x.name === 'MsnMessageTemplateDef').data;
			this.templateTypes = res.find(x => x.name === 'MsnMessageTemplateTypeDef').data;
			this.messageTypes = res.find(x => x.name === 'MsnMessageTypeDef').data;
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
		});

		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataSource();
				})
			)
			.subscribe();
	}

	loadDataSource() {
		this.isGetClicked = true;
		this.callGetService();
	}

	callGetService() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.dataSource.load(queryParams, 'GetMsnMessagePool');
	}

	filterConfiguration(): any {
		let filter: any = {};
		filter.ProcessStartDate = this.messageMonitoringForm.value['startDate'];
		filter.ProcessEndDate = this.messageMonitoringForm.value['endDate'];
		filter.messageType = this.messageMonitoringForm.value['messageType'];

		let templateCodes: number[] = [];

		if (this.messageMonitoringForm.value['templateCode'])
			templateCodes.push(<number>this.messageMonitoringForm.value['templateCode']);

		if (templateCodes.length > 0) {
			filter.templateCodes = templateCodes;
		}

		if (this.filteredTemplateCodes.length > 0) {
			if (templateCodes.length == 0) {
				this.filteredTemplateCodes.forEach(element => {
					templateCodes.push(<number>element.code);
				});
			}

			filter.templateCodes = templateCodes;
		}

		if (this.messageMonitoringForm.value['isProcessed'] == '0') {
			filter.isProcessed = false;
		} else {
			filter.isProcessed = true;
		}

		return filter;
	}

	clear() {
		this.dataSource.clear();
		this.isGetClicked = false;
		this.messageMonitoringForm.reset();
		this.filteredTemplateCodes = [];
	}

	showDetail(item: any) {
		this.dialogRef = this.dialog.open(MessagePoolDetailComponent, {
			data: { guid: item.guid, showBatchCloseButton: false }
		});
	}

	addLookupObject() {
		this.lookupObjectList.push({ key: 'templateCode', value: this.templateCodes });
		this.lookupObjectList.push({ key: 'messageType', value: this.messageTypes });
	}

	exportAsXLSX(exportAll: boolean): void {
		if (this.lookupObjectList.length === 0)
			this.addLookupObject();

		const queryParams = new QueryParamsModel(this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			(exportAll ? 0 : this.paginator.pageIndex),
			(exportAll ? -1 : this.paginator.pageSize));

		this.excelService.exportAsExcelFileRouting(this.msnMessagePoolService,
			queryParams,
			'GetMsnMessagePool',
			'MessagePool',
			this.gridColumns,
			this.lookupObjectList);
	}

	openHistory(key: string) {
		if (this.lookupObjectList.length == 0)
			this.addLookupObject();

		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'MsnMessagePool',
				key: key,
				lookupObjectList: this.lookupObjectList
			}
		});
	}

	selectTemplateType(templateType: string) {
		let filter = f();
		filter.eq('type', templateType);
		let queryParams = new ODataParamsModel();
		queryParams.select = 'code, description';
		queryParams.filter = filter.toString();
		queryParams.orderby = 'code asc';
		this.msnMessageTemplateService.findOData(queryParams).subscribe((result: any) => {
			this.filteredTemplateCodes = result.items;
			this.templateCodes = this.filteredTemplateCodes;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}
}
