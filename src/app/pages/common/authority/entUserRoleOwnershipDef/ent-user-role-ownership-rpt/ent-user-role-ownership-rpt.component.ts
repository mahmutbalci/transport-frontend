import { Component, OnInit, NgZone } from '@angular/core';
import { ExcelExportService } from '@core/_base/layout/services/excel-export.service';
import { EntUserRoleDefService } from '@common/authority/entUserRoleDef.service';
import { EntMenuTreeService } from '@common/authority/entMenuTree.service';
import { LayoutUtilsService } from '@core/_base/crud';
import { TranslateService } from '@ngx-translate/core';
import { EntUserRoleDefModel } from '@common/authority/entUserRoleDef.model';
import { EntMenuTreeModel } from '@common/authority/entMenuTree.model';
import * as _ from 'lodash';
import { EntUserService } from '@common/authority/entUser.service';
import { EntUserModel } from '@common/authority/entUser.model';
import { FrameworkApi } from '@services/framework.api';
import { LookupPipe } from 'app/pipes/lookup.pipe';
import { LangParserPipe } from 'app/pipes/lang-parser.pipe';

export class ExportExcelEnt {
	userCode: string;
	roleName: string;
	screenName: string;
	roleType: string;
	employeeId: string;
	userName: string;
	userSurname: string;
	userStat: string;
}

@Component({
	selector: 'ent-user-role-ownership-rpt',
	templateUrl: './ent-user-role-ownership-rpt.component.html'
})

export class EntUserRoleOwnershipRptComponent implements OnInit {
	lookupPipe: LookupPipe = new LookupPipe(new LangParserPipe());
	isLoading: boolean = false;
	isLoaded: boolean = false;
	loadingValue: number = -1;
	disableExportButton: boolean = false;

	userRoleList: any = [];
	entUserStatDefs: any = [];

	entUserRoleDef: EntUserRoleDefModel[] = [];
	entUserDef: EntUserModel[] = [];
	entMenuTree: EntMenuTreeModel[] = [];

	responseExcelService: ExportExcelEnt[] = [];

	gridColumns = [
		{
			userCode: 'General.UserCode',
			employeeId: 'General.EmployeeId',
			userName: 'General.Name',
			userSurname: 'General.Surname',
			userStat: 'General.UserStat',
			roleName: 'General.RoleName',
			screenName: 'General.ScreenName',
			roleType: 'System.Authority.AuthorizationType'
		}
	];

	constructor(
		private excelService: ExcelExportService,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private entUserRoleDefService: EntUserRoleDefService,
		private entMenuTreeService: EntMenuTreeService,
		private entUserService: EntUserService,
		private frameworkApi: FrameworkApi,
		private zone: NgZone
	) {

	}

	ngOnInit() {
		this.updateProgressBar(this.loadingValue);

		this.frameworkApi.getLookups(['EntUserStatDef']).then(res => {
			this.entUserStatDefs = res.find(x => x.name === 'EntUserStatDef').data;
		});
	}

	exportData() {
		try {
			this.excelService.exportAsExcelFile(this.responseExcelService, 'UserRoleOwnershipRpt', this.gridColumns);
			this.updateProgressBar(100);
		} catch (e) {
			this.errorHandler(e);
		}
	}

	exportPrepareData() {
		try {
			let index = 0;
			this.entUserDef.forEach(entUser => {
				index++;
				if (entUser.userRoleOwnerShips && entUser.userRoleOwnerShips.length > 0
					&& entUser.key.institutionId && entUser.key.institutionId.toString() === sessionStorage.getItem('institutionId')) {
					let extUserCode = entUser.key.id;
					let extEmployeeId = entUser.employeeId;
					let extUserName = entUser.name;
					if (entUser.midname) {
						extUserName += ' ' + entUser.midname;
					}
					let extUserSurname = entUser.surname;
					let extUserStat = this.lookupPipe.transform(entUser.userStat, this.entUserStatDefs);

					entUser.userRoleOwnerShips.forEach(entUserRoleOwner => {
						this.entUserRoleDef.forEach(entUserRoleDef => {
							if (entUserRoleDef.guid.toString() === entUserRoleOwner.roleGuid.toString()) {
								let extRoleName = entUserRoleDef.description;
								this.entMenuTree.forEach(menuTree => {
									if (!_.isUndefined(menuTree.routeUrl) && !_.isNull(menuTree.routeUrl)) {
										let extScreenName = this.translate.instant(menuTree.description);
										let extAuthenticationLevel = this.translate.instant('System.Authority.Unauthorized');

										const findMenu = entUserRoleDef.userRoleMenus.find(x => x.menuGuid === menuTree.guid);
										if (findMenu) {
											if (findMenu.authenticationLevel === 1) {
												extAuthenticationLevel = this.translate.instant('System.Authority.ReadOnly');
											} else if (findMenu.authenticationLevel === 2) {
												extAuthenticationLevel = this.translate.instant('System.Authority.Authorized');
											}
										}

										let resp: ExportExcelEnt = new ExportExcelEnt();
										resp.userCode = extUserCode;
										resp.roleName = extRoleName;
										resp.screenName = extScreenName;
										resp.roleType = extAuthenticationLevel;
										resp.employeeId = extEmployeeId;
										resp.userName = extUserName;
										resp.userSurname = extUserSurname;
										resp.userStat = extUserStat;

										this.responseExcelService.push(resp);
									}
								});
							}
						});
					});
				}

				if (index === this.entUserDef.length) {
					this.updateProgressBar(80);
					this.exportData();
				}
			});
		} catch (e) {
			this.errorHandler(e);
		}
	}

	exportLoadData() {
		this.responseExcelService = [];
		this.isLoaded = false;
		this.isLoading = true;
		this.disableExportButton = true;
		this.updateProgressBar(0);
		this.entUserRoleDefService.findAll().subscribe(roleRes => {
			this.entUserRoleDef = roleRes.items;
			this.updateProgressBar(20);
			this.entMenuTreeService.findAll().subscribe(menRes => {
				this.entMenuTree = menRes.items;
				this.updateProgressBar(40);
				this.entUserService.all().subscribe(userRes => {
					this.entUserDef = userRes.result;
					this.updateProgressBar(60);
					this.exportPrepareData();
				}, (error) => {
					this.errorHandler(error);
				});
			}, (error) => {
				this.errorHandler(error);
			});
		}, (error) => {
			this.errorHandler(error);
		});
	}

	errorHandler(error) {
		if (error.message) {
			this.layoutUtilsService.showError(error.message);
		} else {
			this.layoutUtilsService.showError(error);
		}
		this.updateProgressBar(0);
	}

	updateProgressBar(value) {
		this.zone.run(() => {
			if (value === -1) {
				this.isLoaded = false;
				this.isLoading = false;
				this.disableExportButton = false;
			} else if (value === 100) {
				this.isLoaded = true;
				this.isLoading = false;
				this.disableExportButton = false;
			} else {
				this.isLoaded = false;
				this.isLoading = true;
				this.disableExportButton = true;

			}
			this.loadingValue = value;
		});
	}
}
