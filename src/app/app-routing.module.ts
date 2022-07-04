// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocationStrategy, PathLocationStrategy, HashLocationStrategy } from '@angular/common';

const routes: Routes = [
	{ path: 'auth', loadChildren: 'app/views/pages/auth/auth.module#AuthModule' },
	{ path: '', loadChildren: 'app/pages/pages.module#PagesModule' },

	// enable this router to set which default theme to load,
	// leave the path value empty to enter into nested router in ThemeModule
	//{path: 'dashboard', loadChildren: 'app/views/themes/default/theme.module#ThemeModule'},
	/** START: remove this themes list on production */
	// list of routers specified by demos, for demo purpose only!
	//{path: '', loadChildren: 'app/views/themes/default/theme.module#ThemeModule'},
	/** END: themes list end */
	{ path: '**', redirectTo: 'default/error/403', pathMatch: 'full' },
	// {path: '**', redirectTo: 'error/403', pathMatch: 'full'},
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {
		onSameUrlNavigation: 'reload'
	})],
	exports: [RouterModule],
	providers: [
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	]
})
export class AppRoutingModule {
}
