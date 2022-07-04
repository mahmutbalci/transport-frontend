import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { EntApiDefModel } from '@common/authority/entApiDef.model';
import { EntApiDefService } from '@common/authority/entApiDef.service';
import f from '@assets/lib/odata/ODataFilterBuilder.js';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

@Component({
	selector: 'kt-ent-api-def',
	templateUrl: './ent-api-def.component.html'
})
export class EntApiDefComponent implements OnInit {
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	form: FormGroup = new FormGroup({});
	hasFormErrors: boolean = false;
	model: EntApiDefModel = new EntApiDefModel();
	customer: any;
	isDisable: boolean = false;
	processing: boolean = false;
	parentApiDefs: any[] = [];

	guidMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 16,
	});

	// constructor
	constructor(private activatedRoute: ActivatedRoute,
		private service: EntApiDefService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		Object.keys(this.model).forEach(name => {
			this.form.addControl(name, new FormControl(this.model[name]));
		});

		let filter = f();
		filter.eq('apiRoute', null);
		let queryParams = new ODataParamsModel();
		queryParams.filter = filter.toString();
		this.service.api.getLookupOData("EntApiDef", queryParams).then(resLookup => {
			this.parentApiDefs = resLookup;

			const dynSub = this.activatedRoute.queryParams.subscribe(params => {
				const code = params.code;
				this.isDisable = (params.type === 'show');
				if (code && code !== null) {
					this.service.get(code).subscribe(resEntity => {
						this.model = resEntity.result;
						this.model._isEditMode = !this.isDisable;
						this.model._isNew = false;

						this.initForm();
					}, (error) => {
						this.layoutUtilsService.showError(error);
					});
				} else {
					this.model = new EntApiDefModel();
					this.model._isEditMode = false;
					this.model._isNew = true;

					this.initForm();
				}
			});
			dynSub.unsubscribe();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
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

	clear(): any {
		const ResponseDto = new EntApiDefModel();
		this.model = ResponseDto;
		this.model._isNew = true;
		this.initForm();
	}

	goBack() {
		let _backUrl = '/common/authority/entApiDef';
		this.router.navigateByUrl(_backUrl);
	}

	getComponentTitle() {
		if (this.model._isNew) {
			return this.translate.instant('General.Add');
		} else if (this.model._isEditMode) {
			return this.translate.instant('General.Edit');
		} else {
			return this.translate.instant('General.View');
		}
	}

	save() {
		this.hasFormErrors = false;
		this.processing = true;
		const controls = this.form.controls;
		/** check form */
		if (this.form.invalid) {
			Object.keys(this.model).forEach(name =>
				controls[name].markAsTouched()
			);
			this.processing = false;
			this.hasFormErrors = true;
			return;
		}

		this.model = <EntApiDefModel>this.form.value;
		if (this.model._isNew) {
			this.create();
		} else {
			this.update();
		}

		this.loading = true;
	}

	update() {
		this.service.update(this.model).subscribe((response: any) => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Update, 5000, true, false)
				.afterClosed().subscribe(res => {
					this.router.navigate(['/common/authority/entApiDef']);
				});
		}, (error) => {
			this.loading = false;
			this.layoutUtilsService.showError(error);
			this.processing = false;
		}, () => {
			this.loading = false;
		});
	}

	create() {
		this.service.create(this.model).subscribe((response: any) => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false)
				.afterClosed().subscribe(res => {
					this.router.navigate(['/common/authority/entApiDef']);
				});
		}, (error) => {
			this.loading = false;
			this.layoutUtilsService.showError(error);
			this.processing = false;
		}, () => {
			this.loading = false;
		});
	}
}