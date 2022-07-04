import { BaseModel } from "@core/_base/crud/models/_base.model";
import { CfgExpressionConfigDefModel } from "./cfgExpressionConfigDef.model";

export class CfgExpressionCriteriaDefModel extends BaseModel {
	guid: number = 0;
	lastUpdated: number = 1;
	propertyName: string = null;
	labelText: string = null;
	operatorType: string = null;
	lookupEntity: string = null;
	configDefs: CfgExpressionConfigDefModel[] = [];
}
