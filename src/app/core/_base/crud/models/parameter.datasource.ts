import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseService } from '@core/_base/layout/services/base.service';
import { CacheService } from '@core/_base/layout/services/cache.service';
import { QueryParamsModel } from './query-params.model';
import { BaseDataSource } from './_base.datasource';
import { QueryResultsModel } from './query-results.model';


export class ParameterDataSource extends BaseDataSource {
	loadingSubject: any;
	constructor(public service: BaseService) {
		super();
	}

	// push filter selections and page options (queryParams) to the filter behaviour(lastFilter$)
	// push true to the loading behaviour to trigger showing loading gif
	// call findAll() to access api controller with the filter and page options()
	//	pipe returned data to the 'tap' method to process data on the fly;
	//	 what does tap action do? :
	//		filters the returned data on client
	//		sets the real datasource(entitySubject), which will be shown in the grid, by pushing filtered data(calling 'next' method with 'result.items')
	//		sets the paginator with the filtered data's page info
	load(queryParams: QueryParamsModel, _filtrationFields: string[] = []) {
		this.service.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.service
			.findAll()
			.pipe(
				tap(res => {
					this.wasQuery = true;

					if (res.error) {
						return of(new QueryResultsModel([], res.error));
					}

					// filter returned data from service:
					let result = this.baseFilter(
						res.items,
						queryParams,
						_filtrationFields
					);
					//set the datasource with filtered data:
					this.entitySubject.next(result.items);
					// set the paging info with the filtered data page info
					this.paginatorTotalSubject.next(result.totalCount);

				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			)
			.subscribe(result => {
				this.setError(result);
			});
	}

	loadWithEndPointSuffix(queryParams: QueryParamsModel, enpointSuffix: string = 'all', _filtrationFields: string[] = []) {
		this.service.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.service
			.findFiltered(queryParams, enpointSuffix)
			.pipe(
				tap(res => {
					this.wasQuery = true;
					// filter returned data from service:
					let result = this.baseFilter(
						res.items,
						queryParams,
						_filtrationFields
					);
					//set the datasource with filtered data:
					this.entitySubject.next(result.items);
					// set the paging info with the filtered data page info
					this.paginatorTotalSubject.next(result.totalCount);

					this.loadingSubject.next(false);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			)
			.subscribe(result => {
				this.setError(result);
			});
	}

	//response u cacheliyor, cacheten getiriyor
	load$(
		queryParams: QueryParamsModel,
		cache: CacheService,
		_filtrationFields: string[] = []
	) {
		this.service.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		cache
			.get(this.service.endpoint, this.service.findAll())
			.pipe(
				tap(res => {
					this.wasQuery = true;
					// filter returned data from service:
					let result = this.baseFilter(
						res.items,
						queryParams,
						_filtrationFields
					);
					//set the datasource with filtered data:
					this.entitySubject.next(result.items);
					// set the paging info with the filtered data page info
					this.paginatorTotalSubject.next(result.totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			)
			.subscribe();
	}
}
