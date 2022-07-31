import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TxnResponseCodeDefModel } from '@common/txn/txnResponseCodeDef.model';
import { TxnResponseCodeDefService } from '@common/txn/txn-response-code-def.service';

@Component({
	selector: 'm-txn-response-code-def',
	templateUrl: './txn-response-code-def.component.html'
})
export class TxnResponseCodeDefComponent implements OnInit {
	moduleRootUrl = '/common/txn';
	currentUrl = '/common/txn/txnResponseCodeDef';
	backUrl = '/common/txn/txnResponseCodeDef';

	loading: any;
	errorMessage: any;
	saveresult: string;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	txnResponseCodeDefForm: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	txnResponseCodeDefModel: TxnResponseCodeDefModel = new TxnResponseCodeDefModel();
	isAdd: boolean = true;
	isDisabled: boolean = false;
	editedRecCode: any;
	isProcessing: boolean = false;

	// mask for code field: (code can be max 2 length)
	public codeMask = [/[a-z\dA-Z]/, /[a-z\dA-Z]/];

	constructor(private activatedRoute: ActivatedRoute,
		private txnResponseCodeDefService: TxnResponseCodeDefService,
		private router: Router,
		public dialog: MatDialog,
		
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngOnInit() {

		Object.keys(this.txnResponseCodeDefModel).forEach(name => {
			this.txnResponseCodeDefForm.addControl(name, new FormControl(this.txnResponseCodeDefModel[name]));
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const code = params.code;
			this.isDisabled = (params.type == "show");
			if (code && code !== null) {
				this.isAdd = false;
				this.editedRecCode = code;
			}
			this.loadModelData();
		});
		dynSub.unsubscribe();
	}

	initForm(): any {
		this.loadingSubject.next(false);
		const controls = this.txnResponseCodeDefForm.controls;
		Object.keys(this.txnResponseCodeDefModel).forEach(name => {
			if (controls[name])
				controls[name].setValue(this.txnResponseCodeDefModel[name]);
		});
	}

	loadModelData() {
		this.loadingSubject.next(true);
		if (!this.isAdd) {
			const code = this.editedRecCode;
			this.txnResponseCodeDefService.get(code).subscribe(res => {
				this.txnResponseCodeDefModel = res.result;
				if (!this.isDisabled)
					this.txnResponseCodeDefModel._isEditMode = true;
				this.initForm();
			}, (error) => {
				this.loadingSubject.next(false);
				this.layoutUtilsService.showError(error);
			});
		} else {
			this.txnResponseCodeDefModel = new TxnResponseCodeDefModel();
			this.initForm();
		}
	}

	goBack() {
		this.router.navigateByUrl(this.backUrl);
	}

	save() {
		this.hasFormErrors = false;
		const controls = this.txnResponseCodeDefForm.controls;
		if (this.txnResponseCodeDefForm.invalid) {
			Object.keys(this.txnResponseCodeDefModel).forEach(name =>
				controls[name].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		this.isProcessing = true;
		this.txnResponseCodeDefModel = <TxnResponseCodeDefModel>this.txnResponseCodeDefForm.value;

		if (this.isAdd)
			this.createTxnResponseCodeDef();
		else
			this.updateTxnResponseCodeDef()

		this.loading = true;
		this.errorMessage = '';
	}

	updateTxnResponseCodeDef() {
		this.loadingSubject.next(true);

		this.txnResponseCodeDefService.update(this.txnResponseCodeDefModel)
			.subscribe((response: any) => {
				this.saveresult = response;
				const message = this.translate.instant('System.Transaction.ResponseCodeDefinitionHasBeenSuccessfullyUpdated');
				this.layoutUtilsService.showNotification(message, MessageType.Update, 5000, true, false)
					.afterClosed().subscribe(res => {
						this.goBack();
					});
			}, (error) => {
				this.loading = false;
				this.isProcessing = false;
				this.loadingSubject.next(false);
				this.layoutUtilsService.showError(error);
			}, () => {
				this.loading = false;
				this.isProcessing = false;
				this.loadingSubject.next(false);
			});
	}

	createTxnResponseCodeDef() {
		this.loadingSubject.next(true);

		this.txnResponseCodeDefService.create(this.txnResponseCodeDefModel)
			.subscribe((response: any) => {
				this.saveresult = response;
				const message = this.translate.instant('System.Transaction.NewResponseCodeDefinitionHasBeenSuccessfullyAdded');
				this.layoutUtilsService.showNotification(message, MessageType.Create, 5000, true, false)
					.afterClosed().subscribe(res => {
						this.goBack();
					});
			}, (error) => {
				this.loading = false;
				this.isProcessing = false;
				this.layoutUtilsService.showError(error);
			}, () => {
				this.loading = false;
				this.isProcessing = false;
			});
	}

	getComponentTitle() {
		if (!this.txnResponseCodeDefModel || !this.txnResponseCodeDefModel.code)
			return this.translate.instant('General.Add');
		else if (this.isDisabled)
			return this.translate.instant('General.View');
		else
			return this.translate.instant('General.Edit');
	}

	clear() {
		this.loadModelData();
	}
}
