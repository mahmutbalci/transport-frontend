import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { MMatTableDataSource } from '@core/models/mmat-table.datasource';
import { CmpCampaignDefModel, CmpCampaignDetModel } from '@models/transport/campaign/cmpCampaignDef.model';
import { CmpCampaignDefService } from '@services/transport/campaign/cmpCampaignDef.service';

@Component({
	selector: 'kt-cmp-campaign-def',
	templateUrl: './cmp-campaign-def.component.html',
})
export class CmpCampaignDefComponent implements OnInit {
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	menuUrl: string = '/transport/campaign/cmpCampaignDef';
	succesMessage = this.translate.instant('General.Success');
	entityForm: FormGroup = new FormGroup({});
	entityModel: CmpCampaignDefModel = new CmpCampaignDefModel();

	detailColumns = ['actions', 'cardDigits', 'd042AcqId',];
	detailAddColumns = ['add-actions', 'add-cardDigits', 'add-d042AcqId',];
	dataSourceDetail = new MMatTableDataSource<CmpCampaignDetModel>();
	detailEntityForm: FormGroup = new FormGroup({});
	detailModel: CmpCampaignDetModel = new CmpCampaignDetModel();
	detailModelBack: CmpCampaignDetModel = new CmpCampaignDetModel();
	isEditModeDetail: boolean = false;

	isReadonly: boolean = false;
	isProcessing: boolean = false;

	splitChar: string = ',';
	weekDays: any[] = [];

	timeMask = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/, ':', /[0-5]/, /[0-9]/,];
	cmpCodeMask = [/[0-9,A-Z,a-z]/, /[0-9,A-Z,a-z]/, /[0-9,A-Z,a-z]/, /[0-9,A-Z,a-z]/, /[0-9,A-Z,a-z]/,];
	numberMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		decimalLimit: 0,
	});
	amountMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 15,
		decimalLimit: 2,
	});

	// constructor
	constructor(private activatedRoute: ActivatedRoute,
		private entityService: CmpCampaignDefService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel[name]));
		});
		this.entityForm.addControl('campaignDays', new FormControl());

		Object.keys(this.detailModel).forEach(name => {
			this.detailEntityForm.addControl(name, new FormControl(this.detailModel[name]));
		});

		this.weekDays.push({ code: '1', description: this.translate.instant('General.Monday') });
		this.weekDays.push({ code: '2', description: this.translate.instant('General.Tuesday') });
		this.weekDays.push({ code: '3', description: this.translate.instant('General.Wednesday') });
		this.weekDays.push({ code: '4', description: this.translate.instant('General.Thursday') });
		this.weekDays.push({ code: '5', description: this.translate.instant('General.Friday') });
		this.weekDays.push({ code: '6', description: this.translate.instant('General.Saturday') });
		this.weekDays.push({ code: '0', description: this.translate.instant('General.Sunday') });

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const prmId = params.prmId;
			this.isReadonly = (params.type === 'show');
			if (prmId && prmId !== null) {
				this.entityService.get(prmId).subscribe(res2 => {
					this.entityModel = res2.data;
					this.entityModel._isEditMode = !this.isReadonly;
					this.entityModel._isNew = false;

					this.dataSourceDetail.setData(this.entityModel.cmpCampaignDets);

					this.initForm();
				}, (error) => {
					this.layoutUtilsService.showError(error);
				});
			} else {
				this.entityModel = new CmpCampaignDefModel();
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


		let campaignDays: string[] = [];
		if (this.entityModel.weekday && this.entityModel.weekday.length > 0) {
			if (this.entityModel.weekday.includes(this.splitChar)) {
				this.entityModel.weekday.split(this.splitChar).forEach(x => {
					if (x && this.weekDays.filter(y => y.code === x).length > 0) {
						campaignDays.push(x);
					}
				});
			} else {
				if (this.entityModel.weekday && this.weekDays.filter(x => x.code === this.entityModel.weekday).length > 0) {
					campaignDays.push(this.entityModel.weekday);
				}
			}
		}
		controls['campaignDays'].setValue(campaignDays);
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

		this.entityModel = new CmpCampaignDefModel();
		if (!this.entityModel.getFormValues(this.entityForm)) {
			this.isProcessing = false;
			return;
		}

		let campaignDays: string[] = this.entityForm.controls['campaignDays'].value;
		if (!campaignDays || campaignDays.length < 1) {
			this.entityModel.weekday = null;
		} else {
			this.entityModel.weekday = '';
			campaignDays.forEach(x => {
				this.entityModel.weekday += x + this.splitChar;
			});

			if (this.entityModel.weekday.substr(this.entityModel.weekday.length - 1, 1) === this.splitChar) {
				this.entityModel.weekday = this.entityModel.weekday.substr(0, this.entityModel.weekday.length - 1);
			}
		}

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
		this.entityModel = new CmpCampaignDefModel();
		this.entityModel.cmpCampaignDets = [];
		this.entityModel._isNew = true;

		const controls = this.entityForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});

		this.dataSourceDetail.setData(this.entityModel.cmpCampaignDets);
	}

	//#region detail process
	addDetail() {
		if (!this.checkDetailForm()) {
			return;
		}

		let row = <CmpCampaignDetModel>this.detailEntityForm.value;
		row.campaignId = this.entityModel.guid === 0 ? null : this.entityModel.guid;
		this.entityModel.cmpCampaignDets.push(row);
		this.dataSourceDetail.setData(this.entityModel.cmpCampaignDets);
		this.detailEntityForm.reset();
		Object.keys(this.detailModel).forEach(name => {
			if (this.detailEntityForm.controls[name]) {
				this.detailEntityForm.controls[name].markAsPristine();
				this.detailEntityForm.controls[name].markAsUntouched();
				let temp: CmpCampaignDetModel = new CmpCampaignDetModel();
				this.detailEntityForm.controls[name].setValue(temp[name]);
			}
		});

		this.detailModel._isNew = false;
		this.detailModel._isEditMode = false;
		this.isEditModeDetail = false;
	}

	addDetailButtonOnClick() {
		Object.keys(this.detailModel).forEach(name => {
			this.detailEntityForm.controls[name].markAsPristine();
			this.detailEntityForm.controls[name].markAsUntouched();
			let temp: CmpCampaignDetModel = new CmpCampaignDetModel();
			this.detailEntityForm.controls[name].setValue(temp[name]);
		});

		this.detailModel._isNew = true;
		this.detailModel._isEditMode = false;
		this.isEditModeDetail = true;
	}

	deleteDetail(row: CmpCampaignDetModel) {
		const y = this.entityModel.cmpCampaignDets.indexOf(row);
		if (y !== -1) {
			this.entityModel.cmpCampaignDets.splice(y, 1);
		}

		this.dataSourceDetail.setData(this.entityModel.cmpCampaignDets);
	}

	checkDetailForm() {
		if (this.detailEntityForm.invalid) {
			Object.keys(this.detailModel).forEach(name =>
				this.detailEntityForm.controls[name].markAsTouched()
			);

			return false;
		}

		return true;
	}

	cancelDetailAddButtonOnClick() {
		this.detailModel._isNew = false;
		this.isEditModeDetail = false;
	}

	cancelDetailEditButtonOnClick(item: CmpCampaignDetModel) {
		Object.keys(this.detailModel).forEach(name => {
			item[name] = this.detailModelBack[name];
		});

		item._isEditMode = false;
		this.isEditModeDetail = false;
	}

	editDetailButtonOnClick(item: CmpCampaignDetModel) {
		Object.keys(this.detailModel).forEach(name => {
			if (this.detailEntityForm.controls[name]) {
				this.detailEntityForm.controls[name].setValue(item[name]);
				this.detailModelBack[name] = item[name];
			}
		});

		item._isEditMode = true;
		this.isEditModeDetail = true;
	}

	updateDetail(item: CmpCampaignDetModel) {
		Object.keys(this.detailModel).forEach(name => {
			this.detailEntityForm.controls[name].markAsPristine();
			this.detailEntityForm.controls[name].markAsUntouched();
			this.detailEntityForm.controls[name].setValue(item[name]);
		});

		if (!this.checkDetailForm()) {
			return;
		}

		item._isEditMode = false;
		this.isEditModeDetail = false;
	}
	//#endregion
}
