import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as _ from 'lodash';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { LookupPipe } from 'app/pipes/lookup.pipe';
import { LangParserPipe } from 'app/pipes/lang-parser.pipe';
import { WorkflowProcessModel } from '@common/workflow/workflowProcess.model';
import { WorkflowProcessService } from '@common/workflow/workflowProcess.service';

export interface DataTableEntry {
	label?: string;
	value?: any;
	oldValue?: any;
	type?: string;
	dataType?: string;
	level?: number;
}

@Injectable({
	providedIn: 'root'
})

@Component({
	selector: 'kt-workflow-approve',
	templateUrl: './workflow-approve.component.html',
	styleUrls: ['./workflow-approve.component.scss']
})
export class WorkflowApproveComponent implements OnInit {
	succesMessage = this.translate.instant('General.Success');
	viewLoading: boolean = false;
	isProcessing: boolean = false;
	appMenus: any[] = [];
	appApiMethod: any[] = [];

	@Output() saveEmitter = new EventEmitter();

	query = { condition: 'and', rules: [] };

	workflowApproveForm: FormGroup = new FormGroup({});
	workflowProcess: WorkflowProcessModel = new WorkflowProcessModel();

	public updatedData: DataTableEntry[] = [];
	public currentData: DataTableEntry[] = [];
	private translactionList: any[] = [];
	private translactionObjectList: any[] = [];

	titleComponent: string = '';
	isAuthorizedUser: boolean = true;
	isDisabled: boolean = true;
	hasCurrentState: boolean = false;

	cfgYesNoNumeric: any[] = [];

	lookupPipe: LookupPipe = new LookupPipe(new LangParserPipe());

	constructor(@Inject(MAT_DIALOG_DATA) public injectData: { processItem: any, isAuthorizedUser: boolean },
		public dialogRef: MatDialogRef<WorkflowApproveComponent>,
		private entWorkflowProcessService: WorkflowProcessService,
		private translate: TranslateService,
		private langParserPipe: LangParserPipe,
		private layoutUtilsService: LayoutUtilsService,
		private frameworkApi: FrameworkApi) {
		this.injectData.processItem.explanation = this.langParserPipe.transform(injectData.processItem.explanation);
		this.isAuthorizedUser = this.injectData.isAuthorizedUser
		this.workflowProcess = _.cloneDeep(this.injectData.processItem);
		this.updatedData = [];
		this.currentData = [];
		this.hasCurrentState = this.workflowProcess.screenViewCurrentState != null && this.workflowProcess.screenViewCurrentState != '';

		this.prepareComparedData(this.workflowProcess.request, this.hasCurrentState ? this.workflowProcess.screenViewCurrentState : null).then(data => this.updatedData = data);

		if (this.hasCurrentState) {
			this.prepareSingleData(this.workflowProcess.screenViewCurrentState).then(data => this.currentData = data);
		}
	}

	ngOnInit() {
		this.frameworkApi.getLookups(['AppApiMethod', 'AppMenus', 'CfgYesNoNumeric']).then(res => {
			this.appApiMethod = res.find(x => x.name === 'AppApiMethod').data;
			this.appMenus = res.find(x => x.name === 'AppMenus').data;
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;

			this.appMenus.forEach(element => {
				if (element.description && element.description.includes('.')) {
					element.description = this.translate.instant(element.description);
				}
			});

			this.titleComponent = this.getTitleComponent();
		});

		this.initForm();
	}

	initForm(): any {
		if (this.workflowProcess.stat !== 0) {
			this.isDisabled = false;
		}

		Object.keys(this.workflowProcess).forEach(name => {
			this.workflowApproveForm.addControl(name, new FormControl(this.workflowProcess[name]));
		});
	}

	prepareComparedData(strData: string, strOldData: string): Promise<DataTableEntry[]> {
		let newData = JSON.parse(strData);
		let oldData = JSON.parse(strOldData);

		const resolvedData: DataTableEntry[] = [];
		const depth = this.jsonDepth(newData);

		if (oldData) {
			this.hasCurrentState = true;
		} else {
			this.hasCurrentState = false;
		}

		this.buildWithCompare(newData, oldData, resolvedData, false, depth);

		return Promise.resolve(resolvedData);
	}

	buildWithCompare(data, oldData, values: DataTableEntry[], nested, originalDepth, partialDepth = 1) {
		for (let key in data) {
			if (this.isIgnoredFieldNames(key)) {
				continue;
			}

			if (typeof data[key] !== 'object' || this.isNativeArray(data[key])) {
				if (nested) {
					if (!values[values.length - 1].value.rows) {
						let dataType = this.dataType(data[key]);
						let _value = null;
						if (dataType === 'string') {
							_value = this.langParserPipe.transform(this.getChangeItemDesc(data[key]));
						} else {
							_value = data[key];
						}

						values[values.length - 1].value.push({
							label: this.langParserPipe.transform(this.getChangeItemDesc(key)),
							value: _value,
							dataType: dataType,
							level: partialDepth
						});
					}
				} else {
					let dataType = this.dataType(data[key]);
					let _value = null;
					let _oldValue = null;
					if (dataType === 'string') {
						_value = this.langParserPipe.transform(this.getChangeItemDesc(data[key]));

						if (this.hasCurrentState) {
							_oldValue = this.langParserPipe.transform(this.getChangeItemDesc(oldData[key]));
						}
					} else {
						_value = data[key];

						if (this.hasCurrentState) {
							_oldValue = oldData[key];
						}
					}

					//if old value is not null and new value is null
					if (dataType !== 'boolean' && !_value && _oldValue) {
						_value = 'null';
					}

					values.push({
						type: 'h-table',
						label: this.langParserPipe.transform(this.getChangeItemDesc(key)) + ':  ',
						value: _value,
						oldValue: _oldValue,
						dataType: dataType,
						level: partialDepth
					});
				}
			} else {
				if (data[key] instanceof Array) {
					const newLastChild = {
						labels: [],
						rows: [],
					};

					if (originalDepth === partialDepth + 1) {
						for (let i = 0; i < data[key].length; i++) {
							const keys = Object.keys(data[key][i]);
							const newRow = [];

							let _isNewRow = true;
							let oldRecord: any = null;
							if (this.hasCurrentState) {
								if (oldData[key] && oldData[key].length > 0) {
									let uniqueKey = data[key][i]['Guid'];
									oldRecord = oldData[key].find(x => x['Guid'] == uniqueKey);

									if (oldRecord) {
										_isNewRow = false;
									}
								} else {
									_isNewRow = true;
								}
							}

							for (let j = 0; j < keys.length; j++) {
								if (this.isIgnoredFieldNames(keys[j])) {
									continue;
								}

								if (i === 0) {
									newLastChild.labels.push(this.langParserPipe.transform(this.getChangeItemDesc(keys[j])));
								}

								let dataType = this.dataType(data[key][i][keys[j]]);
								let _value = null;
								let _oldValue = null;
								if (dataType === 'string') {
									_value = this.langParserPipe.transform(this.getChangeItemDesc(data[key][i][keys[j]]));

									if (this.hasCurrentState && !_isNewRow) {
										_oldValue = this.langParserPipe.transform(this.getChangeItemDesc(oldRecord[keys[j]]));
									}
								} else {
									_value = data[key][i][keys[j]];

									if (this.hasCurrentState && !_isNewRow) {
										_oldValue = oldRecord[keys[j]];
									}
								}

								//if old value is not null and new value is null
								if (dataType !== 'boolean' && !_value && _oldValue) {
									_value = 'null';
								}

								newRow.push({
									value: _value,
									oldValue: _oldValue,
									dataType: dataType,
								});
							}

							newRow.push({ isNewRow: _isNewRow });
							newRow.push({ isDeletedRow: false });
							newLastChild.rows.push(newRow);
						}

						//to detect deleted rows
						if (this.hasCurrentState && oldData && oldData[key]) {
							for (let i = 0; i < oldData[key].length; i++) {
								const keys = Object.keys(oldData[key][i]);
								const newRow = [];

								let _isDeletedRow = false;
								if (this.hasCurrentState) {
									if (oldData[key] && oldData[key].length > 0) {
										let uniqueKey = oldData[key][i]['Guid'];
										let isExistsData = data[key].find(x => x['Guid'] == uniqueKey);

										if (!isExistsData) {
											_isDeletedRow = true;
										}
									} else {
										_isDeletedRow = false;
									}
								}

								if (_isDeletedRow) {
									for (let j = 0; j < keys.length; j++) {
										if (this.isIgnoredFieldNames(keys[j])) {
											continue;
										}

										let dataType = this.dataType(oldData[key][i][keys[j]]);
										let _value = null;
										if (dataType === 'string') {
											_value = this.langParserPipe.transform(this.getChangeItemDesc(oldData[key][i][keys[j]]));
										} else {
											_value = oldData[key][i][keys[j]];
										}

										newRow.push({
											value: _value,
											oldValue: null,
											dataType: dataType,
										});
									}

									newRow.push({ isNewRow: false });
									newRow.push({ isDeletedRow: _isDeletedRow });
									newLastChild.rows.push(newRow);
								}
							}
						}

						if (newLastChild.rows.length > 0) {
							values.push({
								type: 'last-child-row',
								label: this.langParserPipe.transform(this.getChangeItemDesc(key)),
								value: newLastChild,
								level: partialDepth + 1
							});
						}
					} else {
						data[key].forEach(d => {
							values.push({
								type: 'label',
								label: this.langParserPipe.transform(this.getChangeItemDesc(key)),
								value: [],
								level: partialDepth + 1
							});

							this.buildWithCompare(d, oldData ? oldData[key] : null, values, true, originalDepth, partialDepth + 1);
						});
					}
				} else {
					this.buildWithCompare(data[key], oldData ? oldData[key] : null, values, values.length > 0, originalDepth, (values.length > 0 ? partialDepth + 1 : partialDepth));
				}
			}
		}
	}

	prepareSingleData(strData: string): Promise<DataTableEntry[]> {
		let newData = JSON.parse(strData);

		const resolvedData: DataTableEntry[] = [];
		const depth = this.jsonDepth(newData);

		this.buildSingle(newData, resolvedData, false, depth);

		return Promise.resolve(resolvedData);
	}

	buildSingle(data, values: DataTableEntry[], nested, originalDepth, partialDepth = 1) {
		for (let key in data) {
			if (this.isIgnoredFieldNames(key)) {
				continue;
			}

			if (typeof data[key] !== 'object' || this.isNativeArray(data[key])) {
				if (nested) {
					if (!values[values.length - 1].value.rows) {
						let dataType = this.dataType(data[key]);
						let _value = null;
						if (dataType === 'string') {
							_value = this.langParserPipe.transform(this.getChangeItemDesc(data[key]));
						} else {
							_value = data[key];
						}

						values[values.length - 1].value.push({
							label: this.langParserPipe.transform(this.getChangeItemDesc(key)),
							value: _value,
							dataType: dataType,
							level: partialDepth
						});
					}
				} else {
					let dataType = this.dataType(data[key]);
					let _value = null;
					let _oldValue = null;
					if (dataType === 'string') {
						_value = this.langParserPipe.transform(this.getChangeItemDesc(data[key]));

						if (this.hasCurrentState) {
							_oldValue = this.langParserPipe.transform(this.getChangeItemDesc(data[key]));
						}
					} else {
						_value = data[key];

						if (this.hasCurrentState) {
							_oldValue = data[key];
						}
					}

					values.push({
						type: 'h-table',
						label: this.langParserPipe.transform(this.getChangeItemDesc(key)) + ':  ',
						value: _value,
						oldValue: _oldValue,
						dataType: dataType,
						level: partialDepth
					});
				}
			} else {
				if (data[key] instanceof Array) {
					const newLastChild = {
						labels: [],
						rows: []
					};

					if (originalDepth === partialDepth + 1) {
						for (let i = 0; i < data[key].length; i++) {
							const keys = Object.keys(data[key][i]);
							const newRow = [];

							for (let j = 0; j < keys.length; j++) {
								if (this.isIgnoredFieldNames(keys[j])) {
									continue;
								}

								if (i === 0) {
									newLastChild.labels.push(this.langParserPipe.transform(this.getChangeItemDesc(keys[j])));
								}

								let dataType = this.dataType(data[key][i][keys[j]]);
								let _value = null;
								if (dataType === 'string') {
									_value = this.langParserPipe.transform(this.getChangeItemDesc(data[key][i][keys[j]]));
								} else {
									_value = data[key][i][keys[j]];
								}

								newRow.push({
									value: _value,
									dataType: dataType,
								});
							}
							newLastChild.rows.push(newRow);
						}

						if (newLastChild.rows.length > 0) {
							values.push({
								type: 'last-child-row',
								label: this.langParserPipe.transform(this.getChangeItemDesc(key)),
								value: newLastChild,
								level: partialDepth + 1
							});
						}
					} else {
						data[key].forEach(d => {
							values.push({
								type: 'label',
								label: this.langParserPipe.transform(this.getChangeItemDesc(key)),
								value: [],
								level: partialDepth + 1
							});

							this.buildSingle(d, values, true, originalDepth, partialDepth + 1);
						});
					}
				} else {
					this.buildSingle(data[key], values, values.length > 0, originalDepth, (values.length > 0 ? partialDepth + 1 : partialDepth));
				}
			}
		}
	}

	jsonDepth(object) {
		let level = 1;
		for (let key in object) {
			if (!object.hasOwnProperty(key)) {
				continue;
			}

			if (this.isIgnoredFieldNames(key)) {
				continue;
			}

			if (typeof object[key] === 'object' && !_.isUndefined(object[key]) && !_.isNull(object[key])) {
				if (object[key] instanceof Array) {
					if (!this.isNativeArray(object[key])) {
						for (let i = 0; i < object[key].length; i++) {
							const depth = this.jsonDepth(object[key][i]) + 1;
							level = Math.max(depth, level);
						}
					}
				} else {
					const depth = this.jsonDepth(object[key]) + 1;
					level = Math.max(depth, level);
				}
			}
		}
		return level;
	}

	private dataType(value: any) {
		if (_.isUndefined(value) || _.isNull(value) || value == null || typeof value === 'string') {
			return 'string';
		}

		if (typeof value === 'boolean') {
			return 'boolean';
		}

		if (typeof value === 'number') {
			return 'number';
		}

		const date = new Date(value);
		if (date instanceof Date && !isNaN(date.valueOf()) && value.length >= 8) {
			return 'date';
		}

		return typeof value;
	}

	isNativeArray(array: any[]) {
		if (typeof array !== 'object' || !(array instanceof Array)) {
			return false;
		}

		for (let i = 0; i < array.length; i++) {
			if (typeof array[i] === 'object') {
				return false;
			}
		}

		return true;
	}

	public getRowLabels(values) {
		return values.map(v => v.label);
	}

	public getRowValues(values) {
		return values.map(v => ({
			dataType: v.dataType,
			value: v.value,
			oldValue: v.oldValue,
		}));
	}

	getRowClass(row, value) {
		if (!this.hasCurrentState) {
			return null;
		}

		let isDeletedRow = row.some(child => child.isDeletedRow == true);
		if (isDeletedRow) {
			return 'deleted_row_color';
		}

		let isNewRow = row.some(child => child.isNewRow == true);
		if (isNewRow) {
			return 'new_row_color';
		}

		if (value.oldValue != value.value) {
			return 'edited_row_color';
		}

		return null;
	}

	getValueClass(value) {
		if (!this.hasCurrentState) {
			return null;
		}

		if (value.oldValue != value.value) {
			return 'edited_row_color';
		}

		return null;
	}

	public formatDate(d: string) {
		const date = new Date(d);

		return date.getUTCFullYear() + '/' +
			('0' + (date.getUTCMonth() + 1)).slice(-2) + '/' +
			('0' + date.getUTCDate()).slice(-2) + ' ' +
			('0' + date.getUTCHours()).slice(-2) + ':' +
			('0' + date.getUTCMinutes()).slice(-2);
	}

	getChangeItemDesc(item): string {
		if (!item || item === '' || _.isUndefined(item) || _.isNull(item)) {
			return '';
		}

		let translateItem = this.translate.instant(item);
		if (translateItem !== item && typeof translateItem === 'string') {
			return translateItem;
		}

		return this.findTranslateObject(item);
	}

	private findTranslateObject(key: string): string {
		if (!this.translactionList || this.translactionList.length === 0) {
			const currentLang = this.translate.currentLang;
			this.translactionList = this.translate.store.translations[currentLang];
			this.getObjectKey(this.translactionList);
		}

		let findKey = key;
		if (key.includes('.')) {
			let keyObj = key.split('.');
			findKey = keyObj[keyObj.length - 1];
		}

		const findIndex = this.translactionObjectList.findIndex(f => f.key === findKey);
		if (findKey) {
			if (findIndex >= 0) {
				return this.translactionObjectList[findIndex].value;
			}
		}

		return key;
	}

	private getObjectKey(objectList: any[]) {
		Object.keys(objectList).forEach(resultKey => {
			if (objectList[resultKey]) {
				if ((typeof objectList[resultKey]) === 'string') {
					this.addTranslateKey(resultKey, objectList[resultKey]);
				} else {
					this.getObjectKey(objectList[resultKey]);
				}
			}
		});
	}

	private addTranslateKey(key, value) {
		const findIndex = this.translactionObjectList.findIndex(f => f.key === key);
		if (findIndex < 0) {
			this.translactionObjectList.push({ key: key, value: value });
		} else {
			if (this.translactionObjectList[findIndex].value.length > value.length) {
				this.translactionObjectList[findIndex].value = value;
			}
		}
	}

	private isIgnoredFieldNames(keyName: string): boolean {
		return keyName === 'LastUpdated' || keyName === 'Guid' || keyName === 'Status' || keyName === 'institutionId';
	}

	approve() {
		this.isProcessing = true;
		if (this.workflowApproveForm.invalid) {
			Object.keys(this.workflowProcess).forEach(name =>
				this.workflowApproveForm.controls[name].markAsTouched()
			);

			this.isProcessing = false;
			return;
		}

		this.workflowProcess = <WorkflowProcessModel>this.workflowApproveForm.value;
		this.entWorkflowProcessService.approve(this.workflowProcess).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 5000, true, false)
				.afterClosed().subscribe(() => {
					this.dialogRef.close();
				});
			this.isProcessing = false;
		}, (error) => {
			this.isProcessing = false;
			this.layoutUtilsService.showError(error);
		});
	}

	reject() {
		this.isProcessing = true;
		if (this.workflowApproveForm.invalid) {
			Object.keys(this.workflowProcess).forEach(name =>
				this.workflowApproveForm.controls[name].markAsTouched()
			);

			this.isProcessing = false;
			return;
		}

		this.workflowProcess = <WorkflowProcessModel>this.workflowApproveForm.value;
		this.entWorkflowProcessService.reject(this.workflowProcess).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 5000, true, false)
				.afterClosed().subscribe(() => {
					this.dialogRef.close();
				});
			this.isProcessing = false;
		}, (error) => {
			this.isProcessing = false;
			this.layoutUtilsService.showError(error);
		});
	}

	cancel() {
		this.dialogRef.close();
	}

	getTitleComponent() {
		let menuDescription = '';
		if (this.workflowProcess.menuId) {
			menuDescription = this.lookupPipe.transform(this.workflowProcess.menuId, this.appMenus);
		}

		if (!menuDescription) {
			menuDescription = this.workflowProcess.menuId;
		} else {
			menuDescription = this.translate.instant(menuDescription);
		}

		let apiMethodDescription = '';
		if (this.workflowProcess.apiMethod) {
			apiMethodDescription = this.lookupPipe.transform(this.workflowProcess.apiMethod, this.appApiMethod);
		}

		if (!apiMethodDescription) {
			apiMethodDescription = this.workflowProcess.apiMethod.toString();
		} else {
			apiMethodDescription = this.translate.instant(apiMethodDescription);
		}

		return menuDescription + ' | ' + apiMethodDescription;
	}
}
