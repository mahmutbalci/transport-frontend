// Actions
import { AuthActions, AuthActionTypes } from '../_actions/auth.actions';
// Models
import { AuthTokenModel } from '../_models/authToken.model';

export interface AuthState {
	loggedIn: boolean;
	authToken: string;
	authTokenModel: AuthTokenModel;
	isUserLoaded: boolean;
}

export const initialAuthState: AuthState = {
	loggedIn: false,
	authToken: undefined,
	authTokenModel: undefined,
	isUserLoaded: false
};

export function authReducer(state = initialAuthState, action: AuthActions): AuthState {
	switch (action.type) {
		case AuthActionTypes.Login: {
			const _token: string = action.payload.authToken;
			return {
				loggedIn: true,
				authToken: _token,
				authTokenModel: undefined,
				isUserLoaded: false
			};
		}

		case AuthActionTypes.Register: {
			const _token: string = action.payload.authToken;
			return {
				loggedIn: true,
				authToken: _token,
				authTokenModel: undefined,
				isUserLoaded: false
			};
		}

		case AuthActionTypes.Logout:
			return initialAuthState;

		case AuthActionTypes.UserLoaded: {
			const authTokenModel: AuthTokenModel = action.payload.authTokenModel;
			return {
				...state,
				authTokenModel: authTokenModel,
				isUserLoaded: true
			};
		}

		default:
			return state;
	}
}
