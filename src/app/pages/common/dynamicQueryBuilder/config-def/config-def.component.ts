import { Component, OnInit } from '@angular/core';
import { CfgExpressionConfigDefModel } from '@common/dynamicQueryBuilder/cfgExpressionConfigDef.model';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CfgExpressionConfigDefService } from '@common/framework/cfgExpressionConfigDef.service';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CfgExpressionCriteriaDefService } from '@common/framework/cfgExpressionCriteriaDef.service';
import { CfgExpressionCriteriaDefModel } from '@common/dynamicQueryBuilder/cfgExpressionCriteriaDef.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-config-def',
	templateUrl: './config-def.component.html',
	styleUrls: ['./config-def.component.scss']
})
export class ConfigDefComponent implements OnInit {
	succesMessage = this.translate.instant('General.Success');
	menuUrl = '/common/dynamicQueryBuilder/configDef';
	entityModel: CfgExpressionConfigDefModel = new CfgExpressionConfigDefModel();
	cfgExpressionConfigDefForm: FormGroup = new FormGroup({});
	allCriterias: CfgExpressionCriteriaDefModel[] = [];
	definedCriterias: CfgExpressionCriteriaDefModel[] = [];
	isView: boolean = false;
	configTypeDefs: any[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public entityService: CfgExpressionConfigDefService,
		public cfgExpressionCriteriaDefService: CfgExpressionCriteriaDefService,
		public translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,) { }

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.cfgExpressionConfigDefForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.entityService.api.getLookup("CfgExpressionConfigType").then(res => {
			this.configTypeDefs = res;
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const guid = params.guid;
			this.isView = (params.type == "show");
			if (guid && guid !== null) {
				this.entityModel._isNew = false;
				this.entityModel._isEditMode = true;
				this.entityService.get(guid).subscribe(res => {
					this.entityModel = res.data;
					this.definedCriterias = this.entityModel.criterias;
					this.initForm();
				},
					(error) => {
						this.layoutUtilsService.showError(error);
					});
			} else {
				this.entityModel = new CfgExpressionConfigDefModel();
				this.entityModel._isNew = true;
				this.entityModel._isEditMode = false;
				this.initForm();
			}
		});
		dynSub.unsubscribe();
	}

	initForm() {
		const controls = this.cfgExpressionConfigDefForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});

		this.cfgExpressionCriteriaDefService.getAll<any>().subscribe(res => {
			this.allCriterias = res.data.filter((x: { guid: number; }) => {
				return !this.entityModel.criterias.filter(y => y.guid === x.guid).length;
			})
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	onSubmit() {
		this.entityModel = <CfgExpressionConfigDefModel>this.cfgExpressionConfigDefForm.value;
		this.entityModel.criterias = [];
		this.definedCriterias.forEach(element => {
			this.entityModel.criterias.push(element);
		});

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
				this.layoutUtilsService.showError(res);
			}
		}, (error) => {
			this.layoutUtilsService.showError(error);
		}, () => {
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
				this.layoutUtilsService.showError(res);
			}
		}, (error) => {
			this.layoutUtilsService.showError(error);
		}, () => {
		});
	}

	goBack() {
		this.router.navigateByUrl(this.menuUrl);
	}

	reset() {
		this.cfgExpressionConfigDefForm.reset();
	}

	drop(event: CdkDragDrop<CfgExpressionCriteriaDefModel[]>) {
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			transferArrayItem(event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex);
		}
	}

	getComponentTitle() {
		if (this.entityModel._isNew) {
			return this.translate.instant('General.Add');
		}
		else if (!this.entityModel._isNew && !this.isView) {
			return this.translate.instant('General.Edit');
		}
		else {
			return this.translate.instant('General.View');
		}
	}
}
