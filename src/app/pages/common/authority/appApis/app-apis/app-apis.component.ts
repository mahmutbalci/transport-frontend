import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { AppApisModel } from '@common/authority/appApis.model';
import { AppApisService } from '@common/authority/appApis.service';

@Component({
	selector: 'kt-ent-api-def',
	templateUrl: './app-apis.component.html'
})
export class AppApisComponent implements OnInit {
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	menuUrl: string = '/common/authority/appApis';
	succesMessage = this.translate.instant('General.Success');
	entityForm: FormGroup = new FormGroup({});
	entityModel: AppApisModel = new AppApisModel();

	isReadonly: boolean = false;
	isProcessing: boolean = false;

	appApplications: any[] = [];

	guidMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 16,
	});

	// constructor
	constructor(private activatedRoute: ActivatedRoute,
		private entityService: AppApisService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.entityService.api.getLookups(['AppApplications']).then(res => {
			this.appApplications = res.find(x => x.name === 'AppApplications').data;

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
					this.entityModel = new AppApisModel();
					this.entityModel._isEditMode = false;
					this.entityModel._isNew = true;

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
		const controls = this.entityForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});

		if (this.isReadonly) {
			this.entityForm.disable();
		}
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
		const controls = this.entityForm.controls;

		if (this.entityForm.invalid) {
			Object.keys(this.entityModel).forEach(name =>
				controls[name].markAsTouched()
			);

			this.isProcessing = false;
			return;
		}

		this.entityModel = <AppApisModel>this.entityForm.value;
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
		this.entityModel = new AppApisModel();
		this.entityModel._isNew = true;

		const controls = this.entityForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});
	}
}
