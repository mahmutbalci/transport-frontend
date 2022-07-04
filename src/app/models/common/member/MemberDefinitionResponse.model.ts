import { CfgMemberDefaultsModel } from "./cfgMemberDefaults.model";
import { EntMenuTreeModel } from "@common/authority/entMenuTree.model";
import { EntApiDefModel } from "@common/authority/entApiDef.model";
import { CfgMemberDefinitionModel } from "./cfgMemberDefinition.model";
import { BinOnusDefModel } from "@common/cfgbin/binOnusDef.model";
import { BaseModel } from "@core/_base/crud/models/_base.model";
import { EntUserModel } from "@common/authority/entUser.model";

export class MemberDefinitionResponseDto extends BaseModel {
	memberDefinition: CfgMemberDefinitionModel;
	memberDefault: CfgMemberDefaultsModel[] = [];
	entMenuTree: EntMenuTreeModel[] = [];
	entUser: EntUserModel[] = [];
	entApiDef: EntApiDefModel[] = [];
	binOnusDef: BinOnusDefModel[] = [];

	clear() {
		this.memberDefault = [];
		this.entMenuTree = [];
		this.entUser = [];
		this.binOnusDef = [];
	}
}
