import { Component, OnInit, ViewChild } from '@angular/core';
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
import { NotifierService } from "angular-notifier";
import { DatePipe } from '@angular/common';
@Component({
	selector: 'kt-provision-monitoring',
	templateUrl: './provision-monitoring.component.html',
	styleUrls: ['./provision-monitoring.component.css'],
	providers: [DatePipe]
})
export class ProvisionMonitoringComponent implements OnInit {
	
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	dataSourceOnl: FilteredDataSource;
	gridColumnsOnl = [
		{
			txnGuid: 'Transportation.Transaction.TxnGuid',
			bankCode: 'Transportation.Transaction.BankCode',
			// debtRecoveryReferenceNo: 'Transportation.Transaction.DebtRecoveryReferenceNo',
			// f01MessageType: 'Transportation.Transaction.F01MessageType',
			ptcn: 'Transportation.Transaction.Ptcn',
			// cardEncrypted: 'Transportation.Transaction.CardEncrypted',
			cardMask: 'Transportation.Transaction.CardMask',
			// f02Pan: 'Transportation.Transaction.F02Pan',
			// f03ProcessingCode: 'Transportation.Transaction.F03ProcessingCode',
			f04: 'Transportation.Transaction.F04',
			f04Org: 'Transportation.Transaction.F04Org',
			f49Currency: 'Transportation.Transaction.F49',
			f06: 'Transportation.Transaction.F06',
			f06Org: 'Transportation.Transaction.F06Org',
			f51BillingCurrency: 'Transportation.Transaction.F51',
			f07: 'Transportation.Transaction.F07',
			// f09BillingConvRate: 'Transportation.Transaction.F09BillingConvRate',
			f11TraceNumber: 'Transportation.Transaction.F11TraceNumber',
			f12: 'Transportation.Transaction.F12',
			f13: 'Transportation.Transaction.F13',
			f14ExpiryDate: 'Transportation.Transaction.F14',
			// f16ConversionDate: 'Transportation.Transaction.F16',
			f18CategoryCode: 'Transportation.Transaction.F18',
			f22: 'Transportation.Transaction.F22',
			// f23PanSequenceNo: 'Transportation.Transaction.F23PanSeqNo',
			f32: 'Transportation.Transaction.F32',
			// f35TrackData: 'Transportation.Transaction.F35TrackData',
			f37Rrn: 'Transportation.Transaction.F37',
			f38AuthCode: 'Transportation.Transaction.F38',
			f39ResponseCode: 'Transportation.Transaction.F39',
			f41TerminalId: 'Transportation.Transaction.F41',
			f42: 'Transportation.Transaction.F42',
			f43AcceptorLocation: 'Transportation.Transaction.F43AcceptorLocation',
			// f48TransitProgram: 'Transportation.Transaction.F48TransitProgram',
			// f48Cvv2: 'Transportation.Transaction.F48Cvv2',
			// f048CvcResult: 'General.F048CvcResult',
			// f53SecurityInfo: 'Transportation.Transaction.F53SecurityInfo',
			f54AdditionalAmount: 'Transportation.Transaction.F54AdditionalAmount',
			// f55EmvData: 'Transportation.Transaction.F55EmvData',
			f60ReversalCode: 'Transportation.Transaction.F60ReversalCode',
			f61PosData: 'Transportation.Transaction.F61PosData',
			// f63NetworkCode: 'Transportation.Transaction.F63NetworkCode',
			// f63BankRefNo: 'Transportation.Transaction.F63BankRefNo',
			// f90OriginalElement: 'Transportation.Transaction.F90OriginalElement',
			// f95ReplacementAmounts: 'Transportation.Transaction.F95ReplacementAmounts',
			// keyType: 'Transportation.Transaction.KeyType',
			// keyIndex: 'Transportation.Transaction.KeyIndex',
			createDate: 'Transportation.Transaction.CreateDate',
			campaignId: 'Transportation.Campaign.CampaignId',
			discountRate: 'Transportation.Campaign.DiscountRate',
		}
	];
	displayedColumnsOnl = [];

	dataSourceClr: FilteredDataSource;
	gridColumnsClr = [
		{
			txnGuid: 'Transportation.Transaction.TxnGuid',
			fileInfoGuid: 'Transportation.Transaction.FileId',
			bankCode: 'Transportation.Transaction.BankCode',
			// debtRecoveryReferenceNo: 'Transportation.Transaction.DebtRecoveryReferenceNo',
			// f01MessageType: 'Transportation.Transaction.F01MessageType',
			ptcn: 'Transportation.Transaction.Ptcn',
			// cardEncrypted: 'Transportation.Transaction.CardEncrypted',
			cardMask: 'Transportation.Transaction.CardMask',
			// f02Pan: 'Transportation.Transaction.F02Pan',
			// f03ProcessingCode: 'Transportation.Transaction.F03',
			f04: 'Transportation.Transaction.F04',
			f04Org: 'Transportation.Transaction.F04Org',
			f49Currency: 'Transportation.Transaction.F49',
			f06: 'Transportation.Transaction.F06',
			f06Org: 'Transportation.Transaction.F06Org',
			f51BillingCurrency: 'Transportation.Transaction.F51',
			f07: 'Transportation.Transaction.F07',
			// f09BillingConvRate: 'Transportation.Transaction.F09BillingConvRate',
			f11TraceNumber: 'Transportation.Transaction.F11TraceNumber',
			f12: 'Transportation.Transaction.F12',
			f13: 'Transportation.Transaction.F13',
			f14ExpiryDate: 'Transportation.Transaction.F14',
			// f16ConversionDate: 'Transportation.Transaction.F16',
			f18CategoryCode: 'Transportation.Transaction.F18',
			f22: 'Transportation.Transaction.F22',
			// f23PanSequenceNo: 'Transportation.Transaction.F23PanSeqNo',
			f32: 'Transportation.Transaction.F32',
			// f35TrackData: 'Transportation.Transaction.F35TrackData',
			f37Rrn: 'Transportation.Transaction.F37',
			f38AuthCode: 'Transportation.Transaction.F38',
			f39ResponseCode: 'Transportation.Transaction.F39',
			f41TerminalId: 'Transportation.Transaction.F41',
			f42: 'Transportation.Transaction.F42',
			f43AcceptorLocation: 'Transportation.Transaction.F43AcceptorLocation',
			// f48TransitProgram: 'Transportation.Transaction.F48TransitProgram',
			// f48Cvv2: 'Transportation.Transaction.F48Cvv2',
			// f048CvcResult: 'General.F048CvcResult',
			// f53SecurityInfo: 'Transportation.Transaction.F53SecurityInfo',
			f54AdditionalAmount: 'Transportation.Transaction.F54AdditionalAmount',
			// f55EmvData: 'Transportation.Transaction.F55EmvData',
			f60ReversalCode: 'Transportation.Transaction.F60ReversalCode',
			f61PosData: 'Transportation.Transaction.F61PosData',
			// f63NetworkCode: 'Transportation.Transaction.F63NetworkCode',
			// f63BankRefNo: 'Transportation.Transaction.F63BankRefNo',
			// f90OriginalElement: 'Transportation.Transaction.F90OriginalElement',
			// f95ReplacementAmounts: 'Transportation.Transaction.F95ReplacementAmounts',
			// keyType: 'Transportation.Transaction.KeyType',
			// keyIndex: 'Transportation.Transaction.KeyIndex',
			createDate: 'Transportation.Transaction.CreateDate',
			campaignId: 'Transportation.Campaign.CampaignId',
			discountRate: 'Transportation.Campaign.DiscountRate',
			f43Name: 'Transportation.Transaction.F43Name',
			f43City: 'Transportation.Transaction.F43City',
			f43Country: 'Transportation.Transaction.F43Country',
			f43PostalCode: 'Transportation.Transaction.F43PostalCode',
			f43RegionCode: 'Transportation.Transaction.F43RegionCode',
			txnSource: 'Transportation.Transaction.TxnSource',
			txnType: 'Transportation.Transaction.TxnType',
			offlineOnlineIndicator: 'Transportation.Transaction.OfflineOnlineIndicator',
			f26BusinessCode: 'Transportation.Transaction.F26BusinessCode',
			f31AcqReference: 'Transportation.Transaction.F31AcqReference',
			// f33FwdId: 'Transportation.Transaction.F33FwdId',
			f48TerminalType: 'Transportation.Transaction.F48TerminalType',
			// F48TxnFeeCurrency: 'Transportation.Transaction.F48TxnFeeCurrency',
			// F48TxnFeeAmount: 'Transportation.Transaction.F48TxnFeeAmount',
			// TxnFeeSign: 'Transportation.Transaction.TxnFeeSign',
			// TransitProgram: 'Transportation.Transaction.TransitProgram',
			errorCode: 'Transportation.Transaction.ErrorCode',
			bankResponseCode: 'Transportation.Transaction.BankResponseCode',
		}
	];
	displayedColumnsClr = [];

	requestModel: GetProvisionRequestDto = new GetProvisionRequestDto();
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
	selectedOptions: any[] = [];	
	options: any[] = [];
	private readonly notifier: NotifierService;
	constructor(
		private txnService: TxnTransactionService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private excelService: ExcelExportService,
		private translate: TranslateService,
		notifierService: NotifierService,
		private datePipe: DatePipe
	) { 
		this.notifier = notifierService
		this.filterForm = new FormGroup({
			f39ResponseCode: new FormControl([]) 
		});
	}

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

		

		this.txnService.api.getLookups(['CfgYesNoNumeric', 'TxnCurrencyDef', 'CmpCampaignDef', 'KeyTypeDef']).then(res => {
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
			this.txnCurrencyDefs = res.find(x => x.name === 'TxnCurrencyDef').data;
			this.cmpCampaignDefs = res.find(x => x.name === 'CmpCampaignDef').data;
			this.keyTypeDefs = res.find(x => x.name === 'KeyTypeDef').data;			
			this.keyTypeDefs = this.keyTypeDefs.filter(x => x.code == '01' || x.code == '02');
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
		this.dataSourceOnl = new FilteredDataSource(this.txnService);
		this.dataSourceClr = new FilteredDataSource(this.txnService);		
		
	}

	
	onRemove(option: any): void {
		const index = this.selectedOptions.indexOf(option);
		
		if (index >= 0) {
			
			this.selectedOptions.splice(index, 1);
			this.options.splice(index, 1);
			
		}
	}

	filterConfiguration(): any {
		this.hasFormError = false;

		this.requestModel = new GetProvisionRequestDto();
		
		
		if (!this.requestModel.getFormValues(this.filterForm)) {
			this.hasFormError = true;
			return;
		}
		
		if (this.requestModel.clearCard) {
			if (this.requestModel.keyType == null || !this.requestModel.clearCard) {
				this.filterForm.controls['keyType'].markAsTouched();
				this.hasFormError = true;
				this.layoutUtilsService.showError(this.translate.instant('Transportation.Exception.KeyTypeNotNullForClearCard'));
			}
			
			this.requestModel.clearCard = this.requestModel.clearCard.replace(/\s/g, '');
		}
		
		if (this.requestModel.cardMask) {
			this.requestModel.cardMask = this.requestModel.cardMask.replace(/\s/g, '');
		}
		const selectedF39ResponseCodes = this.filterForm.get('f39ResponseCode').value;
		if (selectedF39ResponseCodes && selectedF39ResponseCodes.length > 0) {			
			const f39ResponseCodeString = selectedF39ResponseCodes.map(option => option.value).join(',');
			
			this.requestModel.f39ResponseCode = f39ResponseCodeString;
		}
	
		
		return this.requestModel;
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

				this.dataSourceOnl.load(queryParamsOnl, 'GetOnlineProvisions');
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

	GetloadDataF39ResponseCode() {	
		
		this.options = [
			{ value: '00', id: 0 },
			{ value: '01', id: 1 },
			{ value: '03', id: 2 },
			{ value: '04', id: 3 },
			{ value: '05', id: 4 },
			{ value: '07', id: 5 },
			{ value: '09', id: 6 },
			{ value: '12', id: 7 },
			{ value: '13', id: 8 },
			{ value: '14', id: 9 },
			{ value: '15', id: 10 },
			{ value: '22', id: 11 },
			{ value: '30', id: 12 },
			{ value: '33', id: 13 },
			{ value: '36', id: 14 },
			{ value: '38', id: 15 },
			{ value: '41', id: 16 },
			{ value: '43', id: 17 },
			{ value: '51', id: 18 },
			{ value: '53', id: 19 },
			{ value: '54', id: 20 },
			{ value: '55', id: 21 },
			{ value: '56', id: 22 },
			{ value: '57', id: 23 },
			{ value: '58', id: 24 },
			{ value: '59', id: 25 },
			{ value: '61', id: 26 },
			{ value: '62', id: 27 },
			{ value: '63', id: 28 },
			{ value: '65', id: 29 },
			{ value: '75', id: 30 },
			{ value: '76', id: 31 },
			{ value: '77', id: 32 },
			{ value: '78', id: 33 },
			{ value: '79', id: 34 },
			{ value: '88', id: 35 },
			{ value: '89', id: 36 },
			{ value: '91', id: 37 },
			{ value: '96', id: 38 }
		  ];
	}
	getData() {
		
		this.dataSourceOnl.clear();
		this.dataSourceClr.clear();
		this.paginatorOnl.pageIndex = 0;
		this.paginatorClr.pageIndex = 0;
		this.loadDataSource();
	}

	changePaginator() {
		this.loadDataSource();
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

	changeSortClr() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sortClr.direction,
			this.sortClr.active,
			this.paginatorClr.pageIndex,
			this.paginatorClr.pageSize
		);

		this.dataSourceClr.sort(queryParams);
		this.dataSourceClr.loadingSubject.next(false);
	}

	addLookupObject() {
		this.lookupObjectList.push({ key: 'f49Currency', value: this.txnCurrencyDefs });
		this.lookupObjectList.push({ key: 'f51BillingCurrency', value: this.txnCurrencyDefs });
		this.lookupObjectList.push({ key: 'campaignId', value: this.cmpCampaignDefs });
		this.lookupObjectList.push({ key: 'offlineOnlineIndicator', value: this.offlineOnlineIndicators });
	}

	addPipeObject() {
		this.pipeObjectList.push({ key: 'txnGuid', value: 'toString' });
		this.pipeObjectList.push({ key: 'fileInfoGuid', value: 'toString' });
		this.pipeObjectList.push({ key: 'f04', value: 'currency' });
		this.pipeObjectList.push({ key: 'f04Org', value: 'currency' });
		this.pipeObjectList.push({ key: 'f06', value: 'currency' });
		this.pipeObjectList.push({ key: 'f06Org', value: 'currency' });
		this.pipeObjectList.push({ key: 'f07', value: 'date', format: 'dd.MM.yyyy HH:mm:ss' });
		this.pipeObjectList.push({ key: 'f13', value: 'date', format: 'dd.MM.yyyy' });
		this.pipeObjectList.push({ key: 'f12', value: 'slice', format: '0:8' });
		this.pipeObjectList.push({ key: 'f14ExpiryDate', value: 'expiryFormatTxn' });
		this.pipeObjectList.push({ key: 'createDate', value: 'date', format: 'dd.MM.yyyy' });
		this.pipeObjectList.push({ key: 'discountRate', value: 'rateTimes100', fixedLength: 5 });
	}
	formatDate(date: Date): string {
		return this.datePipe.transform(date, 'dd yyyy HH:mm:ss');
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

				fileName = 'OnlineProvisions';
				funcName = 'GetOnlineProvisions';
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
		
		this.notifier.notify('info', fileName+" Dosyası İndirilmeye başladı..");
		this.excelService.exportAsExcelFileRouting(this.txnService,
			queryParams,
			funcName,
			fileName,
			gridColumns,
			this.lookupObjectList,
			this.pipeObjectList, (successfulFileName) => {
				
				this.notifier.notify('success', this.formatDate(queryParams.filter.txnDateEnd)   + " tarihinde indirilen " +successfulFileName+ " dosyası başarıyla indirildi.");
				
			  },
			  (error) => {
				console.error("Dosya indirme işlemi sırasında bir hata oluştu:", error);
				
				this.notifier.notify('error',  this.formatDate(queryParams.filter.txnDateEnd)   + "tarihinde indirilen " +fileName+ " dosyası işlemi başarısız oldu.");
			  }
			);

			
			
			this.loadDataSource();
			
	}

	clearScreen() {
		this.filterForm.reset();
		this.requestModel = new GetProvisionRequestDto();

		const controls = this.filterForm.controls;
		Object.keys(this.requestModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.requestModel[name]);
			}
		});

		this.dataSourceOnl = new FilteredDataSource(this.txnService);
		this.dataSourceClr = new FilteredDataSource(this.txnService);
	}
}
