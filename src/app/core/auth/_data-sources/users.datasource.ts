// RxJS
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource } from '@core/_base/crud';
// State
import { AppState } from '@core/reducers';
import { QueryResultsModel } from '@core/_base/crud/models/query-results.model';
import { selectUsersInStore, selectUsersPageLoading } from '../_selectors/user.selectors';


export class UsersDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectUsersPageLoading)
		);

		// this.isPreloadTextViewed$ = this.store.pipe(
		// 	select(selectUsersShowInitWaitingMessage)
		// );

		this.store.pipe(
			select(selectUsersInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
