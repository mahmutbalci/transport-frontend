import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import * as _ from 'lodash';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { UtilsService } from '@core/_base/crud/utils/utils.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { Key } from '@core/_config/keys';
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
			debtRecoveryReferenceNo: 'Transportation.Transaction.DebtRecoveryReferenceNo',
			f01MessageType: 'Transportation.Transaction.F01MessageType',
			ptcn: 'Transportation.Transaction.Ptcn',
			// cardEncrypted: 'Transportation.Transaction.CardEncrypted',
			cardMask: 'Transportation.Transaction.CardMask',
			// f02Pan: 'Transportation.Transaction.F02Pan',
			f03ProcessingCode: 'Transportation.Transaction.F03ProcessingCode',
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
			f35TrackData: 'Transportation.Transaction.F35TrackData',
			f37Rrn: 'Transportation.Transaction.F37',
			f38AuthCode: 'Transportation.Transaction.F38',
			f39ResponseCode: 'Transportation.Transaction.F39',
			f41TerminalId: 'Transportation.Transaction.F41',
			f42: 'Transportation.Transaction.F42',
			f43AcceptorLocation: 'Transportation.Transaction.F43AcceptorLocation',
			f48TransitProgram: 'Transportation.Transaction.F48TransitProgram',
			f48Cvv2: 'Transportation.Transaction.F48Cvv2',
			f048CvcResult: 'General.F048CvcResult',
			f53SecurityInfo: 'Transportation.Transaction.F53SecurityInfo',
			f54AdditionalAmount: 'Transportation.Transaction.F54AdditionalAmount',
			f60ReversalCode: 'Transportation.Transaction.F60ReversalCode',
			f61PosData: 'Transportation.Transaction.F61PosData',
			// f63NetworkCode: 'Transportation.Transaction.F63NetworkCode',
			// f63BankRefNo: 'Transportation.Transaction.F63BankRefNo',
			// f90OriginalElement: 'Transportation.Transaction.F90OriginalElement',
			// f95ReplacementAmounts: 'Transportation.Transaction.F95ReplacementAmounts',
			// keyType: 'Transportation.Transaction.KeyType',
			// keyIndex: 'Transportation.Transaction.KeyIndex',
			createDate: 'Transportation.Transaction.CreateDate',
			campaignId: 'Transportation.Transaction.CampaignId',
			discountRate: 'Transportation.Transaction.DiscountRate',
		}
	];
	displayedColumnsOnl = [];

	dataSourceClr: FilteredDataSource;
	gridColumnsClr = [
		{
			txnGuid: 'Transportation.Transaction.TxnGuid',
			bankCode: 'Transportation.Transaction.BankCode',
			debtRecoveryReferenceNo: 'Transportation.Transaction.DebtRecoveryReferenceNo',
			f01MessageType: 'Transportation.Transaction.F01MessageType',
			ptcn: 'Transportation.Transaction.Ptcn',
			// cardEncrypted: 'Transportation.Transaction.CardEncrypted',
			cardMask: 'Transportation.Transaction.CardMask',
			// f02Pan: 'Transportation.Transaction.F02Pan',
			f03ProcessingCode: 'Transportation.Transaction.F03',
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
			f35TrackData: 'Transportation.Transaction.F35TrackData',
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
			f60ReversalCode: 'Transportation.Transaction.F60ReversalCode',
			f61PosData: 'Transportation.Transaction.F61PosData',
			// f63NetworkCode: 'Transportation.Transaction.F63NetworkCode',
			// f63BankRefNo: 'Transportation.Transaction.F63BankRefNo',
			// f90OriginalElement: 'Transportation.Transaction.F90OriginalElement',
			// f95ReplacementAmounts: 'Transportation.Transaction.F95ReplacementAmounts',
			// keyType: 'Transportation.Transaction.KeyType',
			// keyIndex: 'Transportation.Transaction.KeyIndex',
			createDate: 'Transportation.Transaction.CreateDate',
			campaignId: 'Transportation.Transaction.CampaignId',
			discountRate: 'Transportation.Transaction.DiscountRate',
			f43Name: 'Transportation.Transaction.F43Name',
			f43City: 'Transportation.Transaction.F43City',
			f43Country: 'Transportation.Transaction.F43Country',
			f43PostalCode: 'Transportation.Transaction.F43PostalCode',
			f43RegionCode: 'Transportation.Transaction.F43RegionCode',
			fileInfoGuid: 'Transportation.Transaction.FileInfoGuid',
			txnSource: 'Transportation.Transaction.TxnSource',
			txnType: 'Transportation.Transaction.TxnType',
			offlineOnlineIndicator: 'Transportation.Transaction.F43Country',
			f26BusinessCode: 'Transportation.Transaction.F26BusinessCode',
			f31AcqReference: 'Transportation.Transaction.F31AcqReference',
			f33FwdId: 'Transportation.Transaction.F33FwdId',
			F48TerminalType: 'Transportation.Transaction.F48TerminalType',
			F48TxnFeeCurrency: 'Transportation.Transaction.F48TxnFeeCurrency',
			F48TxnFeeAmount: 'Transportation.Transaction.F48TxnFeeAmount',
			TxnFeeSign: 'Transportation.Transaction.TxnFeeSign',
			TransitProgram: 'Transportation.Transaction.TransitProgram',
			ErrorCode: 'Transportation.Transaction.ErrorCode',
			BankResponseCode: 'Transportation.Transaction.BankResponseCode',
		}
	];
	displayedColumnsClr = [];

	requestModel: GetProvisionRequestDto = new GetProvisionRequestDto();
	txnMonitoringForm: FormGroup = new FormGroup({});

	@ViewChild('paginatorOnl') paginatorOnl: MatPaginator;
	@ViewChild('sortOnl') sortOnl: MatSort;
	@ViewChild('paginatorClr') paginatorClr: MatPaginator;
	@ViewChild('sortClr') sortClr: MatSort;

	showIcon: any;
	hasFormError: boolean = false;

	cardMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, ' ', /[0-9]/, /[0-9]/, '**', ' ', '****', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];
	cardBinMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];
	last4DigitsMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
	rrnNumberMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];
	timeMask = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];

	amountNumberMask = createNumberMask({
		prefix: '',
		suffix: '',
		allowDecimal: true,
		integerLimit: 10,
		decimalLimit: 2,
	});

	lookupObjectList: any[] = [];
	pipeObjectList: any[] = [];
	cfgYesNoNumeric: any[] = [];

	constructor(
		private txnService: TxnTransactionService,
		public dialog: MatDialog,
		private utilsService: UtilsService,
		private layoutUtilsService: LayoutUtilsService,
		private translateService: TranslateService,
		private excelService: ExcelExportService,) { }

	ngOnInit() {
		Object.keys(this.requestModel).forEach(name => {
			this.txnMonitoringForm.addControl(name, new FormControl(this.requestModel[name]));
		});

		Object.keys(this.gridColumnsOnl[0]).forEach(key => {
			this.displayedColumnsOnl.push(key);
		});

		Object.keys(this.gridColumnsClr[0]).forEach(key => {
			this.displayedColumnsClr.push(key);
		});

		this.txnService.api.getLookups(['CfgYesNoNumeric']).then(res => {
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		this.dataSourceOnl = new FilteredDataSource(this.txnService);
		this.dataSourceClr = new FilteredDataSource(this.txnService);

		this.paginatorOnl.page
			.pipe(
				tap(() => {
					this.loadDataSourceOnl();
				})
			)
			.subscribe();

		this.paginatorClr.page
			.pipe(
				tap(() => {
					this.loadDataSourceClr();
				})
			)
			.subscribe();
	}

	loadDataSourceOnl() {

	}

	loadDataSourceClr() {

	}

	getDate() { 
		
	}

}
