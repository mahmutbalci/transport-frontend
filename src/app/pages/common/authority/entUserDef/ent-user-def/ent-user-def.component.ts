import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { EntUserModel, UserKey } from '@common/authority/entUser.model';
import { EntUserService } from '@common/authority/entUser.service';
import { FrameworkApi } from '@services/framework.api';
import emailMask from 'text-mask-addons/dist/emailMask';
import { EntUserRoleOwnershipModel } from '@common/authority/entUserRoleOwnership.model';
import f from '@assets/lib/odata/ODataFilterBuilder.js'
import _ from 'lodash';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model.js';

@Component({
	selector: 'kt-ent-user-def',
	templateUrl: './ent-user-def.component.html'
})

export class EntUserDefComponent implements OnInit {
	loading: any;
	errorMessage: any;
	saveresult: string;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	hasFormErrors: boolean = false;
	validationMessage: string;
	isSaving: boolean = false;

	frmControlSearch: FormControl = new FormControl();
	entityForm: FormGroup = new FormGroup({});
	entityModel: EntUserModel = new EntUserModel();

	isDisabled: boolean = false;
	backUrl: string = '/common/authority/entUserDef';
	dontShowApiRoles: boolean = true; //api definition disable

	emailMask = emailMask;
	phoneMask = [/[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];

	cTicketType: string = '';
	cfgYesNoNumeric: any = [];
	entUserTicketTypeDefs: any = [];
	entUserStatDefs: any = [];
	entUserAuthTypeDefs: any = [];
	entUserRestrictionDefs: any = [];
	entUserRoleDefs: any = [];

	constructor(private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private frameworkApi: FrameworkApi,
		private entityService: EntUserService,
	) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel[name]));
		});
		Object.keys(this.entityModel.key).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel.key[name]));
		});
		this.entityForm.addControl('userRoleGuids', new FormControl([]));

		this.frameworkApi.getLookups(['CfgYesNoNumeric', 'EntUserTicketTypeDef', 'EntUserStatDef', 'EntUserAuthTypeDef', 'EntUserRestrictionDef', 'EntUserRoleDef',]).then(res => {
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
			this.entUserTicketTypeDefs = res.find(x => x.name === 'EntUserTicketTypeDef').data;
			this.entUserStatDefs = res.find(x => x.name === 'EntUserStatDef').data;
			this.entUserAuthTypeDefs = res.find(x => x.name === 'EntUserAuthTypeDef').data;
			this.entUserAuthTypeDefs = this.entUserAuthTypeDefs.filter(x => x.code == 'L');
			this.entUserRestrictionDefs = res.find(x => x.name === 'EntUserRestrictionDef').data;
			this.entUserRoleDefs = res.find(x => x.name === 'EntUserRoleDef').data;

			if (this.dontShowApiRoles) {
				this.entUserTicketTypeDefs = this.entUserTicketTypeDefs.filter(x => x.code == 'M');;
				this.frameworkApi.getFilteredLookup('EntUserRoleDef', 'ticketType', 'M').then(res => {
					this.entUserRoleDefs = res;
				});
			}

			const dynSub = this.activatedRoute.queryParams.subscribe(params => {
				const id = params.id;
				const institutionId = params.institutionId;
				this.isDisabled = (params.type === 'show');
				if (id && id !== null && institutionId && institutionId !== null) {
					this.entityService.getUser(id, institutionId).subscribe(res => {
						this.entityModel = res.result;
						this.entityModel._isNew = false;
						this.entityModel._isEditMode = !this.isDisabled;

						// this.cTicketType = this.entityModel.ticketType;
						// this.cmbTicketTypeChange();

						this.initForm();
					}, (error) => {
						this.loading = false;
						this.layoutUtilsService.showError(error);
					});
				}
				else {
					this.entityModel = new EntUserModel();
					this.entityModel.authType = 'L';
					this.entityModel.ticketType = 'M';
					this.entityModel._isNew = true;
					this.entityModel._isEditMode = false;

					// this.cTicketType = this.entityModel.ticketType;
					// this.cmbTicketTypeChange();

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
		this.entityModel.userRoleOwnerShips.forEach(element => {
			selectedItems.push(element.roleGuid);
		});

		controls['userRoleGuids'].setValue(selectedItems);
	}

	goBack() {
		this.router.navigateByUrl(this.backUrl);
	}

	getComponentTitle() {
		if (this.isDisabled)
			return this.translate.instant('General.View');
		else if (!this.entityModel || this.entityModel._isNew)
			return this.translate.instant('General.Add');
		else if (!this.isDisabled)
			return this.translate.instant('General.Edit');
		return '';
	}

	onAlertClose() {
		this.hasFormErrors = false;
		this.validationMessage = '';
	}

	save() {
		this.isSaving = true;
		this.hasFormErrors = false;

		const controls = this.entityForm.controls;
		controls['name'].setValue(controls['name'].value ? controls['name'].value.trim() : '');
		controls['midname'].setValue(controls['midname'].value ? controls['midname'].value.trim() : '');
		controls['surname'].setValue(controls['surname'].value ? controls['surname'].value.trim() : '');
		controls['id'].setValue(controls['id'].value ? controls['id'].value.trim() : '');
		controls['employeeId'].setValue(controls['employeeId'].value ? controls['employeeId'].value.trim() : '');
		controls['email'].setValue(controls['email'].value ? controls['email'].value.trim() : '');

		if (this.entityForm.invalid) {
			this.isSaving = false;

			Object.keys(this.entityModel).forEach(name =>
				controls[name].markAsTouched()
			);

			Object.keys(this.entityModel.key).forEach(name =>
				controls[name].markAsTouched()
			);
			return;
		}

		this.entityModel = <EntUserModel>this.entityForm.value;
		this.entityModel.key.id = this.entityForm.get('id').value;
		this.entityModel.key.institutionId = parseInt(sessionStorage.getItem('institutionId'));

		let userRoleGuids: any[] = this.entityForm.controls['userRoleGuids'].value;
		if (!userRoleGuids || userRoleGuids.length < 1) {
			this.isSaving = false;
			this.hasFormErrors = true;
			this.validationMessage = this.translate.instant('General.Exception.SelectAUserRole');
			return;
		}

		let index = this.entityModel.userRoleOwnerShips.length - 1;
		while (index >= 0) {
			let roleGuid = this.entityModel.userRoleOwnerShips[index].roleGuid;
			if (!_.find(userRoleGuids, function (o) { return o == roleGuid; })) {
				this.entityModel.userRoleOwnerShips.splice(index, 1);
			}
			index -= 1;
		}

		userRoleGuids.forEach(element => {
			let userRoles = { roleGuid: element, userCode: this.entityModel.key.id }

			if (!_.find(this.entityModel.userRoleOwnerShips, function (o) { return o.roleGuid == userRoles.roleGuid; })) {
				this.entityModel.userRoleOwnerShips.push(<EntUserRoleOwnershipModel>userRoles);
			}
		});

		if (this.entityModel._isNew) {
			this.create();
		}
		else {
			this.update();
		}

		this.loading = true;
		this.errorMessage = '';
	}

	update() {
		this.entityService.update(this.entityModel).subscribe((response: any) => {
			this.saveresult = response;
			this.layoutUtilsService.showNotification(response.message, MessageType.Update, 5000, true, false).afterClosed().subscribe(res => {
				this.router.navigate([this.backUrl]);
			})
		},
			(error) => {
				this.errorMessage = error;
				this.loading = false;
				this.layoutUtilsService.showError(error);
				this.isSaving = false;
			},
			() => {
				this.loading = false;
				this.isSaving = false;
			}
		);
	}

	create() {
		this.entityService.create(this.entityModel)
			.subscribe((response: any) => {
				this.saveresult = response;
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false).afterClosed().subscribe(res => {
					this.router.navigate([this.backUrl]);
				})
			},
				(error) => {
					this.errorMessage = error;
					this.loading = false;
					this.layoutUtilsService.showError(error);
					this.isSaving = false;
				},
				() => {
					this.loading = false;
					this.isSaving = false;
				}
			);
	}

	clearScreen() {
		this.entityForm.reset();
		this.entityModel = new EntUserModel();
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

	cmbTicketTypeChange() {
		if (!this.cTicketType) {
			return;
		}

		this.entityForm.controls['userRoleGuids'].setValue(null);

		this.frameworkApi.getFilteredLookup('EntUserRoleDef', 'ticketType', this.cTicketType).then(res => {
			this.entUserRoleDefs = res;
		});
	}
}
