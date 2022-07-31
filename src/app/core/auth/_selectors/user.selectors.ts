// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { HttpExtenstionsModel } from '../../_base/crud';
// State
import { UsersState } from '../_reducers/user.reducers';
import { each } from 'lodash';
import { AuthTokenModel } from '../_models/authToken.model';
import { QueryResultsModel } from '@core/_base/crud/models/query-results.model';


export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectUserById = (userId: number) => createSelector(
    selectUsersState,
    usersState => usersState.entities[userId]
);

export const selectUsersPageLoading = createSelector(
    selectUsersState,
    usersState => {
        return usersState.listLoading;
    }
);

export const selectUsersActionLoading = createSelector(
    selectUsersState,
    usersState => usersState.actionsloading
);

export const selectLastCreatedUserId = createSelector(
    selectUsersState,
    usersState => usersState.lastCreatedUserId
);

export const selectUsersPageLastQuery = createSelector(
    selectUsersState,
    usersState => usersState.lastQuery
);

export const selectUsersInStore = createSelector(
    selectUsersState,
    usersState => {
        const items: AuthTokenModel[] = [];
        each(usersState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: AuthTokenModel[] = httpExtension.sortArray(items, usersState.lastQuery.sortField, usersState.lastQuery.sortOrder);
        return new QueryResultsModel(result, usersState.totalCount);
    }
);

export const selectUsersShowInitWaitingMessage = createSelector(
    selectUsersState,
    usersState => usersState.showInitWaitingMessage
);

export const selectHasUsersInStore = createSelector(
    selectUsersState,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
