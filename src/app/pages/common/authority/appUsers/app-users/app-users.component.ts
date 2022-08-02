import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { AppUsersModel } from '@common/authority/appUsers.model';
import { AppUsersService } from '@common/authority/appUsers.service';
import emailMask from 'text-mask-addons/dist/emailMask';
import { AppUserRoleRelModel } from '@common/authority/appUserRoleRel.model';
import _ from 'lodash';

@Component({
	selector: 'kt-app-users',
	templateUrl: './app-users.component.html'
})
export class AppUsersComponent implements OnInit {
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	succesMessage = this.translate.instant('General.Success');
	menuUrl: string = '/common/authority/appUsers';
	frmControlSearch: FormControl = new FormControl();
	entityForm: FormGroup = new FormGroup({});
	entityModel: AppUsersModel = new AppUsersModel();

	isReadonly: boolean = false;
	isProcessing: boolean = false;
	hasFormErrors: boolean = false;
	validationMessage: string;

	emailMask = emailMask;
	phoneMask = [/[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];

	cfgYesNoNumeric: any = [];
	appChannelCodes: any = [];
	appUserStats: any = [];
	appRoles: any = [];

	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private entityService: AppUsersService,
	) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel[name]));
		});
		Object.keys(this.entityModel.key).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel.key[name]));
		});
		this.entityForm.addControl('userRoleIds', new FormControl([]));

		this.entityService.api.getLookups(['CfgYesNoNumeric', 'AppUserStats', 'AppChannelCodes', 'AppRoles']).then(res => {
			this.cfgYesNoNumeric = res.data.find(x => x.name === 'CfgYesNoNumeric').data;
			this.appUserStats = res.data.find(x => x.name === 'AppUserStats').data;
			this.appChannelCodes = res.data.find(x => x.name === 'AppChannelCodes').data;
			this.appRoles = res.data.find(x => x.name === 'AppRoles').data;

			const dynSub = this.activatedRoute.queryParams.subscribe(params => {
				const prmId = params.prmId;
				const institutionId = params.institutionId;
				this.isReadonly = (params.type === 'show');
				if (prmId && prmId !== null && institutionId && institutionId !== null) {
					this.entityService.getUser(prmId, institutionId).subscribe(res => {
						this.entityModel = res.data;
						this.entityModel._isNew = false;
						this.entityModel._isEditMode = !this.isReadonly;

						this.initForm();
					}, (error) => {
						this.loading = false;
						this.layoutUtilsService.showError(error);
					});
				}
				else {
					this.entityModel = new AppUsersModel();
					this.entityModel._isNew = true;
					this.entityModel._isEditMode = false;

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

		Object.keys(this.entityModel.key).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel.key[name]);
			}
		});

		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});

		let selectedItems = [];
		this.entityModel.appUserRoleRels.forEach(element => {
			selectedItems.push(element.roleId);
		});

		controls['userRoleIds'].setValue(selectedItems);
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
		this.hasFormErrors = false;

		const controls = this.entityForm.controls;
		controls['name'].setValue(controls['name'].value ? controls['name'].value.trim() : '');
		controls['midname'].setValue(controls['midname'].value ? controls['midname'].value.trim() : '');
		controls['surname'].setValue(controls['surname'].value ? controls['surname'].value.trim() : '');
		controls['id'].setValue(controls['id'].value ? controls['id'].value.trim() : '');
		controls['employeeId'].setValue(controls['employeeId'].value ? controls['employeeId'].value.trim() : '');
		controls['email'].setValue(controls['email'].value ? controls['email'].value.trim() : '');

		if (this.entityForm.invalid) {
			this.isProcessing = false;

			Object.keys(this.entityModel).forEach(name =>
				controls[name].markAsTouched()
			);

			Object.keys(this.entityModel.key).forEach(name =>
				controls[name].markAsTouched()
			);
			return;
		}

		this.entityModel = <AppUsersModel>this.entityForm.value;
		this.entityModel.key.clientId = this.entityForm.get('clientId').value;
		this.entityModel.key.institutionId = parseInt(sessionStorage.getItem('institutionId'));

		let userRoleIds: any[] = this.entityForm.controls['userRoleIds'].value;
		if (!userRoleIds || userRoleIds.length < 1) {
			this.isProcessing = false;
			this.hasFormErrors = true;
			this.validationMessage = this.translate.instant('General.Exception.SelectAUserRole');
			return;
		}

		let index = this.entityModel.appUserRoleRels.length - 1;
		while (index >= 0) {
			let roleGuid = this.entityModel.appUserRoleRels[index].roleId;
			if (!_.find(userRoleIds, function (o) { return o == roleGuid; })) {
				this.entityModel.appUserRoleRels.splice(index, 1);
			}
			index -= 1;
		}

		userRoleIds.forEach(element => {
			let userRoles = { roleId: element, clientId: this.entityModel.key.clientId }

			if (!_.find(this.entityModel.appUserRoleRels, function (o) { return o.roleId === userRoles.roleId; })) {
				this.entityModel.appUserRoleRels.push(<AppUserRoleRelModel>userRoles);
			}
		});

		if (this.entityModel._isNew) {
			this.create();
		} else {
			this.update();
		}

		this.loading = true;
	}

	update() {
		this.entityService.update(this.entityModel).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Update, 5000, true, false).afterClosed().subscribe(() => {
				this.router.navigate([this.menuUrl]);
			});
		}, (error) => {
			this.loading = false;
			this.layoutUtilsService.showError(error);
			this.isProcessing = false;
		}, () => {
			this.loading = false;
		});
	}

	create() {
		this.entityService.create(this.entityModel).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 5000, true, false).afterClosed().subscribe(() => {
				this.router.navigate([this.menuUrl]);
			});
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
		this.entityModel = new AppUsersModel();
		this.entityModel._isNew = true;

		const controls = this.entityForm.controls;
		Object.keys(this.entityModel.key).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel.key[name]);
			}
		});

		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});
	}

	onAlertClose() {
		this.hasFormErrors = false;
		this.validationMessage = '';
	}
}
