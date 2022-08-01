import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import * as _ from 'lodash';
import { tap, catchError, finalize } from 'rxjs/operators';
import { BaseModel } from '..';
import { BaseService } from '@core/_base/layout/services/base.service';
import { ODataParamsModel } from './odata-params.model';
import { ODataResultsModel } from './odata-results.model';

// Why not use MatTableDataSource?
/*  In this example, we will not be using the built-in MatTableDataSource because its designed for filtering,
	sorting and pagination of a client - side data array.
	Read the article: 'https://blog.angular-university.io/angular-material-data-table/'
**/
export class ODataDataSource implements DataSource<BaseModel> {
	errorSubject = new BehaviorSubject<any>({});

	entitySubject = new BehaviorSubject<any[]>([]);
	hasItems: boolean = false; // Need to show message: 'No records found
	wasQuery: boolean = false;

	// Loading | Progress bar
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$: Observable<boolean>;

	// Paginator | Paginators count
	paginatorTotalSubject = new BehaviorSubject<number>(0);
	paginatorTotal$: Observable<number>;

	constructor(public service: BaseService) {
		this.loading$ = this.loadingSubject.asObservable();
		this.paginatorTotal$ = this.paginatorTotalSubject.asObservable();
		this.paginatorTotal$.subscribe(res => this.hasItems = res > 0);
	}
	clear() {
		this.wasQuery = false;
		this.errorSubject.next({});
		this.entitySubject.next([]);
		this.loadingSubject.next(false);
		this.paginatorTotalSubject.next(0);
	}

	clearError() {
		this.errorSubject.next({});
	}

	setError(result) {
		if (result) {
			if (result.error) {
				this.errorSubject.next(result);
			}
		}
	}

	hasError() {
		let _hasError = false;
		if (typeof this.errorSubject.value !== 'undefined' && typeof this.errorSubject.value.error !== 'undefined')
			_hasError = true;
		return _hasError;
	}

	getErrorMessage() {
		var errorMessage = '';
		if (typeof this.errorSubject.value !== 'undefined' && typeof this.errorSubject.value.error !== 'undefined') {
			errorMessage = this.errorSubject.value.error.message;
			if (this.errorSubject.value.error.referenceId) {
				errorMessage += ' CorrelationId : ' + this.errorSubject.value.error.referenceId;
			}
		}
		return errorMessage;
	}

	connect(collectionViewer: CollectionViewer): Observable<any[]> {
		// Connecting data source
		return this.entitySubject.asObservable();
	}

	disconnect(collectionViewer: CollectionViewer): void {
		// Disonnecting data source
		this.entitySubject.complete();
		this.loadingSubject.complete();
		this.paginatorTotalSubject.complete();
	}

	load(queryParams: ODataParamsModel) {
		this.loadingSubject.next(true);
		this.service.getOData(queryParams)
			.pipe(
				tap(res => {
					this.wasQuery = true;
					let result = new ODataResultsModel(res);
					this.entitySubject.next(result.items);
					if (queryParams.skip == 0)
						this.paginatorTotalSubject.next(result.totalCount);

				}),
				catchError(err => of(new ODataResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(result => {
				this.setError(result);
			});
	}

	loadWithEndPointSuffix(queryParams: ODataParamsModel, enpointSuffix: string = 'all') {
		this.loadingSubject.next(true);
		this.service.getODataWithEndPointSuffix(queryParams, enpointSuffix)
			.pipe(
				tap(res => {
					this.wasQuery = true;
					let result = new ODataResultsModel(res);
					this.entitySubject.next(result.items);
					if (queryParams.skip == 0)
						this.paginatorTotalSubject.next(result.totalCount);

				}),
				catchError(err => of(new ODataResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(result => {
				this.setError(result);
			});
	}
}
