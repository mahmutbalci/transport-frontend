import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CfgHolidayVariablesModel } from '@common/member/cfgHolidayVariables';
import { CfgHolidayNationalModel } from '@common/member/cfgHolidayNational';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CfgHolidayVariableService } from '@common/member/cfgHolidayVariableService';
import { CfgHolidayNationalService } from '@common/member/cfgHolidayNation.service';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-cfg-holiday-def',
	templateUrl: './cfg-holiday-def.component.html'
})

export class CfgHolidayDefComponent implements OnInit {
	holidayVariablesForm: FormGroup = new FormGroup({});
	holidayNationalForm: FormGroup = new FormGroup({});
	cfgHolidayVariablesModel: CfgHolidayVariablesModel = new CfgHolidayVariablesModel();
	cfgHolidayNationalModel: CfgHolidayNationalModel = new CfgHolidayNationalModel();
	visible_1: Boolean = true;
	visible_2: Boolean = false;
	isAdd: boolean = true;
	state: string = "";
	selectedHoliday: string = "";
	hasFormErrors: boolean = false;
	loading: any;
	errorMessage: any;
	days: number = 31;
	saveresult: string;
	isDisabled: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	isView: boolean = false;
	isProcessing: boolean = false;

	constructor(private cfgHolidayVariablesService: CfgHolidayVariableService,
		private cfgHolidayNationalService: CfgHolidayNationalService,
		private layoutUtilsService: LayoutUtilsService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private translate: TranslateService, ) { }

	ngOnInit() {
		Object.keys(this.cfgHolidayVariablesModel).forEach(name => {
			this.holidayVariablesForm.addControl(name, new FormControl(this.cfgHolidayVariablesModel[name]));
		});
		Object.keys(this.cfgHolidayNationalModel).forEach(name => {
			this.holidayNationalForm.addControl(name, new FormControl(this.cfgHolidayNationalModel[name]));
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const guid = params.guid;
			const selected = params.selected;
			this.isDisabled = (params.type == "show");
			this.isView = (params.type == "view");
			if (guid && guid !== null) {
				this.selectedHoliday = selected;
				this.isAdd = false;
				if (this.selectedHoliday == "1") {
					this.cfgHolidayVariablesService.get(guid).subscribe(res => {
						this.cfgHolidayVariablesModel = res.data;
						this.onItemChange();
					},
						(error) => {
							this.layoutUtilsService.showError(error);
						});
				}
				if (this.selectedHoliday == "2") {
					this.cfgHolidayNationalService.get(guid).subscribe(res => {
						this.cfgHolidayNationalModel = res.data;
						this.onItemChange();
					}, (error) => {
						this.layoutUtilsService.showError(error);
					});
				}
			}
			else {
				this.isAdd = true;
				this.selectedHoliday = "1";
				this.cfgHolidayVariablesModel = new CfgHolidayVariablesModel();
				this.cfgHolidayNationalModel = new CfgHolidayNationalModel();
				this.initForm();
			}
		});
		dynSub.unsubscribe();
	}

	initForm(): any {
		this.loadingSubject.next(false);

		if (this.selectedHoliday == "1") {
			const controls = this.holidayVariablesForm.controls;
			Object.keys(this.cfgHolidayVariablesModel).forEach(name => {
				if (controls[name]) {
					controls[name].setValue(this.cfgHolidayVariablesModel[name]);
				}
			});
		}

		if (this.selectedHoliday == "2") {
			const controls = this.holidayNationalForm.controls;
			Object.keys(this.cfgHolidayNationalModel).forEach(name => {
				if (controls[name]) {
					controls[name].setValue(this.cfgHolidayNationalModel[name]);
				}
			});
		}
	}

	goBack() {
		let _backUrl = '/common/member/cfgHolidayDef';
		this.router.navigateByUrl(_backUrl);
	}

	onItemChange() {
		this.state = this.selectedHoliday;
		if (this.state == "1") {
			this.visible_1 = true;
			this.visible_2 = false;
		}
		else if (this.state == "2") {
			this.visible_1 = false;
			this.visible_2 = true;
		}

		this.initForm();
	}

	save() {
		this.hasFormErrors = false;

		if (this.visible_1) {
			const controls = this.holidayVariablesForm.controls;
			if (this.holidayVariablesForm.invalid) {
				Object.keys(this.cfgHolidayVariablesModel).forEach(name =>
					controls[name].markAsTouched()
				);
				this.hasFormErrors = true;
				return;
			}
			this.isProcessing = true;
			this.cfgHolidayVariablesModel = <CfgHolidayVariablesModel>this.holidayVariablesForm.value;
			if (this.isAdd)
				this.createCfgHolidayVariable();
			else
				this.updateCfgHolidayVariable();
		}

		else if (this.visible_2) {
			const controls = this.holidayNationalForm.controls;
			if (this.holidayNationalForm.invalid) {

				Object.keys(this.cfgHolidayNationalModel).forEach(name =>
					controls[name].markAsTouched()
				);
				this.hasFormErrors = true;
				return;
			}

			this.cfgHolidayNationalModel = <CfgHolidayNationalModel>this.holidayNationalForm.value;
			if (this.isAdd)
				this.createCfgHolidayNational();
			else
				this.updateCfgHolidayNational();
		}
		this.loading = true;
		this.errorMessage = '';
	}

	createCfgHolidayNational() {
		this.cfgHolidayNationalService.create(this.cfgHolidayNationalModel)
			.subscribe((response: any) => {
				this.saveresult = response;
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false)
					.afterClosed().subscribe(res => {
						this.router.navigate(['/common/member/cfgHolidayDef']);
					})
			}, (error) => {
				this.errorMessage = error;
				this.loading = false;
				this.layoutUtilsService.showError(error);
			}, () => {
				this.loading = false;
			});
	}

	updateCfgHolidayNational() {
		this.cfgHolidayNationalService.update(this.cfgHolidayNationalModel).subscribe((response: any) => {
			this.saveresult = response;
			this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false)
				.afterClosed().subscribe(res => {
					this.router.navigate(['/common/member/cfgHolidayDef']);
				})
		}, (error) => {
			this.errorMessage = error;
			this.loading = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.loading = false;
		});
	}

	createRange(number) {
		var items: number[] = [];
		for (var i = 1; i <= number; i++) {
			items.push(i);
		}
		return items;
	}

	createCfgHolidayVariable() {
		this.cfgHolidayVariablesService.create(this.cfgHolidayVariablesModel)
			.subscribe((response: any) => {
				this.saveresult = response;
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false)
					.afterClosed().subscribe(res => {
						this.router.navigate(['/common/member/cfgHolidayDef']);
					})
			}, (error) => {
				this.errorMessage = error;
				this.loading = false;
				this.isProcessing = false;
				this.layoutUtilsService.showError(error);
			}, () => {
				this.isProcessing = false;
				this.loading = false;
			});
	}

	updateCfgHolidayVariable() {
		this.cfgHolidayVariablesService.update(this.cfgHolidayVariablesModel).subscribe((response: any) => {
			this.saveresult = response;
			this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false)
				.afterClosed().subscribe(res => {
					this.router.navigate(['/common/member/cfgHolidayDef']);
				})
		}, (error) => {
			this.errorMessage = error;
			this.loading = false;
			this.isProcessing = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.isProcessing = false;
			this.loading = false;
		});
	}

	getDays(item: any) {
		if (item == 2) {
			this.days = 29;
		}
		else {
			this.days = 31;
		}
	}

	getComponentTitle() {
		if (this.isAdd) {
			return this.translate.instant('General.Add');
		}
		else if (!this.isAdd && this.isDisabled) {
			return this.translate.instant('General.Edit');
		}
		else {
			return this.translate.instant('General.View');
		}
	}

	clear() {
		this.holidayVariablesForm.reset();
		this.holidayNationalForm.reset();
	}
}
