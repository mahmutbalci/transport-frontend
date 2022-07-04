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
				path: 'acquiring/merchant',
				loadChildren: './acquiring/merchant/merchant.module#MerchantModule'
			},
			{
				path: 'acquiring/pos',
				loadChildren: './acquiring/pos/pos.module#PosModule'
			},
			{
				path: 'acquiring/txn',
				loadChildren: './acquiring/txn/acquiring.txn.module#AcquiringTxnModule'
			},
			{
				path: 'clearing',
				loadChildren: './clearing/clearing-main.module#ClearingMainModule'
			},
			{
				path: 'clearing/bkm',
				loadChildren: './clearing/bkm/bkm.module#BkmModule'
			},
			{
				path: 'clearing/clearing',
				loadChildren: './clearing/clearing/clearing.module#ClearingModule'
			},
			{
				path: 'clearing/mastercard',
				loadChildren: './clearing/mastercard/mastercard.module#MastercardModule'
			},
			{
				path: 'clearing/transaction',
				loadChildren: './clearing/transaction/transaction.module#TransactionModule'
			},
			{
				path: 'clearing/visa',
				loadChildren: './clearing/visa/visa.module#VisaModule'
			},
			{
				path: 'cleveract/dictionary',
				loadChildren: './cleveract/dictionary/dictionary.module#DictionaryModule'
			},
			{
				path: 'cleveract/scenario',
				loadChildren: './cleveract/scenario/scenario.module#ScenarioModule'
			},
			{
				path: 'cleveract/monitoring',
				loadChildren: './cleveract/monitoring/monitoring.module#MonitoringModule'
			},
			{
				path: 'cleveract/reports',
				loadChildren: './cleveract/reports/reports.module#ReportsModule'
			},
			{
				path: 'common/member',
				loadChildren: './common/member/member.module#MemberModule'
			},
			{
				path: 'common/monitoring',
				loadChildren: './common/monitoring/monitoring.module#MonitoringModule'
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
				path: 'common/btc',
				loadChildren: './common/btc/btc.module#BtcModule'
			},
			{
				path: 'common/cfgbin',
				loadChildren: './common/cfgbin/cfgbin.module#CfgbinModule'
			},
			{
				path: 'common/oltp',
				loadChildren: './common/oltp/oltp.module#OltpModule'
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
				path: 'issuing',
				loadChildren: './issuing/issuing-main.module#IssuingMainModule'
			},
			{
				path: 'issuing/card',
				loadChildren: './issuing/card/card.module#CardModule'
			},
			{
				path: 'issuing/campaign',
				loadChildren: './issuing/campaign/campaign.module#IssuingCampaignModule'
			},
			{
				path: 'issuing/courier',
				loadChildren: './issuing/courier/courier.module#CourierModule'
			},
			{
				path: 'issuing/customer',
				loadChildren: './issuing/customer/customer.module#CustomerModule'
			},
			{
				path: 'issuing/statement',
				loadChildren: './issuing/statement/statement.module#StatementModule'
			},
			{
				path: 'issuing/accounting',
				loadChildren: './issuing/accounting/accounting.module#AccountingModule'
			},
			{
				path: 'issuing/emboss',
				loadChildren: './issuing/emboss/emboss.module#EmbossModule'
			},
			{
				path: 'issuing/txn',
				loadChildren: './issuing/txn/txn.module#IssuingTxnModule'
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
