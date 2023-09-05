import { Component, OnInit, ViewChild } from '@angular/core';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import * as _ from 'lodash';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { GetProvisionRequestDto } from '@models/transport/txn/getProvisionRequestDto.model';
import { TxnTransactionService } from '@services/transport/txn/txnTransaction-service';
import { TranslateService } from '@ngx-translate/core';
import { MappingMerchantModel } from '@models/transport/txn/mappingMerchant.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MMatTableDataSource } from '@core/models/mmat-table.datasource';
import { MappingMerchantService } from '@services/transport/txn/mappingMerchant-service';

@Component({
  selector: 'kt-mapping-merchant',
  templateUrl: './mapping-merchant.component.html',

})
export class MappingMerchantComponent implements OnInit {

	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	menuUrl: string = '/transport/txn/mappingMerchant';
	succesMessage = this.translate.instant('General.Success');
	entityForm: FormGroup = new FormGroup({});
	entityModel: MappingMerchantModel = new MappingMerchantModel;

	detailColumns = ['actions', 'cardDigits', 'd042AcqId',];
	detailAddColumns = ['add-actions', 'add-cardDigits', 'add-d042AcqId',];
	dataSourceDetail = new MMatTableDataSource<MappingMerchantModel>();
	isEditModeDetail: boolean = false;

	isReadonly: boolean = false;
	isProcessing: boolean = false;

	splitChar: string = ',';
	

	timeMask = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/, ':', /[0-5]/, /[0-9]/,];
	cmpCodeMask = [/[0-9,A-Z,a-z]/, /[0-9,A-Z,a-z]/, /[0-9,A-Z,a-z]/, /[0-9,A-Z,a-z]/, /[0-9,A-Z,a-z]/,];
	acqIdMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];

	numberMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 10,
	});

	amountMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 15,
		allowDecimal: true,
		decimalLimit: 2,
	});

	rateMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 3,
		allowDecimal: false,
		decimalLimit: 0,
	});

	// constructor
	constructor(private activatedRoute: ActivatedRoute,
		private entityService: MappingMerchantService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel[name]));
		});
		this.entityForm.addControl('bankCode', new FormControl());
	
		
		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			let prmId = params.prmId;
			this.isReadonly = (params.type === 'show');
			if (prmId && prmId !== null) {
				this.entityService.get(prmId).subscribe(res2 => {
					this.entityModel = res2.data;
					this.entityModel._isEditMode = !this.isReadonly;
					this.entityModel._isNew = false;

					
					this.initForm();
				}, (error) => {
					this.layoutUtilsService.showError(error);
				});
			} else {
				this.entityModel = new MappingMerchantModel();
				this.entityModel._isEditMode = false;
				this.entityModel._isNew = true;

				this.initForm();
			}
		});
		dynSub.unsubscribe();
	}

	initForm(): any {
		this.loadingSubject.next(false);
		const controls = this.entityForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});


		
	}

	goBack() {
		this.router.navigateByUrl(this.menuUrl);
	}

	getComponentTitle() {
		if (this.isReadonly) {
			return this.translate.instant('General.View');
		} else if (this.entityModel._isNew) {
			return this.translate.instant('General.Add');
		} else if (this.entityModel._isEditMode) {
			return this.translate.instant('General.Edit');
		}

		return '';
	}

	save() {
		this.isProcessing = true;

		let newEntity = new MappingMerchantModel();
		if (!newEntity.getFormValues(this.entityForm)) {
			this.isProcessing = false;
			return;
		}

		// let campaignDays: string[] = this.entityForm.controls['campaignDays'].value;
		


		this.entityModel = newEntity;
		if (this.entityModel._isNew) {
			this.create();
		} else {
			
			this.update();
		}

		this.loading = true;
	}

	update() {
		
		this.entityService.update(this.entityModel).subscribe((res: any) => {
			if (res.success) {
				this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Update, 10000, true, false)
					.afterClosed().subscribe(() => {
						this.goBack();
					});
			} else {
				this.loading = false;
				this.isProcessing = false;
				this.layoutUtilsService.showError(res);
			}
		}, (error) => {
			this.loading = false;
			this.layoutUtilsService.showError(error);
			this.isProcessing = false;
		}, () => {
			this.loading = false;
		});
	}

	create() {
		this.entityService.create(this.entityModel).subscribe((res: any) => {
			if (res.success) {
				this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Update, 10000, true, false)
					.afterClosed().subscribe(() => {
						this.goBack();
					});
			} else {
				this.loading = false;
				this.isProcessing = false;
				this.layoutUtilsService.showError(res);
			}
		}, (error) => {
			this.loading = false;
			this.layoutUtilsService.showError(error);
			this.isProcessing = false;
		}, () => {
			this.loading = false;
		});
	}

	clearScreen() {
		this.entityForm.reset();
		this.entityModel = new MappingMerchantModel();
		this.entityModel._isNew = true;

		const controls = this.entityForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});

	}

}
