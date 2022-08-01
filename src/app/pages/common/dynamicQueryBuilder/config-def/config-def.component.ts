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
	cfgExpressionConfigDefModel: CfgExpressionConfigDefModel = new CfgExpressionConfigDefModel();
	cfgExpressionConfigDefForm: FormGroup = new FormGroup({});
	allCriterias: CfgExpressionCriteriaDefModel[] = [];
	definedCriterias: CfgExpressionCriteriaDefModel[] = [];
	isView: boolean = false;
	configTypeDefs: any[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public cfgExpressionConfigDefService: CfgExpressionConfigDefService,
		public cfgExpressionCriteriaDefService: CfgExpressionCriteriaDefService,
		public translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService, ) { }

	ngOnInit() {
		Object.keys(this.cfgExpressionConfigDefModel).forEach(name => {
			this.cfgExpressionConfigDefForm.addControl(name, new FormControl(this.cfgExpressionConfigDefModel[name]));
		});

		this.cfgExpressionConfigDefService.api.getLookup("CfgExpressionConfigType").then(res => {
			this.configTypeDefs = res;
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const guid = params.guid;
			this.isView = (params.type == "show");
			if (guid && guid !== null) {
				this.cfgExpressionConfigDefModel._isNew = false;
				this.cfgExpressionConfigDefService.get(guid).subscribe(res => {
					this.cfgExpressionConfigDefModel = res.data;
					this.definedCriterias = this.cfgExpressionConfigDefModel.criterias;
					this.initForm();
				},
					(error) => {
						this.layoutUtilsService.showError(error);
					});
			} else {
				this.cfgExpressionConfigDefModel = new CfgExpressionConfigDefModel();
				this.cfgExpressionConfigDefModel._isNew = true;
				this.initForm();
			}
		});
		dynSub.unsubscribe();
	}

	initForm() {
		const controls = this.cfgExpressionConfigDefForm.controls;
		Object.keys(this.cfgExpressionConfigDefModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.cfgExpressionConfigDefModel[name]);
			}
		});

		this.cfgExpressionCriteriaDefService.getAll<any>().subscribe(res => {
			this.allCriterias = res.data.filter((x: { guid: number; }) => {
				return !this.cfgExpressionConfigDefModel.criterias.filter(y => y.guid === x.guid).length;
			})
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	onSubmit() {
		this.cfgExpressionConfigDefModel = <CfgExpressionConfigDefModel>this.cfgExpressionConfigDefForm.value;
		this.cfgExpressionConfigDefModel.criterias = [];
		this.definedCriterias.forEach(element => {
			this.cfgExpressionConfigDefModel.criterias.push(element);
		});

		if (this.cfgExpressionConfigDefModel._isNew) {
			this.create();
		}
		else {
			this.update();
		}
	}

	create() {
		this.cfgExpressionConfigDefService.create(this.cfgExpressionConfigDefModel)
			.subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 10000, true, false)
					.afterClosed().subscribe(res => {
						this.router.navigate(['/common/dynamicQueryBuilder/configDef']);
					})
			},
				(error) => {
					this.layoutUtilsService.showError(error);
				}
			);
	}

	update() {
		this.cfgExpressionConfigDefService.update(this.cfgExpressionConfigDefModel)
			.subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 10000, true, false)
					.afterClosed().subscribe(res => {
						this.router.navigate(['/common/dynamicQueryBuilder/configDef']);
					})
			},
				(error) => {
					this.layoutUtilsService.showError(error);
				}
			);
	}

	goBack() {
		let _backUrl = '/common/dynamicQueryBuilder/configDef';
		this.router.navigateByUrl(_backUrl);
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
		if (this.cfgExpressionConfigDefModel._isNew) {
			return this.translate.instant('General.Add');
		}
		else if (!this.cfgExpressionConfigDefModel._isNew && !this.isView) {
			return this.translate.instant('General.Edit');
		}
		else {
			return this.translate.instant('General.View');
		}
	}
}
