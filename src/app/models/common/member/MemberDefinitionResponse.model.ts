import { EntMenuTreeModel } from "@common/authority/entMenuTree.model";
import { EntApiDefModel } from "@common/authority/entApiDef.model";
import { BaseModel } from "@core/_base/crud/models/_base.model";
import { EntUserModel } from "@common/authority/entUser.model";

export class MemberDefinitionResponseDto extends BaseModel {
	entMenuTree: EntMenuTreeModel[] = [];
	entUser: EntUserModel[] = [];
	entApiDef: EntApiDefModel[] = [];

	clear() {
		this.entMenuTree = [];
		this.entUser = [];
	}
}
