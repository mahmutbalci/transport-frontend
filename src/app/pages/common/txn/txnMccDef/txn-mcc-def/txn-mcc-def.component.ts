import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TxnMccDefModel } from '@common/txn/txnMccDef.model';
import { TxnMccDefService } from '@common/txn/txnMccDef.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { TransportApi } from '@services/transport.api';

@Component({
	selector: 'm-txn-mcc-def',
	templateUrl: './txn-mcc-def.component.html'
})
export class TxnMccDefComponent implements OnInit {
	loading: any;
	errorMessage: any;
	saveresult: string;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	hasFormErrors: boolean = false;
	isAdd: boolean = true;
	isSaving: boolean = false;
	txnMccDefForm: FormGroup = new FormGroup({});
	entityModel: TxnMccDefModel = new TxnMccDefModel();

	trmCategoryDefs: any = [];
	txnMccGroupDefs: any = [];

	_chkIsTax: boolean = false;
	isDisabled: boolean = false;

	codeMask = [/[1-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];

	rateNumberMask = createNumberMask({
		prefix: '',
		suffix: '',
		allowDecimal: true,
		includeThousandsSeparator: false,
		integerLimit: 3,
		decimalLimit: 5,
	});

	// constructor
	constructor(private activatedRoute: ActivatedRoute, private entityService: TxnMccDefService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private transportApi: TransportApi,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.txnMccDefForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.transportApi.getLookups(["TrmCategoryDef", "TxnMccGroupDef"]).then(res => {
			this.trmCategoryDefs = res.find(x => x.name === "TrmCategoryDef").data;
			this.txnMccGroupDefs = _.sortBy(res.find(x => x.name === "TxnMccGroupDef").data, [function (o) { return o.description; }]);
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const prmId = params.prmId;
			this.isDisabled = (params.type == "show");
			if (prmId && prmId !== null) {
				this.isAdd = false;
				this.entityService.get(prmId).subscribe(res => {
					this.entityModel = res.result;
					this.entityModel._isEditMode = !this.isDisabled;

					this.initForm();
				}, (error) => {
					this.layoutUtilsService.showError(error);
				});
			}
			else {
				this.entityModel = new TxnMccDefModel();
				this.entityModel._isNew = true;
				this.initForm();
			}
		});
		dynSub.unsubscribe();
	}

	initForm(): any {
		this.loadingSubject.next(false);
		const controls = this.txnMccDefForm.controls;

		Object.keys(this.entityModel).forEach(name => {
			if (controls[name])
				controls[name].setValue(this.entityModel[name]);
		});

		this._chkIsTax = this.txnMccDefForm.controls['isTax'].value;
	}

	goBack() {
		let _backUrl = '/common/txn/txnMccDef';
		this.router.navigateByUrl(_backUrl);
	}

	getComponentTitle() {
		if (this.isDisabled)
			return this.translate.instant('General.View');
		else if (!this.entityModel || !this.entityModel.code)
			return this.translate.instant('General.Add');
		else if (!this.isDisabled)
			return this.translate.instant('General.Edit');

		return "";
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	save() {
		this.isSaving = true;
		this.hasFormErrors = false;
		const controls = this.txnMccDefForm.controls;
		controls["description"].setValue(controls["description"].value.trim());

		/** check form */
		if (this.txnMccDefForm.invalid) {
			Object.keys(this.entityModel).forEach(name =>
				controls[name].markAsTouched()
			);

			if (!controls["description"].value.trim()) {
				this.layoutUtilsService.showError(this.translate.instant('General.Exception.PleaseEnterDescription'));
			}

			this.hasFormErrors = true;
			this.isSaving = false;
			return;
		}

		this.entityModel = <TxnMccDefModel>this.txnMccDefForm.value;

		if (!this.validateEntity()) {
			this.isSaving = false;
			return;
		}

		if (this.isAdd)
			this.create();
		else
			this.update()

		this.loading = true;
		this.errorMessage = '';
	}

	update() {
		this.entityService.update(this.entityModel).subscribe((response: any) => {
			this.saveresult = response;
			this.layoutUtilsService.showNotification(response.message, MessageType.Update, 5000, true, false).afterClosed().subscribe(res => {
				this.router.navigate(['/common/txn/txnMccDef']);
			})
		},
			(error) => {
				this.errorMessage = error;
				this.loading = false;
				this.layoutUtilsService.showError(error);
				this.isSaving = false;

			},
			() => {
				this.loading = false;
			}
		);
	}

	create() {
		this.entityService.create(this.entityModel)
			.subscribe((response: any) => {
				this.saveresult = response;
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false).afterClosed().subscribe(res => {
					this.router.navigate(['/common/txn/txnMccDef']);
				})
			},
				(error) => {
					this.errorMessage = error;
					this.loading = false;
					this.layoutUtilsService.showError(error);
					this.isSaving = false;
				},
				() => {
					this.loading = false;
				}
			);
	}

	validateEntity(): boolean {
		this.entityModel.taxRatio = +this.entityModel.taxRatio.toString().replace(',', '.');

		if (!this.txnMccDefForm.controls['isTax'].value) {
			this.entityModel.taxRatio = 0;
		} else {
			if (this.entityModel.taxRatio == 0 || this.entityModel.taxRatio == null) {
				this.layoutUtilsService.showError(this.translate.instant('Acquiring.Transaction.Exception.TaxRatioMustGreaterThan0'));
				return false;
			}
		}

		return true;
	}

	changeChkIsTax() {
		this._chkIsTax = this.txnMccDefForm.controls['isTax'].value;
	}

	clearScreen() {
		this.txnMccDefForm.reset();

		this.entityModel = new TxnMccDefModel();
		this.entityModel._isNew = true;
		const controls = this.txnMccDefForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name])
				controls[name].setValue(this.entityModel[name]);
		});
	}

}
