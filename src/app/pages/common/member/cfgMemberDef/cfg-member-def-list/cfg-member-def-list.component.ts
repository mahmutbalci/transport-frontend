import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MemberDefinitionService } from '@common/member/memberDefinition.service';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { CfgMemberDefinitionModel } from '@common/member/cfgMemberDefinition.model';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FrameworkApi } from '@services/framework.api';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

@Component({
	selector: 'm-cfg-member-def-list',
	templateUrl: './cfg-member-def-list.component.html',
	styleUrls: ['./cfg-member-def-list.component.scss']
})

export class CfgMemberDefListComponent implements OnInit, AfterViewInit {
	dataSource: ParameterDataSource;
	displayedColumns = [];

	gridColumns = [
		{
			mbrId: 'General.MemberId',
			description: 'General.Description',
			languageCode: 'System.Member.Language',
			mbrCurrency: 'General.Currency',
			taxNo: 'Acquiring.Merchant.TaxNo',
			address1: 'System.Member.Address1',
			address2: 'System.Member.Address2',
			countryCode: 'System.Member.Country',
			cityCode: 'System.Member.City',
			town: 'System.Member.Town',
			postalCode: 'System.Member.ZipCode',
			eftCode: 'System.CfgBin.EftCode',
			faxNumber: 'Acquiring.Merchant.Fax',
			isoCountryCode: 'Clearing.Clearing.CountryCode',
			isAdmin: 'System.Member.IsAdmin'
		}
	];

	txnCurrencyDefs: any = [];
	cfgCountryDefs: any = [];
	cfgCityDefs: any = [];
	cfgCityTownDefs: any = [];
	cfgYesNoNumeric: any = [];
	cfgLanguage: any = [];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	selection = new SelectionModel<CfgMemberDefinitionModel>(true, []);
	cfgMemberDefinitionModel: CfgMemberDefinitionModel[] = [];
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	responsecodes: any = [];
	lookupObjectList: any[] = [];

	constructor(public cfgMemberService: MemberDefinitionService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private frameworkApi: FrameworkApi,
		private excelService: ExcelExportService) { }

	ngAfterViewInit(): void {
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadCfgMemberDefList();
		});
		dynSub.unsubscribe();
	}

	ngOnInit() {
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadCfgMemberDefList();
				})
			)
			.subscribe();

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadCfgMemberDefList();
				})
			)
			.subscribe();

		this.dataSource = new ParameterDataSource(this.cfgMemberService);

		this.frameworkApi.getLookups(['TxnCurrencyDef', 'CfgCountryDef', 'CfgCityDef', 'CfgCityTownDef', 'CfgYesNoNumeric', 'CfgLanguageDef']).then(res => {
			this.txnCurrencyDefs = res.find(x => x.name === 'TxnCurrencyDef').data;
			this.cfgCountryDefs = res.find(x => x.name === 'CfgCountryDef').data;
			this.cfgCityDefs = res.find(x => x.name === 'CfgCityDef').data;
			this.cfgCityTownDefs = res.find(x => x.name === 'CfgCityTownDef').data;
			this.cfgLanguage = res.find(x => x.name === 'CfgLanguageDef').data;
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;

			this.cfgLanguage = this.cfgLanguage.filter(f => f.code.includes('-'));
		});

		this.displayedColumns.push('actions');

		Object.keys(this.gridColumns[0]).forEach(key => {
			this.displayedColumns.push(key);
		});
	}

	addLookupObject() {
		this.lookupObjectList.push({ key: 'mbrCurrency', value: this.txnCurrencyDefs });
		this.lookupObjectList.push({ key: 'countryCode', value: this.cfgCountryDefs });
		this.lookupObjectList.push({ key: 'cityCode', value: this.cfgCityDefs });
		this.lookupObjectList.push({ key: 'town', value: this.cfgCityTownDefs });
		this.lookupObjectList.push({ key: 'languageCode', value: this.cfgLanguage });
		this.lookupObjectList.push({ key: 'isAdmin', value: this.cfgYesNoNumeric });
	}

	loadCfgMemberDefList() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.dataSource.load(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.mbrId = searchText;
		filter.description = searchText;
		filter.mbrCurrency = searchText;
		filter.taxNo = searchText;
		filter.address1 = searchText;
		filter.address2 = searchText;
		filter.countryCode = searchText;
		filter.cityCode = searchText;
		filter.town = searchText;
		filter.postalCode = searchText;
		filter.eftCode = searchText;
		filter.faxNumber = searchText;
		filter.isoCountryCode = searchText;
		return filter;
	}

	exportAsXLSX(exportAll: boolean): void {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		const queryParams = new QueryParamsModel(this.filterConfiguration(), this.sort.direction, this.sort.active, (exportAll ? 0 : this.paginator.pageIndex), (exportAll ? -1 : this.paginator.pageSize));
		let _filtrationFields: string[] = [];
		this.excelService.exportAsExcelFileFilter(this.cfgMemberService, queryParams, _filtrationFields, 'MemberDefList', this.gridColumns, this.lookupObjectList);
		this.loadCfgMemberDefList();
	}

	openHistory(key: string) {
		if (this.lookupObjectList.length === 0) {
			this.addLookupObject();
		}

		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'MemberDefinition',
				key: key,
				lookupObjectList: this.lookupObjectList
			}
		});
	}
}
