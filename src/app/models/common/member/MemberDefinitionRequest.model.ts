import { EntMenuTreeModel } from '@common/authority/entMenuTree.model';
import { EntUserRoleMenuModel } from '@common/authority/entUserRoleMenu.model';
import { EntUserRoleApiModel } from '@common/authority/entUserRoleApi.model';
import { BaseModel } from '@core/_base/crud/models/_base.model';

export class MemberDefinitionRequestDto extends BaseModel {
	mbrId: number = 0;
	lastUpdated: number = 1;
	description: string = '';
	languageCode: string = '';
	mbrCurrency: number = 949;
	taxNo: string = '';
	installationDate: Date = null;
	address1: string = '';
	address2: string = '';
	countryCode: string = '';
	cityCode: string = '';
	town: string = '';
	postalCode: string = '';
	isAdmin: boolean = false;
	eftCode: string = '';
	faxNumber: string = '';
	isoCountryCode: string = '';

	referanceMbrId: number = 0;
	issuingApi: boolean = false;
	acquiringApi: boolean = false;
	clearingApi: boolean = false;
	fraudApi: boolean = false;

	userCode: string = '';
	menuRolName: string = '';
	apiRolName: string = '';

	loopSelection: boolean = false;
	loopSelectionValue: string[] = [];
	issuingSelectionValue: string[] = [];
	acquiringSelectionValue: string[] = [];

	menuDefinition: EntMenuTreeModel[] = [];
	userRoleMenu: EntUserRoleMenuModel[] = [];
	userRoleApi: EntUserRoleApiModel[] = [];

	clear() {
		this.mbrId = 101;
		this.lastUpdated = 1;
		this.description = '';
		this.languageCode = '';
		this.mbrCurrency = 1;
		this.taxNo = '';
		this.installationDate = null;
		this.address1 = '';
		this.address2 = '';
		this.countryCode = '';
		this.cityCode = '';
		this.town = '';
		this.postalCode = '';
		this.isAdmin = false;
		this.eftCode = '';
		this.faxNumber = '';
		this.isoCountryCode = '';

		this.referanceMbrId = 0;
		this.issuingApi = false;
		this.acquiringApi = false;
		this.clearingApi = false;
		this.fraudApi = false;

		this.userCode = '';
		this.menuRolName = '';
		this.apiRolName = '';

		this.loopSelection = false;
		this.loopSelectionValue = [];
		this.issuingSelectionValue = [];
		this.acquiringSelectionValue = [];

		this.menuDefinition = [];
		this.userRoleMenu = [];
		this.userRoleApi = [];
	}
}
