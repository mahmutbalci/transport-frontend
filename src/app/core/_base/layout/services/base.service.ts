import { Injectable } from '@angular/core';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { HttpUtilsService } from '@core/_base/crud';
import { Api } from './api';
import { FilteredQueryResultsModel } from '@core/_base/crud/models/filtered-query-results.model';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import { ODataResultsModel } from '@core/_base/crud/models/odata-results.model';
import { QueryResultsModel } from '@core/_base/crud/models/query-results.model';

@Injectable()
export class BaseService {
	public endpoint: string = '';
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));

	constructor(public api: Api,
		private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new entity to the server
	create<T>(entity, extraHeaders?: any[]): Observable<T> {
		return this.api.post<T>(this.endpoint, entity, extraHeaders);
	}

	// CREATE =>  POST: add a new entity to the server
	createWithEndPointSuffix<T>(entity, enpointSuffix: string = 'save', extraHeaders?: any[]): Observable<T> {
		return this.api.post<T>(this.endpoint + '/' + enpointSuffix, entity, extraHeaders);
	}

	// READ
	getAll<T>(): Observable<T> {
		return this.api.get<T>(this.endpoint);
	}

	// READ
	getAllWithEndPointSuffix<T>(enpointSuffix: string = 'all'): Observable<T> {
		return this.api.get<T>(this.endpoint + '/' + enpointSuffix);
	}

	get(id: any): Observable<any> {
		return this.api.get(this.endpoint + `/${id}`);
	}

	findAll(): Observable<QueryResultsModel> {
		return this.getAll<any>().pipe(
			mergeMap(res => of(new QueryResultsModel(res.data, res.exception)))
		);
	}

	findAllWithEndPointSuffix(enpointSuffix: string = 'all'): Observable<QueryResultsModel> {
		return this.getAllWithEndPointSuffix<any>(enpointSuffix).pipe(
			mergeMap(res => {
				return of(new QueryResultsModel(res.data, res.exception));
			})
		);
	}

	findFiltered(queryParams: QueryParamsModel, enpointSuffix: string = 'filter'): Observable<FilteredQueryResultsModel> {
		var params = this.httpUtils.setParameters(queryParams);
		return this.api.get<any>(this.endpoint + '/' + enpointSuffix, params).pipe(
			mergeMap(res => {
				return of(new FilteredQueryResultsModel(res.data, queryParams.useSubData, res.exception));
			})
		);
	}

	getOData<T>(queryParams: ODataParamsModel): Observable<T> {
		var params = this.httpUtils.setOdataParameters(queryParams);
		return this.api.get<T>(this.endpoint, params, null, 'response');
	}

	findOData(queryParams: ODataParamsModel): Observable<ODataResultsModel> {
		return this.getOData<any>(queryParams).pipe(
			mergeMap(res => {
				return of(new ODataResultsModel(res));
			})
		);
	}

	getODataWithEndPointSuffix<T>(queryParams: ODataParamsModel, enpointSuffix: string = 'all'): Observable<T> {
		var params = this.httpUtils.setOdataParameters(queryParams);
		return this.api.get<T>(this.endpoint + '/' + enpointSuffix, params, null, 'response');
	}

	findODataWithEndPointSuffix(queryParams: ODataParamsModel, enpointSuffix: string = 'sll'): Observable<ODataResultsModel> {
		return this.getODataWithEndPointSuffix<any>(queryParams, enpointSuffix).pipe(
			mergeMap(res => {
				return of(new ODataResultsModel(res));
			})
		);
	}

	// UPDATE => PUT: update the product on the server
	update<T>(entity: T, extraHeaders?: any[]): Observable<T> {
		return this.api.put<T>(this.endpoint, entity, extraHeaders);
	}

	// UPDATE => PUT: update the product on the server
	updateWithEndPointSuffix<T>(entity: T, enpointSuffix: string = 'update', extraHeaders?: any[]): Observable<T> {
		return this.api.put<T>(this.endpoint + '/' + enpointSuffix, entity, extraHeaders);
	}

	// DELETE => delete the product from the server
	delete<T>(id: any, extraHeaders?: any[]): Observable<T> {
		const url = `${this.endpoint}/${id}`;
		return this.api.delete<T>(url, extraHeaders);
	}

	// Method imitates server calls which deletes items from DB (should rewrite this to real server call)
	// START
	deleteSelected(ids: any[] = []) {
		// Comment this when you start work with real server
		// This code imitates server calls
		// START
		const tasks$ = [];
		const length = ids.length;
		for (let i = 0; i < length; i++) {
			tasks$.push(this.delete(ids[i]));
		}
		return forkJoin(tasks$);
		// END

		// Uncomment this when you start work with real server
		// Note: Add headers if needed
		// START
		// const url = this.API_URL + '/delete';
		// return this.http.get<QueryResultsModel>(url, { params: ids });
		// END
	}
}

