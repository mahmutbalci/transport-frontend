import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { EntMenuTreeModel } from '@models/common/authority/entMenuTree.model';
import { MessageType, LayoutUtilsService } from '@core/_base/crud/utils/layout-utils.service';
import { EntMenuTreeService } from '@common/authority/entMenuTree.service';
import { FrameworkApi } from '@services/framework.api';
import { EntUserMenuApiModel } from '@common/authority/entMenuApi.model';
import _ from 'lodash';

@Component({
	selector: 'kt-ent-menu-detail-def',
	templateUrl: './ent-menu-detail-def.component.html'
})
export class EntMenuDetailDefComponent implements OnInit {
	frmControlSearch: FormControl = new FormControl();
	entMenuTreeForm: FormGroup = new FormGroup({});
	entMenuTreeModel: EntMenuTreeModel = new EntMenuTreeModel();
	processing: boolean = false;
	entApiDefs: any[] = [];
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
		private entMenuTreeService: EntMenuTreeService,
		public dialogRef: MatDialogRef<EntMenuDetailDefComponent>,
		private layoutUtilsService: LayoutUtilsService,
		private translateService: TranslateService,
		private frameworkApi: FrameworkApi) { }

	ngOnInit() {
		Object.keys(this.entMenuTreeModel).forEach(key => {
			this.entMenuTreeForm.addControl(key, new FormControl(this.entMenuTreeModel[key]));
		});
		this.entMenuTreeForm.addControl('menuApis', new FormControl([]));

		this.frameworkApi.getLookups(['EntApiDef']).then(res => {
			this.entApiDefs = res.find(x => x.name === 'EntApiDef').data;
		});

		if (this.data.level === 0) {
			this.entMenuTreeForm.controls['menuApis'].disable();
			this.entMenuTreeForm.controls['routeUrl'].disable();
			this.entMenuTreeForm.controls['screenOrder'].disable();
		} else {
			this.entMenuTreeForm.controls['iconPath'].disable();
		}

		const guid = this.data.guid;
		if (guid && guid !== null && guid !== 0) {
			this.entMenuTreeService.get(guid).subscribe(res => {
				this.entMenuTreeModel = res.result;
				this.entMenuTreeModel._isEditMode = true;
				this.entMenuTreeModel._isNew = false;

				this.initForm();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		} else {
			this.entMenuTreeModel = new EntMenuTreeModel();
			this.entMenuTreeModel.parentMenuGuid = this.data.parentMenuGuid;
			this.entMenuTreeModel._isEditMode = false;
			this.entMenuTreeModel._isNew = true;

			this.initForm();
		}
	}

	initForm(): any {
		const controls = this.entMenuTreeForm.controls;

		if (this.data.level === 2) {
			Object.keys(this.entMenuTreeModel).forEach(name => {
				if (controls[name]) {
					controls[name].setValue(this.entMenuTreeModel[name]);
				}
			});
		} else {
			Object.keys(this.entMenuTreeModel).forEach(name => {
				if (controls[name]) {
					controls[name].setValue(this.entMenuTreeModel[name]);
				}
			});
		}

		let selectedItems = [];
		this.entMenuTreeModel.userMenuApis.forEach(element => {
			selectedItems.push(element.apiGuid);
		});

		controls['menuApis'].setValue(selectedItems);
	}

	save() {
		this.processing = true;
		if (this.entMenuTreeForm.invalid) {
			Object.keys(this.entMenuTreeModel).forEach(name => {
				this.entMenuTreeForm.controls[name].markAsTouched();
			});

			return;
		}

		this.entMenuTreeModel = <EntMenuTreeModel>this.entMenuTreeForm.value;
		if (this.data.level !== 0) {
			let selectApiList: EntUserMenuApiModel[] = [];

			this.entMenuTreeForm.controls['menuApis'].value.forEach(element => {
				let entApi = { apiGuid: element };

				let existsApi = _.find(this.entMenuTreeModel.userMenuApis, function (o) {
					return o.apiGuid === entApi.apiGuid;
				});

				if (existsApi) {
					selectApiList.push(existsApi);
				} else {
					selectApiList.push(<EntUserMenuApiModel>entApi);
				}
			});

			this.entMenuTreeModel.userMenuApis = [];
			this.entMenuTreeModel.userMenuApis = selectApiList;
		}

		if (this.data.level === 0) {
			this.entMenuTreeModel.screenOrder = 0;
		}

		if (this.entMenuTreeModel._isNew) {
			this.create();
		} else {
			this.update();
		}
	}

	update() {
		this.entMenuTreeService.update(this.entMenuTreeModel).subscribe((response: any) => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Update, 5000, true, false);
			this.dialogRef.close();
		}, (error) => {
			this.processing = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.processing = false;
		});
	}

	create() {
		this.entMenuTreeService.create(this.entMenuTreeModel)
			.subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false);
				this.dialogRef.close();
			}, (error) => {
				this.layoutUtilsService.showError(error);
				this.processing = false;
			}, () => {
				this.processing = false;
			});
	}

	getTitle(): string {
		let menuName = this.translateService.instant(this.data.parentMenuName);

		if (this.data.guid > 0) {
			return menuName + ' | ' + this.translateService.instant('General.Edit');
		}

		return menuName + ' | ' + this.translateService.instant('General.Add');
	}

	onNoClick(): void {
		this.dialogRef.close({ isUpdated: false });
	}

	clear() {
		this.entMenuTreeForm.reset();
	}
}
