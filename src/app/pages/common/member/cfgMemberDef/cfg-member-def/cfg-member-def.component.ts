import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatTreeFlattener, MatTreeFlatDataSource, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { FrameworkApi } from '@services/framework.api';
import f from '@assets/lib/odata/ODataFilterBuilder.js'
import { MemberDefinitionRequestDto } from '@common/member/MemberDefinitionRequest.model';
import { MemberDefinitionResponseDto } from '@common/member/MemberDefinitionResponse.model';
import { EntMenuTreeService } from '@common/authority/entMenuTree.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import * as _ from 'lodash';
import { EntMenuDetailDefComponent } from '@common/authority/entMenuTreeDef/ent-menu-detail-def/ent-menu-detail-def.component';
import { SelectionModel } from '@angular/cdk/collections';
import { EntMenuTreeModel } from '@common/authority/entMenuTree.model';
import { EntUserRoleMenuModel } from '@common/authority/entUserRoleMenu.model';
import { EntUserRoleApiModel } from '@common/authority/entUserRoleApi.model';
import { CfgCityDefService } from '@common/member/cfgCityDef.service';
import { MemberDefService } from '@common/authority/memberDef.service';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import { MMatTableDataSource } from '@core/_base/crud/models/mmat-table.datasource.js';

export default class MenuMemberItemNode {
	checked: boolean;
	parentGuid: number;
	guid: number;
	description: string;
	iconPath: string;
	routeUrl: string;
	screenOrder: number;
	children: MenuMemberItemNode[];
}

/** Flat to-do item node with expandable and level information */
export class MenuMemberItemFlatNode {
	guid: number;
	description: string;
	level: number;
	expandable: boolean;
}

@Component({
	selector: 'm-cfg-member-def',
	templateUrl: './cfg-member-def.component.html',
	providers: [EntMenuTreeService]
})

export class CfgMemberDefComponent implements OnInit {
	loading: any;
	saveresult: string;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	displayedBinColumns = ['actions', 'isValid', 'bin', 'description', 'dci', 'cardBrand', 'binClass'];
	activeAccordionIds: string = "memberDefinitionToogle";
	activeAccordionIdsList: any[] = [];
	activeAccordionActiveIdsList: string[] = [];
	memberDefinitionFormControls = ['mbrId', 'description', 'languageCode', 'mbrCurrency', 'taxNo', 'address1',
		'address2', 'countryCode', 'cityCode', 'town', 'postalCode', 'eftCode',
		'faxNumber', 'isoCountryCode'];
	moduleSelectionFormControls = ['issuingApi', 'acquiringApi', 'clearingApi', 'fraudApi', 'referanceMbrId'];
	loopSelectionFormControls = ['loopSelection', 'loopSelectionValue'];
	rolDefinitionFormControls = ['userCode', 'menuRolName', 'apiRolName'];
	issuingSelectioFormControls = ['issuingSelectionValue'];
	acquiringSelectioFormControls = ['acquiringSelectionValue'];

	mainForm: FormGroup = new FormGroup({});
	memberDefinitionForm: FormGroup = new FormGroup({});
	loopSelectionForm: FormGroup = new FormGroup({});
	memberDefaultForm: FormGroup = new FormGroup({});
	issuingSelectionForm: FormGroup = new FormGroup({});
	acquiringSelectionForm: FormGroup = new FormGroup({});
	rolDefinitionForm: FormGroup = new FormGroup({});
	moduleSelectionForm: FormGroup = new FormGroup({});

	entityModel: MemberDefinitionRequestDto = new MemberDefinitionRequestDto();
	referanceEntityMode: MemberDefinitionResponseDto = new MemberDefinitionResponseDto();

	menuTreeModel: EntMenuTreeModel[] = [];
	userCodeList: { code: '', description: string }[] = [];
	entApiDefs: any = [];

	hasFormErrors: boolean = false;
	validationMessage: string;
	nextButtonTitle: string;
	selectedAccordion: number = 0;
	disabledNextButton: boolean = false;
	disabledBackButton: boolean = true;
	isView: boolean = false;
	dataSourceBinDef = new MMatTableDataSource([]);
	lookUpValueList: any[] = [];

	txnCurrencyDefs: any = [];
	cfgCountryDefs: any = [];
	cfgCityDefs: any = [];
	cfgCityTownDefs: any = [];
	cfgLanguage: any = [];
	cfgCityDefsList: any = [];
	cfgCardDciDefs: any = [];
	cfgCardBrandDefs: any = [];
	cfgLoopBrandDefs: any = [];
	cfgAcquiringBusinessDefs: any = [];
	memberDefList: any = [];
	phoneMask1 = [/[1-9]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
	countryMask = ['+', /\d/, /\d/, /\d/,];
	townDescriptions: any[];
	formControlSearch: FormControl = new FormControl();
	loadMenuTree: boolean = false;

	getLevel = (node: MenuMemberItemFlatNode) => node.level;
	isExpandable = (node: MenuMemberItemFlatNode) => node.expandable;
	getChildren = (node: MenuMemberItemNode): MenuMemberItemNode[] => node.children;
	hasChild = (_: number, _nodeData: MenuMemberItemFlatNode) => _nodeData.expandable;
	hasNoContent = (_: number, _nodeData: MenuMemberItemFlatNode) => _nodeData.description === '';
	selectedUserGuid: any;
	menuList: any = [];
	dialogRefEntMenuTreeNewDef: MatDialogRef<EntMenuDetailDefComponent>;
	flatNodeMap = new Map<MenuMemberItemFlatNode, MenuMemberItemNode>();
	nestedNodeMap = new Map<MenuMemberItemNode, MenuMemberItemFlatNode>();
	selectedParent: MenuMemberItemFlatNode | null = null;
	newItemName = '';
	treeControlMenu: FlatTreeControl<MenuMemberItemFlatNode>;
	treeControlApi: FlatTreeControl<MenuMemberItemFlatNode>;
	treeFlattenerMenu: MatTreeFlattener<MenuMemberItemNode, MenuMemberItemFlatNode>;
	treeFlattenerApi: MatTreeFlattener<MenuMemberItemNode, MenuMemberItemFlatNode>;
	dataSourceMenu: MatTreeFlatDataSource<MenuMemberItemNode, MenuMemberItemFlatNode>;
	dataSourceApi: MatTreeFlatDataSource<MenuMemberItemNode, MenuMemberItemFlatNode>;
	checklistSelectionMenu = new SelectionModel<MenuMemberItemFlatNode>(true /* multiple */);
	checklistIndeterminateSelectionMenu = new SelectionModel<MenuMemberItemFlatNode>(true /* multiple */);
	checklistSelectionApi = new SelectionModel<MenuMemberItemFlatNode>(true /* multiple */);
	checklistIndeterminateSelectionApi = new SelectionModel<MenuMemberItemFlatNode>(true /* multiple */);
	transformer = (node: MenuMemberItemNode, level: number) => {
		const existingNode = this.nestedNodeMap.get(node);
		const flatNode = existingNode && existingNode.guid === node.guid
			? existingNode
			: new MenuMemberItemFlatNode();
		flatNode.guid = node.guid;
		flatNode.description = node.description;
		flatNode.level = level;
		flatNode.expandable = !!node.children;
		this.flatNodeMap.set(flatNode, node);
		this.nestedNodeMap.set(node, flatNode);
		return flatNode;
	}

	dataChangeMenu = new BehaviorSubject<MenuMemberItemNode[]>([]);
	dataChangeApi = new BehaviorSubject<MenuMemberItemNode[]>([]);
	get data(): MenuMemberItemNode[] { return this.dataChangeMenu.value; }

	isChangeModuleSelection: boolean = true;
	isChangeLoopSelection: boolean = true;
	isChangeReferanceSelection: boolean = true;

	commonApiTab: boolean = false;
	fraudApiTab: boolean = false;
	clearingApiTab: boolean = false;
	issuingApiTab: boolean = false;
	acquiringApiTab: boolean = false;
	commonApiCoreTab: boolean = false;
	fraudApiCoreTab: boolean = false;
	clearingApiCoreTab: boolean = false;
	issuingApiCoreTab: boolean = false;
	acquiringApiCoreTab: boolean = false;
	commonApiInstTab: boolean = false;
	fraudApiInstTab: boolean = false;
	clearingApiInstTab: boolean = false;
	issuingApiInstTab: boolean = false;
	acquiringApiInstTab: boolean = false;

	memberDefaultCoreAcquiring: any[] = [];
	memberDefaultCoreIssuing: any[] = [];
	memberDefaultCoreClearing: any[] = [];
	memberDefaultCoreFraud: any[] = [];
	memberDefaultCoreCommon: any[] = [];
	memberDefaultInstAcquiring: any[] = [];
	memberDefaultInstIssuing: any[] = [];
	memberDefaultInstClearing: any[] = [];
	memberDefaultInstFraud: any[] = [];
	memberDefaultInstCommon: any[] = [];

	translactionObjectList: any[] = [];

	constructor(
		private activatedRoute: ActivatedRoute,
		private cfgCityDefService: CfgCityDefService,
		private memberDefService: MemberDefService,
		private router: Router,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private frameworkApi: FrameworkApi
	) { }

	ngOnInit() {
		this.memberDefinitionFormControls.forEach(name => {
			this.memberDefinitionForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.moduleSelectionFormControls.forEach(name => {
			this.moduleSelectionForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.loopSelectionFormControls.forEach(name => {
			this.loopSelectionForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.rolDefinitionFormControls.forEach(name => {
			this.rolDefinitionForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.issuingSelectioFormControls.forEach(name => {
			this.issuingSelectionForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		this.acquiringSelectioFormControls.forEach(name => {
			this.acquiringSelectionForm.addControl(name, new FormControl(this.entityModel[name]));
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const guid = params.guid;
			this.isView = (params.type === "show");
			if (guid && guid !== null) {
				this.getReferanceMemberData(guid);
			} else {
				this.entityModel = new MemberDefinitionRequestDto();
				this.entityModel._isNew = true;
				this.initForm();
			}
			this.initAccordionForm();
		});
		dynSub.unsubscribe();

		this.frameworkApi.getLookups(["MemberDefinition", "TxnCurrencyDef", "CfgCountryDef", "CfgCityDef", "CfgCityTownDef", "CfgLanguageDef", "CfgCardDciDef", "CfgCardBrandDef"]).then(res => {
			this.memberDefList = res.find(x => x.name === "MemberDefinition").data;
			this.txnCurrencyDefs = res.find(x => x.name === "TxnCurrencyDef").data;
			this.cfgCountryDefs = res.find(x => x.name === "CfgCountryDef").data;
			this.cfgCityDefs = res.find(x => x.name === "CfgCityDef").data;
			this.cfgCityTownDefs = res.find(x => x.name === "CfgCityTownDef").data;
			this.cfgLanguage = res.find(x => x.name === "CfgLanguageDef").data;
			this.cfgCardDciDefs = res.find(x => x.name === "CfgCardDciDef").data;
			this.cfgLoopBrandDefs = res.find(x => x.name === "CfgCardBrandDef").data;
			this.cfgCardBrandDefs = _.filter(this.cfgLoopBrandDefs, function (o) {
				if (o.code == "V" || o.code == "M" || o.code == "T") {
					return o;
				}
			});

			if (!this.cfgLoopBrandDefs.find(f => f.code === 'B')) {
				this.cfgLoopBrandDefs.push({ code: 'B', description: 'B~BKM' });
			}

			this.cfgCityDefService.getAll().subscribe((res: any) => { this.cfgCityDefsList = res.result; }, (error) => {
				this.layoutUtilsService.showError(error);
			});

			this.townDescriptions = [];
			this.cfgCityTownDefs.forEach(data => {
				let item: any = {};
				if (data.code) {
					item.code = data.code;
				}

				item.description = data.description;
				this.townDescriptions.push(item);
			});

			this.cfgLanguage = this.cfgLanguage.filter(f => f.code.includes('-'));
			this.cfgAcquiringBusinessDefs.push({ code: 'P', description: 'P~POS' });
			this.cfgAcquiringBusinessDefs.push({ code: 'V', description: 'V~VPOS' });
			this.cfgAcquiringBusinessDefs.push({ code: 'A', description: 'A~ATM' });
		});
	}

	initAccordionForm() {
		let indexToogle = 0;
		for (let element in MenuToogleList) {
			if (isNaN(Number(element))) {
				let disabled = false;
				if (this.entityModel._isNew) {
					if (indexToogle == MenuToogleList.issuingSelectionToogle || indexToogle == MenuToogleList.acquiringSelectionToogle) {
						disabled = true;
					}
				}
				else if (this.isView) {
					if (indexToogle == MenuToogleList.issuingSelectionToogle || indexToogle == MenuToogleList.acquiringSelectionToogle || indexToogle == MenuToogleList.moduleSelectionToogle || indexToogle == MenuToogleList.loopSelectionToogle) {
						disabled = true;
					}
				}
				else {
					disabled = true;
					if (indexToogle == MenuToogleList.memberDefaultToogle || indexToogle == MenuToogleList.memberDefinitionToogle) {
						disabled = false;
					}
				}

				this.activeAccordionIdsList.push({ code: element, disabled: disabled });
				if (!disabled) {
					this.activeAccordionActiveIdsList.push(element);
				}
				indexToogle++;
			}
		}
	}

	initForm(): any {
		this.getObjectKey(this.translate.store.translations[localStorage.getItem('language')]);

		this.loadingSubject.next(false);
		Object.keys(this.entityModel).forEach(name => {
			if (this.memberDefinitionForm.controls[name]) {
				if (name == "address1") {
					this.memberDefinitionForm.controls[name].setValue(this.entityModel[name] + this.entityModel["address2"]);
				}
				else {
					this.memberDefinitionForm.controls[name].setValue(this.entityModel[name]);
				}
			}

			if (this.rolDefinitionForm.controls[name]) {
				this.rolDefinitionForm.controls[name].setValue(this.entityModel[name]);
			}
		});

		this.nextButtonTitle = this.translate.instant('General.Next');
	}

	getReferanceMemberData(mbrId: number) {
		this.lookUpValueList = [];
		this.userCodeList = [];
		this.entityModel.menuDefinition = [];
		this.memberDefService.getMemberDef(mbrId).subscribe((response: any) => {
			this.entApiDefs = response.result.entApiDef;
			this.entityModel.referanceMbrId = response.result.memberDefinition.mbrId;

			if (this.lookUpValueList.length > 0) {
				this.frameworkApi.getLookups(this.lookUpValueList.map(({ code }) => code)).then(res => {
					this.lookUpValueList.forEach(element => {
						element.data = res.find(x => x.name === element.code).data;
					});
				});
			}

			if (response.result.entUser) {
				response.result.entUser.forEach(data => {
					this.userCodeList.push({ code: data.key.id, description: data.name + ' ' + data.surname });
				});
			}
			if (!this.entityModel._isNew) {
				this.dataSourceBinDef = response.result.binOnusDef;
				this.entityModel = response.result.memberDefinition;
				this.entityModel.menuDefinition = response.result.entMenuTree;
				this.entityModel.userRoleMenu = [];
				this.entityModel.userRoleApi = [];

				if (!this.isView) {
					this.entityModel._isEditMode = true;
				}

				this.initForm();
			}
			else {
				this.buildMenuTreeModel(response.result.entMenuTree).forEach(element => {
					this.entityModel.menuDefinition.push(element);
				});

				this.getMemberDefaults();
			}
		});
	}

	goBack() {
		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			this.isView = (params.type == "show");
			if (!this.isView) {
				const dialogRef = this.layoutUtilsService.yesNoElement(this.translate.instant('General.UnsavedDataWillBeLostAreSureToExit'), null, null);
				dialogRef.afterClosed().subscribe(res => {
					if (res) {
						let _backUrl = '/common/member/cfgMemberDef';
						this.router.navigateByUrl(_backUrl);
					};
				});
			}
			else {
				let _backUrl = '/common/member/cfgMemberDef';
				this.router.navigateByUrl(_backUrl);
			}
		});
		dynSub.unsubscribe();
	}

	beforeChange($event) {
		$event.preventDefault();
	};

	processBack() {
		if (this.selectedAccordion > 0) {
			const tempSelectedAccordion = this.selectedAccordion;
			for (let index = 0; index < this.activeAccordionIdsList.length; index++) {
				if (index < tempSelectedAccordion && !this.activeAccordionIdsList[index].disabled) {
					this.selectedAccordion = index;
				}
			}
		}

		this.setNextButtonText();
	}

	processNext() {
		this.validate(this.selectedAccordion);
		if (this.hasFormErrors) {
			return;
		}

		setTimeout(() => {
			const tempSelectedAccordion = this.selectedAccordion;
			if (tempSelectedAccordion < this.activeAccordionIdsList.length - 1) {
				for (let index = 0; index < this.activeAccordionIdsList.length; index++) {
					if (index > tempSelectedAccordion && !this.activeAccordionIdsList[index].disabled) {
						this.selectedAccordion = index;
						break;
					}
				}
				if (tempSelectedAccordion === this.selectedAccordion) {
					this.save();
				}
				else {
					this.setNextButtonText();
				}
			}
			else if (this.entityModel._isNew || this.entityModel._isEditMode) {
				this.save();
			}
		}, 10);
	}

	setNextButtonText() {
		this.disabledNextButton = false;
		this.activeAccordionIds = this.activeAccordionIdsList[this.selectedAccordion].code;

		let lastAccordionIndex = 0;
		for (let index = 0; index < this.activeAccordionIdsList.length; index++) {
			if (!this.activeAccordionIdsList[index].disabled) {
				lastAccordionIndex = index;
			}
		}

		if (this.selectedAccordion < lastAccordionIndex) {
			this.nextButtonTitle = this.translate.instant('General.Next');
		}
		else if (this.entityModel._isNew) {
			this.nextButtonTitle = this.translate.instant('General.Add');
		}
		else if (this.entityModel._isEditMode) {
			this.nextButtonTitle = this.translate.instant('General.Update');
		}
		else {
			this.disabledNextButton = true;
		}

		if (this.selectedAccordion == 0) {
			this.disabledBackButton = true;
		}
		else {
			this.disabledBackButton = false;
		}
	}

	validate(selectedAccordion: number) {
		this.validationMessage = "";
		if (this.entityModel._isNew || this.entityModel._isEditMode) {
			switch (selectedAccordion) {
				case MenuToogleList.memberDefinitionToogle:
					this.controlForm(this.memberDefinitionForm);
					break;
				case MenuToogleList.loopSelectionToogle:
					if (this.entityModel.loopSelection && this.loopSelectionForm.get('loopSelectionValue').value.length == 0) {
						this.validationMessage = this.translate.instant('System.Member.Exception.PlaseOpenLoopSelect');
						this.hasFormErrors = true;
						this.layoutUtilsService.showError(this.validationMessage);
					}
					break;
				case MenuToogleList.moduleSelectionToogle:
					if (!this.entityModel._isEditMode) {
						this.controlForm(this.moduleSelectionForm);
					}
					else {
						this.controlForm(this.memberDefaultForm);
					}
					break;
				case MenuToogleList.memberDefaultToogle:
					this.controlForm(this.memberDefaultForm);
					break;
				case MenuToogleList.issuingSelectionToogle:

					break;
				case MenuToogleList.acquiringSelectionToogle:

					break;
				case MenuToogleList.rolDefinifitonToogle:
					this.controlForm(this.rolDefinitionForm);
					break;
				default:
					break;
			}
		}

		if (!this.hasFormErrors) {
			this.setFormValuesToModel();
		}
	}

	getMemberDefaults() {
		this.memberDefaultCoreAcquiring = [];
		this.memberDefaultCoreIssuing = [];
		this.memberDefaultCoreClearing = [];
		this.memberDefaultCoreFraud = [];
		this.memberDefaultCoreCommon = [];
		this.memberDefaultInstAcquiring = [];
		this.memberDefaultInstIssuing = [];
		this.memberDefaultInstClearing = [];
		this.memberDefaultInstFraud = [];
		this.memberDefaultInstCommon = [];

		if (this.entityModel.fraudApi && (this.memberDefaultCoreFraud.length > 0 || this.memberDefaultInstFraud.length > 0)) {
			this.fraudApiTab = true;
			if (this.memberDefaultCoreFraud.length > 0) {
				this.fraudApiCoreTab = true;
			}
			else {
				this.fraudApiCoreTab = false;
			}

			if (this.memberDefaultInstFraud.length > 0) {
				this.fraudApiInstTab = true;
			}
			else {
				this.fraudApiInstTab = false;
			}
		}
		else {
			this.fraudApiTab = false;
		}


		if (this.entityModel.acquiringApi && (this.memberDefaultCoreAcquiring.length > 0 || this.memberDefaultInstAcquiring.length > 0)) {
			this.acquiringApiTab = true;
			if (this.memberDefaultCoreAcquiring.length > 0) {
				this.acquiringApiCoreTab = true;
			}
			else {
				this.acquiringApiCoreTab = false;
			}

			if (this.memberDefaultInstAcquiring.length > 0) {
				this.acquiringApiInstTab = true;
			}
			else {
				this.acquiringApiInstTab = false;
			}
		}
		else {
			this.acquiringApiTab = false;
		}


		if (this.entityModel.issuingApi && (this.memberDefaultCoreIssuing.length > 0 || this.memberDefaultInstIssuing.length > 0)) {
			this.issuingApiTab = true;
			if (this.memberDefaultCoreIssuing.length > 0) {
				this.issuingApiCoreTab = true;
			}
			else {
				this.issuingApiCoreTab = false;
			}

			if (this.memberDefaultInstIssuing.length > 0) {
				this.issuingApiInstTab = true;
			}
			else {
				this.issuingApiInstTab = false;
			}
		}
		else {
			this.issuingApiTab = false;
		}


		if (this.entityModel.clearingApi && (this.memberDefaultCoreClearing.length > 0 || this.memberDefaultInstClearing.length > 0)) {
			this.clearingApiTab = true;
			if (this.memberDefaultCoreClearing.length > 0) {
				this.clearingApiCoreTab = true;
			}
			else {
				this.clearingApiCoreTab = false;
			}

			if (this.memberDefaultInstClearing.length > 0) {
				this.clearingApiInstTab = true;
			}
			else {
				this.clearingApiInstTab = false;
			}
		}
		else {
			this.clearingApiTab = false;
		}

		if (this.memberDefaultCoreCommon.length > 0 || this.memberDefaultInstCommon.length > 0) {
			this.commonApiTab = true;
			if (this.memberDefaultCoreCommon.length > 0) {
				this.commonApiCoreTab = true;
			}
			else {
				this.commonApiCoreTab = false;
			}

			if (this.memberDefaultInstCommon.length > 0) {
				this.commonApiInstTab = true;
			}
			else {
				this.commonApiInstTab = false;
			}
		}
		else {
			this.commonApiTab = false;
		}

		this.memberDefaultCoreAcquiring = this.gruopByMemberDefault(_.orderBy(this.memberDefaultCoreAcquiring, ['key'], ['asc']));
		this.memberDefaultCoreIssuing = this.gruopByMemberDefault(_.orderBy(this.memberDefaultCoreIssuing, ['key'], ['asc']));
		this.memberDefaultCoreClearing = this.gruopByMemberDefault(_.orderBy(this.memberDefaultCoreClearing, ['key'], ['asc']));
		this.memberDefaultCoreFraud = this.gruopByMemberDefault(_.orderBy(this.memberDefaultCoreFraud, ['key'], ['asc']));
		this.memberDefaultCoreCommon = this.gruopByMemberDefault(_.orderBy(this.memberDefaultCoreCommon, ['key'], ['asc']));
		this.memberDefaultInstAcquiring = this.gruopByMemberDefault(_.orderBy(this.memberDefaultInstAcquiring, ['key'], ['asc']));
		this.memberDefaultInstIssuing = this.gruopByMemberDefault(_.orderBy(this.memberDefaultInstIssuing, ['key'], ['asc']));
		this.memberDefaultInstClearing = this.gruopByMemberDefault(_.orderBy(this.memberDefaultInstClearing, ['key'], ['asc']));
		this.memberDefaultInstFraud = this.gruopByMemberDefault(_.orderBy(this.memberDefaultInstFraud, ['key'], ['asc']));
		this.memberDefaultInstCommon = this.gruopByMemberDefault(_.orderBy(this.memberDefaultInstCommon, ['key'], ['asc']));
	}

	gruopByMemberDefault(item: any[]) {
		let newItem = [];

		item.forEach(element => {
			let groupingKey = ''
			if (element.key.includes('.')) {
				const splitItem = element.key.split('.');

				const findIndex = this.translactionObjectList.findIndex(f => f.key === splitItem[1].toLowerCase());
				if (findIndex >= 0) {
					groupingKey = this.translactionObjectList[findIndex].value;
				}
				else {
					groupingKey = this.translate.instant('General.Other');
				}
			}
			else {
				groupingKey = this.translate.instant('General.Other');
			}


			const findNewItemIndex = newItem.findIndex(f => f.description === groupingKey);
			if (findNewItemIndex >= 0) {
				newItem[findNewItemIndex].data.push(element);
			}
			else {
				newItem.push({ description: groupingKey, data: [element] });
			}
		});

		return newItem;
	}

	getMenuTree() {
		try {
			this.loadMenuTree = true;
			this.entityModel.menuDefinition = _.orderBy(this.entityModel.menuDefinition, ['screenOrder'], ['asc']);
			this.dataChangeMenu.next(this.buildMenuTree(this.entityModel.menuDefinition));
			this.LoadMenuRolTree();
			this.getApiTree();
		}
		catch {
			this.loadMenuTree = false;
		}
	}

	getApiTree() {
		this.dataChangeApi.next(this.buildApiTree(this.entApiDefs));
		this.LoadApiRolTree();
	}

	LoadMenuRolTree() {
		this.treeFlattenerMenu = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
		this.treeControlMenu = new FlatTreeControl<MenuMemberItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSourceMenu = new MatTreeFlatDataSource(this.treeControlMenu, this.treeFlattenerMenu);

		this.dataChangeMenu.subscribe(data => {
			this.dataSourceMenu.data = data;
		});
	}

	LoadApiRolTree() {
		this.treeFlattenerApi = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
		this.treeControlApi = new FlatTreeControl<MenuMemberItemFlatNode>(this.getLevel, this.isExpandable);
		this.dataSourceApi = new MatTreeFlatDataSource(this.treeControlApi, this.treeFlattenerApi);

		this.dataChangeApi.subscribe(data => {
			this.dataSourceApi.data = data;
		});
	}

	buildMenuTree(menuTree: any[], parentMenuGuid: any = null, operation: any[] = []): MenuMemberItemNode[] {
		let masterMenu: any[] = [];
		menuTree.forEach(node => {
			if (node.parentMenuGuid == parentMenuGuid) {
				if (node.parentMenuGuid == null) {
					operation = this.getSelectedOperation(node.description.replace("Menu.", ""));
				}

				if (operation[0]) {
					let tempNode = new MenuMemberItemNode();
					tempNode.guid = node.guid;
					tempNode.description = node.description;
					tempNode.parentGuid = node.parentMenuGuid;
					tempNode.iconPath = node.iconPath;
					tempNode.routeUrl = node.routeUrl;
					tempNode.screenOrder = node.screenOrder;
					let childMenu = this.buildMenuTree(menuTree, node.guid, operation);

					if (childMenu.length > 0) {
						tempNode.children = childMenu;
					}

					masterMenu.push(tempNode);
				}
			}
		});

		return masterMenu;
	}

	buildMenuTreeModel(menuTree: EntMenuTreeModel[], parentMenuGuid: any = null, operation: any[] = []): EntMenuTreeModel[] {
		let masterMenu: EntMenuTreeModel[] = [];
		menuTree.forEach(node => {
			if (node.parentMenuGuid == parentMenuGuid) {
				if (node.parentMenuGuid == null) {
					operation = this.getSelectedOperation(node.description.replace("Menu.", ""));
				}

				if (operation[0]) {
					let childMenu = this.buildMenuTreeModel(menuTree, node.guid, operation);
					if (childMenu.length > 0) {
						childMenu.forEach(element => {
							masterMenu.push(element);
						});
					}

					masterMenu.push(node);
				}
			}
		});

		return masterMenu;
	}

	buildApiTree(menuTree: any[], parentMenuGuid: any = null, operation: any[] = []): MenuMemberItemNode[] {
		let masterMenu: any[] = [];
		menuTree.forEach(node => {
			if (node.parentApiGuid == parentMenuGuid) {
				if (node.parentApiGuid == null) {
					operation = this.getSelectedOperation(node.description);
				}

				if (operation[0]) {
					let tempNode = new MenuMemberItemNode();
					tempNode.guid = node.guid;
					if (node.parentApiGuid == null) {
						tempNode.description = node.description;
					}
					else {
						tempNode.description = node.description + ' - ' + node.apiRoute;
					}

					tempNode.parentGuid = node.parentApiGuid;
					let childMenu = this.buildApiTree(menuTree, node.guid, operation);
					if (childMenu.length > 0) {
						tempNode.children = childMenu;
					}

					masterMenu.push(tempNode);
				}
			}
		});
		return masterMenu;
	}

	getQueryParams() {
		let filter = f();
		if (this.entityModel._isNew) {
			filter.eq('mbrId', this.entityModel.referanceMbrId);
		}
		else {
			filter.eq('mbrId', this.entityModel.mbrId);
		}

		let queryParams = new ODataParamsModel();
		queryParams.filter = filter.toString();
		return queryParams;
	}

	getSelectedOperation(key: string) {
		let isAddDefItem = this.entityModel._isNew ? false : true;
		let isRemoveDefItem = false;
		let loopSelection = false;

		if (this.entityModel._isNew) {
			if (key.toLowerCase().includes("bkm") && (!this.entityModel.loopSelectionValue.includes('B') || !this.entityModel.loopSelection)) {
				isRemoveDefItem = true;
			}
			else if (key.toLowerCase().includes("visa") && (!this.entityModel.loopSelectionValue.includes('V') || !this.entityModel.loopSelection)) {
				isRemoveDefItem = true;
			}
			else if (key.toLowerCase().includes("mastercard") && (!this.entityModel.loopSelectionValue.includes('M') || !this.entityModel.loopSelection)) {
				isRemoveDefItem = true;
			}
			else {
				loopSelection = true;
			}

			if (loopSelection) {
				if (key.toLowerCase().startsWith("clearing")) {
					if (this.entityModel.clearingApi) {
						isAddDefItem = true;
					}
					else {
						isRemoveDefItem = true;
					}
				}
				else if (key.toLowerCase().startsWith("acquirer") || key.startsWith("acquiring")) {
					if (this.entityModel.acquiringApi) {
						isAddDefItem = true;
					}
					else {
						isRemoveDefItem = true;
					}
				}
				else if (key.toLowerCase().startsWith("issuing")) {
					if (this.entityModel.issuingApi) {
						isAddDefItem = true;
					}
					else {
						isRemoveDefItem = true;
					}
				}
				else if (key.toLowerCase().startsWith("cleveract")) {
					if (this.entityModel.fraudApi) {
						isAddDefItem = true;
					}
					else {
						isRemoveDefItem = true;
					}
				}
				else {
					isAddDefItem = true;
				}
			}
		}

		let operation = [];
		operation.push(isAddDefItem);
		operation.push(isRemoveDefItem);
		return operation;
	}

	setFormValuesToModel() {
		let selectedAc = this.selectedAccordion;
		if (selectedAc == MenuToogleList.memberDefinitionToogle) {
			this.memberDefinitionFormControls.forEach(element => {
				this.entityModel[element] = this.memberDefinitionForm.get(element).value;
			});

			if (this.entityModel.address1.length > 40) {
				this.entityModel.address2 = this.entityModel.address1.substr(40, this.entityModel.address1.length);
				this.entityModel.address1 = this.entityModel.address1.substr(0, 40);
			}

			if (!this.entityModel._isNew) {
				this.entityModel.issuingApi = true;
				this.entityModel.fraudApi = true;
				this.entityModel.acquiringApi = true;
				this.entityModel.clearingApi = true;
				this.getMemberDefaults();
			}
		}
		else if (selectedAc == MenuToogleList.loopSelectionToogle) {
			if (this.entityModel.loopSelection) {
				if (this.entityModel.loopSelectionValue != this.loopSelectionForm.get('loopSelectionValue').value) {
					this.isChangeLoopSelection = true;
				}

				this.entityModel.loopSelectionValue = this.loopSelectionForm.get('loopSelectionValue').value;
			}
			else {
				this.entityModel.loopSelectionValue = [];
				this.moduleSelectionForm.controls["clearingApi"].setValue(false);
			}
		}
		else if (selectedAc == MenuToogleList.moduleSelectionToogle) {
			let formControlCnt = 0;
			this.moduleSelectionFormControls.forEach(element => {
				if (element != "referanceMbrId" && this.entityModel[element] == this.moduleSelectionForm.get(element).value) {
					formControlCnt++;
				}
				else if (element == "referanceMbrId" && this.entityModel[element] != this.moduleSelectionForm.get(element).value) {
					this.isChangeReferanceSelection = true;
				}

				this.entityModel[element] = this.moduleSelectionForm.get(element).value;
			});

			if (formControlCnt == this.moduleSelectionFormControls.length - 1) {
				this.isChangeModuleSelection = true;
			}

			if (this.isChangeModuleSelection) {
				let indexToogle = 0;
				this.loadMenuTree = false;
				this.activeAccordionActiveIdsList = [];
				this.activeAccordionIdsList.forEach(element => {
					let disabled = false;
					if (indexToogle == MenuToogleList.issuingSelectionToogle) {
						disabled = !this.entityModel.issuingApi;
						element.disabled = disabled;
					}
					else if (indexToogle == MenuToogleList.acquiringSelectionToogle) {
						disabled = !this.entityModel.acquiringApi;
						element.disabled = disabled;
					}
					if (!element.disabled) {
						this.activeAccordionActiveIdsList.push(element.code);
					}

					indexToogle++;
				});
			}
			if (this.isChangeReferanceSelection) {
				this.loadMenuTree = false;
				this.getReferanceMemberData(this.moduleSelectionForm.get("referanceMbrId").value);
			}
			else if (this.isChangeModuleSelection || this.isChangeLoopSelection) {
				this.loadMenuTree = false;
				this.getMemberDefaults();
			}
		}
		else if (selectedAc == MenuToogleList.issuingSelectionToogle) {
			this.entityModel.issuingSelectionValue = this.issuingSelectionForm.get('issuingSelectionValue').value;
		}
		else if (selectedAc == MenuToogleList.acquiringSelectionToogle) {
			this.entityModel.acquiringSelectionValue = this.acquiringSelectionForm.get('acquiringSelectionValue').value;
		}
		else if (selectedAc == MenuToogleList.rolDefinifitonToogle) {
			this.rolDefinitionFormControls.forEach(element => {
				this.entityModel[element] = this.rolDefinitionForm.get(element).value;
			});

			if (this.entityModel._isNew || this.entityModel._isEditMode) {
				this.entityModel.userRoleMenu = [];
				this.treeControlMenu.dataNodes.forEach(node => {
					if (this.checklistSelectionMenu.isSelected(node) || this.descendantsPartiallySelected(node, 1)) {
						this.entityModel.menuDefinition.forEach(element => {
							if (element.guid == node.guid) {
								let userRoleMenu: EntUserRoleMenuModel = new EntUserRoleMenuModel();
								userRoleMenu.roleGuid = 0;
								userRoleMenu.menuGuid = element.guid;
								if (this.checklistIndeterminateSelectionMenu.isSelected(node)) {
									userRoleMenu.authenticationLevel = 1;
								}
								else {
									userRoleMenu.authenticationLevel = 2;
								}

								this.entityModel.userRoleMenu.push(userRoleMenu);
							}
						});
					}
				});

				this.entityModel.userRoleApi = [];
				this.treeControlApi.dataNodes.forEach(node => {
					if (this.checklistSelectionApi.isSelected(node) || this.descendantsPartiallySelected(node, 2)) {
						this.entApiDefs.forEach(element => {
							if (element.guid == node.guid) {
								let userRoleApi: EntUserRoleApiModel = new EntUserRoleApiModel();
								userRoleApi.roleGuid = 0;
								if (this.checklistIndeterminateSelectionApi.isSelected(node)) {
									userRoleApi.authenticationLevel = 1;
								}
								else {
									userRoleApi.authenticationLevel = 2;
								}

								userRoleApi.apiGuid = node.guid;
								this.entityModel.userRoleApi.push(userRoleApi);
							}
						});
					}
				});
			}
		}
	}

	getComponentTitle() {
		if (this.entityModel._isNew) {
			return this.translate.instant('General.Add');
		}
		else if (this.entityModel._isEditMode) {
			return this.translate.instant('General.Edit');
		}
		else {
			return this.translate.instant('General.View');
		}
	}

	onChangeUserCode(input) {
		if (!this.entityModel._isNew) {
			this.rolDefinitionForm.controls["apiRolName"].setValue("");
			this.rolDefinitionForm.controls["menuRolName"].setValue("");

			this.treeControlApi.dataNodes.forEach(apiNode => {
				this.getChecklistSelection(2).deselect(apiNode);
			});

			this.treeControlMenu.dataNodes.forEach(menuNode => {
				this.getChecklistSelection(1).deselect(menuNode);
			});

			this.memberDefService.getUserRoleDef(input.value, this.entityModel.mbrId).subscribe(res => {
				let ApiRoleDef = 0;
				let MenuRoleDef = 0;
				res.result.entUserRoleDef.forEach(element => {
					if (element.ticketType == "A" && ApiRoleDef == 0) {
						ApiRoleDef = element.guid;
						this.rolDefinitionForm.controls["apiRolName"].setValue(element.description);
						res.result.entUserRoleApi.forEach(apiEl => {
							this.treeControlApi.dataNodes.forEach(apiNode => {
								if (apiNode.guid == apiEl.apiGuid) {
									this.menuLeafItemSet(apiNode, apiEl.authenticationLevel, 2);
								}
							});
						});
					}
					else if (element.ticketType == "M" && MenuRoleDef == 0) {
						MenuRoleDef = element.guid;
						this.rolDefinitionForm.controls["menuRolName"].setValue(element.description);
						res.result.entUserRoleMenu.forEach(menuEl => {
							this.treeControlMenu.dataNodes.forEach(menuNode => {
								if (menuNode.guid == menuEl.menuGuid) {
									this.menuLeafItemSet(menuNode, menuEl.authenticationLevel, 1);
								}
							});
						});
					}
				});
			});
		}
	}

	onChangeCityCode(input) {
		if (input.value) {
			this.cfgCityTownDefs = this.townDescriptions.filter(x => x.code.substr(0, 2) == input.value.substr(1, 3));
		}
	}

	onChangeCountryCode(input) {
		this.cfgCityDefs = [];
		this.memberDefinitionForm.controls["cityCode"].setValue('');
		this.cfgCityDefsList.filter(f => f.countryCode == input.value).forEach(element => {
			let item: any = {};
			if (element.code) {
				item.code = element.code;
			}

			item.description = element.code + "~" + element.description;
			this.cfgCityDefs.push(item)
		});
		this.cfgCityTownDefs = [];
	}

	clear(): any {
		const ResponseDto = new MemberDefinitionRequestDto();
		ResponseDto.clear();
		this.entityModel = ResponseDto;
		this.entityModel._isNew = true;
		this.initForm();
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	controlForm(form: FormGroup) {
		if (form.invalid) {
			Object.keys(form.controls).forEach(key => {
				form.get(key).markAsTouched();
			});

			this.hasFormErrors = true;
			this.validationMessage = this.translate.instant('Acquiring.Merchant.PleaseCheckRequiredFields');
			return;
		}
	}

	save() {
		this.hasFormErrors = false;
		let header = this.translate.instant('General.Accept');
		let confirmationMessage = this.entityModel._isNew
			? this.translate.instant('General.Exception.SavingConfirmMessage')
			: this.translate.instant('General.Exception.UpdatingConfirmMessage');
		let pleaseWait = this.translate.instant('General.PleaseWaitWhileProcessing');
		const dialogRef = this.layoutUtilsService.yesNoElement(header, confirmationMessage, pleaseWait);
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				if (this.entityModel._isNew) {
					this.create();
				}
				else {
					this.update();
				}
			}
		});

		this.loading = true;
	}

	update() {
		this.disabledNextButton = true;
		this.memberDefService.updateMemberDef(this.entityModel).subscribe((response: any) => {
			this.saveresult = response;
			this.layoutUtilsService.showNotification(response.message, MessageType.Update, 5000, true, false).afterClosed().subscribe(res => {
				this.router.navigate(['/common/member/cfgMemberDef']);
			})
		}, (error) => {
			this.loading = false;
			this.disabledNextButton = false;
			if (error.message) {
				this.layoutUtilsService.showError(error.message);
			}
			else {
				this.layoutUtilsService.showError(error);
			}
		});
	}

	create() {
		this.disabledNextButton = true;
		this.memberDefService.crateMemberDef(this.entityModel)
			.subscribe((response: any) => {
				this.saveresult = response;
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 5000, true, false).afterClosed().subscribe(res => {
					this.router.navigate(['/common/member/cfgMemberDef']);
				})
			}, (error) => {
				this.disabledNextButton = false;
				this.loading = false;
				if (error.message) {
					this.layoutUtilsService.showError(error.message);
				}
				else {
					this.layoutUtilsService.showError(error);
				}
			});
	}

	getTreeControl(mode: number) {
		return mode == 1 ? this.treeControlMenu : this.treeControlApi;
	}

	getDataChange(mode: number) {
		return mode == 1 ? this.dataChangeMenu : this.dataChangeApi;
	}

	getTreeFlattener(mode: number) {
		return mode == 1 ? this.treeFlattenerMenu : this.treeFlattenerApi;
	}

	getTreeDataSource(mode: number) {
		return mode == 1 ? this.dataSourceMenu : this.dataSourceApi;
	}

	getChecklistSelection(mode: number) {
		return mode == 1 ? this.checklistSelectionMenu : this.checklistSelectionApi;
	}

	getChecklistIndeterminateSelection(mode: number) {
		return mode == 1 ? this.checklistIndeterminateSelectionMenu : this.checklistIndeterminateSelectionApi;
	}

	descendantsAllSelected(node: MenuMemberItemFlatNode, mode: number): boolean {
		const descendants = this.getTreeControl(mode).getDescendants(node);
		const descAllSelected = descendants.every(child =>
			this.getChecklistSelection(mode).isSelected(child)
		);
		return descAllSelected;
	}

	descendantsPartiallySelected(node: MenuMemberItemFlatNode, mode: number): boolean {
		const descendants = this.getTreeControl(mode).getDescendants(node);
		const result = descendants.some(child => this.getChecklistSelection(mode).isSelected(child));
		return result && !this.descendantsAllSelected(node, mode);
	}

	menuItemSelectionToggle(node: MenuMemberItemFlatNode, mode: number): void {
		this.getChecklistSelection(mode).toggle(node);
		const descendants = this.getTreeControl(mode).getDescendants(node);

		if (this.getChecklistSelection(mode).isSelected(node)) {
			this.getChecklistSelection(mode).select(...descendants);
		}
		else {
			this.getChecklistSelection(mode).deselect(...descendants); {
				this.getChecklistIndeterminateSelection(mode).deselect(...descendants);
			}
		}

		descendants.every(child =>
			this.getChecklistSelection(mode).isSelected(child)
		);
		this.checkAllParentsSelection(node, mode);
	}

	menuLeafItemSelectionToggle(node: MenuMemberItemFlatNode, mode: number): void {
		if (this.getChecklistSelection(mode).isSelected(node) && !this.getChecklistIndeterminateSelection(mode).isSelected(node)) {
			this.getChecklistSelection(mode).select(node);
			this.getChecklistIndeterminateSelection(mode).select(node);
		}
		else if (this.getChecklistSelection(mode).isSelected(node) && this.getChecklistIndeterminateSelection(mode).isSelected(node)) {
			this.getChecklistSelection(mode).deselect(node);
			this.getChecklistIndeterminateSelection(mode).deselect(node)
		}
		else if (!this.getChecklistSelection(mode).isSelected(node) && !this.getChecklistIndeterminateSelection(mode).isSelected(node)) {
			this.getChecklistSelection(mode).select(node);
			this.getChecklistIndeterminateSelection(mode).deselect(node)
		}
		this.checkAllParentsSelection(node, mode);
	}

	menuLeafItemSet(node: MenuMemberItemFlatNode, authenticationLevel: number, mode: number): void {
		if (authenticationLevel == 1) {
			this.getChecklistSelection(mode).select(node);
			this.getChecklistIndeterminateSelection(mode).select(node);
		}
		else if (authenticationLevel == 2) {
			this.getChecklistSelection(mode).toggle(node);
		}
		this.checkAllParentsSelection(node, mode);
	}

	checkAllParentsSelection(node: MenuMemberItemFlatNode, mode: number): void {
		let parent: MenuMemberItemFlatNode | null = this.getParentNode(node, mode);
		while (parent) {
			this.checkRootNodeSelection(parent, mode);
			parent = this.getParentNode(parent, mode);
		}
	}

	getParentNode(node: MenuMemberItemFlatNode, mode: number): MenuMemberItemFlatNode | null {
		const currentLevel = this.getLevel(node);

		if (currentLevel < 1) {
			return null;
		}

		const startIndex = this.getTreeControl(mode).dataNodes.indexOf(node) - 1;
		for (let i = startIndex; i >= 0; i--) {
			const currentNode = this.getTreeControl(mode).dataNodes[i];

			if (this.getLevel(currentNode) < currentLevel) {
				return currentNode;
			}
		}
		return null;
	}

	checkRootNodeSelection(node: MenuMemberItemFlatNode, mode: number): void {
		const nodeSelected = this.getChecklistSelection(mode).isSelected(node);
		const descendants = this.getTreeControl(mode).getDescendants(node);
		const descAllSelected = descendants.every(child =>
			this.getChecklistSelection(mode).isSelected(child)
		);
		if (nodeSelected && !descAllSelected) {
			this.getChecklistSelection(mode).deselect(node);
		} else if (!nodeSelected && descAllSelected) {
			this.getChecklistSelection(mode).select(node);
		}
	}

	maskNoDecimal = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
	});

	onChangeLoopSelection() {
		this.isChangeLoopSelection = true;
		this.entityModel.loopSelection = this.loopSelectionForm.get("loopSelection").value;
	}

	getLookUpList(value) {
		const findIndex = this.lookUpValueList.findIndex(f => f.code == value);
		if (findIndex >= 0) {
			return this.lookUpValueList[findIndex].data;
		}

		return [];
	}

	getObjectKey(objectList: any[]) {
		Object.keys(objectList).forEach(resultKey => {
			if (objectList[resultKey]) {
				if ((typeof objectList[resultKey]) === 'string') {
					this.addTranslateKey(resultKey, objectList[resultKey]);
				}
				else {
					this.getObjectKey(objectList[resultKey]);
				}
			}
		});
	}

	addTranslateKey(key, value) {
		const findIndex = this.translactionObjectList.findIndex(f => f.key.toLowerCase() === key.toLowerCase());
		if (findIndex < 0) {
			this.translactionObjectList.push({ key: key.toLowerCase(), value: value });
		}
		else {
			if (this.translactionObjectList[findIndex].value.length > value.length) {
				this.translactionObjectList[findIndex].value = value;
			}
		}
	}
}

enum MenuToogleList {
	memberDefinitionToogle = 0,
	loopSelectionToogle = 1,
	moduleSelectionToogle = 2,
	issuingSelectionToogle = 3,
	acquiringSelectionToogle = 4,
	memberDefaultToogle = 5,
	rolDefinifitonToogle = 6,
}
