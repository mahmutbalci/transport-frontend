import { GetReportDailyRequestDto } from './../../../../../models/transport/report/getReportDailyRequestDto.model';
import { Component, OnInit,ViewChild } from '@angular/core';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import * as _ from 'lodash';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { GetProvisionRequestDto } from '@models/transport/txn/getProvisionRequestDto.model';
import { TxnTransactionService } from '@services/transport/txn/txnTransaction-service';
import { TranslateService } from '@ngx-translate/core';
import { ReportDailyService } from '@services/transport/report/reportDaily-service';

@Component({
  selector: 'kt-daily-monitoring',
  templateUrl: './daily-monitoring.component.html',
 
})
export class DailyMonitoringComponent implements OnInit {
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	dataSourceOnl: FilteredDataSource;
	gridColumnsOnl = [
		{

			f13: 'Transportation.ReportsDaily.F13',
			f39ResponseCode: 'Transportation.ReportsDaily.F39ResponseCode',
			f42MerchantId: 'Transportation.ReportsDaily.F42MerchantId',
			f43Location : 'Transportation.ReportsDaily.F43Location',
			totalAmount: 'Transportation.ReportsDaily.TotalAmount',
			
			totalCount:'Transportation.ReportsDaily.TotalCount',
			totalCampaignAmount: 'Transportation.ReportsDaily.TotalCampaignAmount',
			totalCampaignCount: 'Transportation.ReportsDaily.TotalCampaignCount',
			indicator: 'Transportation.ReportsDaily.OfflineOnlineIndicator',
			mcCount :'Transportation.ReportsDaily.McCount',	
			visaCount :'Transportation.ReportsDaily.VisaCount',	
			troyCount :'Transportation.ReportsDaily.TroyCount',	
			otherCount: 'Transportation.ReportsDaily.OtherCount',	
		}
	];
	displayedColumnsOnl = [];

	dataSourceClr: FilteredDataSource;
	gridColumnsClr = [
		{

			f13: 'Transportation.ReportsDaily.F13',
			f39ResponseCode: 'Transportation.ReportsDaily.F39ResponseCode',
			f42MerchantId: 'Transportation.ReportsDaily.F42MerchantId',
			f43Location : 'Transportation.ReportsDaily.F43Location',
			totalAmount: 'Transportation.ReportsDaily.TotalAmount',
			totalCount:'Transportation.ReportsDaily.TotalCount',
			totalCampaignAmount: 'Transportation.ReportsDaily.TotalCampaignAmount',
			totalCampaignCount: 'Transportation.ReportsDaily.TotalCampaignCount',
			indicator: 'Transportation.ReportsDaily.OfflineOnlineIndicator',
			mcCount :'Transportation.ReportsDaily.McCount',	
			visaCount :'Transportation.ReportsDaily.VisaCount',	
			troyCount :'Transportation.ReportsDaily.TroyCount',	
			otherCount: 'Transportation.ReportsDaily.OtherCount',	
			
			
		
		}
	];
	displayedColumnsClr = [];

	requestModel: GetReportDailyRequestDto = new GetReportDailyRequestDto();
	filterForm: FormGroup = new FormGroup({});

	@ViewChild('paginatorOnl') paginatorOnl: MatPaginator;
	@ViewChild('sortOnl') sortOnl: MatSort;
	@ViewChild('paginatorClr') paginatorClr: MatPaginator;
	@ViewChild('sortClr') sortClr: MatSort;

	hasFormError: boolean = false;
	selectedTab: number = 0;

	cardNumberMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, ' ', /[0-9]/, /[0-9]/, /['*']/, /['*']/, ' ',
		/['*']/, /['*']/, /['*']/, /['*']/, ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];
	clearCardMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, ' ', /[0-9]/, /[0-9]/, /[0-9,'*']/, /[0-9,'*']/, ' ',
		/[0-9,'*']/, /[0-9,'*']/, /[0-9,'*']/, /[0-9,'*']/, ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, ' ', /[0-9]/, /[0-9]/, /[0-9]/,];
	rrnNumberMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
	authCodeMask = [/[0-9,A-Z,a-z]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];
	responseCodeMask = [/[0-9]/, /[0-9]/,];
	timeMask = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];

	guidNumberMask = createNumberMask({
		prefix: '',
		suffix: '',
		allowDecimal: false,
		includeThousandsSeparator: false,
		integerLimit: 16,
	});

	lookupObjectList: any[] = [];
	pipeObjectList: any[] = [];
	cfgYesNoNumeric: any[] = [];
	txnCurrencyDefs: any[] = [];
	cmpCampaignDefs: any[] = [];
	keyTypeDefs: any[] = [];
	offlineOnlineIndicators: any[] = [];
	constructor(
		private rprDailyService: ReportDailyService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private excelService: ExcelExportService,
		private translate: TranslateService,
	) { }

  ngOnInit() {
		Object.keys(this.requestModel).forEach(name => {
			this.filterForm.addControl(name, new FormControl(this.requestModel[name]));
		});

		Object.keys(this.gridColumnsOnl[0]).forEach(key => {
			this.displayedColumnsOnl.push(key);
		});

		Object.keys(this.gridColumnsClr[0]).forEach(key => {
			this.displayedColumnsClr.push(key);
		});

		this.offlineOnlineIndicators.push({ code: '0', description: 'Offline' });
		this.offlineOnlineIndicators.push({ code: '1', description: 'Online' });

		

		this.dataSourceOnl = new FilteredDataSource(this.rprDailyService);
		this.dataSourceClr = new FilteredDataSource(this.rprDailyService);
  }
 
	getData() {
		this.dataSourceOnl.clear();
		this.dataSourceClr.clear();
		//  this.paginatorOnl.pageIndex = 0;
		//  this.paginatorClr.pageIndex = 0;
		 this.loadDataSource();
	}
	loadDataSource() {
		switch (this.selectedTab) {
			case 0:
				const queryParamsOnl = new QueryParamsModel(
					this.filterConfiguration(),
					this.sortOnl.direction,
					this.sortOnl.active,
					this.paginatorOnl.pageIndex,
					this.paginatorOnl.pageSize
				);

				if (this.hasFormError) {
					return;
				}

				this.dataSourceOnl.load(queryParamsOnl, 'GetOnlineReportDaily');
				break;
			case 1:
				const queryParamsClr = new QueryParamsModel(
					this.filterConfiguration(),
					this.sortClr.direction,
					this.sortClr.active,
					this.paginatorClr.pageIndex,
					this.paginatorClr.pageSize
				);

				if (this.hasFormError) {
					return;
				}

				this.dataSourceClr.load(queryParamsClr, 'GetClearingTransactions');
				break;
		}
	}
	addLookupObject() {
		
		this.lookupObjectList.push({ key: 'offlineOnlineIndicator', value: this.offlineOnlineIndicators });
	}
	changeSortClr() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sortClr.direction,
			this.sortClr.active,
			this.paginatorClr.pageIndex,
			this.paginatorClr.pageSize
		);

		this.dataSourceClr.load(queryParams);
		this.dataSourceClr.loadingSubject.next(false);
	}
	exportAsXLSX(exportAll: boolean): void {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		if (this.pipeObjectList.length === 0) {
			this.addPipeObject();
		}

		let queryParams: QueryParamsModel;
		let fileName: string = '';
		let funcName: string = '';
		let gridColumns: any[];
		switch (this.selectedTab) {
			case 0:
				queryParams = new QueryParamsModel(this.filterConfiguration(),
					this.sortOnl.direction,
					this.sortOnl.active,
					(exportAll ? 0 : this.paginatorOnl.pageIndex),
					(exportAll ? -1 : this.paginatorOnl.pageSize));

				fileName = 'OnlineReportDaily';
				funcName = 'GetOnlineReportDaily';
				gridColumns = this.gridColumnsOnl;
				break;
			case 1:
				queryParams = new QueryParamsModel(this.filterConfiguration(),
					this.sortClr.direction,
					this.sortClr.active,
					(exportAll ? 0 : this.paginatorClr.pageIndex),
					(exportAll ? -1 : this.paginatorClr.pageSize));

				fileName = 'ClearingTransactions';
				funcName = 'GetClearingTransactions';
				gridColumns = this.gridColumnsClr;
				break;
		}

		if (this.hasFormError) {
			return;
		}

		this.excelService.exportAsExcelFileRouting(this.rprDailyService,
			queryParams,
			funcName,
			fileName,
			gridColumns,
			this.lookupObjectList,
			this.pipeObjectList);

		this.loadDataSource();
	}
	addPipeObject() {
		
	}
	changePaginator() {
		this.loadDataSource();
	}
	clearScreen() {
		this.filterForm.reset();
		this.requestModel = new GetReportDailyRequestDto();

		const controls = this.filterForm.controls;
		Object.keys(this.requestModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.requestModel[name]);
			}
		});

		this.dataSourceOnl = new FilteredDataSource(this.rprDailyService);
		this.dataSourceClr = new FilteredDataSource(this.rprDailyService);
	}
	
	changeSortOnl() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sortOnl.direction,
			this.sortOnl.active,
			this.paginatorOnl.pageIndex,
			this.paginatorOnl.pageSize
		);

		this.dataSourceOnl.sort(queryParams);
		this.dataSourceOnl.loadingSubject.next(false);
	}

	filterConfiguration(): any {
		this.hasFormError = false;

		this.requestModel = new GetReportDailyRequestDto();
		if (!this.requestModel.getFormValues(this.filterForm)) {
			this.hasFormError = true;
			return;
		}

	

		return this.requestModel;
	}
}
