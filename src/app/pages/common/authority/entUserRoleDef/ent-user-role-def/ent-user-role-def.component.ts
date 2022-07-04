import { MatDialog, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { FrameworkApi } from '@services/framework.api';
import { EntUserRoleDefModel } from '@models/common/authority/entUserRoleDef.model';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { EntMenuTreeService } from '@services/common/authority/entMenuTree.service';
import { EntUserRoleDefService } from '@common/authority/entUserRoleDef.service';
import { EntUserRoleMenuModel } from '@common/authority/entUserRoleMenu.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EntUserRoleApiModel } from '@common/authority/entUserRoleApi.model';
import { EntApiDefService } from '@common/authority/entApiDef.service';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import f from '@assets/lib/odata/ODataFilterBuilder.js';
import { StringHelper } from '@core/util/stringHelper';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

export default class MenuItemNode {
	parentGuid: number;
	guid: number;
	description: string;
	children: MenuItemNode[];
}

export class MenuItemFlatNode {
	guid: number;
	description: string;
	level: number;
	expandable: boolean;
}

@Injectable()
export class ChecklistDatabase {
	menuTree: any = [];
	dataChange = new BehaviorSubject<MenuItemNode[]>([]);
	get data(): MenuItemNode[] { return this.dataChange.value; }
	resultCheckList: any[] = []

	constructor(
		private frameworkApi: FrameworkApi,
		private translate: TranslateService,) {
	}

	setDataChange(): Observable<any> {
		this.frameworkApi.get<any>('auth/entMenuTree').subscribe(res => {
			res.result = _.orderBy(res.result, ['screenOrder'], ['asc']);
			this.resultCheckList = res.result;
			if (res.result.length > 0) {
				this.dataChange.next(this.buildMenuTree(res.result));
				return of(true);
			}
		});
		return of(false);
	}

	buildMenuTree(menuTree: any[], parentMenuGuid: any = null): MenuItemNode[] {
		let masterMenu: any[] = [];
		menuTree.forEach(node => {
			if (node.parentMenuGuid === parentMenuGuid) {
				let tempNode = new MenuItemNode();
				tempNode.guid = node.guid;
				tempNode.description = node.description;
				tempNode.parentGuid = node.parentMenuGuid;

				let childMenu = this.buildMenuTree(menuTree, node.guid);
				if (childMenu.length > 0) {
					tempNode.children = childMenu;
				}

				masterMenu.push(tempNode);
			}
		});

		return masterMenu;
	}

	filterByDescription(filterText: string) {
		let filteredTreeData: any[] = [];

		if (filterText) {
			filteredTreeData = this.getSearchList(filterText, this.resultCheckList);
		} else {
			filteredTreeData = this.resultCheckList;
		}

		// file node as children.
		let data = this.buildMenuTree(filteredTreeData);

		// Notify the change. !!!IMPORTANT
		this.dataChange.next(data);
	}

	getSearchList(filterText: string, userMenus: any[]) {
		let searchText = StringHelper.normalizeString(filterText);
		var searchMenuList: any[] = [];
		if (userMenus) {
			userMenus.forEach(menu => {
				let filteredMenu = _.cloneDeep(menu);
				if (filteredMenu.routeUrl == null || filteredMenu.routeUrl == '') {
					return;
				}

				let menuName = StringHelper.normalizeString(this.translate.instant(filteredMenu.description));
				if (menuName.search(searchText) != -1) {
					if (filteredMenu.parentMenuGuid) {
						let parentMenus = this.getParentMenus(userMenus, filteredMenu.parentMenuGuid);
						parentMenus.forEach(parentMenu => {
							if (!searchMenuList.includes(parentMenu)) {
								searchMenuList.push(parentMenu);
							}
						});
					}

					searchMenuList.push(filteredMenu);
				}
			});
		}

		return _.orderBy(searchMenuList, ['screenOrder'], ['asc']);
	}

	getParentMenus(userMenus: any[], parentMenuGuid: number) {
		var parentMenuList: any[] = [];
		let parentMenu = userMenus.find(x => x.guid == parentMenuGuid);
		if (!parentMenu) {
			return parentMenuList;
		}

		if (parentMenu.parentMenuGuid) {
			parentMenuList = parentMenuList.concat(this.getParentMenus(userMenus, parentMenu.parentMenuGuid));
		}

		parentMenuList.push(parentMenu);
		return parentMenuList;
	}
}

@Injectable()
export class ChecklistApiDatabase {
	apiTree: any = [];
	dataChange = new BehaviorSubject<MenuItemNode[]>([]);
	get data(): MenuItemNode[] { return this.dataChange.value; }

	constructor(
		private frameworkApi: FrameworkApi) {
	}

	setDataChange(): Observable<any> {
		this.frameworkApi.get<any>('auth/entApiDef').subscribe(res => {
			if (res.result.length > 0) {
				this.dataChange.next(this.buildApiTree(res.result));
				return of(true);
			}
		});
		return of(false);
	}

	buildApiTree(menuTree: any[]): MenuItemNode[] {
		let masterMenu: any[] = [];
		menuTree.forEach(node => {
			if (node.parentApiGuid === null) {
				let tempNode = new MenuItemNode();
				tempNode.guid = node.guid;
				tempNode.description = node.description;
				tempNode.parentGuid = node.parentApiGuid;
				tempNode.children = this.getMenuObject(menuTree, node.guid);
				masterMenu.push(tempNode);
			}
		});
		return masterMenu;
	}

	getMenuObject(menuTree: any[], parentGuid: number): MenuItemNode[] {
		let menuList: any[] = [];
		menuTree.forEach(node => {
			if (node.parentApiGuid === parentGuid) {
				let tempNode = new MenuItemNode();
				tempNode.guid = node.guid;
				tempNode.description = node.description + ' - ' + node.apiRoute;
				tempNode.parentGuid = node.parentApiGuid;
				menuList.push(tempNode);
			}
		});
		return menuList;
	}
}

@Component({
	selector: 'kt-ent-user-role-def',
	templateUrl: './ent-user-role-def.component.html',
	styleUrls: ['./ent-user-role-def.component.scss'],
	providers: [ChecklistDatabase, EntMenuTreeService, ChecklistApiDatabase, EntApiDefService]
})
export class EntUserRoleDefComponent implements OnInit {
	loading: any;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	dontShowApiRoles: boolean = true; //api definition disable
	selectedTab: number = 0;
	hasFormErrors: boolean = false;
	isView: boolean = false;
	isWait: boolean = false;

	ticketTypes: any[] = [];
	menuList: any[] = [];
	apiList: any[] = [];

	entityForm: FormGroup = new FormGroup({});
	entityModel: EntUserRoleDefModel = new EntUserRoleDefModel();
	flatNodeMap = new Map<MenuItemFlatNode, MenuItemNode>();
	nestedNodeMap = new Map<MenuItemNode, MenuItemFlatNode>();

	treeControl: FlatTreeControl<MenuItemFlatNode>;
	treeFlattener: MatTreeFlattener<MenuItemNode, MenuItemFlatNode>;
	dataSource: MatTreeFlatDataSource<MenuItemNode, MenuItemFlatNode>;

	authorizedLevelMenuList = new SelectionModel<MenuItemFlatNode>(true /* multiple */);
	readOnlyLevelMenuList = new SelectionModel<MenuItemFlatNode>(true /* multiple */);

	treeApiControl: FlatTreeControl<MenuItemFlatNode>;
	treeApiFlattener: MatTreeFlattener<MenuItemNode, MenuItemFlatNode>;
	dataSourceApi: MatTreeFlatDataSource<MenuItemNode, MenuItemFlatNode>;

	authorizedLevelApiList = new SelectionModel<MenuItemFlatNode>(true /* multiple */);
	readOnlyLevelApiList = new SelectionModel<MenuItemFlatNode>(true /* multiple */);

	@ViewChild('menuTreeControl') menuTreeControl;
	@ViewChild('apiTreeControl') apiTreeControl;

	guidMask = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		integerLimit: 16,
	});

	constructor(
		private entityService: EntUserRoleDefService,
		private frameworkApi: FrameworkApi,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private database: ChecklistDatabase,
		private databaseApi: ChecklistApiDatabase) {

		this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
		this.treeControl = new FlatTreeControl<MenuItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

		this.treeApiFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
		this.treeApiControl = new FlatTreeControl<MenuItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSourceApi = new MatTreeFlatDataSource(this.treeApiControl, this.treeApiFlattener);
	}

	ngOnInit() {
		Object.keys(this.entityModel).forEach(name => {
			this.entityForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		// this.entityForm.addControl('searchFilter', new FormControl());

		this.frameworkApi.getLookups(['EntUserTicketTypeDef']).then(res => {
			this.ticketTypes = res.find(x => x.name === 'EntUserTicketTypeDef').data;

			const dynSub = this.activatedRoute.queryParams.subscribe(params => {
				const guid = params.guid;
				this.isView = (params.type === 'show');

				if (guid > 0) {
					this.entityService.get(guid).subscribe(res => {
						this.entityModel = res.result;
						this.entityModel._isEditMode = !this.isView;
						this.entityModel._isNew = false;

						this.database.setDataChange().subscribe(men => {
							this.databaseApi.setDataChange().subscribe(ap => {
								this.initForm();
								this.entityForm.controls['ticketType'].disable();
							});
						});
					}, (error) => {
						this.layoutUtilsService.showError(error);
					});

				} else {
					this.entityModel = new EntUserRoleDefModel();
					this.entityModel._isEditMode = false;
					this.entityModel._isNew = true;

					this.database.setDataChange().subscribe(men => {
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

		if (this.dontShowApiRoles) {
			if (this.entityModel._isNew) {
				this.entityForm.get('ticketType').setValue('M');
				this.entityModel.ticketType = 'M';
			}

			this.entityForm.get('ticketType').disable();
		}

		this.onChangeticketType(this.entityModel.ticketType);

		this.loadTrees();
	}

	onKeyupFilterMenuTre(event: any) {
		this.database.filterByDescription(this.entityForm.get('searchFilter').value);
	}

	getLevel = (node: MenuItemFlatNode) => node.level;
	isExpandable = (node: MenuItemFlatNode) => node.expandable;
	getChildren = (node: MenuItemNode): MenuItemNode[] => node.children;
	hasChild = (_: number, _nodeData: MenuItemFlatNode) => _nodeData.expandable;
	hasNoContent = (_: number, _nodeData: MenuItemFlatNode) => _nodeData.description === '';

	loadTrees() {
		//Menu Tree
		this.database.dataChange.subscribe(data => {
			this.dataSource.data = data;

			if (this.entityForm.controls['ticketType'].value === 'M') {
				this.entityModel.userRoleMenus.forEach(element => {
					let treeMenuNode = this.treeControl.dataNodes.find(n => n.guid === element.menuGuid);
					if (treeMenuNode != null) {
						this.menuLeafItemSet(treeMenuNode, element.authenticationLevel);
					}
				});
			}
		});

		//ApiTree
		this.databaseApi.dataChange.subscribe(data => {
			this.dataSourceApi.data = data;

			if (this.entityForm.controls['ticketType'].value === 'A') {
				this.entityModel.userRoleApis.forEach(element => {
					let treeApiNode = this.treeApiControl.dataNodes.find(n => n.guid === element.apiGuid);
					if (treeApiNode != null) {
						this.apiLeafItemSet(treeApiNode, element.authenticationLevel);
					}
				});
			}
		});
	}

	transformer = (node: MenuItemNode, level: number) => {
		const existingNode = this.nestedNodeMap.get(node);
		const flatNode = existingNode && existingNode.guid === node.guid
			? existingNode
			: new MenuItemFlatNode();

		flatNode.guid = node.guid;
		flatNode.description = node.description;
		flatNode.level = level;
		flatNode.expandable = !!node.children;
		this.flatNodeMap.set(flatNode, node);
		this.nestedNodeMap.set(node, flatNode);
		return flatNode;
	}

	goBack() {
		let _backUrl = 'common/authority/entUserRoleDef';
		this.router.navigateByUrl(_backUrl);
	}

	getComponentTitle() {
		if (this.entityModel._isNew) {
			return this.translate.instant('General.Add');
		} else if (this.entityModel._isEditMode) {
			return this.translate.instant('General.Edit');
		} else {
			return this.translate.instant('General.View');
		}
	}

	onChangeticketType(newticketType) {
		switch (newticketType) {
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
		this.isWait = true;
		this.hasFormErrors = false;

		const controls = this.entityForm.controls;
		if (this.entityForm.invalid) {
			Object.keys(this.entityModel).forEach(name =>
				controls[name].markAsTouched()
			);

			this.isWait = false;
			this.hasFormErrors = true;

			return;
		}

		this.entityModel = <EntUserRoleDefModel>this.entityForm.value;
		if (this.entityModel._isNew) {
			if (this.dontShowApiRoles) {
				this.entityModel.ticketType = this.entityForm.get('ticketType').value;
			}

			const queryParams = new ODataParamsModel();
			const filter = f('and');

			filter.eq('ticketType', this.entityModel.ticketType);
			filter.eq('description', this.entityModel.description);
			queryParams.filter = filter.toString();
			queryParams.orderby = 'description asc';
			queryParams.skip = 0;
			queryParams.top = -1;
			this.entityService.findOData(queryParams).subscribe(res => {
				if (res.items.length > 0) {
					this.loading = false;
					this.isWait = false;
					this.layoutUtilsService.showError(this.translate.instant('General.Exception.RowExistsWithSameDetails'));
				} else {
					this.loading = true;
					this.create();
				}
			}, (error) => {
				this.loading = false;
				this.isWait = false;

				this.layoutUtilsService.showError(error);
			});
		} else {
			this.loading = true;
			this.update();
		}
	}

	update() {
		if (this.entityForm.controls['ticketType'].value === 'M') { //Menu Role
			let selectMenuList = [];

			this.treeControl.dataNodes.forEach(node => {
				let authenticationLevel = this.getMenuAuthLevel(node);

				if (authenticationLevel && authenticationLevel != null) {
					let existsMenu = _.find(this.entityModel.userRoleMenus, function (o) {
						return o.menuGuid == node.guid;
					});

					if (existsMenu) {
						existsMenu.authenticationLevel = authenticationLevel;
						selectMenuList.push(existsMenu);
					} else {
						let userRoleMenu: EntUserRoleMenuModel = new EntUserRoleMenuModel();
						userRoleMenu.menuGuid = node.guid;
						userRoleMenu.authenticationLevel = authenticationLevel;
						userRoleMenu.roleGuid = this.entityModel.guid;
						selectMenuList.push(userRoleMenu);
					}
				}
			});

			this.entityModel.userRoleApis = [];	//apis must clear for Menu Role
			this.entityModel.userRoleMenus = [];
			this.entityModel.userRoleMenus = selectMenuList;
			this.entityModel.ticketType = 'M';
		} else if (this.entityForm.controls['ticketType'].value === 'A') { //API Role
			let selectApiList = [];

			this.treeApiControl.dataNodes.forEach(node => {
				let authenticationLevel = this.getApiAuthLevel(node);

				if (authenticationLevel && authenticationLevel != null) {
					let existsApi = _.find(this.entityModel.userRoleApis, function (o) {
						return o.apiGuid == node.guid;
					});

					if (existsApi) {
						existsApi.authenticationLevel = authenticationLevel;
						selectApiList.push(existsApi);
					} else {
						let userRoleApi: EntUserRoleApiModel = new EntUserRoleApiModel();
						userRoleApi.apiGuid = node.guid;
						userRoleApi.authenticationLevel = authenticationLevel;
						userRoleApi.roleGuid = this.entityModel.guid;
						selectApiList.push(userRoleApi);
					}
				}
			});

			this.entityModel.userRoleMenus = [];	//menus must clear for API Role
			this.entityModel.userRoleApis = [];
			this.entityModel.userRoleApis = selectApiList;
			this.entityModel.ticketType = 'A';
		}

		this.entityService.update(this.entityModel).subscribe((response: any) => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Update, 10000, true, false)
				.afterClosed().subscribe(res => {
					this.goBack();
				});
		}, (error) => {
			this.loading = false;
			this.isWait = false;

			this.layoutUtilsService.showError(error);
		});
	}

	create() {
		this.entityModel.userRoleMenus = [];
		this.entityModel.userRoleApis = [];
		if (this.entityModel.ticketType === 'M') { //Menu Role
			let selectMenuList = [];
			this.treeControl.dataNodes.forEach(node => {
				let authenticationLevel = this.getMenuAuthLevel(node);

				if (authenticationLevel && authenticationLevel != null) {
					let userRoleMenu: EntUserRoleMenuModel = new EntUserRoleMenuModel();
					userRoleMenu.menuGuid = node.guid;
					userRoleMenu.authenticationLevel = authenticationLevel;

					selectMenuList.push(userRoleMenu);
				}
			});

			this.entityModel.userRoleMenus = selectMenuList;
		} else if (this.entityModel.ticketType === 'A') { //API Role
			let selectApiList = [];
			this.treeApiControl.dataNodes.forEach(node => {
				let authenticationLevel = this.getApiAuthLevel(node);

				if (authenticationLevel && authenticationLevel != null) {
					let userRoleApi: EntUserRoleApiModel = new EntUserRoleApiModel();
					userRoleApi.apiGuid = node.guid;
					userRoleApi.authenticationLevel = authenticationLevel;

					selectApiList.push(userRoleApi);
				}
			});

			this.entityModel.userRoleApis = selectApiList;
		}

		this.entityService.create(this.entityModel).subscribe((response: any) => {
			this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false)
				.afterClosed().subscribe(res => {
					this.goBack();
				});
		}, (error) => {
			this.loading = false;
			this.isWait = false;

			this.layoutUtilsService.showError(error);
		}, () => {
			this.isWait = false;
			this.loading = false;
		});
	}

	clear(): any {
		this.entityModel = new EntUserRoleDefModel();
		this.entityModel._isNew = true;
		this.initForm();
	}

	selectedTabChanged(value) {
		this.selectedTab = value.index;
	}

	//#region Menu operations
	menuItemSelectionToggle(node: MenuItemFlatNode, e): void {
		const descendants = this.treeControl.getDescendants(node);
		if (descendants.length < 1) {
			return;
		}

		let authLevel = this.getMenuAuthLevel(node);

		descendants.forEach(child => {
			let subDescant = this.treeControl.getDescendants(child);
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
		const descendants = this.treeControl.getDescendants(node);
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
		const descendants = this.treeControl.getDescendants(node);
		if (descendants.length < 1) {
			return this.getSubMenuAuthLevel(node);
		}

		let descAllAuthorized = false;
		let idx = 0;
		descendants.forEach(child => {
			let subDescant = this.treeControl.getDescendants(child);
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
		const descendants = this.treeControl.getDescendants(node);
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
		const currentLevel = this.getLevel(node);
		if (currentLevel < 1) {
			return null;
		}

		const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
		for (let i = startIndex; i >= 0; i--) {
			const currentNode = this.treeControl.dataNodes[i];

			if (this.getLevel(currentNode) < currentLevel) {
				return currentNode;
			}
		}

		return null;
	}
	//#endregion Menu operations

	//#region Api operations
	apiItemSelectionToggle(node: MenuItemFlatNode, e): void {
		const descendants = this.treeApiControl.getDescendants(node);
		if (descendants.length < 1) {
			return;
		}

		let authLevel = this.getApiAuthLevel(node);

		descendants.forEach(child => {
			let subDescant = this.treeApiControl.getDescendants(child);
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

	apiLeafItemSelectionToggle(node: MenuItemFlatNode, e): void {
		const descendants = this.treeApiControl.getDescendants(node);
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

	apiLeafItemSet(node: MenuItemFlatNode, authenticationLevel: number): void {
		const descendants = this.treeApiControl.getDescendants(node);
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

	getApiAuthLevel(node: MenuItemFlatNode): number {
		const descendants = this.treeApiControl.getDescendants(node);
		if (descendants.length < 1) {
			return this.getSubApiAuthLevel(node);
		}

		let descAllAuthorized = false;
		let idx = 0;
		descendants.forEach(child => {
			let subDescant = this.treeApiControl.getDescendants(child);
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

	getSubApiAuthLevel(node: MenuItemFlatNode): number {
		if (this.authorizedLevelApiList.isSelected(node)) {
			return 2;
		}

		if (this.readOnlyLevelApiList.isSelected(node)) {
			return 1;
		}

		return null;
	}

	getApiParentNode(node: MenuItemFlatNode): MenuItemFlatNode | null {
		const currentLevel = this.getLevel(node);

		if (currentLevel < 1) {
			return null;
		}

		const startIndex = this.treeApiControl.dataNodes.indexOf(node) - 1;

		for (let i = startIndex; i >= 0; i--) {
			const currentNode = this.treeApiControl.dataNodes[i];

			if (this.getLevel(currentNode) < currentLevel) {
				return currentNode;
			}
		}
		return null;
	}
	//#endregion Api operations
}
