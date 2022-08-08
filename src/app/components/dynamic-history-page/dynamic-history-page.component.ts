import { Component, OnInit, ViewChild, Inject, ElementRef } from '@angular/core';
import { CfgTraceLogService } from '@common/trace/cfgTaceLog.service';
import { BehaviorSubject, merge } from 'rxjs';
import { MatPaginator, MAT_DIALOG_DATA, MatDialogRef, MatSort } from '@angular/material';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FrameworkApi } from '@services/framework.api';
import { LookupPipe } from 'app/pipes/lookup.pipe';
import { LangParserPipe } from 'app/pipes/lang-parser.pipe';
import * as _ from 'lodash';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import { FormGroup, FormControl } from '@angular/forms';
import { CfgTraceLogRequestModel } from '@common/trace/cfgTraceLogRequest.model';
import { LayoutUtilsService } from '@core/_base/crud';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'm-dynamic-history-page',
	templateUrl: './dynamic-history-page.component.html',
	styleUrls: ['./dynamic-history-page.component.scss']
})
export class DynamicHistoryPageComponent implements OnInit {
	columnsToDisplay = [];
	gridColumns = [
		{
			className: 'General.ClassName',
			type: 'System.Member.TraceType',
			field: 'System.Member.FieldName',
			oldValue: 'System.Member.OldValue',
			newValue: 'System.Member.NewValue',
			actionDate: 'General.ActionDate',
			actionTime: 'General.ActionTime',
			userCode: 'General.UserCode',
			channelCode: 'System.Member.ChannelCode',
			referenceId: 'General.ReferenceId'
		}
	];
	dataSource: FilteredDataSource;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	translactionList: any[] = [];
	translactionObjectList: any[] = [];
	translactionEntityList: any[] = [];
	cfgTraceType: any[] = [];
	cfgYesNoNumeric: any[] = [];
	appChannelCodes: any[] = [];
	dateDiff: number = 30;
	lookupPipe: LookupPipe = new LookupPipe(new LangParserPipe());
	filterForm: FormGroup = new FormGroup({});
	cfgTraceLogRequestModel: CfgTraceLogRequestModel = new CfgTraceLogRequestModel();
	frmControlSearch: FormControl = new FormControl();

	@ViewChild('paginator') private paginator: MatPaginator;
	@ViewChild('nationSort') nationSort: MatSort;

	@ViewChild('headerScroller') headerScroller: ElementRef;
	@ViewChild('tableScroller') tableScroller: ElementRef;
	scrollWidth: number = 0;

	className: string = '';
	key: string = '';
	lookupObjectList: any[] = [];
	referenceId: string = '';

	isLogTool = false;
	isScreenTool = false;
	isExternalTool = false;

	constructor(
		private frameworkApi: FrameworkApi,
		private cfgTraceLogService: CfgTraceLogService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private dialogRef: MatDialogRef<DynamicHistoryPageComponent>,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private excelService: ExcelExportService
	) {
		if (data.className) {
			this.className = data.className;
		}
		if (data.key) {
			if (typeof data.key == "object") {
				let tuppleKeyValue: string = "";
				Object.keys(data.key).forEach(name => {
					if (data.key[name]) {
						tuppleKeyValue += (tuppleKeyValue ? "~" : "") + data.key[name];
					}
				});

				this.key = tuppleKeyValue;
			}
			else {
				this.key = data.key.toString();
			}
		}
		if (data.referenceId) {
			this.referenceId = data.referenceId;
		}
		if (data.lookupObjectList) {
			this.lookupObjectList = data.lookupObjectList;
		}

		if (this.referenceId) {
			this.isLogTool = true;
		} else if (this.className && this.key) {
			this.isExternalTool = true;
		} else {
			this.isScreenTool = true;
		}
	}

	scrollHead() {
		this.tableScroller.nativeElement.scrollTo(this.headerScroller.nativeElement.scrollLeft, 0);
		this.scrollWidth = this.tableScroller.nativeElement.scrollWidth;
	}

	scrollFoot() {
		this.headerScroller.nativeElement.scrollTo(this.tableScroller.nativeElement.scrollLeft, 0);
		this.scrollWidth = this.tableScroller.nativeElement.scrollWidth;
	}

	ngOnInit(): void {
		this.paginator.pageSize = 500;
		this.nationSort.active = 'actionDate';
		this.nationSort.direction = 'desc';

		Object.keys(this.cfgTraceLogRequestModel).forEach(name => {
			this.filterForm.addControl(name, new FormControl(this.cfgTraceLogRequestModel[name]));
		});

		if (this.nationSort) {
			this.nationSort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
			merge(this.nationSort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadDataSource();
					})
				).subscribe();
		}

		this.frameworkApi.getLookups(['CfgTraceTypeDef', 'CfgYesNoNumeric', 'AppChannelCodes']).then(res => {
			this.cfgTraceType = res.find(x => x.name === 'CfgTraceTypeDef').data;
			this.cfgYesNoNumeric = res.find(x => x.name === 'CfgYesNoNumeric').data;
			this.appChannelCodes = res.find(x => x.name === 'AppChannelCodes').data;
		});

		Object.keys(this.gridColumns[0]).forEach(key => {
			this.columnsToDisplay.push(key);
		});

		this.dataSource = new FilteredDataSource(this.cfgTraceLogService);

		this.cfgTraceLogRequestModel.actionDateStart.setDate(new Date().getDate() - this.dateDiff);
		this.cfgTraceLogRequestModel.actionDateEnd = new Date();
		Object.keys(this.cfgTraceLogRequestModel).forEach(name => {
			if (this.filterForm.controls[name]) {
				this.filterForm.controls[name].setValue(this.cfgTraceLogRequestModel[name]);
			}
		});

		if (!this.isScreenTool) {
			this.loadDataSource();
		}

		setInterval(() => {
			this.scrollWidth = this.tableScroller.nativeElement.scrollWidth;
		}, 3000);
	}

	loadDataSource() {
		if (!this.validation()) {
			return;
		}

		const queryParams = new QueryParamsModel(
			this.cfgTraceLogRequestModel,
			this.nationSort.direction,
			this.nationSort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.dataSource.load(queryParams, 'GetTraceLog');
	}

	validation(): boolean {
		if (this.isExternalTool || this.isScreenTool) {
			this.cfgTraceLogRequestModel = <CfgTraceLogRequestModel>this.filterForm.value;

			if (this.isExternalTool) {
				this.cfgTraceLogRequestModel.className = this.className;
				this.cfgTraceLogRequestModel.key = this.key;
				this.cfgTraceLogRequestModel.correlationDetail = true;
			}

			if (!this.cfgTraceLogRequestModel.actionDateEnd || !this.cfgTraceLogRequestModel.actionDateStart) {
				this.layoutUtilsService.showError(this.translate.instant('System.Member.Exception.PlaseEntryStartAndEndDate'));
				return false;
			} else {
				const startTime = this.cfgTraceLogRequestModel.actionDateStart['_d'] ? this.cfgTraceLogRequestModel.actionDateStart['_d'].getTime() : this.cfgTraceLogRequestModel.actionDateStart.getTime();
				const endTime = this.cfgTraceLogRequestModel.actionDateEnd['_d'] ? this.cfgTraceLogRequestModel.actionDateEnd['_d'].getTime() : this.cfgTraceLogRequestModel.actionDateEnd.getTime();
				let dateAbs = endTime - startTime;

				let diffFloor = Math.floor(dateAbs / (1000 * 3600 * 24));
				if (diffFloor < 0) {
					this.layoutUtilsService.showError(this.translate.instant('System.Member.Exception.StartDateCanotBeGretarThanEndDate'));
					return false;
				} else if (diffFloor > this.dateDiff) {
					let description: string = this.translate.instant('System.Member.Exception.DifferenceBetweenDatesCannotExeedDays');
					this.layoutUtilsService.showError(description.replace('{1}', this.dateDiff.toString()));
					return false;
				} else {
					return true;
				}
			}
		} else {
			this.cfgTraceLogRequestModel = new CfgTraceLogRequestModel();
			this.cfgTraceLogRequestModel.referenceId = this.referenceId;
			return true;
		}
	}

	cancel() {
		this.dialogRef.close();
	}

	findLookupObjcet(key, value): string {
		let lookupValue = value;
		if (!_.isUndefined(value) && !_.isNull(value)) {
			if (this.lookupObjectList && this.lookupObjectList.length > 0) {
				this.lookupObjectList.forEach(element => {
					if (element.key.includes('.')) {
						const splitItem = element.key.split('.');
						element.key = splitItem[splitItem.length - 1];
					}

					if (element.key.toString().toUpperCase().includes(key.toString().toUpperCase())
						||
						key.toString().toUpperCase().includes(element.key.toString().toUpperCase())) {
						lookupValue = this.lookupPipe.transform(value, element.value);

						if (lookupValue === '') {
							lookupValue = this.transform(value, element.value);
						}
					}
				});
			}

			let numericYesNo = true;
			if (value.toString().toUpperCase() === 'FALSE') {
				value = '0';
			} else if (value.toString().toUpperCase() === 'TRUE') {
				value = '1';
			} else {
				numericYesNo = false;
			}

			if (numericYesNo) {
				lookupValue = this.lookupPipe.transform(value, this.cfgYesNoNumeric);
			}
		}

		return lookupValue === '' ? value : lookupValue;
	}

	transform(value: any, lookupList: any[]): any {
		let result: any = '';
		if (typeof lookupList !== 'undefined' && lookupList != null) {
			lookupList.forEach(element => {
				if (element.guid && element.guid === value) {
					return element.description;
				}
			});
		}
		return result;
	}

	findTranslateObject(key: string, type: number): string {
		if (!this.translactionList || this.translactionList.length === 0) {
			const currentLang = this.translate.currentLang;
			this.translactionList = this.translate.store.translations[currentLang];
			this.getObjectKey(this.translactionList, true);
		}

		let objectList = (type === 0) ? this.translactionObjectList : this.translactionEntityList;
		const findIndex = objectList.findIndex(f => f.key === key);
		if (findIndex >= 0) {
			return objectList[findIndex].value;
		} else {
			return key;
		}
	}

	getObjectKey(objectList: any[], isStart: boolean, parentObj: string = '') {
		Object.keys(objectList).forEach(resultKey => {
			if (objectList[resultKey]) {
				if (isStart) {
					parentObj = resultKey;
				}
				if ((typeof objectList[resultKey]) === 'string') {
					this.addTranslateKey(resultKey, objectList[resultKey], parentObj);
				} else {
					this.getObjectKey(objectList[resultKey], false, parentObj);
				}
			}
		});
	}

	addTranslateKey(key, value, parentObj) {
		let objectList = (parentObj === 'Entity') ? this.translactionEntityList : this.translactionObjectList;

		const findIndex = objectList.findIndex(f => f.key === key);
		if (findIndex < 0) {
			objectList.push({ key: key, value: value });
		} else {
			if (objectList[findIndex].value.length > value.length) {
				objectList[findIndex].value = value;
			}
		}
	}

	exportAsXLSX() {
		if (!this.validation()) {
			return;
		}

		const queryParams = new QueryParamsModel(this.cfgTraceLogRequestModel, this.nationSort.direction, this.nationSort.active, 0, -1);
		this.cfgTraceLogService.findFiltered(queryParams, 'GetTraceLog').subscribe(result => {
			if (result.items != null && result.items.length > 0) {
				this.prepareData(result.items);
				this.loadDataSource();
			} else {
				this.layoutUtilsService.showError(this.translate.instant('General.NoRecordsFound'));
			}
		});
	}

	async prepareData(items: any[]) {
		let lang = localStorage.getItem('language');
		await items.forEach(resultElement => {
			const fieldName = resultElement['field'];
			Object.keys(resultElement).forEach(resultKey => {
				if (resultKey === 'className') {
					resultElement[resultKey] = this.findTranslateObject(resultElement[resultKey], 1);
				} else if (resultKey === 'type') {
					resultElement[resultKey] = this.lookupPipe.transform(resultElement[resultKey], this.cfgTraceType);
				} else if (resultKey === 'field') {
					resultElement[resultKey] = this.findTranslateObject(resultElement[resultKey], 0);
				} else if (resultKey === 'oldValue' || resultKey === 'newValue') {
					resultElement[resultKey] = this.findLookupObjcet(fieldName, resultElement[resultKey]);
				} else if (resultKey === 'actionDate' && resultElement[resultKey]) {
					resultElement[resultKey] = new DatePipe(lang).transform(resultElement[resultKey], 'dd.MM.yyyy');
				} else if (resultKey === 'actionTime' && resultElement[resultKey]) {
					resultElement[resultKey] = resultElement[resultKey].toString().substring(0, 8);
				}
			});
		});

		this.excelService.exportAsExcelFile(items, 'TraceFile_' + this.className, this.gridColumns);
	}
}
