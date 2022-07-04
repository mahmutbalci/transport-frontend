import { NgModule } from '@angular/core';

import { OnlBinFinderJarDefService } from './onlBinFinderJarDef.service';
import { OnlBinFinderProfileDefService } from './onlBinFinderProfileDef.service';

import { OnlGateDefService } from './onlGateDef.service';
import { OnlGateDslDefService } from './onlGateDslDef.service';
import { OnlGateSessionDefService } from './onlGateSessionDef.service';
import { OnlGateTypeDefService } from './onlGateTypeDef.service';

import { OnlIsoParserDefService } from './onlIsoParserDef.service';
import { OnlIsoParserFieldDefService } from './onlIsoParserFieldDef.service';
import { OnlIsoParserTypeDefService } from './onlIsoParserTypeDef.service';
import { OnlIsoParserTypeFieldMapService } from './onlIsoParserTypeFieldMap.service';

import { OnlScriptDefService } from './onlScriptDef.service';
import { OnlTxnProfileMethodDefService } from './onlTxnProfileMethodDef.service';
import { OnlTxnProfileMapService } from './onlTxnProfileMap.service';
import { OnlScriptMethodMapService } from './onlScriptMethodMap.service';
import { OnlTxnProfileDefService } from './onlTxnProfileDef.service';
import { OnlTxnMessageService } from './onlTxnMessage.service';
import { OnlTxnMessageAnalysisService } from './onlTxnMessageAnalysis.service'

@NgModule({
	providers: [
		OnlBinFinderJarDefService,
		OnlBinFinderProfileDefService,

		OnlGateDefService,
		OnlGateDslDefService,
		OnlGateTypeDefService,
		OnlGateSessionDefService,

		OnlIsoParserDefService,
		OnlIsoParserFieldDefService,
		OnlIsoParserTypeDefService,
		OnlIsoParserTypeFieldMapService,

		OnlScriptDefService,
		OnlTxnProfileMapService,
		OnlTxnProfileMethodDefService,
		OnlScriptMethodMapService,
		OnlTxnProfileDefService,
		OnlTxnMessageService,
		OnlTxnMessageAnalysisService,
	],
})
export class OnlineTransactionServiceModule { }
