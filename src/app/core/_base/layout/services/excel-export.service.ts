import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { LangParserPipe } from 'app/pipes/lang-parser.pipe';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from './base.service';
import { LookupPipe } from 'app/pipes/lookup.pipe';
import { DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { RateFormatPipe, DivideTo100Pipe, RateTimes100FormatPipe } from '@core/pipes/rate-mask-pipe';
import { CardNumberFormatPipe } from '@core/pipes/card-number-format-pipe';
import { BaseDataSource, LayoutUtilsService, MessageType } from '@core/_base/crud';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import { ODataResultsModel } from '@core/_base/crud/models/odata-results.model';
import { TimeFormatPipe } from 'app/pipes/time-format-pipe';
import { DateMmyyyyFormatTxnPipe } from 'app/pipes/expiry-format-pipe';
import { FirstLetterPipe, JoinPipe } from '@core/_base/metronic';
import { ArnFormatPipe } from '@core/pipes/arn-mask-pipe';
import { MatDialog } from '@angular/material';
import { DynamicSpinnerComponent } from '@components/dynamic-spinner/dynamic-spinner.component';
import { ConfirmationDialogPageComponent } from '@components/confirmation-dialog-page/confirmation-dialog-page.component'
import { LastUpdatedPipe } from 'app/pipes/lastupdated-pipe';
import { Subscription } from 'rxjs';
import { style } from '@angular/animations';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()

export class ExcelExportService extends BaseDataSource {
	lookupPipe: LookupPipe = new LookupPipe(new LangParserPipe());
	dialogRef: any;
	
	private apiSubscription: Subscription;
	constructor(
		private translate: TranslateService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
	) { super() }

	public exportAsExcelFileRouting(service: BaseService, queryParams: QueryParamsModel, routing: string, excelFileName: string, columns?: any[], lookupObjectList?: any, pipeObjectList?: any
		,successCallback?: (fileName: string) => void, 
		errorCallback?: (error: any) => void  
	): void {
		this.openLoadDialog();
		
		try {
			this.apiSubscription =	service.findFiltered(queryParams, routing).subscribe(result => {
				if (result.items != null && result.items.length > 0) {
					this.prepareLookUpData(result.items, excelFileName, columns, lookupObjectList, pipeObjectList);
					if (successCallback) {
						successCallback(excelFileName); 
					  }
					
				}
				else {
					this.closeLoadDialog();
					
				}
			}, (error) => {
				this.closeLoadDialog();
				if (errorCallback) {
					errorCallback(error); 
				  }
				this.layoutUtilsService.showError(error);
			});
		} catch (e) {
		
			this.closeLoadDialog();
			this.layoutUtilsService.showError(e);
		}
	}

	public exportAsExcelFileWithData(data: any[], excelFileName: string, columns?: any[], lookupObjectList?: any, pipeObjectList?: any): void {
		this.openLoadDialog();
		try {
			if (data != null && data.length > 0) {
				this.prepareLookUpData(data, excelFileName, columns, lookupObjectList, pipeObjectList);
			}
		} catch (e) {
			this.closeLoadDialog();
			this.layoutUtilsService.showError(e);
		}
	}

	public exportAsExcelFileFilter(service: BaseService, queryParams: QueryParamsModel, _filtrationFields: string[] = [], excelFileName: string, columns?: any[], lookupObjectList?: any, pipeObjectList?: any): void {
		this.openLoadDialog();
		try {
			service.lastFilter$.next(queryParams);
			this.apiSubscription = service.findAll().subscribe(res => {
				let result = this.baseFilter(res.items, queryParams, _filtrationFields);
				if (result.items != null && result.items.length > 0) {
					this.prepareLookUpData(result.items, excelFileName, columns, lookupObjectList, pipeObjectList);
				}
			}, (error) => {
				this.closeLoadDialog();
				this.layoutUtilsService.showError(error);
			});
		} catch (e) {
			this.closeLoadDialog();
			this.layoutUtilsService.showError(e);
		}
	}

	public exportAsExcelFileEndPointSuffix(service: BaseService, enpointSuffix: string = 'all', queryParams: QueryParamsModel, _filtrationFields: string[] = [], excelFileName: string, columns?: any[], lookupObjectList?: any, pipeObjectList?: any): void {
		this.openLoadDialog();
		try {
			service.lastFilter$.next(queryParams);
			this.apiSubscription = service.findAllWithEndPointSuffix(enpointSuffix).subscribe(res => {
				let result = this.baseFilter(res.items, queryParams, _filtrationFields);
				if (result.items != null && result.items.length > 0) {
					this.prepareLookUpData(result.items, excelFileName, columns, lookupObjectList, pipeObjectList);
				}
			}, (error) => {
				this.closeLoadDialog();
				this.layoutUtilsService.showError(error);
			});
		} catch (e) {
			this.closeLoadDialog();
			this.layoutUtilsService.showError(e);
		}
	}

	public exportAsExcelFileParameter(service: BaseService, queryParams: ODataParamsModel, excelFileName: string, columns?: any[], lookupObjectList?: any, pipeObjectList?: any): void {
		this.openLoadDialog();
		try {
			this.apiSubscription = service.getOData(queryParams).subscribe(res => {
				let result = new ODataResultsModel(res);
				if (result.items != null && result.items.length > 0) {
					this.prepareLookUpData(result.items, excelFileName, columns, lookupObjectList, pipeObjectList);
				}
			}, (error) => {
				this.closeLoadDialog();
				this.layoutUtilsService.showError(error);
			});
		} catch (e) {
			this.closeLoadDialog();
			this.layoutUtilsService.showError(e);
		}
	}

	async prepareLookUpData(items: any, excelFileName: string, columns?: any[], lookupObjectList?: any[], pipeObjectList?: any[]) {
		if (lookupObjectList && lookupObjectList.length > 0) {
			await items.forEach(resultElement => {
				Object.keys(resultElement).forEach(resultKey => {
					lookupObjectList.forEach(lookElement => {
						if (lookElement.key.includes('.')) {
							const item1Key = lookElement.key.split('.')[0];
							const item2Key = lookElement.key.split('.')[1];
							let itemValue = '';
							if (resultKey == item1Key) {
								resultElement[item1Key].forEach(element => {
									let resultElemntKey = element[item2Key];
									itemValue += this.lookupPipe.transform(resultElemntKey, lookElement.value) + ',';
								});

								resultElement[resultKey] = itemValue;
							}
						}
						else if (resultKey == lookElement.key) {
							let resultElemntKey = resultElement[resultKey];
							resultElement[resultKey] = this.lookupPipe.transform(resultElemntKey, lookElement.value);
						}
					});
				});
			});
		}

		if (pipeObjectList && pipeObjectList.length > 0) {
			var lang = localStorage.getItem('language');
			await items.forEach(resultElement => {
				Object.keys(resultElement).forEach(resultKey => {
					pipeObjectList.forEach(pipeElement => {
						if (resultKey == pipeElement.key) {
							let resultElemntVal = resultElement[resultKey];

							switch (pipeElement.value) {
								case 'date':
									let datePipeVal = new DatePipe(lang).transform(resultElemntVal, pipeElement.format);
									resultElement[resultKey] = datePipeVal;
									break;
								case 'timeFormat':
									let timeFormatPipeVal = new TimeFormatPipe().transform(resultElemntVal);
									resultElement[resultKey] = timeFormatPipeVal;
									break;
								case 'expiryFormatTxn':
									let datePipeTxnVal = new DateMmyyyyFormatTxnPipe().transform(resultElemntVal);
									resultElement[resultKey] = datePipeTxnVal;
									break;
								case 'currency':
									let currencyPipeVal = new CurrencyPipe(lang).transform(resultElemntVal, ' ', 'symbol-narrow');
									resultElement[resultKey] = currencyPipeVal ? currencyPipeVal.trim() : '';
									break;
								case 'rateMask':
									let rateFormatPipeVal = new RateFormatPipe().transform(resultElemntVal);
									resultElement[resultKey] = rateFormatPipeVal;
									break;
								case 'slice':
									let sliceStart = pipeElement.format.split(':')[0];
									let sliceEnd = pipeElement.format.split(':')[1];
									let slicePipVal = new SlicePipe().transform(resultElemntVal, sliceStart, sliceEnd);
									resultElement[resultKey] = slicePipVal;
									break;
								case 'cardNoMask':
									let cardNoMaskPipeVal = new CardNumberFormatPipe().transform(resultElemntVal);
									resultElement[resultKey] = cardNoMaskPipeVal;
									break;
								case 'mFirstLetter':
									let mFirstLetterPipeVal = new FirstLetterPipe().transform(resultElemntVal);
									resultElement[resultKey] = mFirstLetterPipeVal;
									break;
								case 'mJoin':
									let mJoinPipeVal = new JoinPipe().transform(resultElemntVal);
									resultElement[resultKey] = mJoinPipeVal;
									break;
								case 'arnMask':
									let arnMaskPipeVal = new ArnFormatPipe().transform(resultElemntVal);
									resultElement[resultKey] = arnMaskPipeVal;
									break;
								case 'string':
									resultElement[resultKey] = !resultElemntVal || resultElemntVal === '' ? '' : resultElemntVal + ' ';
									break;
								case 'toString':
									resultElement[resultKey] = !resultElemntVal || resultElemntVal === '' ? '' : "'" + resultElemntVal;
									break;
								case 'lastUpdated':
									let lastUpdatedPipeVal = new LastUpdatedPipe().transform(resultElemntVal);
									resultElement[resultKey] = lastUpdatedPipeVal;
									break;
								case 'rateTimes100':
									let rateTimes100Val = new RateTimes100FormatPipe().transform(resultElemntVal, pipeElement.fixedLength);
									resultElement[resultKey] = rateTimes100Val;
									break;
								case 'divideTo100':
									let divideTo100Val = new DivideTo100Pipe().transform(resultElemntVal, pipeElement.fixedLength);
									resultElement[resultKey] = divideTo100Val;
									break;
							}
						}
					});
				});
			});
		}

		this.exportAsExcelFile(items, excelFileName, columns);
	}

	exportAsExcelFile(json: any[], excelFileName: string, columns?: any[]): void {
		
		let _json = json;
		if (columns
			&& columns.length > 0
			&& columns[0])
			_json = this.prepareExcelData(json, columns);

		const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(_json);
		const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

		const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', ignoreEC: false });
		this.saveAsExcelFile(excelBuffer, excelFileName);
		
	}

	prepareExcelData(json: any[], columns: any[]): any[] {
		let excelData: any[] = [];

		json.forEach(element => {
			let newLine = {};
			Object.keys(columns[0]).forEach(columnKey => {
				let cellHeader = this.translate.instant(columns[0][columnKey]);
				let cellValue = element[columnKey];
				newLine[cellHeader] = cellValue;
			});

			excelData.push(newLine);
		});

		return excelData;
	}

	private saveAsExcelFile(buffer: any, fileName: string): void {
		const data: Blob = new Blob([buffer], {
			type: EXCEL_TYPE
		});
		FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
		
		this.closeLoadDialog();
	}
	async confirmCancellation(): Promise<boolean> {
		const result =  this.showConfirmationDialog('İptal etmek istediğinizden emin misiniz?');
		return result;
	}
	 showConfirmationDialog(message: string): Promise<boolean> {
		const dialogRef = this.dialog.open(ConfirmationDialogPageComponent, {
		  data: {
			title : message
		  },
		});
	
		return dialogRef.afterClosed().toPromise();
	}
	
	openLoadDialog() {
		this.dialogRef = this.dialog.open(DynamicSpinnerComponent, {
			disableClose: false,
			id: 'mExcelLoadScreenComponent-dialog-' + new Date().getTime(),
			data: {
				title: 'General.PleaseWaitWhileProcessing'
			}
		});
		this.dialogRef.afterOpened().subscribe(async () => {
			const cancelButton = document.querySelector('.mat-dialog-container .your-cancel-button-class');
		
				if (cancelButton)
				{
					cancelButton.addEventListener('click', async () => {
						const confirmCancel = await this.confirmCancellation()
						
						if (confirmCancel)
						{
					
							this.layoutUtilsService.showNotification("Excel Dosya İndirme İşlemi İptal Edildi")
						    this.apiSubscription.unsubscribe();
				   		    this.dialogRef.close(); 
						}
						else {
						
							this.layoutUtilsService.showError("ss")
						}
			  });
			}
		  });
	}

	closeLoadDialog() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}
}
