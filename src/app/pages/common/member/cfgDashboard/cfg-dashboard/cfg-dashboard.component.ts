import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { CfgDashboardModel } from '@common/member/cfgDashboard.model';
import { CfgDashboardService } from '@common/member/cfgDashboard.Service';
import { AnnouncementDetailPopupComponent } from 'app/views/partials/content/widgets/widget5/announcement-detail-popup/announcement-detail-popup.component';
import { MatDialog } from '@angular/material';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
	selector: 'kt-cfg-dashboard',
	templateUrl: './cfg-dashboard.component.html',
	styleUrls: ['./cfg-dashboard.component.scss']
})
export class CfgDashboardComponent implements OnInit {
	htmlContent = '';
	config: AngularEditorConfig = {
		editable: true,
		spellcheck: true,
		height: '15rem',
		minHeight: '5rem',
		translate: 'no',
		customClasses: [
			{
				name: 'quote',
				class: 'quote',
			},
			{
				name: 'redText',
				class: 'redText'
			},
			{
				name: 'titleText',
				class: 'titleText',
				tag: 'h1',
			},
		]
	}

	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	imageData: string = '';
	entityForm: FormGroup = new FormGroup({});
	entityModel: CfgDashboardModel = new CfgDashboardModel();

	isReadonly: boolean = false;
	isProcessing: boolean = false;
	menuUrl: string = '/common/member/cfgDashboard';

	constructor(
		private activatedRoute: ActivatedRoute,
		private entityService: CfgDashboardService,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.entityModel.addFormControls(this.entityForm);

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const prmId = params.prmId;
			this.isReadonly = (params.type === 'show');
			if (prmId && prmId !== null) {
				this.entityService.get(prmId).subscribe(res => {
					this.entityModel = res.data;
					this.entityModel._isEditMode = !this.isReadonly;
					this.entityModel._isNew = false;

					this.imageData = this.entityModel.picture;

					this.initForm();
				}, (error) => {
					this.loading = false;
					this.layoutUtilsService.showError(error);
				});
			} else {
				this.entityModel = new CfgDashboardModel();
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

		this.entityModel = <CfgDashboardModel>this.entityForm.value;
		this.entityModel.picture = this.imageData;
		if (this.entityModel._isNew) {
			this.create();
		} else {
			this.update();
		}

		this.loading = true;
	}

	update() {
		this.entityService.update(this.entityModel).subscribe((response: any) => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Update, 5000, true, false).afterClosed().subscribe(() => {
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
		this.entityService.create(this.entityModel)
			.subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false).afterClosed().subscribe(() => {
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
		this.entityModel = new CfgDashboardModel();
		this.entityModel._isNew = true;

		const controls = this.entityForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});

		this.removeFile();
	}

	preview() {
		let announcementItem = <CfgDashboardModel>this.entityForm.value;
		announcementItem.picture = this.imageData;
		announcementItem.insertUser = this.entityModel._isEditMode ? this.entityModel.insertUser : sessionStorage.getItem('userCode');
		announcementItem.insertDateTime = this.entityModel._isEditMode ? this.entityModel.insertDateTime : new Date();

		this.dialog.open(AnnouncementDetailPopupComponent, { data: announcementItem });
	}

	changeListener($event): void {
		this.readThis($event.target);
	}

	readThis(inputValue: any): void {
		let file: File = inputValue.files[0];
		let myReader: FileReader = new FileReader();

		myReader.onloadend = () => {
			let image = myReader.result.toString();
			this.imageData = image.substring(('data:image/jpeg;base64,').length);
		}
		myReader.readAsDataURL(file);
	}

	removeFile() {
		this.imageData = '';
		this.entityModel.picture = '';
	}
}