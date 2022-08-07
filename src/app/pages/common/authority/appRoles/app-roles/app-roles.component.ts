import { MatDialog, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppRolesService } from '@services/common/authority/appRoles.service';
import { AppMenusService } from '@services/common/authority/appMenus.service';
import { AppApisService } from '@services/common/authority/appApis.service';
import { AppRolesModel } from '@models/common/authority/appRoles.model';
import { AppRoleApiRelModel } from '@models/common/authority/appRoleApiRel.model';
import { AppRoleMenuRelModel } from '@models/common/authority/appRoleMenuRel.model';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import f from '@assets/lib/odata/ODataFilterBuilder.js';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { AppApisModel } from '@common/authority/appApis.model';
import { AppMenusModel } from '@common/authority/appMenus.model';

export class MenuItemNode {
	parentId: string;
	menuId: string;
	description: string;
	children: MenuItemNode[];
}

export class MenuItemFlatNode {
	menuId: string;
	description: string;
	level: number;
	expandable: boolean;
}

export class ApiItemNode {
	applicationId: number;
	apiId: number;
	description: string;
	children: ApiItemNode[];
}

export class ApiItemFlatNode {
	apiId: number;
	description: string;
	level: number;
	expandable: boolean;
}

@Injectable()
export class ChecklistMenuDatabase {
	menuTree: any = [];
	dataChange = new BehaviorSubject<MenuItemNode[]>([]);
	get data(): MenuItemNode[] { return this.dataChange.value; }
	resultCheckList: any[] = []

	constructor(
		private appMenusService: AppMenusService,
	) { }

	setDataChange(): Observable<any> {
		this.appMenusService.getAll<any>().subscribe(res => {
			res.data = _.orderBy(res.data, ['screenOrder'], ['asc']);
			this.resultCheckList = res.data;
			if (res.data.length > 0) {
				this.dataChange.next(this.buildMenuTree(<AppMenusModel[]>res.data));
				return of(true);
			}
		});
		return of(false);
	}

	buildMenuTree(menuTree: AppMenusModel[], parentMenuId: any = null): MenuItemNode[] {
		let masterMenu: any[] = [];
		menuTree.forEach(node => {
			if (node.parentMenuId == parentMenuId) {
				let tempNode = new MenuItemNode();
				tempNode.menuId = node.menuId;
				tempNode.description = node.description;
				tempNode.parentId = node.parentMenuId;

				let childMenu = this.buildMenuTree(menuTree, node.menuId);
				if (childMenu.length > 0) {
					tempNode.children = childMenu;
				}

				masterMenu.push(tempNode);
			}
		});

		return masterMenu;
	}

	getParentMenus(userMenus: any[], parentMenuId: string) {
		var parentMenuList: any[] = [];
		let parentMenu = userMenus.find(x => x.menuId == parentMenuId);
		if (!parentMenu) {
			return parentMenuList;
		}

		if (parentMenu.parentMenuId) {
			parentMenuList = parentMenuList.concat(this.getParentMenus(userMenus, parentMenu.parentMenuId));
		}

		parentMenuList.push(parentMenu);
		return parentMenuList;
	}
}

@Injectable()
export class ChecklistApiDatabase {
	apiTree: any = [];
	appApplications: any[] = [];
	dataChange = new BehaviorSubject<ApiItemNode[]>([]);
	get data(): ApiItemNode[] { return this.dataChange.value; }

	constructor(
		private appApisService: AppApisService) {
	}

	setDataChange(): Observable<any> {
		this.appApisService.api.getLookups(['AppApplications']).then(res => {
			this.appApplications = res.find(x => x.name === 'AppApplications').data;

			this.appApisService.getAll<any>().subscribe(res => {
				if (res.data.length > 0) {
					this.dataChange.next(this.buildApiTree(<AppApisModel[]>res.data));
					return of(true);
				}
			});
		});

		return of(false);
	}

	buildApiTree(apiTree: AppApisModel[]): ApiItemNode[] {
		let masterApi: any[] = [];

		let dst = apiTree.map(function (obj) { return obj.applicationId });
		dst.forEach(appId => {
			let appDef = this.appApplications.find(app => app.code === appId);

			let tempNode = new ApiItemNode();
			tempNode.applicationId = appDef.applicationId;
			tempNode.description = appDef.description;
			tempNode.children = this.getApiObject(apiTree, appId);

			masterApi.push(tempNode);
		});

		return masterApi;
	}

	getApiObject(apiList: any[], applicationId: number): ApiItemNode[] {
		let apiTree: any[] = [];
		apiList.filter(x => x.applicationId === applicationId).forEach(apiItem => {
			let tempNode = new ApiItemNode();
			tempNode.applicationId = applicationId;
			tempNode.apiId = apiItem.apiId;
			tempNode.description = apiItem.description + ' - ' + apiItem.apiRoute;
			apiTree.push(tempNode);
		});

		return apiTree;
	}
}

@Component({
	selector: 'kt-app-roles',
	templateUrl: './app-roles.component.html',
	styleUrls: ['./app-roles.component.scss'],
	providers: [ChecklistMenuDatabase, AppMenusService, ChecklistApiDatabase, AppApisService]
})
export class AppRolesComponent implements OnInit {
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	succesMessage = this.translate.instant('General.Success');

	entityForm: FormGroup = new FormGroup({});
	entityModel: AppRolesModel = new AppRolesModel();

	menuFlatNodeMap = new Map<MenuItemFlatNode, MenuItemNode>();
	menuNestedNodeMap = new Map<MenuItemNode, MenuItemFlatNode>();

	menuTreeControl: FlatTreeControl<MenuItemFlatNode>;
	menuTreeFlattener: MatTreeFlattener<MenuItemNode, MenuItemFlatNode>;
	menuDataSource: MatTreeFlatDataSource<MenuItemNode, MenuItemFlatNode>;

	authorizedLevelMenuList = new SelectionModel<MenuItemFlatNode>(true /* multiple */);
	readOnlyLevelMenuList = new SelectionModel<MenuItemFlatNode>(true /* multiple */);

	apiFlatNodeMap = new Map<ApiItemFlatNode, ApiItemNode>();
	apiNestedNodeMap = new Map<ApiItemNode, ApiItemFlatNode>();

	apiTreeControl: FlatTreeControl<ApiItemFlatNode>;
	apiTreeFlattener: MatTreeFlattener<ApiItemNode, ApiItemFlatNode>;
	apiDataSource: MatTreeFlatDataSource<ApiItemNode, ApiItemFlatNode>;

	authorizedLevelApiList = new SelectionModel<ApiItemFlatNode>(true /* multiple */);
	readOnlyLevelApiList = new SelectionModel<ApiItemFlatNode>(true /* multiple */);

	@ViewChild('treeControlMenu') treeControlMenu;
	@ViewChild('treeControlApi') treeControlApi;

	isReadonly: boolean = false;
	isProcessing: boolean = false;
	menuUrl: string = '/common/authority/appRoles';
	hasFormErrors: boolean = false;

	showApiRoles: boolean = true; //api definition disable
	selectedTab: number = 0;

	appRoleTypes: any[] = [];

	guidMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 16,
	});

	constructor(
		private entityService: AppRolesService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private databaseMenu: ChecklistMenuDatabase,
		private databaseApi: ChecklistApiDatabase) {

		this.menuTreeFlattener = new MatTreeFlattener(this.menuTreeTransformer, this.getMenuLevel, this.isMenuExpandable, this.getMenuChildren);
		this.menuTreeControl = new FlatTreeControl<MenuItemFlatNode>(this.getMenuLevel, this.isMenuExpandable);
		this.menuDataSource = new MatTreeFlatDataSource(this.menuTreeControl, this.menuTreeFlattener);

		this.apiTreeFlattener = new MatTreeFlattener(this.apiTreeTransformer, this.getApiLevel, this.isApiExpandable, this.getApiChildren);
		this.apiTreeControl = new FlatTreeControl<ApiItemFlatNode>(this.getApiLevel, this.isApiExpandable);
		this.apiDataSource = new MatTreeFlatDataSource(this.apiTreeControl, this.apiTreeFlattener);
	}

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.entityService.api.getLookups(['AppRoleTypes']).then(res => {
			this.appRoleTypes = res.find(x => x.name === 'AppRoleTypes').data;

			const dynSub = this.activatedRoute.queryParams.subscribe(params => {
				const prmId = params.prmId;
				this.isReadonly = (params.type === 'show');

				if (prmId && prmId > 0) {
					this.entityService.get(prmId).subscribe(res => {
						this.entityModel = res.data;
						this.entityModel._isEditMode = !this.isReadonly;
						this.entityModel._isNew = false;

						this.databaseMenu.setDataChange().subscribe(men => {
							this.databaseApi.setDataChange().subscribe(ap => {
								this.initForm();
								this.entityForm.controls['roleType'].disable();
							});
						});
					}, (error) => {
						this.layoutUtilsService.showError(error);
					});

				} else {
					this.entityModel = new AppRolesModel();
					this.entityModel._isEditMode = false;
					this.entityModel._isNew = true;

					this.databaseMenu.setDataChange().subscribe(men => {
						this.databaseApi.setDataChange().subscribe(ap => {
							this.initForm();
						});
					});
				}
			});

			dynSub.unsubscribe();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	// ngAfterViewInit() {
	// 	this.matTreeControl.treeControl.collapseAll();
	// }

	initForm(): any {
		this.loadingSubject.next(false);
		const controls = this.entityForm.controls;
		Object.keys(this.entityModel).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.entityModel[name]);
			}
		});

		if (!this.showApiRoles) {
			if (this.entityModel._isNew) {
				this.entityForm.get('roleType').setValue('M');
				this.entityModel.roleType = 'M';
			}

			this.entityForm.get('roleType').disable();
		}

		this.onChangeRoleType(this.entityModel.roleType);

		this.loadTrees();
	}

	getMenuLevel = (node: MenuItemFlatNode) => node.level;
	getApiLevel = (node: ApiItemFlatNode) => node.level;
	isMenuExpandable = (node: MenuItemFlatNode) => node.expandable;
	isApiExpandable = (node: ApiItemFlatNode) => node.expandable;
	getMenuChildren = (node: MenuItemNode): MenuItemNode[] => node.children;
	getApiChildren = (node: ApiItemNode): ApiItemNode[] => node.children;
	hasMenuChild = (_: number, _nodeData: MenuItemFlatNode) => _nodeData.expandable;
	hasApiChild = (_: number, _nodeData: ApiItemFlatNode) => _nodeData.expandable;
	hasMenuNoContent = (_: number, _nodeData: MenuItemFlatNode) => _nodeData.description === '';
	hasApiNoContent = (_: number, _nodeData: ApiItemFlatNode) => _nodeData.description === '';

	loadTrees() {
		//Menu Tree
		this.databaseMenu.dataChange.subscribe(data => {
			this.menuDataSource.data = data;

			if (this.entityForm.controls['roleType'].value === 'M') {
				this.entityModel.roleMenuRels.forEach(element => {
					let treeMenuNode = this.menuTreeControl.dataNodes.find(n => n.menuId === element.menuId);
					if (treeMenuNode != null) {
						this.menuLeafItemSet(treeMenuNode, element.roleLevel);
					}
				});
			}
		});

		//ApiTree
		this.databaseApi.dataChange.subscribe(data => {
			this.apiDataSource.data = data;

			if (this.entityForm.controls['roleType'].value === 'A') {
				this.entityModel.roleApiRels.forEach(element => {
					let treeApiNode = this.apiTreeControl.dataNodes.find(n => n.apiId === element.apiId);
					if (treeApiNode != null) {
						this.apiLeafItemSet(treeApiNode, element.roleLevel);
					}
				});
			}
		});
	}

	menuTreeTransformer = (node: MenuItemNode, level: number) => {
		const existingNode = this.menuNestedNodeMap.get(node);
		const flatNode = existingNode && existingNode.menuId === node.menuId
			? existingNode
			: new MenuItemFlatNode();

		flatNode.menuId = node.menuId;
		flatNode.description = node.description;
		flatNode.level = level;
		flatNode.expandable = !!node.children;
		this.menuFlatNodeMap.set(flatNode, node);
		this.menuNestedNodeMap.set(node, flatNode);
		return flatNode;
	}

	apiTreeTransformer = (node: ApiItemNode, level: number) => {
		const existingNode = this.apiNestedNodeMap.get(node);
		const flatNode = existingNode && existingNode.apiId === node.apiId
			? existingNode
			: new ApiItemFlatNode();

		flatNode.apiId = node.apiId;
		flatNode.description = node.description;
		flatNode.level = level;
		flatNode.expandable = !!node.children;
		this.apiFlatNodeMap.set(flatNode, node);
		this.apiNestedNodeMap.set(node, flatNode);
		return flatNode;
	}

	goBack() {
		this.router.navigateByUrl(this.menuUrl);
	}

	getComponentTitle() {
		if (this.isReadonly) {
			return this.translate.instant('General.View');
		} else if (this.entityModel._isNew) {
			return this.translate.instant('General.Add');
		} else if (this.entityModel._isEditMode) {
			return this.translate.instant('General.Edit');
		}

		return '';
	}

	onChangeRoleType(newroleType) {
		switch (newroleType) {
			case 'M':
				this.selectedTab = 0;
				break;
			case 'A':
				this.selectedTab = 1;
				break;
		}
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	save() {
		this.isProcessing = true;
		this.hasFormErrors = false;

		const controls = this.entityForm.controls;
		if (this.entityForm.invalid) {
			Object.keys(this.entityModel).forEach(name =>
				controls[name].markAsTouched()
			);

			this.isProcessing = false;
			this.hasFormErrors = true;

			return;
		}

		this.entityModel = <AppRolesModel>this.entityForm.value;
		if (this.entityModel._isNew) {
			if (!this.showApiRoles) {
				this.entityModel.roleType = this.entityForm.get('roleType').value;
			}

			const queryParams = new ODataParamsModel();
			const filter = f('and');

			filter.eq('roleType', this.entityModel.roleType);
			filter.eq('description', this.entityModel.description);
			queryParams.filter = filter.toString();
			queryParams.orderby = 'description asc';
			queryParams.skip = 0;
			queryParams.top = -1;
			this.entityService.findOData(queryParams).subscribe(res => {
				if (res.items.length > 0) {
					this.loading = false;
					this.isProcessing = false;
					this.layoutUtilsService.showError(this.translate.instant('General.Exception.RowExistsWithSameDetails'));
				} else {
					this.loading = true;
					this.create();
				}
			}, (error) => {
				this.loading = false;
				this.isProcessing = false;

				this.layoutUtilsService.showError(error);
			});
		} else {
			this.loading = true;
			this.update();
		}
	}

	update() {
		if (this.entityForm.controls['roleType'].value === 'M') { //Menu Role
			let selectMenuList = [];

			this.menuTreeControl.dataNodes.forEach(node => {
				let roleLevel = this.getMenuAuthLevel(node);

				if (roleLevel && roleLevel != null) {
					let existsMenu = _.find(this.entityModel.roleMenuRels, function (o) {
						return o.menuId === node.menuId;
					});

					if (existsMenu) {
						existsMenu.roleLevel = roleLevel;
						selectMenuList.push(existsMenu);
					} else {
						let userRoleMenu: AppRoleMenuRelModel = new AppRoleMenuRelModel();
						userRoleMenu.menuId = node.menuId;
						userRoleMenu.roleLevel = roleLevel;
						userRoleMenu.roleId = this.entityModel.roleId;
						selectMenuList.push(userRoleMenu);
					}
				}
			});

			this.entityModel.roleApiRels = [];	//apis must clear for Menu Role
			this.entityModel.roleMenuRels = [];
			this.entityModel.roleMenuRels = selectMenuList;
			this.entityModel.roleType = 'M';
		} else if (this.entityForm.controls['roleType'].value === 'A') { //API Role
			let selectApiList = [];

			this.apiTreeControl.dataNodes.forEach(node => {
				let roleLevel = this.getApiAuthLevel(node);

				if (roleLevel && roleLevel != null) {
					let existsApi = _.find(this.entityModel.roleApiRels, function (o) {
						return o.apiId == node.apiId;
					});

					if (existsApi) {
						existsApi.roleLevel = roleLevel;
						selectApiList.push(existsApi);
					} else {
						let userRoleApi: AppRoleApiRelModel = new AppRoleApiRelModel();
						userRoleApi.apiId = node.apiId;
						userRoleApi.roleLevel = roleLevel;
						userRoleApi.roleId = this.entityModel.roleId;
						selectApiList.push(userRoleApi);
					}
				}
			});

			this.entityModel.roleMenuRels = [];	//menus must clear for API Role
			this.entityModel.roleApiRels = [];
			this.entityModel.roleApiRels = selectApiList;
			this.entityModel.roleType = 'A';
		}

		this.entityService.update(this.entityModel).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Update, 10000, true, false)
				.afterClosed().subscribe(() => {
					this.goBack();
				});
		}, (error) => {
			this.loading = false;
			this.isProcessing = false;

			this.layoutUtilsService.showError(error);
		});
	}

	create() {
		this.entityModel.roleMenuRels = [];
		this.entityModel.roleApiRels = [];
		if (this.entityModel.roleType === 'M') { //Menu Role
			let selectMenuList = [];
			this.menuTreeControl.dataNodes.forEach(node => {
				let roleLevel = this.getMenuAuthLevel(node);

				if (roleLevel && roleLevel != null) {
					let userRoleMenu: AppRoleMenuRelModel = new AppRoleMenuRelModel();
					userRoleMenu.menuId = node.menuId;
					userRoleMenu.roleLevel = roleLevel;

					selectMenuList.push(userRoleMenu);
				}
			});

			this.entityModel.roleMenuRels = selectMenuList;
		} else if (this.entityModel.roleType === 'A') { //API Role
			let selectApiList = [];
			this.apiTreeControl.dataNodes.forEach(node => {
				let roleLevel = this.getApiAuthLevel(node);

				if (roleLevel && roleLevel != null) {
					let userRoleApi: AppRoleApiRelModel = new AppRoleApiRelModel();
					userRoleApi.apiId = node.apiId;
					userRoleApi.roleLevel = roleLevel;

					selectApiList.push(userRoleApi);
				}
			});

			this.entityModel.roleApiRels = selectApiList;
		}

		this.entityService.create(this.entityModel).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 5000, true, false)
				.afterClosed().subscribe(() => {
					this.goBack();
				});
		}, (error) => {
			this.loading = false;
			this.isProcessing = false;

			this.layoutUtilsService.showError(error);
		}, () => {
			this.isProcessing = false;
			this.loading = false;
		});
	}

	clear(): any {
		this.entityModel = new AppRolesModel();
		this.entityModel._isNew = true;
		this.initForm();
	}

	selectedTabChanged(value) {
		this.selectedTab = value.index;
	}

	//#region Menu operations
	menuItemSelectionToggle(node: MenuItemFlatNode, e): void {
		const descendants = this.menuTreeControl.getDescendants(node);
		if (descendants.length < 1) {
			return;
		}

		let authLevel = this.getMenuAuthLevel(node);

		descendants.forEach(child => {
			let subDescant = this.menuTreeControl.getDescendants(child);
			if (subDescant.length === 0) {
				if (authLevel == null || !authLevel) {
					this.authorizedLevelMenuList.deselect(child);
					this.readOnlyLevelMenuList.select(child);
				} else if (authLevel === 2) {
					this.authorizedLevelMenuList.deselect(child);
					this.readOnlyLevelMenuList.deselect(child);
				} else if (authLevel === 1) {
					this.authorizedLevelMenuList.select(child);
					this.readOnlyLevelMenuList.deselect(child);
				}
			}
		});
	}

	menuLeafItemSelectionToggle(node: MenuItemFlatNode, e): void {
		const descendants = this.menuTreeControl.getDescendants(node);
		if (descendants.length > 0) {
			this.menuItemSelectionToggle(node, e);
			return;
		}

		if (!this.authorizedLevelMenuList.isSelected(node) && !this.readOnlyLevelMenuList.isSelected(node)) {
			this.authorizedLevelMenuList.deselect(node);
			this.readOnlyLevelMenuList.select(node);
		} else if (this.authorizedLevelMenuList.isSelected(node) && !this.readOnlyLevelMenuList.isSelected(node)) {
			this.authorizedLevelMenuList.deselect(node);
			this.readOnlyLevelMenuList.deselect(node);
		} else if (!this.authorizedLevelMenuList.isSelected(node) && this.readOnlyLevelMenuList.isSelected(node)) {
			this.authorizedLevelMenuList.select(node);
			this.readOnlyLevelMenuList.deselect(node);
		}
	}

	getMenuAuthLevel(node: MenuItemFlatNode): number {
		const descendants = this.menuTreeControl.getDescendants(node);
		if (descendants.length < 1) {
			return this.getSubMenuAuthLevel(node);
		}

		let descAllAuthorized = false;
		let idx = 0;
		descendants.forEach(child => {
			let subDescant = this.menuTreeControl.getDescendants(child);
			if (subDescant.length === 0) {
				if (idx === 0) {
					descAllAuthorized = this.authorizedLevelMenuList.isSelected(child);
				} else {
					descAllAuthorized = descAllAuthorized && this.authorizedLevelMenuList.isSelected(child);
				}

				idx++;
			}
		});

		if (descAllAuthorized) {
			return 2;
		}

		const descSomeReadOnly = descendants.some(child => this.readOnlyLevelMenuList.isSelected(child));
		const descSomeAuthorized = descendants.some(child => this.authorizedLevelMenuList.isSelected(child));
		if (descSomeReadOnly || descSomeAuthorized) {
			return 1;
		}

		return null;
	}

	getSubMenuAuthLevel(node: MenuItemFlatNode): number {
		if (this.authorizedLevelMenuList.isSelected(node)) {
			return 2;
		}

		if (this.readOnlyLevelMenuList.isSelected(node)) {
			return 1;
		}

		return null;
	}

	menuLeafItemSet(node: MenuItemFlatNode, authenticationLevel: number): void {
		const descendants = this.menuTreeControl.getDescendants(node);
		if (descendants.length > 0) {
			return;
		}

		if (authenticationLevel === 1) {
			this.authorizedLevelMenuList.deselect(node);
			this.readOnlyLevelMenuList.select(node);
		} else if (authenticationLevel === 2) {
			this.authorizedLevelMenuList.select(node);
			this.readOnlyLevelMenuList.deselect(node);
		}
	}

	getMenuParentNode(node: MenuItemFlatNode): MenuItemFlatNode | null {
		const currentLevel = this.getMenuLevel(node);
		if (currentLevel < 1) {
			return null;
		}

		const startIndex = this.menuTreeControl.dataNodes.indexOf(node) - 1;
		for (let i = startIndex; i >= 0; i--) {
			const currentNode = this.menuTreeControl.dataNodes[i];

			if (this.getMenuLevel(currentNode) < currentLevel) {
				return currentNode;
			}
		}

		return null;
	}
	//#endregion Menu operations

	//#region Api operations
	apiItemSelectionToggle(node: ApiItemFlatNode, e): void {
		const descendants = this.apiTreeControl.getDescendants(node);
		if (descendants.length < 1) {
			return;
		}

		let authLevel = this.getApiAuthLevel(node);

		descendants.forEach(child => {
			let subDescant = this.apiTreeControl.getDescendants(child);
			if (subDescant.length === 0) {
				if (authLevel == null || !authLevel) {
					this.authorizedLevelApiList.deselect(child);
					this.readOnlyLevelApiList.select(child);
				} else if (authLevel === 2) {
					this.authorizedLevelApiList.deselect(child);
					this.readOnlyLevelApiList.deselect(child);
				} else if (authLevel === 1) {
					this.authorizedLevelApiList.select(child);
					this.readOnlyLevelApiList.deselect(child);
				}
			}
		});
	}

	apiLeafItemSelectionToggle(node: ApiItemFlatNode, e): void {
		const descendants = this.apiTreeControl.getDescendants(node);
		if (descendants.length > 0) {
			this.apiItemSelectionToggle(node, e);
			return;
		}

		if (!this.authorizedLevelApiList.isSelected(node) && !this.readOnlyLevelApiList.isSelected(node)) {
			this.authorizedLevelApiList.deselect(node);
			this.readOnlyLevelApiList.select(node);
		} else if (this.authorizedLevelApiList.isSelected(node) && !this.readOnlyLevelApiList.isSelected(node)) {
			this.authorizedLevelApiList.deselect(node);
			this.readOnlyLevelApiList.deselect(node);
		} else if (!this.authorizedLevelApiList.isSelected(node) && this.readOnlyLevelApiList.isSelected(node)) {
			this.authorizedLevelApiList.select(node);
			this.readOnlyLevelApiList.deselect(node);
		}
	}

	apiLeafItemSet(node: ApiItemFlatNode, authenticationLevel: number): void {
		const descendants = this.apiTreeControl.getDescendants(node);
		if (descendants.length > 0) {
			return;
		}

		if (authenticationLevel === 1) {
			this.authorizedLevelApiList.deselect(node);
			this.readOnlyLevelApiList.select(node);
		} else if (authenticationLevel === 2) {
			this.authorizedLevelApiList.select(node);
			this.readOnlyLevelApiList.deselect(node);
		}
	}

	getApiAuthLevel(node: ApiItemFlatNode): number {
		const descendants = this.apiTreeControl.getDescendants(node);
		if (descendants.length < 1) {
			return this.getSubApiAuthLevel(node);
		}

		let descAllAuthorized = false;
		let idx = 0;
		descendants.forEach(child => {
			let subDescant = this.apiTreeControl.getDescendants(child);
			if (subDescant.length === 0) {
				if (idx === 0) {
					descAllAuthorized = this.authorizedLevelApiList.isSelected(child);
				} else {
					descAllAuthorized = descAllAuthorized && this.authorizedLevelApiList.isSelected(child);
				}

				idx++;
			}
		});

		if (descAllAuthorized) {
			return 2;
		}

		const descSomeReadOnly = descendants.some(child => this.readOnlyLevelApiList.isSelected(child));
		const descSomeAuthorized = descendants.some(child => this.authorizedLevelApiList.isSelected(child));
		if (descSomeReadOnly || descSomeAuthorized) {
			return 1;
		}

		return null;
	}

	getSubApiAuthLevel(node: ApiItemFlatNode): number {
		if (this.authorizedLevelApiList.isSelected(node)) {
			return 2;
		}

		if (this.readOnlyLevelApiList.isSelected(node)) {
			return 1;
		}

		return null;
	}

	getApiParentNode(node: ApiItemFlatNode): ApiItemFlatNode | null {
		const currentLevel = this.getApiLevel(node);
		if (currentLevel < 1) {
			return null;
		}

		const startIndex = this.apiTreeControl.dataNodes.indexOf(node) - 1;
		for (let i = startIndex; i >= 0; i--) {
			const currentNode = this.apiTreeControl.dataNodes[i];

			if (this.getApiLevel(currentNode) < currentLevel) {
				return currentNode;
			}
		}

		return null;
	}
	//#endregion Api operations
}
