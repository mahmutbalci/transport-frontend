import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { FrameworkApi } from '@services/framework.api';
import { EntMenuTreeService } from '@services/common/authority/entMenuTree.service';
import { EntMenuDetailDefComponent } from '@common/authority/entMenuTreeDef/ent-menu-detail-def/ent-menu-detail-def.component';

/* Node for to-do item */
export default class MenuItemNode {
	parentGuid: number;
	guid: number;
	description: string;
	children: MenuItemNode[];
}

/** Flat to-do item node with expandable and level information */
export class MenuItemFlatNode {
	guid: number;
	description: string;
	level: number;
	expandable: boolean;
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
	menuTree: any = [];
	dataChange = new BehaviorSubject<MenuItemNode[]>([]);
	get data(): MenuItemNode[] { return this.dataChange.value; }

	constructor(private frameworkApi: FrameworkApi, public dialog: MatDialog,) {
		this.frameworkApi.get<any>('auth/entMenuTree').subscribe(res => {
			if (res.result.length > 0) {
				res.result = _.orderBy(res.result, ['screenOrder'], ['asc']);
				this.dataChange.next(this.buildMenuTree(res.result));
			}
		});
	}

	reloadMenuTree() {
		this.frameworkApi.get<any>('auth/entMenuTree').subscribe(res => {
			if (res.result.length > 0) {
				res.result = _.orderBy(res.result, ['screenOrder'], ['asc']);
				this.dataChange.next(this.buildMenuTree(res.result));
			}
		});
	}
	/**
	 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
	 * The return value is the list of `MenuItemNode`.
	 */
	buildMenuTree(menuTree: any[], parentMenuGuid: any = null): MenuItemNode[] {
		let masterMenu: any[] = [];

		menuTree.forEach(node => {
			if (node.parentMenuGuid == parentMenuGuid) {
				let tempNode = new MenuItemNode();
				tempNode.guid = node.guid;
				tempNode.description = node.description;
				tempNode.parentGuid = node.parentMenuGuid;
				let childMenu = this.buildMenuTree(menuTree, node.guid);
				if (childMenu.length > 0)
					tempNode.children = childMenu;
				masterMenu.push(tempNode);
			}
		});
		return masterMenu;
	}
}

/**
 * @title Tree with checkboxes
 */
@Component({
	selector: 'kt-ent-menu-tree-def',
	templateUrl: './ent-menu-tree-def.component.html',
	providers: [ChecklistDatabase, EntMenuTreeService]
})
export class EntMenuTreeDefComponent implements OnInit {
	selectedUserGuid: any;
	menuList: any = [];
	dialogRefEntMenuTreeNewDef: MatDialogRef<EntMenuDetailDefComponent>;

	/** Map from flat node to nested node. This helps us finding the nested node to be modified */
	flatNodeMap = new Map<MenuItemFlatNode, MenuItemNode>();

	/** Map from nested node to flattened node. This helps us to keep the same object for selection */
	nestedNodeMap = new Map<MenuItemNode, MenuItemFlatNode>();

	/** A selected parent node to be inserted */
	selectedParent: MenuItemFlatNode | null = null;

	/** The new item's name */
	newItemName = '';

	treeControl: FlatTreeControl<MenuItemFlatNode>;

	treeFlattener: MatTreeFlattener<MenuItemNode, MenuItemFlatNode>;

	dataSource: MatTreeFlatDataSource<MenuItemNode, MenuItemFlatNode>;

	/** The selection for checklist */
	checklistSelection = new SelectionModel<MenuItemFlatNode>(true /* multiple */);

	constructor(private database: ChecklistDatabase,
		public dialog: MatDialog,) { }

	ngOnInit() {
		this.LoadMenuTree();
	}

	LoadMenuTree() {
		this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
		this.treeControl = new FlatTreeControl<MenuItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

		this.database.dataChange.subscribe(data => {
			this.dataSource.data = data;
		});
	}

	LoadChangeMenu() {
		this.database.reloadMenuTree();
		this.LoadMenuTree();
	}

	getLevel = (node: MenuItemFlatNode) => node.level;

	isExpandable = (node: MenuItemFlatNode) => node.expandable;

	getChildren = (node: MenuItemNode): MenuItemNode[] => node.children;

	hasChild = (_: number, _nodeData: MenuItemFlatNode) => _nodeData.expandable;

	hasNoContent = (_: number, _nodeData: MenuItemFlatNode) => _nodeData.description === '';

	/**
	 * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
	 */
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

	/* Get the parent node of a node */
	getParentNode(node: MenuItemFlatNode): MenuItemFlatNode | null {
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

	dataChange = new BehaviorSubject<MenuItemNode[]>([]);
	parentMenuName: string = '';
	level: number = null;
	addNewMenuItem(selectedData: MenuItemFlatNode) {
		this.dialogRefEntMenuTreeNewDef = this.dialog.open(EntMenuDetailDefComponent, {
			data: {
				guid: 0,
				parentMenuGuid: selectedData.guid,
				description: null,
				iconPath: null,
				routeUrl: null,
				screenOrder: null,
				authenticationLevel: null,
				userMenuApis: [],
				parentMenuName: selectedData.description,
				level: selectedData.level,
			}
		});
		this.dialogRefEntMenuTreeNewDef.afterClosed().subscribe(res => {
			this.LoadChangeMenu();
		});
	}

	editMenuItem(selectedData: MenuItemFlatNode) {
		this.dialogRefEntMenuTreeNewDef = this.dialog.open(EntMenuDetailDefComponent, {
			data: {
				guid: selectedData.guid,
				parentMenuGuid: selectedData.guid,
				description: selectedData.description,
				level: selectedData.level,
				parentMenuName: selectedData.description,
			}
		});
		this.dialogRefEntMenuTreeNewDef.afterClosed().subscribe(res => {
			this.LoadChangeMenu();
		});
	}

	saveNode(node, itemValue) {
		console.log(node);
		console.log(itemValue);
	}
}
