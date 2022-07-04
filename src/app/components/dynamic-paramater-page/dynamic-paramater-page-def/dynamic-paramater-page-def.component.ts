import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '@core/_base/layout/services/cache.service';
import { BaseService } from '@core/_base/layout/services/base.service';
import { FrameworkApi } from '@services/framework.api';
import { AcquiringApi } from '@services/acquiring.api';
import { ClearingApi } from '@services/clearing.api';
import { CleveractApi } from '@services/cleveract.api';
import { CommonApi } from '@services/common.api';
import { IssuingApi } from '@services/issuing.api';
import { BaseModel } from '@core/_base/crud/models/_base.model';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

@Component({
	selector: 'm-dynamic-paramater-page-def',
	templateUrl: './dynamic-paramater-page-def.component.html'
})
export class DynamicParamaterPageDefComponent implements OnInit {
	@Input() model: BaseModel;
	@Input() service: BaseService;
	@Input() page: any = {};

	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	form: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	isAdd: boolean = true;
	isDisabled: boolean = false;
	key: any;

	maskNoDecimal = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
	});

	// constructor
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private cache: CacheService,
		private acquiringApi: AcquiringApi,
		private clearingApi: ClearingApi,
		private cleveractApi: CleveractApi,
		private commonApi: CommonApi,
		private frameworkApi: FrameworkApi,
		private issuingApi: IssuingApi
	) {
		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			this.key = params.key;
			this.isDisabled = (params.type === 'show');

			if (this.key && this.key !== null) {
				this.isAdd = false;
			}
		});
		dynSub.unsubscribe();
	}

	getDisabled(input) {
		return input.disableOnEdit && !this.isAdd;
	}

	ngOnInit() {
		this.page.inputs.forEach(input => {
			let isRequired = false;
			if (input.required) {
				isRequired = input.required;
			}

			if (input.type === 'boolean') {
				this.form.addControl(input.key, new FormControl({ value: this.model[input.key], disabled: this.getDisabled(input) }));
			} else
				if (isRequired === true) {
					this.form.addControl(input.key, new FormControl({ value: this.model[input.key], disabled: this.getDisabled(input) }, Validators.required));
				} else {
					this.form.addControl(input.key, new FormControl({ value: this.model[input.key], disabled: this.getDisabled(input) }));
				}
		});

		this.page.inputs.forEach(input => {
			if ((input.type === 'select' || input.type === 'multiselect') && input.lookup) {
				this.getLookupApi(input.lookup.api).getLookup(input.lookup.query).then(res => {
					input.options = res;
				});
			}
		});

		if (!this.isAdd) {
			this.service.get(this.key).subscribe(res => {
				Object.keys(this.model).forEach(name => {
					if (res && res.result[name]) {
						this.model[name] = res.result[name];
					}
				});

				this.initForm();
			},
				(error) => {
					this.layoutUtilsService.showError(error);
				});
		} else {
			this.initForm();
		}

	}
	clearMask(name: string, value: any): any {
		let element = this.page.inputs.find(t => t.key === name);
		if (element && element.clearMask) {
			value = value.replace(element.clearMask, '');
		}

		return value;
	}
	checkIsMask(name: string): boolean {
		let isMask = false;
		let element = this.page.inputs.find(t => t.key === name);
		if (element && element.type === 'textmask') {
			isMask = true;
		}

		return isMask;
	}
	initForm(): any {
		this.loadingSubject.next(false);
		const controls = this.form.controls;
		Object.keys(this.model).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.model[name]);
			}
		});
	}

	goBack() {
		this.router.navigateByUrl(this.page.backUrl);
	}

	getComponentTitle() {
		let result = this.translate.instant(this.page.addTitle);
		if (!this.model || !this.model[this.page.key]) {
			return result;
		} else {
			result = this.translate.instant(this.page.editTitle);
		}

		return result;
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	save() {
		if (this.isAdd) {
			if (this.form.value['code'] == null || this.form.value['code'] === '' || this.form.value['code'] === '  ' || this.form.value['code'] === ' ') {
				const message = this.translate.instant('Issuing.Courier.EnterCode');
				this.layoutUtilsService.showNotification(message, MessageType.Create, 10000, true, false);
				return;
			}
		}

		if (this.form.value['description'] === 'TR:=;;EN:=' || this.form.value['description'] === '') {
			const message = this.translate.instant('Issuing.Courier.EnterDescription');
			this.layoutUtilsService.showError(message);
			return;
		}

		this.hasFormErrors = false;
		this.isDisabled = true;
		const controls = this.form.controls;
		/** check form */
		if (this.form.invalid) {
			Object.keys(this.model).forEach(name => {
				if (controls[name]) {
					controls[name].markAsTouched();
				}
			});

			this.hasFormErrors = true;
			return;
		}

		Object.keys(this.model).forEach(name => {
			if (this.form.value && this.form.value[name] != null) {
				if (this.checkIsMask(name)) {
					this.model[name] = this.clearMask(name, this.form.value[name]);
				} else {
					this.model[name] = this.form.value[name];
				}
			}
		});


		if (this.isAdd) {
			this.create();
		} else {
			this.update();
		}

		this.loading = true;
	}

	update() {
		this.service.update(this.model).subscribe((response: any) => {
			this.cache.delete(this.service.endpoint);
			this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false).afterClosed().subscribe(res => {
				this.router.navigateByUrl(this.page.backUrl);
			});
		}, (error) => {
			this.loading = false;
			this.isDisabled = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.loading = false;
			this.isDisabled = false;
		});
	}

	create() {
		this.service.create(this.model).subscribe((response: any) => {
			this.cache.delete(this.service.endpoint);
			this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false).afterClosed().subscribe(res => {
				this.router.navigateByUrl(this.page.backUrl);
			});
		}, (error) => {
			this.loading = false;
			this.isDisabled = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.isDisabled = false;
			this.loading = false;
		});
	}
	getLookupApi(lookupApi) {
		let api;
		switch (lookupApi) {
			case 'AcquiringApi': { api = this.acquiringApi; break; };
			case 'ClearingApi': { api = this.clearingApi; break; };
			case 'CleveractApi': { api = this.cleveractApi; break; };
			case 'CommonApi': { api = this.commonApi; break; };
			case 'FrameworkApi': { api = this.frameworkApi; break; };
			case 'IssuingApi': { api = this.issuingApi; break; };
			case 'AcquiringApi': { api = this.acquiringApi; break; };
			default: break;
		}
		return api;
	}

	clear() {
		this.form.reset();
		this.initForm();
	}
}
