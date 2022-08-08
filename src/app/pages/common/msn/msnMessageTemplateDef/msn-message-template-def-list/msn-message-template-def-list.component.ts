import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MsnMessageTemplateDefModel } from '@common/btc/msn-message-template-def-model';
import { ParameterDataSource } from '@core/_base/crud/models/parameter.datasource';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { MsnMessageTemplateDefService } from '@common/framework/msn-message-template-def.service';
import { DynamicHistoryPageComponent } from '@components/dynamic-history-page/dynamic-history-page.component';
import { LayoutUtilsService } from '@core/_base/crud';

export enum MessageType {
	Create,
	Read,
	Update,
	Delete
}

@Component({
	selector: 'm-msn-message-template-def-list',
	templateUrl: './msn-message-template-def-list.component.html'
})

export class MsnMessageTemplateDefListComponent implements OnInit {
	dataSource: ParameterDataSource;
	displayedColumns = ['actions', 'code', 'description', 'type'];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('searchInput') searchInput: ElementRef;
	filterStatus: string = '';
	filterType: string = '';
	selection = new SelectionModel<MsnMessageTemplateDefModel>(true, []);
	result: MsnMessageTemplateDefModel[] = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	templateTypeDefs: any = [];

	constructor(
		private route: ActivatedRoute,
		private msnMessageTemplateDefService: MsnMessageTemplateDefService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		public translate: TranslateService) { }

	ngOnInit() {
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadMsnMessageTemplateDefList();
				})
			)
			.subscribe();


		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadMsnMessageTemplateDefList();
				})
			)
			.subscribe();

		this.msnMessageTemplateDefService.api.getLookup("MsnMessageTemplateTypeDef").then(res => {
			this.templateTypeDefs = res;
		});

		this.dataSource = new ParameterDataSource(this.msnMessageTemplateDefService);
		let queryParams = new QueryParamsModel(this.filterConfiguration());

		const dynSub = this.route.queryParams.subscribe(params => {
			this.dataSource.load(queryParams);
		});
		dynSub.unsubscribe();

		this.dataSource.entitySubject.subscribe(res => {
			this.result = res;
		});
	}

	delete(_item: MsnMessageTemplateDefModel) {
		const _title: string = this.translate.instant('General.Confirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		let entity = { profileType: 10, profileGuid: _item.code };

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.msnMessageTemplateDefService.delete(_item.code.toString()).subscribe(() => {
				this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
				this.loadMsnMessageTemplateDefList();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		});
	}

	loadMsnMessageTemplateDefList() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		this.dataSource.load(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.description = searchText;
		filter.code = searchText;

		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.isOpen = (this.filterStatus == 'true');
		}

		return filter;
	}

	openHistory(key: string) {
		this.dialog.open(DynamicHistoryPageComponent, {
			data: {
				className: 'MsnMessageTemplateDef',
				key: key
			}
		});
	}
}
