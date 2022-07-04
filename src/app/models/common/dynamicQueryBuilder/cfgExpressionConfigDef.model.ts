import { BaseModel } from "@core/_base/crud/models/_base.model";
import { CfgExpressionCriteriaDefModel } from "./cfgExpressionCriteriaDef.model";

export class CfgExpressionConfigDefModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	name: string = null;
	description: string = null;
	criterias: CfgExpressionCriteriaDefModel[] = [];
	configType: number = 0;
}



