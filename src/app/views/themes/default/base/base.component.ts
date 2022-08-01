import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChildren, ViewContainerRef, NgModuleFactoryLoader, Injector, Input, HostListener } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import * as objectPath from 'object-path';
import { LayoutConfigService, PageConfigService, MenuAsideService } from '@core/_base/layout';
import { HtmlClassService } from '../html-class.service';
import { LayoutConfig } from '@core/_config/default/layout.config';
import { PageConfig } from '@core/_config/default/page.config';
import { NgxPermissionsService } from 'ngx-permissions';
import { Permission, currentUserPermissions } from '@core/auth';
import { Store, select } from '@ngrx/store';
import { AppState } from '@core/reducers';
import { Router, NavigationEnd, ActivatedRoute, NavigationStart, NavigationError, NavigationCancel } from '@angular/router';
import * as _ from 'lodash';
import { Location } from '@angular/common';
import { MatDialogRef, MatDialog } from '@angular/material';
import { MLockScreenComponent } from '@components/m-lock-screen/m-lock-screen.component';
import { UserIdleService } from 'angular-user-idle';
import { Key } from '@core/_config/keys';

export class DynamicTabComponent {
	@Input() title;
	@Input() menuId;
	@Input() componentUrl;
	@Input() component;
	@Input() modulPath;
	@Input() componentInstance;
}

@Component({
	selector: 'kt-base',
	templateUrl: './base.component.html',
	styleUrls: ['./base.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class BaseComponent implements OnInit, OnDestroy {
	selfLayout: string;
	asideDisplay: boolean;
	asideSecondary: boolean;
	subheaderDisplay: boolean;
	currentRouteUrl: string = '';
	selectedTab: number = 0;
	isLoadComponent: boolean = false;
	@ViewChildren('dynamicComponent', { read: ViewContainerRef }) dynamicComponent: ViewContainerRef;
	dynamicTabs: DynamicTabComponent[] = [];
	userMenus: any[] = [];
	timeout: number = 1800;
	timeLeft: number = 0;
	dialogRef: MatDialogRef<MLockScreenComponent>;

	// Private properties
	private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
	private currentUserPermissions$: Observable<Permission[]>;

	isLoadingIndicator: boolean = false;

	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayoutConfigService
	 * @param menuConfigService: MenuConfifService
	 * @param pageConfigService: PageConfigService
	 * @param htmlClassService: HtmlClassService
	 */
	constructor(
		private layoutConfigService: LayoutConfigService,
		private pageConfigService: PageConfigService,
		private htmlClassService: HtmlClassService,
		private store: Store<AppState>,
		private permissionsService: NgxPermissionsService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private menuAsideService: MenuAsideService,
		private location: Location,
		private moduleLoader: NgModuleFactoryLoader,
		private dialog: MatDialog,
		private userIdle: UserIdleService,
		private injector: Injector) {

		this.userIdle.setConfigValues({ idle: 300, timeout: 600, ping: 120 });

		this.userIdle.startWatching();

		// Start watching when user idle is starting.
		this.userIdle.onTimerStart().subscribe(count => {
		});

		// Start watch when time is up.
		this.userIdle.onTimeout().subscribe(() => {
			if (!this.dialog.openDialogs.find(f => f.id === 'mLockScreenComponent-dialog')) {
				this.dialogRef = this.dialog.open(MLockScreenComponent, {
					width: '40%',
					id: 'mLockScreenComponent-dialog'
				});
				this.dialogRef.afterClosed().subscribe(() => {
					this.userIdle.resetTimer();
				});
			}
		});

		// this.startTimer();
		this.loadRolesWithPermissions();

		// register configs by demos
		this.layoutConfigService.loadConfigs(new LayoutConfig().configs);
		// this.menuConfigService.setDynamicMenu(new MenuConfig().configs);
		this.pageConfigService.loadConfigs(new PageConfig().configs);

		// setup element classes
		this.htmlClassService.setConfig(this.layoutConfigService.getConfig());

		const layoutSubdscription = this.layoutConfigService.onConfigUpdated$.subscribe(layoutConfig => {
			// reset body class based on global and page level layout config, refer to html-class.service.ts
			document.body.className = '';
			this.htmlClassService.setConfig(layoutConfig);
		});
		this.unsubscribe.push(layoutSubdscription);

		this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				this.isLoadingIndicator = true;
			}

			if (event instanceof NavigationEnd || event instanceof NavigationError || event instanceof NavigationCancel) {
				this.openTab(event.url);

				setTimeout(() => {
					this.isLoadingIndicator = false;
				}, 100);
			}
		});
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		const config = this.layoutConfigService.getConfig();
		this.selfLayout = objectPath.get(config, 'self.layout');
		this.asideDisplay = objectPath.get(config, 'aside.self.display');
		this.subheaderDisplay = objectPath.get(config, 'subheader.display');

		// let the layout type change
		const layoutConfigSubscription = this.layoutConfigService.onConfigUpdated$.subscribe(cfg => {
			setTimeout(() => {
				this.selfLayout = objectPath.get(cfg, 'self.layout');
			});
		});
		this.unsubscribe.push(layoutConfigSubscription);
	}

	@HostListener('window:mousemove', ['$event.target'])
	mouseMoveEvent(targetElement: string) {
		this.userIdle.resetTimer();
	}

	@HostListener('window:keyup', ['$event'])
	handleKeyUpEvent(event: KeyboardEvent): void {
		if (event.keyCode === Key.Escape) {
			if (this.dialog.openDialogs.length > 0 && this.dialog.openDialogs[this.dialog.openDialogs.length - 1].id !== 'mExcelLoadScreenComponent-dialog') {
				this.dialog.openDialogs[this.dialog.openDialogs.length - 1].close();
			}
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe.forEach(sb => sb.unsubscribe());
	}

	loadRolesWithPermissions() {
		this.currentUserPermissions$ = this.store.pipe(select(currentUserPermissions));
		const subscr = this.currentUserPermissions$.subscribe(res => {
			if (!res || res.length === 0) {
				return;
			}

			this.permissionsService.flushPermissions();
			res.forEach((pm: Permission) => this.permissionsService.addPermission(pm.name));
		});
		this.unsubscribe.push(subscr);
	}

	openTab(componentUrl: string): Observable<any> {
		let responseRouter = true;
		const baseUrl = this.getBaseUrl(componentUrl);
		if (baseUrl.replace('/', '').length > 0) {
			const title = this.getTabTitle(baseUrl);

			if (!_.isUndefined(title[1]) && !_.isNull(title[1]) && title[1].length > 0) {
				const findIndex = this.dynamicTabs.findIndex(x => x.title === title[1] && x.menuId === title[0]);
				if (findIndex < 0) {
					let instance = new DynamicTabComponent();
					instance.title = title[1];
					instance.componentUrl = componentUrl;
					instance.menuId = title[0];
					this.dynamicTabs.push(instance);
					this.selectedTab = this.dynamicTabs.length - 1;
					this.isLoadComponent = true;
				} else {
					this.selectedTab = findIndex;
					if (this.dynamicTabs[this.selectedTab].componentUrl !== componentUrl) {
						this.isLoadComponent = true;
					}
					this.dynamicTabs[this.selectedTab].componentUrl = componentUrl;
					responseRouter = false;
				}
			} else {
				if (this.dynamicTabs.length === 0) {
					this.closeAllTab(true);
				} else {
					this.isLoadComponent = true;
					this.dynamicTabs[this.selectedTab].componentUrl = componentUrl;
					responseRouter = false;
				}
			}

			if (this.isLoadComponent) {
				this.getComponent(this.dynamicTabs[this.selectedTab]);
				this.selectedTabChanged(this.selectedTab);
			}
		} else {
			this.closeAllTab(false);
		}

		return of(responseRouter);
	}

	getComponent(tab: DynamicTabComponent) {
		this.activatedRoute['_futureSnapshot'].routeConfig.children.forEach(element => {
			if (element._loadedConfig && !_.isUndefined(element.path) && !_.isNull(element.path) && element.path.length > 0 && tab.componentUrl.startsWith('/' + element.path)) {
				let path = element.path;
				let modulPath = element.loadChildren;
				element._loadedConfig.routes.forEach(load => {
					if (('/' + path + '/' + load.path) === tab.componentUrl.split(/[?#]/)[0]) {
						tab.component = load.component;
						tab.modulPath = modulPath;
						return;
					}
				});
			}
		});
	}

	getBaseUrl(componentUrl: string) {
		let paths = componentUrl.substring(1).split('/');
		let baseUrl = '';

		let addParameter = false;
		if (paths.length > 3) {
			addParameter = true;
		}
		if (paths.length > 2) {
			for (let i = 0; i < 3; i++) {
				baseUrl = baseUrl + '/' + paths[i];
			}
		}

		baseUrl += (addParameter && componentUrl.includes('?')) ? ('?' + (componentUrl.split(/[?#]/)[1])) : '';

		return baseUrl;
	}

	closeTab(tab: DynamicTabComponent) {
		for (let i = 0; i < this.dynamicTabs.length; i++) {
			if (this.dynamicTabs[i] === tab) {
				if (this.dynamicComponent['_results'] && this.dynamicComponent['_results'].length >= i) {
					this.dynamicComponent['_results'][i].clear();
					this.dynamicComponent['_results'].splice(i, 1);
				}

				if (this.dynamicTabs.length >= i) {
					if (this.dynamicTabs[i].componentInstance) {
						this.dynamicTabs[i].componentInstance.destroy();
					}
					this.dynamicTabs.splice(i, 1);
				}

				if (this.dynamicTabs.length > 0) {
					if (this.selectedTab === i) {
						this.selectedTab = 0;
						this.selectedTabChanged(this.selectedTab);
					}
				} else {
					this.closeAllTab(true);
				}
				break;
			}
		}
	}

	selectedTabChanged(value) {
		setTimeout(() => {
			this.location.go(this.dynamicTabs[this.selectedTab].componentUrl);
			this.currentRouteUrl = this.dynamicTabs[this.selectedTab].componentUrl;
			this.menuAsideService.selectMenuItem();
			this.loadComponent();
		}, 50);
	}

	closeAllTab(navigateByUrl: boolean) {
		this.dynamicTabs = [];
		this.selectedTab = 0;
		this.currentRouteUrl = '';
		if (navigateByUrl) {
			this.router.navigateByUrl('/');
		}
	}

	getTabTitle(url: string): any[] {
		let resp = [];
		let menuId = '';
		let menuTitle = '';
		let findIndex;

		if ((!this.userMenus || this.userMenus.length === 0) && sessionStorage.getItem('userMenus')) {
			this.userMenus = JSON.parse(sessionStorage.getItem('userMenus')).filter(x => !_.isUndefined(x.routeUrl) && !_.isNull(x.routeUrl));
		}

		try {
			findIndex = this.userMenus.findIndex(x => url.toLowerCase() === x.routeUrl.toLowerCase());
			if (!_.isUndefined(findIndex) && !_.isNull(findIndex) && findIndex >= 0) {
				menuId = this.userMenus[findIndex].menuId;
				menuTitle = this.userMenus[findIndex].description;
			} else {
				findIndex = this.userMenus.findIndex(x => url.toLowerCase().startsWith(x.routeUrl.toLowerCase()));
				if (!_.isUndefined(findIndex) && !_.isNull(findIndex) && findIndex >= 0) {
					menuId = this.userMenus[findIndex].menuId;
					menuTitle = this.userMenus[findIndex].description;
				}
			}
		} catch (e) {
		}

		resp.push(menuId);
		resp.push(menuTitle);
		return resp;
	}

	async loadComponent() {
		if (this.isLoadComponent && this.dynamicTabs[this.selectedTab].modulPath) {
			try {
				this.isLoadComponent = false;
				const moduleFactory = await this.moduleLoader.load(this.dynamicTabs[this.selectedTab].modulPath);
				const moduleReference = moduleFactory.create(this.injector);
				const componentResolver = moduleReference.componentFactoryResolver;

				const componentFactory = componentResolver.resolveComponentFactory(this.dynamicTabs[this.selectedTab].component);
				componentFactory.create(this.injector);

				if (componentFactory) {
					if (this.dynamicComponent['_results'][this.selectedTab]) {
						this.dynamicComponent['_results'][this.selectedTab].clear();
					}

					this.dynamicTabs[this.selectedTab].componentInstance = await this.dynamicComponent['_results'][this.selectedTab].createComponent(componentFactory);
				}
			} catch (e) {
				console.log(e);
			}
		}
	}
}
