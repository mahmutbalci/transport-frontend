import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MatDialogRef, MatDialog, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import * as _ from 'lodash';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { MMatTableDataSource } from '@core/models/mmat-table.datasource';
import { MsnMessageTemplateTextModel } from '@common/btc/msn-message-template-text-model';
import { MsnMessageTemplateDefModel } from '@common/btc/msn-message-template-def-model';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { LayoutUtilsService, MessageType } from '@core/_base/crud';
import { MsnMessageTemplateDefService } from '@common/framework/msn-message-template-def.service';
import { TransportApi } from '@services/transport.api';

@Component({
	selector: 'm-msn-message-template-def',
	templateUrl: './msn-message-template-def.component.html'
})
export class MsnMessageTemplateDefComponent implements OnInit {
	htmlContent = '';
	config: AngularEditorConfig = {
		editable: true,
		spellcheck: true,
		height: '15rem',
		minHeight: '5rem',
		placeholder: 'Enter text here...',
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
	};
	loading: any;
	errorMessage: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	dataSource = new MMatTableDataSource<MsnMessageTemplateTextModel>();
	isDisabled: boolean = false;
	isVisibleDialog: boolean = false;
	cfgLanguageDefs: any = [];
	templateTypeDefs: any = [];
	cfgYesNoNumeric: any[];
	selectedGuid: number = 0;
	lastUpdated: number = 0;
	templateText: MsnMessageTemplateTextModel = new MsnMessageTemplateTextModel();
	displayedColumns = ['actions', 'language', 'mailSubject', 'mailBody', 'smsBody'];
	loadingAfterSubmitData: boolean = false;
	entityModel: MsnMessageTemplateDefModel = new MsnMessageTemplateDefModel();
	msnMessageTemplateModelForm: FormGroup = new FormGroup({});
	ind: number = 1;
	sameLanguage: boolean = false;
	succesMessage = this.translate.instant('General.Success');
	menuUrl: string = '/common/btc/msnMessageTemplateDef';

	@ViewChild(MatSort) sort: MatSort;

	constructor(
		@Inject(MAT_DIALOG_DATA) public dialogId: number,
		public dialogRefOwn: MatDialogRef<MsnMessageTemplateDefComponent>,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public entityService: MsnMessageTemplateDefService,
		private layoutUtilsService: LayoutUtilsService,
		private transportApi: TransportApi,
		public dialog: MatDialog,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		this.loadingSubject.next(false);
		Object.keys(this.entityModel).forEach(name => {
			this.msnMessageTemplateModelForm.addControl(name,
				new FormControl(this.entityModel[name]));
		});

		this.transportApi.getLookups(['CfgLanguageDef', 'MsnMessageTemplateTypeDef', 'CfgYesNoNumeric']).then(res => {
			this.cfgLanguageDefs = res.find(x => x.name === 'CfgLanguageDef').data;
			this.templateTypeDefs = res.find(x => x.name === 'MsnMessageTemplateTypeDef').data;
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
		});

		this.msnMessageTemplateModelForm.addControl('language', new FormControl());
		this.msnMessageTemplateModelForm.addControl('mailBody', new FormControl());
		this.msnMessageTemplateModelForm.addControl('mailFrom', new FormControl());
		this.msnMessageTemplateModelForm.addControl('mailSubject', new FormControl());
		this.msnMessageTemplateModelForm.addControl('smsBody', new FormControl());
		this.msnMessageTemplateModelForm.addControl('smsFrom', new FormControl());
		this.msnMessageTemplateModelForm.addControl('htmlContent', new FormControl());
		this.msnMessageTemplateModelForm.addControl('allowedMinSendTime', new FormControl());
		this.msnMessageTemplateModelForm.addControl('allowedMaxSendTime', new FormControl());
		this.msnMessageTemplateModelForm.addControl('type', new FormControl());

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const code = this.dialogId > 0 ? this.dialogId : params.code;
			this.isDisabled = (params.type === 'show');
			if (this.dialogId > 0) {
				this.isDisabled = true;
				this.isVisibleDialog = true;
				this.displayedColumns.splice(0, 1);
			}
			if (code && code !== null) {
				this.entityModel._isNew = false;
				this.entityModel._isEditMode = true;
				this.entityService.get(code).subscribe(res => {
					this.entityModel = res.data;
					this.dataSource.setData(_.orderBy(
						this.entityModel.msnMessageTemplateText,
						'mailSubject',
						'asc'));
					this.initForm();
				}, (error) => {
					this.layoutUtilsService.showError(error);
				});
			} else {
				this.entityModel = new MsnMessageTemplateDefModel();
				this.entityModel._isNew = true;
				this.initForm();
			}
		});
		dynSub.unsubscribe();
	}

	initForm() {
		const controls = this.msnMessageTemplateModelForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});
	}

	goBack() {
		this.router.navigateByUrl(this.menuUrl);
	}

	reset() {
		this.msnMessageTemplateModelForm.reset();
		this.dataSource = new MMatTableDataSource<MsnMessageTemplateTextModel>();
	}

	onSubmit() {
		if (this.msnMessageTemplateModelForm.invalid) {
			Object.keys(this.msnMessageTemplateModelForm.controls).forEach(controlName =>
				this.msnMessageTemplateModelForm.controls[controlName].markAsTouched()
			);
			return;
		}

		this.entityModel = <MsnMessageTemplateDefModel>this.msnMessageTemplateModelForm.value;
		this.entityModel.msnMessageTemplateText = <MsnMessageTemplateTextModel[]>this.dataSource.data;

		this.entityModel.msnMessageTemplateText.forEach(element => {
			if (element.templateCode === 0 || element.templateCode == null) {
				element.templateCode = this.entityModel.code;
			}
		});

		if (this.entityModel.code == null || this.entityModel.code === 0) {
			const message = this.translate.instant('Issuing.Card.FillTemplateCode');
			this.layoutUtilsService.showError(message).afterClosed().subscribe(res => {
				window.close();
			});
			return;
		}

		if (this.dataSource.data.length === 0) {
			const message = this.translate.instant('Issuing.Card.FillMessageTemplateText');
			this.layoutUtilsService.showError(message).afterClosed().subscribe(res => {
				window.close();
			});
			return;
		}

		if (this.entityModel._isNew) {
			this.create();
		} else {
			this.update();
		}
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
				this.layoutUtilsService.showError(res);
			}
		}, (error) => {
			this.loading = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.loading = false;
		});
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
				this.layoutUtilsService.showError(res);
			}
		}, (error) => {
			this.loading = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.loading = false;
		});
	}

	addMsnMessageTemplateText() {
		this.dataSource.data.forEach(element => {
			if (element.language === this.templateText.language) {
				const message = this.translate.instant('Issuing.Card.SameLanguageTextExist');
				this.layoutUtilsService.showError(message).afterClosed().subscribe(res => {
					window.close();
				});
				this.sameLanguage = true;
			}
		});

		if (this.sameLanguage) {
			return;
		}

		this.templateText.templateCode = this.entityModel.code;
		this.templateText.language = this.msnMessageTemplateModelForm.value['language'];
		let htmlContentVar = this.msnMessageTemplateModelForm.value['htmlContent'].replaceAll('&lt;', '<').replaceAll('&gt;', '>');
		let indexofFirstHtml = htmlContentVar.toLowerCase().indexOf('html');
		let indexofLastHtml = htmlContentVar.toLowerCase().lastIndexOf('html');

		if (indexofFirstHtml !== -1 || indexofLastHtml !== -1) {
			htmlContentVar = htmlContentVar.slice(indexofFirstHtml - 1, indexofLastHtml + 5);
		}

		if (htmlContentVar != null && htmlContentVar.length <= 4000) {
			this.templateText.mailBody = htmlContentVar;
		} else {
			this.templateText.mailBodyExt = htmlContentVar;
		}
		this.templateText.mailSubject = this.msnMessageTemplateModelForm.value['mailSubject'];
		this.templateText.smsBody = this.msnMessageTemplateModelForm.value['smsBody'];

		if (!this.entityModel._isNew && this.selectedGuid !== 0) {
			this.templateText.guid = this.selectedGuid;
			this.templateText.lastUpdated = this.lastUpdated;
		}

		if (this.templateText.language == null || this.templateText.language === '') {
			const message = this.translate.instant('Issuing.Card.FillLanguage');
			this.layoutUtilsService.showError(message).afterClosed().subscribe(res => {
				window.close();
			});
			return;
		}

		if ((this.templateText.smsBody == null || this.templateText.smsBody === '') &&
			(this.templateText.mailBody == null || this.templateText.mailBody === '') &&
			(this.templateText.mailBodyExt == null || this.templateText.mailBodyExt === '')
		) {
			const message = this.translate.instant('Issuing.Card.FillSmsOrMailBody');
			this.layoutUtilsService.showError(message).afterClosed().subscribe(res => {
				window.close();
			});
			return;
		}

		this.entityModel.msnMessageTemplateText.push(this.templateText);
		this.dataSource.setData(this.entityModel.msnMessageTemplateText);
		this.msnMessageTemplateModelForm.controls['language'].setValue(null);
		this.msnMessageTemplateModelForm.controls['htmlContent'].setValue(null);
		this.msnMessageTemplateModelForm.controls['mailSubject'].setValue(null);
		this.msnMessageTemplateModelForm.controls['smsBody'].setValue(null);
	}

	editMsnMessageTextButtonOnClick(selectedData: MsnMessageTemplateTextModel) {
		this.selectedGuid = selectedData.guid;
		this.lastUpdated = selectedData.lastUpdated;
		this.deleteMsnMessageTexttButtonOnClick(selectedData);

		this.msnMessageTemplateModelForm.controls['language'].setValue(selectedData.language);

		if (selectedData.mailBody != null) {
			this.msnMessageTemplateModelForm.controls['htmlContent'].setValue(selectedData.mailBody);
		} else {
			this.msnMessageTemplateModelForm.controls['htmlContent'].setValue(selectedData.mailBodyExt);
		}

		this.msnMessageTemplateModelForm.controls['mailSubject'].setValue(selectedData.mailSubject);
		this.msnMessageTemplateModelForm.controls['smsBody'].setValue(selectedData.smsBody);
	}

	deleteMsnMessageTexttButtonOnClick(selectedData: MsnMessageTemplateTextModel) {
		const y = this.entityModel.msnMessageTemplateText.indexOf(selectedData);
		if (y !== -1) {
			this.entityModel.msnMessageTemplateText.splice(y, 1);
		}
		this.dataSource.setData(this.entityModel.msnMessageTemplateText);
	}

	dropped(event: CdkDragDrop<MsnMessageTemplateTextModel[]>) {
		this.ind = 1;
		moveItemInArray(
			this.entityModel.msnMessageTemplateText,
			event.previousIndex,
			event.currentIndex
		);
		this.dataSource.setData(null);
		this.entityModel.msnMessageTemplateText.forEach(el => {
			el.templateCode = this.ind; this.ind = this.ind + 1;
		});
		this.dataSource.setData(this.entityModel.msnMessageTemplateText);
	}

	getComponentTitle() {
		if (this.isDisabled) {
			return this.translate.instant('General.View');
		} else if (!this.entityModel || !this.entityModel.code) {
			return this.translate.instant('General.Add');
		} else if (!this.isDisabled) {
			return this.translate.instant('General.Edit');
		}

		return '';
	}

	cancel() {
		this.dialogRefOwn.close();
	}
}
