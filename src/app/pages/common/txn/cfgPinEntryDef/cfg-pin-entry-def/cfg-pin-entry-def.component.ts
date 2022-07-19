import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { CfgPinEntryDefModel } from '@common/txn/cfgPinEntryDef.model';
import { CfgPinEntryDefService } from '@common/txn/cfgPinEntryDef.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-cfg-pin-entry-def',
	templateUrl: './cfg-pin-entry-def.component.html'
})
export class CfgPinEntryDefComponent implements OnInit {

	loading: any;
	errorMessage: any;
	saveresult: string;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	hasFormErrors: boolean = false;
	isAdd: boolean = true;
	cfgPinEntryDefForm: FormGroup = new FormGroup({});
	cfgPinEntryDefModel: CfgPinEntryDefModel = new CfgPinEntryDefModel();
	isDisabled: boolean = false;
	// constructor
	constructor(private activatedRoute: ActivatedRoute, private entityService: CfgPinEntryDefService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService
	) { }

	ngOnInit() {
		Object.keys(this.cfgPinEntryDefModel).forEach(name => {
			this.cfgPinEntryDefForm.addControl(name, new FormControl(this.cfgPinEntryDefModel[name]));
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const code = params.code;
			this.isDisabled = (params.type == "show");
			if (code && code !== null) {
				this.isAdd = false;
				this.entityService.get(code).subscribe(res => {
					this.cfgPinEntryDefModel = res.result;
					this.initForm();
				},
					(error) => {
						this.layoutUtilsService.showError(error);
					});
			}
			else
				this.cfgPinEntryDefModel = new CfgPinEntryDefModel();

			this.initForm();
		});
		dynSub.unsubscribe();
	}

	initForm(): any {
		this.loadingSubject.next(false);
		const controls = this.cfgPinEntryDefForm.controls;

		Object.keys(this.cfgPinEntryDefModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.cfgPinEntryDefModel[name]);
			}
		});
	}

	goBack() {
		let _backUrl = '/common/txn/cfgPinEntryDef';
		this.router.navigateByUrl(_backUrl);
	}

	getComponentTitle() {
		let result = this.translate.instant('General.CreatePinEntryMethod');
		if (!this.cfgPinEntryDefModel || !this.cfgPinEntryDefModel.code)
			return result;
		else
			result = this.translate.instant('General.EditPinEntryMethod');

		return result;
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	save() {
		this.hasFormErrors = false;
		const controls = this.cfgPinEntryDefForm.controls;
		/** check form */
		if (this.cfgPinEntryDefForm.invalid) {
			Object.keys(this.cfgPinEntryDefModel).forEach(name =>
				controls[name].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		this.isDisabled = true;
		this.cfgPinEntryDefModel = <CfgPinEntryDefModel>this.cfgPinEntryDefForm.value;
		if (this.isAdd)
			this.create();
		else
			this.update()

		this.loading = true;
		this.errorMessage = '';
	}

	update() {
		this.entityService.update(this.cfgPinEntryDefModel).subscribe((response: any) => {
			this.saveresult = response;
			const message = this.translate.instant('General.PinEntryMethodSuccessfullyUpdated');

			this.layoutUtilsService.showNotification(message, MessageType.Create, 5000, true, false).afterClosed().subscribe(res => {
				this.isDisabled = false;
				this.router.navigate(['/common/txn/cfgPinEntryDef']);
			})

		},
			(error) => {
				this.errorMessage = error;
				this.isDisabled = false;
				this.loading = false;
				this.layoutUtilsService.showError(error);

			},
			() => {
				this.isDisabled = false;
				this.loading = false;
			}
		);
	}

	create() {
		this.entityService.create(this.cfgPinEntryDefModel)
			.subscribe((response: any) => {
				this.saveresult = response;
				const message = this.translate.instant('General.PinEntryMethodSuccessfullyAdded');
				this.layoutUtilsService.showNotification(message, MessageType.Create, 5000, true, false).afterClosed().subscribe(res => {
					this.isDisabled = false;

					this.router.navigate(['/common/txn/cfgPinEntryDef']);
				})
			},
				(error) => {
					this.errorMessage = error;
					this.isDisabled = false;
					this.loading = false;
					this.layoutUtilsService.showError(error);

				},
				() => {
					this.isDisabled = false;
					this.loading = false;
				}
			);
	}

}
