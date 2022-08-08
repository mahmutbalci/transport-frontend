import { NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BaseComponent } from 'app/views/themes/default/base/base.component';
import { AuthGuard } from '@core/auth';
import { ErrorPageComponent } from 'app/views/themes/default/content/error-page/error-page.component';

// export function redirectToLogin(activateRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot) {
// 	if (routerStateSnapshot['_routerState'].url.length > 1)
// 		return {
// 			navigationCommands: ['/auth/login'],
// 			navigationExtras: {
// 				queryParams: { 'url': routerStateSnapshot['_routerState'].url }
// 			}
// 		};
// 	else
// 		return '/auth/login';
// }

const routes: Routes = [
	{
		path: '',
		component: BaseComponent,
		canActivate: [AuthGuard],

		children: [
			{
				path: 'dashboard',
				loadChildren: 'app/views/pages/dashboard/dashboard.module#DashboardModule'
			},
			{
				path: 'common/member',
				loadChildren: './common/member/member.module#MemberModule'
			},
			{
				path: 'common/txn',
				loadChildren: './common/txn/txn.module#TxnModule'
			},
			{
				path: 'common/authority',
				loadChildren: './common/authority/authority.module#AuthorityModule'
			},
			{
				path: 'common/workflow',
				loadChildren: './common/workflow/workflow.module#WorkflowModule'
			},
			{
				path: 'common/log',
				loadChildren: './common/log/log.module#LogModule'
			},
			{
				path: 'common/msn',
				loadChildren: './common/msn/msn.module#BtcModule'
			},
			{
				path: 'common/dynamicQueryBuilder',
				loadChildren: './common/dynamicQueryBuilder/dynamicQueryBuilder.module#DynamicQueryBuilderModule'
			},
			{
				path: 'common/jobChains',
				loadChildren: './common/jobChains/jobChains.module#JobChainsModule'
			},
			{
				path: 'transport/campaign',
				loadChildren: './transport/campaign/campaign.module#CampaignModule'
			},
			{
				path: 'transport/txn',
				loadChildren: './transport/txn/transportTxn.module#TransportTxnModule'
			},
			{
				path: 'error/403',
				component: ErrorPageComponent,
				data: {
					'type': 'error-v6',
					'code': 403,
					'title': '403... Access forbidden',
					'desc': 'Looks like you don\'t have permission to access for requested page.<br> Please, contact administrator'
				}
			},
			{ path: 'error/:type', component: ErrorPageComponent },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{ path: '**', redirectTo: 'dashboard', pathMatch: 'full' }

		]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PagesRoutingModule { }
