import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { ActivatedRoute } from '@angular/router';
import { CfgHolidayVariablesModel } from '@common/member/cfgHolidayVariables';
import { CfgHolidayVariableService } from '@common/member/cfgHolidayVariableService';
import { CfgHolidayNationalService } from '@common/member/cfgHolidayNation.service';
import { CfgHolidayNationalModel } from '@common/member/cfgHolidayNational';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';

@Component({
	selector: 'm-cfg-holiday-list',
	templateUrl: './cfg-holiday-list.component.html'
})
export class CfgHolidayListComponent implements OnInit, AfterViewInit {
	variableHoliday: ParameterDataSource;
	nationHoliday: ParameterDataSource;
	cfgVariablesResult: CfgHolidayVariablesModel[] = [];
	cfgNationalResult: CfgHolidayNationalModel[] = [];
	displayedColumns1 = [];
	displayedColumns2 = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	strFilter: string = '';
	@ViewChild('searchInput') searchInput: ElementRef;
	@ViewChild('variablePaginator') variablePaginator: MatPaginator;
	@ViewChild('variableSort') variableSort: MatSort;
	@ViewChild('nationPaginator') nationPaginator: MatPaginator;
	@ViewChild('nationSort') nationSort: MatSort;

	gridVariableColumns = [
		{
			holidayName: 'General.HolidayName',
			holidayDate: 'General.HolidayDate'
		}
	];
	gridNationColumns = [
		{
			holidayName: 'General.HolidayName',
			holidayDay: 'General.HolidayDay',
			holidayMonth: 'General.HolidayMonth'
		}
	];

	constructor(
		private cfgHolidayVariableService: CfgHolidayVariableService,
		private cfgHolidayNationalService: CfgHolidayNationalService,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private excelService: ExcelExportService,
		private dialog: MatDialog
	) { }

	ngAfterViewInit(): void {
		this.loadTabFunctions();
		const dynSub = this.route.queryParams.subscribe(params => {
			this.loadVariableData();
			this.loadNationData();
		});
		dynSub.unsubscribe();
	}

	loadTabFunctions() {
		if (this.nationSort) {
			this.nationSort.sortChange.subscribe(() => (this.nationPaginator.pageIndex = 0));
			merge(this.nationSort.sortChange, this.nationPaginator.page)
				.pipe(
					tap(() => {
						this.loadNationData();
					})
				).subscribe();
		}

		if (this.variableSort) {
			this.variableSort.sortChange.subscribe(() => (this.variablePaginator.pageIndex = 0));
			merge(this.variableSort.sortChange, this.variablePaginator.page)
				.pipe(
					tap(() => {
						this.loadVariableData();
					})
				).subscribe();
		}
	}

	ngOnInit() {
		this.variableHoliday = new ParameterDataSource(this.cfgHolidayVariableService);
		this.nationHoliday = new ParameterDataSource(this.cfgHolidayNationalService);

		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					if (this.variablePaginator) {
						this.variablePaginator.pageIndex = 0;
						this.loadVariableData();
					}
					if (this.nationPaginator) {
						this.nationPaginator.pageIndex = 0;
						this.loadNationData();
					}
				})
			)
			.subscribe();



		this.variableHoliday.entitySubject.subscribe(res => {
			this.cfgVariablesResult = res;
		});

		this.nationHoliday.entitySubject.subscribe(res => {
			this.cfgNationalResult = res;
		});

		this.displayedColumns2.push('actions');

		Object.keys(this.gridNationColumns[0]).forEach(key => {
			this.displayedColumns2.push(key);
		});

		this.displayedColumns1.push('actions');
		Object.keys(this.gridVariableColumns[0]).forEach(key => {
			this.displayedColumns1.push(key);
		});
	}

	loadVariableData() {
		const queryParams = new QueryParamsModel(
			this.filterVariableConfiguration(),
			this.variableSort.direction,
			this.variableSort.active,
			this.variablePaginator.pageIndex,
			this.variablePaginator.pageSize
		);
		this.variableHoliday.load(queryParams);
	}

	loadNationData() {
		const queryParams = new QueryParamsModel(
			this.filterNationConfiguration(),
			this.nationSort.direction,
			this.nationSort.active,
			this.nationPaginator.pageIndex,
			this.nationPaginator.pageSize
		);
		this.nationHoliday.load(queryParams);
	}

	filterVariableConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.holidayDate = searchText;
		filter.holidayName = searchText;

		return filter;
	}

	filterNationConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.holidayDay = searchText;
		filter.holidayName = searchText;
		filter.holidayMonth = searchText;
		return filter;
	}

	deleteVarHoliday(_item) {
		const _title: string = this.translate.instant('General.DeleteConfirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.cfgHolidayVariableService.delete(_item.guid).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadVariableData();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	deleteNatHoliday(_item) {
		const _title: string = this.translate.instant('General.DeleteConfirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.cfgHolidayNationalService.delete(_item.guid).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadNationData();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	exportVariableHolidaysAsXLSX(exportAll: boolean): void {
		const queryParams = new QueryParamsModel(this.filterVariableConfiguration(), this.variableSort.direction, this.variableSort.active, (exportAll ? 0 : this.variablePaginator.pageIndex), (exportAll ? -1 : this.variablePaginator.pageSize));
		let _filtrationFields: string[] = [];
		this.excelService.exportAsExcelFileFilter(this.cfgHolidayVariableService, queryParams, _filtrationFields, 'VariableHolidays', this.gridVariableColumns);
	}

	exportNationalHolidaysAsXLSX(exportAll: boolean): void {
		const queryParams = new QueryParamsModel(this.filterNationConfiguration(), this.nationSort.direction, this.nationSort.active, (exportAll ? 0 : this.nationPaginator.pageIndex), (exportAll ? -1 : this.nationPaginator.pageSize));
		let _filtrationFields: string[] = [];
		this.excelService.exportAsExcelFileFilter(this.cfgHolidayNationalService, queryParams, _filtrationFields, 'NationalHolidays', this.gridNationColumns);
	}

	openHistoryVarHoliday(key: string) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'CfgHolidayVariable',
				key: key
			}
		});
	}

	openHistoryNatHoliday(key: string) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'CfgHolidayVariable',
				key: key
			}
		});
	}
}
