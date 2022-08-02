import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { AppMenusModel } from '@models/common/authority/appMenus.model';
import { MessageType, LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { AppMenusService } from '@common/authority/appMenus.service';
import _ from 'lodash';
import { AppMenuApiRelModel } from '@common/authority/appMenuApiRel.model';

@Component({
	selector: 'kt-app-menu-detail',
	templateUrl: './app-menu-detail.component.html'
})
export class AppMenuDetailComponent implements OnInit {
	succesMessage = this.translate.instant('General.Success');
	frmControlSearch: FormControl = new FormControl();
	entityForm: FormGroup = new FormGroup({});
	entityModel: AppMenusModel = new AppMenusModel();

	processing: boolean = false;
	appApis: any[] = [];
	newRecord: boolean = true;
	editRecord: boolean = true;

	maskNumber = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
	});

	guidMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 16,
	});

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private entityService: AppMenusService,
		public dialogRef: MatDialogRef<AppMenuDetailComponent>,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(key => {
			this.entityForm.addControl(key, new FormControl(this.entityModel[key]));
		});
		this.entityForm.addControl('menuApis', new FormControl([]));

		this.entityService.api.getLookups(['AppApis']).then(res => {
			this.appApis = res.data.find(x => x.name === 'AppApis').data;
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});

		if (this.data.level === 0) {
			this.entityForm.controls['menuApis'].disable();
			this.entityForm.controls['routeUrl'].disable();
			this.entityForm.controls['screenOrder'].disable();
		} else {
			this.entityForm.controls['iconPath'].disable();
		}

		const menuId = this.data.menuId;
		if (menuId && menuId !== null && menuId !== 0) {
			this.entityService.get(menuId).subscribe(res => {
				this.entityModel = res.data;
				this.entityModel._isEditMode = true;
				this.entityModel._isNew = false;

				this.initForm();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		} else {
			this.entityModel = new AppMenusModel();
			this.entityModel.parentMenuId = this.data.parentMenuId;
			this.entityModel._isEditMode = false;
			this.entityModel._isNew = true;

			this.initForm();
		}
	}

	initForm(): any {
		const controls = this.entityForm.controls;

		if (this.data.level === 2) {
			Object.keys(this.entityModel).forEach(name => {
				if (controls[name]) {
					controls[name].setValue(this.entityModel[name]);
				}
			});
		} else {
			Object.keys(this.entityModel).forEach(name => {
				if (controls[name]) {
					controls[name].setValue(this.entityModel[name]);
				}
			});
		}

		let selectedItems = [];
		this.entityModel.menuApiRels.forEach(element => {
			selectedItems.push(element.apiId);
		});

		controls['menuApis'].setValue(selectedItems);
	}

	save() {
		this.processing = true;
		if (this.entityForm.invalid) {
			Object.keys(this.entityModel).forEach(name => {
				this.entityForm.controls[name].markAsTouched();
			});

			return;
		}

		this.entityModel = <AppMenusModel>this.entityForm.value;
		if (this.data.level !== 0) {
			let selectApiList: AppMenuApiRelModel[] = [];

			this.entityForm.controls['menuApis'].value.forEach(element => {
				let entApi = { apiId: element };

				let existsApi = _.find(this.entityModel.menuApiRels, function (o) {
					return o.apiId === entApi.apiId;
				});

				if (existsApi) {
					selectApiList.push(existsApi);
				} else {
					selectApiList.push(<AppMenuApiRelModel>entApi);
				}
			});

			this.entityModel.menuApiRels = [];
			this.entityModel.menuApiRels = selectApiList;
		}

		if (this.data.level === 0) {
			this.entityModel.screenOrder = 0;
		}

		if (this.entityModel._isNew) {
			this.create();
		} else {
			this.update();
		}
	}

	update() {
		this.entityService.update(this.entityModel).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Update, 5000, true, false);
			this.dialogRef.close();
		}, (error) => {
			this.processing = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.processing = false;
		});
	}

	create() {
		this.entityService.create(this.entityModel)
			.subscribe(() => {
				this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 5000, true, false);
				this.dialogRef.close();
			}, (error) => {
				this.layoutUtilsService.showError(error);
				this.processing = false;
			}, () => {
				this.processing = false;
			});
	}

	getTitle(): string {
		let menuName = this.translate.instant(this.data.parentMenuName);

		if (this.data.menuId && this.data.menuId !== '') {
			return menuName + ' | ' + this.translate.instant('General.Edit');
		}

		return menuName + ' | ' + this.translate.instant('General.Add');
	}

	onNoClick(): void {
		this.dialogRef.close({ isUpdated: false });
	}

	clear() {
		this.entityForm.reset();
	}
}
