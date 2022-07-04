import { EntUserRoleDefModel } from "@common/authority/entUserRoleDef.model";
import { EntUserRoleApiModel } from "@common/authority/entUserRoleApi.model";
import { EntUserRoleMenuModel } from "@common/authority/entUserRoleMenu.model";
import { BaseModel } from "@core/_base/crud/models/_base.model";

export class UserRoleDefinitionResponseDto extends BaseModel {
	entUserRoleDef: EntUserRoleDefModel[] = [];
	entUserRoleApi: EntUserRoleApiModel[] = [];
	entUserRoleMenu: EntUserRoleMenuModel[] = [];

	clear() {
		this.entUserRoleDef = [];
		this.entUserRoleApi = [];
		this.entUserRoleMenu = [];
	}
}
