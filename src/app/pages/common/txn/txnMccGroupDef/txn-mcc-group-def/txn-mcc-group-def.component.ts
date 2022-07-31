import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TxnMccGroupDefModel } from '@common/txn/txnMccGroupDef.model';
import { TxnMccGroupDefService } from '@common/txn/txnMccGroupDef.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { TransportApi } from '@services/transport.api';

@Component({
	selector: 'm-txn-mcc-group-def',
	templateUrl: './txn-mcc-group-def.component.html'
})
export class TxnMccGroupDefComponent implements OnInit {
	loading: any;
	errorMessage: any;
	saveresult: string;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	hasFormErrors: boolean = false;
	isAdd: boolean = true;
	isProcessing: boolean = false;
	txnMccGroupDefForm: FormGroup = new FormGroup({});
	entityModel: TxnMccGroupDefModel = new TxnMccGroupDefModel();

	txnQualifierDefs: any = [];
	isDisabled: boolean = false;

	codeMask = [/[1-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];

	// constructor
	constructor(private activatedRoute: ActivatedRoute, private entityService: TxnMccGroupDefService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private transportApi: TransportApi,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.txnMccGroupDefForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.transportApi.getLookups(['TxnQualifierDef']).then(res => {
			this.txnQualifierDefs = _.sortBy(res.find(x => x.name === 'TxnQualifierDef').data, [function (o) { return o.description; }]);
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const prmId = params.prmId;
			this.isDisabled = (params.type == 'show');
			if (prmId && prmId !== null) {
				this.isAdd = false;
				this.entityService.get(prmId).subscribe(res => {
					this.entityModel = res.result;
					this.entityModel._isEditMode = !this.isDisabled;

					this.initForm();
				}, (error) => {
					this.layoutUtilsService.showError(error);
				});
			} else {
				this.entityModel = new TxnMccGroupDefModel();
				this.entityModel._isNew = true;
				this.initForm();
			}
		});
		dynSub.unsubscribe();
	}

	initForm(): any {
		this.loadingSubject.next(false);
		const controls = this.txnMccGroupDefForm.controls;

		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});
	}

	goBack() {
		let _backUrl = '/common/txn/txnMccGroupDef';
		this.router.navigateByUrl(_backUrl);
	}

	getComponentTitle() {
		if (this.isDisabled)
			return this.translate.instant('General.View');
		else if (!this.entityModel || !this.entityModel.code)
			return this.translate.instant('General.Add');
		else if (!this.isDisabled)
			return this.translate.instant('General.Edit');

		return '';
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	save() {
		this.isProcessing = true;
		this.hasFormErrors = false;
		const controls = this.txnMccGroupDefForm.controls;
		controls['code'].setValue(controls['code'].value.trim());
		controls['description'].setValue(controls['description'].value.trim());

		/** check form */
		if (this.txnMccGroupDefForm.invalid) {
			Object.keys(this.entityModel).forEach(name =>
				controls[name].markAsTouched()
			);

			if (!controls['description'].value.trim()) {
				this.layoutUtilsService.showError(this.translate.instant('General.Exception.PleaseEnterDescription'));
			}

			this.hasFormErrors = true;
			this.isProcessing = false;
			return;
		}

		this.entityModel = <TxnMccGroupDefModel>this.txnMccGroupDefForm.value;
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
				this.router.navigate(['/common/txn/txnMccGroupDef']);
			})
		},
			(error) => {
				this.errorMessage = error;
				this.loading = false;
				this.layoutUtilsService.showError(error);
				this.isProcessing = false;

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
					this.router.navigate(['/common/txn/txnMccGroupDef']);
				})
			},
				(error) => {
					this.errorMessage = error;
					this.loading = false;
					this.layoutUtilsService.showError(error);
					this.isProcessing = false;

				},
				() => {
					this.loading = false;
				}
			);
	}

	clearScreen() {
		this.txnMccGroupDefForm.reset();

		this.entityModel = new TxnMccGroupDefModel();
		this.entityModel._isNew = true;
		const controls = this.txnMccGroupDefForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name])
				controls[name].setValue(this.entityModel[name]);
		});
	}

}
