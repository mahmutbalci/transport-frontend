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

@Component({
	selector: 'kt-provision-monitoring',
	templateUrl: './provision-monitoring.component.html',
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

	cardMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, ' ', /[0-9]/, /[0-9]/, '**', ' ', '****', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];
	cardBinMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];
	last4DigitsMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
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
	offlineOnlineIndicators: any[] = [];

	constructor(
		private txnService: TxnTransactionService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private excelService: ExcelExportService,) { }

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

		this.txnService.api.getLookups(['CfgYesNoNumeric', 'TxnCurrencyDef', 'CmpCampaignDef',]).then(res => {
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
			this.txnCurrencyDefs = res.find(x => x.name === 'TxnCurrencyDef').data;
			this.cmpCampaignDefs = res.find(x => x.name === 'CmpCampaignDef').data;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		this.dataSourceOnl = new FilteredDataSource(this.txnService);
		this.dataSourceClr = new FilteredDataSource(this.txnService);
	}

	filterConfiguration(): any {
		this.requestModel = <GetProvisionRequestDto>this.filterForm.value;

		if (this.requestModel.cardMask) {
			this.requestModel.cardMask = this.requestModel.cardMask.replace(/\s/g, '');
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

				this.dataSourceClr.load(queryParamsClr, 'GetClearingTransactions');
				break;
		}
	}

	getData() {
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

		this.excelService.exportAsExcelFileRouting(this.txnService,
			queryParams,
			funcName,
			fileName,
			gridColumns,
			this.lookupObjectList,
			this.pipeObjectList);

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
