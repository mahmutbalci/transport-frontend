import { Injectable } from '@angular/core';
import { FrameworkApi } from '@services/framework.api';
import { Observable } from 'rxjs';
import { MemberDefinitionResponseDto } from '@common/member/MemberDefinitionResponse.model';
import { UserRoleDefinitionResponseDto } from '@common/member/UserRoleDefinitionResponse.model';
import { BaseService } from '@core/_base/layout/services/base.service';
import { HttpUtilsService } from '@core/_base/crud/utils/http-utils.service';

@Injectable()
export class MemberDefService extends BaseService {
	public endpoint = 'auth/MemberDefinition';

	constructor(api: FrameworkApi,
		httpUtils: HttpUtilsService) {
		super(api, httpUtils);
	}

	getUserRoleDef(userCode: string, mbrId: number): Observable<any> {
		return this.api.get<UserRoleDefinitionResponseDto>(this.endpoint + '/GetUserRoleDefinition?userCode=' + userCode + '&mbrId=' + mbrId);
	}

	getMemberDef(mbrId: number): Observable<any> {
		return this.api.get<MemberDefinitionResponseDto>(this.endpoint + '/GetMemberDefinition?mbrId=' + mbrId);
	}

	crateMemberDef<MemberDefinitionRequestDto>(entity): Observable<any> {
		return this.api.post<MemberDefinitionRequestDto>(this.endpoint + '/CreateMemberDefinition', entity);
	}

	updateMemberDef<MemberDefinitionRequestDto>(entity): Observable<any> {
		return this.api.put<MemberDefinitionRequestDto>(this.endpoint + '/UpdateMemberDefinition', entity);
	}
}
