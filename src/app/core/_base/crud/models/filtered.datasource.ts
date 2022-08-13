import { tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { BaseDataSource } from '@core/_base/crud/models/_base.datasource';
import { QueryResultsModel } from '@core/_base/crud/models/query-results.model';
import { BaseService } from '@core/_base/layout/services/base.service';

export class FilteredDataSource extends BaseDataSource {

	constructor(public service: BaseService) {
		super();
	}

	load(queryParams: QueryParamsModel, enpointSuffix: string = 'filter') {
		this.service.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.service.findFiltered(queryParams, enpointSuffix)
			.pipe(
				tap(result => {
					this.wasQuery = true;

					if (result.error) {
						return of(new QueryResultsModel([], result.error));
					}

					let entitiesResult = result.items;
					if (queryParams.sortField) {
						entitiesResult = this.sortArray(entitiesResult, queryParams.sortField, queryParams.sortOrder);
					}

					this.entitySubject.next(result.items);
					if (queryParams.pageNumber == 0) {
						this.paginatorTotalSubject.next(result.totalCount);
					}

					this.loadingSubject.next(false);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(result => {
				this.setError(result);
			});
	}

	sort(queryParams: QueryParamsModel) {
		let entitiesResult = this.entitySubject.value;
		if (queryParams.sortField) {
			entitiesResult = this.sortArray(entitiesResult, queryParams.sortField, queryParams.sortOrder);
		}

		this.entitySubject.next(entitiesResult);
	}
}
