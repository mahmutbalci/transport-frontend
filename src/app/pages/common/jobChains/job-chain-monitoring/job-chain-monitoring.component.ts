import { Component, OnInit, ElementRef, ViewChild, HostListener, Inject } from '@angular/core';
import { mxgraph } from 'mxgraph';
import { BtcJobChainDefService } from '@common/framework/btcJobChainDef.service';
import { BtcJobChainDefModel } from '@common/btcJobChains/BtcJobChainDef.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { JobChainTriggerDefComponent } from '../job-chain-trigger-def/job-chain-trigger-def.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { JobChainFlowDefComponent } from '../job-chain-flow-def/job-chain-flow-def.component';
import { BtcJobChainTriggerStatModel } from '@common/btcJobChains/btcJobChainTriggerStat.model';
import { BtcJobChainTriggerStatService } from '@common/framework/btcJobChainTriggerStat.service';
import { isNullOrUndefined } from 'util';
import { Subscription, Subject, interval } from 'rxjs';
import { BtcJobChainService } from '@common/framework/btcJobChain.service';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { JobExecutionHistoryComponent } from '../job-execution-history/job-execution-history.component';
import { switchMap, takeUntil } from 'rxjs/operators';
import { BtcJobChainTriggerModel } from '@common/btcJobChains/btcJobChainTrigger.model';
import { JobProcessErrorPoolComponent } from '../job-process-error-pool/job-process-error-pool.component';
import * as moment from 'moment';
import { DOCUMENT } from '@angular/common';

declare var require: any;

const mx = require('mxgraph')({
	mxImageBasePath: './../../../../../assets/mxgraph/images',
	mxBasePath: '../../../../../../assets/mxgraph'
});

@Component({
	selector: 'm-job-chain-monitoring',
	templateUrl: './job-chain-monitoring.component.html'
})
export class JobChainMonitoringComponent implements OnInit {
	succesMessage = this.translate.instant('General.Success');
	displayedColumnsDetail = ['guid', 'description'];

	@ViewChild('graphContainer') graphContainer: ElementRef;
	isDisabled: boolean = false;

	chainInfo: BtcJobChainDefModel = new BtcJobChainDefModel();
	trigerStats: BtcJobChainTriggerStatModel[] = [];

	triggerDialogRef: MatDialogRef<JobChainTriggerDefComponent>;
	flowDialogRef: MatDialogRef<JobChainFlowDefComponent>;

	executionHistoryDialogRef: MatDialogRef<JobExecutionHistoryComponent>;
	processErrorPoolDialogRef: MatDialogRef<JobProcessErrorPoolComponent>;

	graph: any;

	subscription = new Subscription();
	subject: Subject<boolean> = new Subject<boolean>();
	interval: number = 5000;
	searchGuid: number = null;
	eodDate: Date = null;
	tree: any[] = [];

	chainList: any[] = [];

	handledCount: number = 0;
	skippedCount: number = 0;
	pausedCount: number = 0;
	workingCount: number = 0;
	errorCount: number = 0;
	finishedCount: number = 0;
	totalTriggerCount: number = 0;
	waitingTriggerCount: number = 0;

	handledDetail: any[] = [];
	skippedDetail: any[] = [];
	pausedDetail: any[] = [];
	workingDetail: any[] = [];
	errorDetail: any[] = [];
	finishedDetail: any[] = [];
	totalTriggerDetail: any[] = [];
	waitingTriggerDetail: any[] = [];

	isHorizontal: boolean = false;

	internalTemp: any;
	currentRouteUrl: string = '';
	isOpenOnDefinition: boolean = false;
	definitionGuid: number = 0;

	@HostListener('window:click', ['$event'])
	documentClick(event: MouseEvent) {
		if (!isNullOrUndefined(this.graph)) {
			this.graph.popupMenuHandler.hideMenu();
		}
	}

	constructor(private activatedRoute: ActivatedRoute,
		public dialog: MatDialog,
		private router: Router,
		private btcJobChainService: BtcJobChainService,
		private btcJobChainDefService: BtcJobChainDefService,
		private btcJobChainTriggerStatService: BtcJobChainTriggerStatService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		@Inject(DOCUMENT) private document: Document) { }

	ngOnInit() {
		this.btcJobChainDefService.api.getLookup('BtcJobChainDef').then(res => {
			this.chainList = _.orderBy(res, 'code');
			const dynSub = this.activatedRoute.queryParams.subscribe(params => {
				this.definitionGuid = params.guid;
				this.isDisabled = (params.type === 'show');
				if (this.definitionGuid && this.definitionGuid != null) {
					this.isOpenOnDefinition = true;
					this.getTriggerStatsOnInit(this.definitionGuid);
				}
				else if (this.chainList.length > 0) {
					this.isOpenOnDefinition = false;
					this.chainInfo.guid = this.chainList[0].code;
					this.get();
				}
			});
			dynSub.unsubscribe();
		});

		this.currentRouteUrl = this.document.location.hash.replace('#', '').toLowerCase();
	}

	ngOnDestroy() {
		this.subject.next(false);
		this.subject.unsubscribe();
		this.subscription.unsubscribe();
		if (!isNullOrUndefined(this.graph)) {
			this.graph.popupMenuHandler.hideMenu();
		}
	}

	directionChange(checked) {
		this.buildTree();
	}

	goBack() {
		let _backUrl = '/common/jobChains/jobChainDef';
		this.router.navigateByUrl(_backUrl);
	}

	refresh() {
		if (this.isOpenOnDefinition) {
			this.getTriggerStatsOnInit(this.definitionGuid);
		} else {
			this.get();
		}
	}

	get() {
		this.subject.next(false);
		this.subscription.unsubscribe();
		this.getChainInfo(this.chainInfo.guid);
	}

	getTriggerStatsOnInit(chainGuid) {
		this.btcJobChainTriggerStatService.getTriggerStat(chainGuid).subscribe((res) => {
			this.trigerStats = res.data.triggerStats;
			this.getChainInfo(chainGuid);
		});
	}

	getChainInfo(chainGuid) {
		this.chainInfo = new BtcJobChainDefModel();
		this.chainInfo._isNew = false;
		this.btcJobChainDefService.get(chainGuid).subscribe((res: any) => {
			this.chainInfo = res.data;
			this.btcJobChainTriggerStatService.getTriggerStat(chainGuid).subscribe(statRes => {
				this.buildTree();
				this.setTriggerStats(statRes);
				this.getTriggerStats(chainGuid);
			},
				(error) => {
					this.layoutUtilsService.showError(error);
				});
		},
			(error) => {
				this.layoutUtilsService.showError(error);
			});
	}

	getTriggerStats(chainGuid) {
		if (this.interval < 2000) {
			this.layoutUtilsService.showNotification(this.translate.instant('System.JobChain.MinInterval'));
			this.interval = 2000;
		}
		const intervalEx = interval(this.interval)
			.pipe(switchMap(() => {
				if (this.currentRouteUrl.startsWith(this.document.location.hash.replace('#', '').toLowerCase())) {
					this.internalTemp = this.btcJobChainTriggerStatService.getTriggerStat(chainGuid);
				}
				else {
					this.internalTemp = [];
				}

				return this.internalTemp;
			}),
				takeUntil(this.subject)
			);
		this.subscription = intervalEx.subscribe((res: any) => {
			this.setTriggerStats(res);
		}, (error) => {
			this.subject.next(true);
			this.layoutUtilsService.showError(error);
		});
	}

	setTriggerStats(res) {
		this.eodDate = res.data.eodDate;
		this.trigerStats = res.data.triggerStats;
		this.graph.refresh();
		this.handledCount = this.trigerStats.filter(x => x.stat === 'H').length;
		this.skippedCount = this.trigerStats.filter(x => x.stat === 'S').length;
		this.pausedCount = this.trigerStats.filter(x => x.stat === 'P').length;
		this.workingCount = this.trigerStats.filter(x => x.stat === 'W').length;
		this.errorCount = this.trigerStats.filter(x => x.stat === 'E').length;
		this.finishedCount = this.trigerStats.filter(x => x.stat === 'F').length;
		this.totalTriggerCount = this.chainInfo.triggers.length;
		this.waitingTriggerCount = this.totalTriggerCount - this.trigerStats.length;

		this.handledDetail = [];
		this.skippedDetail = [];
		this.pausedDetail = [];
		this.workingDetail = [];
		this.errorDetail = [];
		this.finishedDetail = [];
		this.totalTriggerDetail = [];
		this.waitingTriggerDetail = [];

		this.chainInfo.triggers.forEach(element => {
			let triggerStat = this.trigerStats.find(x => x.triggerGuid === element.guid);
			if (triggerStat) {
				if (triggerStat.stat === 'H') {
					this.handledDetail.push({ guid: element.guid, description: element.description });
				} else if (triggerStat.stat === 'S') {
					this.skippedDetail.push({ guid: element.guid, description: element.description });
				} else if (triggerStat.stat === 'P') {
					this.pausedDetail.push({ guid: element.guid, description: element.description });
				} else if (triggerStat.stat === 'W') {
					this.workingDetail.push({ guid: element.guid, description: element.description });
				} else if (triggerStat.stat === 'E') {
					this.errorDetail.push({ guid: element.guid, description: element.description });
				} else if (triggerStat.stat === 'F') {
					this.finishedDetail.push({ guid: element.guid, description: element.description });
				}
			} else {
				this.waitingTriggerDetail.push({ guid: element.guid, description: element.description });
			}

			this.totalTriggerDetail.push({ guid: element.guid, description: element.description });
		});
	}

	buildTree(): any {
		// Checks if browser is supported
		if (!mx.mxClient.isBrowserSupported()) {
			// Displays an error message if the browser is
			// not supported.
			mx.mxUtils.error(this.translate.instant('System.JobChain.BrowserNotSupported'), 200, false);
		}
		else {
			try {
				this.graphContainer.nativeElement.innerHTML = '';
				var editor = new mx.mxEditor(null);
				editor.setGraphContainer(this.graphContainer.nativeElement);
				this.graph = editor.graph;

				var model = this.graph.getModel();

				this.graph.setResizeContainer(true);
				this.graph.graphHandler.setRemoveCellsFromParent(false);
				this.graph.setConnectable(false);
				this.graph.setAllowDanglingEdges(false);
				this.graph.getView().updateStyle = true;
				this.graph.getSelectionModel().setSingleSelection(true);
				this.graph.setCellsCloneable(false);
				this.graph.panningHandler.ignoreCell = true
				this.graph.container.style.cursor = 'pointer';
				//this.graph.cellEditor.textarea.style.position='absolute';
				// Changes the default vertex style in-place
				var style = this.graph.getStylesheet().getDefaultVertexStyle();
				style[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_SWIMLANE;
				style[mx.mxConstants.STYLE_PERIMETER] = mx.mxPerimeter.RectanglePerimeter;
				style[mx.mxConstants.STYLE_STROKECOLOR] = 'lightgray';
				style[mx.mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
				style[mx.mxConstants.STYLE_SWIMLANE_FILLCOLOR] = '#FFFFFF';
				style[mx.mxConstants.STYLE_FILLCOLOR] = '#fcfcfc';
				style[mx.mxConstants.STYLE_STARTSIZE] = 30;
				style[mx.mxConstants.STYLE_ROUNDED] = false;
				style[mx.mxConstants.STYLE_FONTSIZE] = 12;
				style[mx.mxConstants.STYLE_HORIZONTAL] = false;
				style['shadow'] = 1;
				style['strokeWidth'] = 1;

				style = [];
				style[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RECTANGLE;
				style[mx.mxConstants.STYLE_FONTSIZE] = 10;
				style[mx.mxConstants.STYLE_ROUNDED] = false;
				style[mx.mxConstants.STYLE_HORIZONTAL] = true;
				style[mx.mxConstants.STYLE_VERTICAL_ALIGN] = 'top';
				delete style[mx.mxConstants.STYLE_STARTSIZE];
				style[mx.mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'none';
				style[mx.mxConstants.STYLE_FILLCOLOR] = '#f9f7f7';
				style[mx.mxConstants.STYLE_STROKECOLOR] = 'lightgray';
				style['shadow'] = 1;
				style['strokeWidth'] = 1;
				style['whiteSpace'] = 'wrap';
				this.graph.getStylesheet().putCellStyle('process', style);

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_FILLCOLOR] = '#ffeaea';
				this.graph.getStylesheet().putCellStyle('processError', style);

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_FILLCOLOR] = '#d4fcd5';
				this.graph.getStylesheet().putCellStyle('processFinish', style);

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_FILLCOLOR] = '#ffff8c';
				this.graph.getStylesheet().putCellStyle('processWorking', style);

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_FILLCOLOR] = '#d1eaff';
				this.graph.getStylesheet().putCellStyle('processHandled', style);

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_FILLCOLOR] = '#dedfe0';
				this.graph.getStylesheet().putCellStyle('processSkip', style);

				style = this.graph.getStylesheet().getDefaultEdgeStyle();
				style[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.ElbowConnector;
				style[mx.mxConstants.STYLE_ENDARROW] = mx.mxConstants.ARROW_BLOCK;
				style[mx.mxConstants.STYLE_CURVED] = '1'
				style[mx.mxConstants.STYLE_ROUNDED] = false;
				style[mx.mxConstants.STYLE_FONTCOLOR] = '#5184F3';
				style[mx.mxConstants.STYLE_STROKECOLOR] = '#5184F3';
				style[mx.mxConstants.STYLE_STROKEWIDTH] = '2';

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.EntityRelation;
				style[mx.mxConstants.STYLE_CURVED] = '1'
				style[mx.mxConstants.STYLE_FONTCOLOR] = '#dd6b4d';
				style[mx.mxConstants.STYLE_STROKECOLOR] = '#dd6b4d';
				style[mx.mxConstants.STYLE_STROKEWIDTH] = '3';
				this.graph.getStylesheet().putCellStyle('swimlaneEdge', style);

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.ElbowConnector;
				style[mx.mxConstants.STYLE_CURVED] = '1'
				style[mx.mxConstants.STYLE_FONTCOLOR] = '#bc42f4';
				style[mx.mxConstants.STYLE_STROKECOLOR] = '#bc42f4';
				style[mx.mxConstants.STYLE_STROKEWIDTH] = '2';
				this.graph.getStylesheet().putCellStyle('groupToJobEdge', style);

				// Installs double click on middle control point and
				// changes style of edges between empty and this value
				this.graph.alternateEdgeStyle = 'elbow=vertical';

				// Adds automatic layout and various switches if the
				// graph is enabled
				if (this.graph.isEnabled()) {
					var base = this;

					// lanes into new pools, but disallows dropping
					// cells on edges to split edges
					this.graph.setDropEnabled(false);
					this.graph.setSplitEnabled(false);

					// Adds new method for identifying a pool
					this.graph.isPool = function (cell) {
						var model = this.getModel();
						var parent = model.getParent(cell);

						return parent != null && model.getChildCount(parent) > 0;
					};

					// Changes swimlane orientation while collapsed
					this.graph.model.getStyle = function (cell) {
						var style = mx.mxGraphModel.prototype.getStyle.apply(this, arguments);

						if (model.isVertex(cell)) {
							base.graph.removeCellOverlays(cell);
							if (cell.value.isPause || cell.value.isSkip) {
								let pauseSkipIcon = cell.value.isPause ? './../../../../../assets/mxgraph/images/pause.svg' : './../../../../../assets/mxgraph/images/skip.svg'
								let overlayPauseSkipDesc = cell.value.isPause ? 'Pause' : 'Skip';
								var overlayPauseSkip = new mx.mxCellOverlay(
									new mx.mxImage(pauseSkipIcon, 20, 20), overlayPauseSkipDesc);
								overlayPauseSkip.defaultOverlap = 0;
								if (cell.value.type == 'J') {
									overlayPauseSkip.align = mx.mxConstants.ALIGN_RIGHT;
									overlayPauseSkip.verticalAlign = mx.mxConstants.ALIGN_TOP;
									overlayPauseSkip.offset = new mx.mxPoint(-25, 5);
								}
								else {
									overlayPauseSkip.align = mx.mxConstants.ALIGN_LEFT;
									overlayPauseSkip.verticalAlign = mx.mxConstants.ALIGN_TOP;
									overlayPauseSkip.offset = new mx.mxPoint(35, 5);
								}
								base.graph.addCellOverlay(cell, overlayPauseSkip);
							}
							let stat = base.trigerStats.find(x => x.triggerGuid == cell.value.guid);
							if (!isNullOrUndefined(stat)) {
								if (stat.stat == 'E') {
									var overlay = new mx.mxCellOverlay(
										new mx.mxImage('./../../../../../assets/mxgraph/images/messagebox_warning.png', 40, 40),
										base.translate.instant('System.JobChain.ShowExceptionDetail'));

									overlay.defaultOverlap = 1;
									// Installs a handler for clicks on the overlay
									overlay.addListener(mx.mxEvent.CLICK, function (sender, evt2) {
										base.layoutUtilsService.showError('' + stat.exception);
									});

									// Sets the overlay for the cell in the graph
									base.graph.addCellOverlay(cell, overlay);
									return 'processError';
								}

								if (stat.stat == 'F') {
									return 'processFinish';
								}
								if (stat.stat == 'S') {
									return 'processSkip';
								}
								if (stat.stat == 'H') {
									return 'processHandled';
								}
								if (stat.stat == 'W') {
									return 'processWorking';
								}
							}
						}

						if (base.graph.isCellCollapsed(cell)) {
							if (style != null) {
								style += ';';
							}
							else {
								style = '';
							}

							style += 'horizontal=1;align=center;';
						}

						return style;
					};

					this.graph.addListener(mx.mxEvent.DOUBLE_CLICK, function (sender, evt) {
						var cell = evt.getProperty('cell');
						if (cell != null) {
							if (model.isVertex(cell)) {
								//is cell, open cell edit panel
								let stat = base.trigerStats.find(x => x.triggerGuid == cell.value.guid);
								if (!isNullOrUndefined(stat) && stat.stat == 'E') {
									base.layoutUtilsService.showError('' + stat.exception);
								}
							}
						}
					});

					// Keeps widths on collapse/expand
					var foldingHandler = function (sender, evt) {
						var cells = evt.getProperty('cells');

						for (var i = 0; i < cells.length; i++) {
							var geo = base.graph.model.getGeometry(cells[i]);

							if (geo.alternateBounds != null) {
								geo.width = geo.alternateBounds.width;
							}
						}
					};

					this.graph.addListener(mx.mxEvent.FOLD_CELLS, foldingHandler);

					// Installs a custom tooltip for cells
					this.graph.getTooltipForCell = function (cell) {
						if (cell.edge) {
							let tooltip = base.translate.instant('System.JobChain.SourceTrigger') + ' : ' + cell.source.value.guid.toString() +
								' ' + base.translate.instant('System.JobChain.TargetTrigger') + ' : ' + cell.target.value.guid.toString();
							return tooltip;
						}
						else if (cell.vertex) {
							let text: string;
							let prevGuids: string = '';
							_.orderBy(base.chainInfo.flows.filter(x => x.triggerGuid == cell.value.guid), ['guid']).forEach(item => {
								prevGuids += item.prevTriggerGuid + ',';
							});
							let stat = base.trigerStats.find(x => x.triggerGuid == cell.value.guid);
							if (isNullOrUndefined(stat)) {
								text = 'Trigger Guid   : ' + cell.value.guid + '\n'
									+ 'Description  : ' + cell.value.description + '\n'
									+ 'Parent Trigger  : ' + cell.value.parentTriggerGuid + '\n'
									+ 'Prev Trigger(s) : ' + prevGuids.slice(0, -1) + '\n'
									+ 'Class Name      : ' + cell.value.className + '\n';
							}
							else {
								text = 'Trigger Guid   : ' + cell.value.guid + '\n'
									+ 'Description  : ' + cell.value.description + '\n'
									+ 'Parent Trigger  : ' + cell.value.parentTriggerGuid + '\n'
									+ 'Prev Trigger(s) : ' + prevGuids.slice(0, -1) + '\n'
									+ '----------------------------------- ' + '\n'
									+ 'Start Date Time : ' + stat.startDateTime + '\n'
									+ 'End Date Time   : ' + stat.endDateTime + '\n'
									+ 'Duration		   : ' + (isNullOrUndefined(stat.firedTriggerDetail) ? null : base.millisecondFormat(stat.firedTriggerDetail.duration * 1000)) + '\n'
									+ 'Produced Item Count : ' + (isNullOrUndefined(stat.firedTriggerDetail) ? null : stat.firedTriggerDetail.producedItemCount) + '\n'
									+ 'Processed Count : ' + (isNullOrUndefined(stat.firedTriggerDetail) ? null : stat.firedTriggerDetail.processedCount) + '\n'
									+ 'Error Count	   : ' + (isNullOrUndefined(stat.firedTriggerDetail) ? null : stat.firedTriggerDetail.errorCount) + '\n'
									+ '----------------------------------- ' + '\n'
									+ 'Class Name      : ' + cell.value.className + '\n'
									+ 'Parameters	   : ' + stat.parameters + '\n';
							}
							return text;
						}
						return cell.id.toString();
					}

					// Installs a popupmenu handler using local function (see below).
					this.graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
						if (cell && cell.id != null) {
							if (!model.isEdge(cell)) {
								menu.addItem(base.translate.instant('System.JobChain.SingleRun'), './../../../../../assets/mxgraph/images/process.svg', function () {
									let runAsSingularMessage = base.translate.instant('System.JobChain.RunAsSingular');
									runAsSingularMessage = runAsSingularMessage.replace('{0}', cell.value.guid + ' - ' + cell.value.description);

									const runDialogRef = base.layoutUtilsService.yesNoElement(base.translate.instant('System.JobChain.TriggerRunRequest'),
										runAsSingularMessage,
										base.translate.instant('System.JobChain.JobIsRunning'));
									runDialogRef.afterClosed().subscribe(res => {
										if (res) {
											base.btcJobChainService.scheduleTrigger(cell.value.guid).subscribe(res => {
												base.layoutUtilsService.showActionNotification(base.translate.instant('System.JobChain.JobRunSuccessfully'));
											},
												(error) => {
													base.layoutUtilsService.showError(error);
												});
										}
									});
								});

								menu.addItem(base.translate.instant('System.JobChain.RunWithOrder'), './../../../../../assets/mxgraph/images/processWithOrder.svg', function () {
									let runAsSequentialMessage = base.translate.instant('System.JobChain.RunAsSequential');
									runAsSequentialMessage = runAsSequentialMessage.replace('{0}', cell.value.guid + ' - ' + cell.value.description);

									const runDialogRef = base.layoutUtilsService.yesNoElement(base.translate.instant('System.JobChain.TriggerRunRequest'),
										runAsSequentialMessage,
										base.translate.instant('System.JobChain.JobIsRunning'));
									runDialogRef.afterClosed().subscribe(res => {
										if (res) {
											base.btcJobChainService.scheduleTriggerWithOrder(cell.value.chainGuid, cell.value.guid).subscribe(res => {
												base.layoutUtilsService.showActionNotification(base.translate.instant('System.JobChain.JobRunSuccessfully'));
											},
												(error) => {
													base.layoutUtilsService.showError(error);
												});
										}
									});
								});

								menu.addItem(base.translate.instant('System.JobChain.ViewExecutionHistory'), './../../../../../assets/mxgraph/images/history.svg', function () {
									base.viewExecutionHistory(cell.value.chainGuid, cell.value.guid);
								});

								menu.addItem(base.translate.instant('System.JobChain.ViewProcessErrorPool'), './../../../../../assets/mxgraph/images/error-pool.svg', function () {
									base.viewProcessErrorPool(cell.value.chainGuid, cell.value.guid);
								});

								let triggerStat = base.trigerStats.find(x => x.triggerGuid == cell.value.guid);
								if (!isNullOrUndefined(triggerStat) && (triggerStat.stat == 'E' || triggerStat.stat == 'H')) {
									menu.addItem('Skip One Time', './../../../../../assets/mxgraph/images/forward.svg', function () {
										base.skipOneTime(cell.value.guid);
									});
								}

								if (cell.value.isSkip) {
									menu.addItem('Take On', './../../../../../assets/mxgraph/images/take-on.svg', function () {
										base.takeOn(cell.value);
									});
								}
								else {
									menu.addItem('Take Skip Intruction', './../../../../../assets/mxgraph/images/skip.svg', function () {
										base.skip(cell.value);
									});
								}
								if (cell.value.isPause) {
									menu.addItem('Resume', './../../../../../assets/mxgraph/images/resume.png', function () {
										base.resume(cell.value);
									});
								}
								else {
									menu.addItem('Pause', './../../../../../assets/mxgraph/images/pause.svg', function () {
										base.pause(cell.value);
									});
								}
							}
						}
					};

					this.graph.convertValueToString = function (cell) {
						if (!model.isEdge(cell) && cell.value != null && cell.value.guid != undefined) {
							return cell.value.guid.toString() + '-' + cell.value.description;
						}
						return cell.id;
					}

					// Returns a HTML representation of the cell where the
					// upper half is the first value, lower half is second
					// value
					this.graph.getLabel = function (cell) {
						if ((model.isVertex(cell) && cell.value != null && cell.value.guid != undefined) &&
							(cell.value.type != 'G' || (cell.value.type == 'G' && model.getChildCount(cell) == 0))) {
							let stat = base.trigerStats.find(x => x.triggerGuid == cell.value.guid);

							var table = document.createElement('table');
							table.style.height = '100%';
							table.style.width = '100%';
							table.style.marginTop = '10px';
							var body = document.createElement('tbody');
							var tr1 = document.createElement('tr');
							var tr2 = document.createElement('tr');
							var tr3 = document.createElement('tr');

							var tdIcon = document.createElement('td');
							tdIcon.style.textAlign = 'center';
							tdIcon.style.fontSize = '12px';

							if (!isNullOrUndefined(stat) && (stat.stat == 'E' || stat.stat == 'W')) {
								tdIcon.rowSpan = 2;

								var tdPercentage = document.createElement('td');
								tdPercentage.style.textAlign = 'center';
								tdPercentage.style.fontSize = '10px';
								tdPercentage.style.color = '#000000';
								let percent = (stat.firedTriggerDetail.processedCount + stat.firedTriggerDetail.errorCount) / stat.firedTriggerDetail.producedItemCount * 100;
								mx.mxUtils.write(tdPercentage, '%' + percent.toFixed(2));
								tr3.appendChild(tdPercentage);
							}
							else {
								tdIcon.rowSpan = 3;
							}


							tdIcon.style.width = '30%'
							var i = document.createElement('img');
							i.src = base.getStatusIcon(cell.value.guid, cell.value.type == 'G');
							i.style.width = '30px';
							i.style.height = '30px';
							tdIcon.appendChild(i);

							var tdJobGuid = document.createElement('td');
							tdJobGuid.style.textAlign = 'left';
							tdJobGuid.style.fontSize = '12px';
							tdJobGuid.style.color = '#000000';
							mx.mxUtils.write(tdJobGuid, cell.value.guid);


							var td2 = document.createElement('td');
							td2.style.textAlign = 'left';
							td2.style.fontSize = '10px';
							td2.style.color = 'gray';
							td2.style.paddingBottom = '5px';

							if (cell.value.description.length > 40) {
								mx.mxUtils.write(td2, cell.value.description.substring(0, 40) + '...');
							}
							else {
								mx.mxUtils.write(td2, cell.value.description);
							}

							var td3 = document.createElement('td');
							td3.style.borderTop = '1px solid';
							td3.style.paddingTop = '5px';
							td3.style.textAlign = 'left';
							td3.style.fontSize = '12px';
							td3.style.color = 'gray';

							mx.mxUtils.write(td3, cell.value.workGroup);

							tr1.appendChild(tdIcon);
							tr1.appendChild(tdJobGuid);
							tr2.appendChild(td2);
							tr3.appendChild(td3);
							body.appendChild(tr1);
							body.appendChild(tr2);
							body.appendChild(tr3);
							table.appendChild(body);

							return table;
						}
					};
				}

				const parent = this.graph.getDefaultParent();

				let direction;
				if (this.isHorizontal) {
					direction = mx.mxConstants.DIRECTION_WEST;
				}
				else {
					direction = mx.mxConstants.DIRECTION_NORTH;
				}

				let hierarchicalLayout = new mx.mxHierarchicalLayout(this.graph, direction);
				hierarchicalLayout.intraCellSpacing = 20;
				hierarchicalLayout.interRankCellSpacing = 40;
				hierarchicalLayout.resizeParent = true;
				hierarchicalLayout.moveParent = true;
				hierarchicalLayout.parentBorder = 30;
				// Keeps the lanes and pools stacked
				var layoutMgr = new mx.mxLayoutManager(this.graph);

				layoutMgr.getLayout = function (cell) {
					return hierarchicalLayout;
				};

				model.beginUpdate();

				base.tree = [];

				this.chainInfo.triggers.forEach(job => {
					base.tree[job.guid] = this.graph.insertVertex(parent, job.guid, job, 0, 0, 200, 90, 'process');
				});

				this.chainInfo.flows.filter(x => x.prevTriggerGuid != null).forEach(flow => {
					if (base.tree[flow.prevTriggerGuid].value.type == 'G' && base.tree[flow.triggerGuid].value.type == 'G') {
						this.graph.insertEdge(parent, flow.guid, flow, base.tree[flow.prevTriggerGuid], base.tree[flow.triggerGuid], 'swimlaneEdge');
					}
					else if (base.tree[flow.prevTriggerGuid].value.type == 'G' && base.tree[flow.triggerGuid].value.type != 'G'
						|| base.tree[flow.prevTriggerGuid].value.type != 'G' && base.tree[flow.triggerGuid].value.type == 'G') {
						this.graph.insertEdge(parent, flow.guid, flow, base.tree[flow.prevTriggerGuid], base.tree[flow.triggerGuid], 'groupToJobEdge');
					}
					else {
						this.graph.insertEdge(parent, flow.guid, flow, base.tree[flow.prevTriggerGuid], base.tree[flow.triggerGuid]);
					}
				});
			} finally {
				model.endUpdate();
				if (this.chainInfo.flows.length > 0) {
					let startTrigger = this.chainInfo.flows.filter(x => x.prevTriggerGuid == null)[0].triggerGuid;
					this.moveCellToStartPoint(this.tree[startTrigger]);
				}
			}
		}
	}

	searchCell() {
		if (!isNullOrUndefined(this.searchGuid) && this.searchGuid > 0) {
			this.moveCellToStartPoint(this.tree[this.searchGuid]);
		}
	}

	moveCellToStartPoint(cell: mxgraph.mxCell) {
		let cellBounds = cell.getGeometry();
		this.graph.setSelectionCell(cell);
		this.graph.view.setTranslate(-cellBounds.x, -cellBounds.y);
	}

	viewExecutionHistory(chainGuid: any, triggerGuid: any) {
		this.executionHistoryDialogRef = this.dialog.open(JobExecutionHistoryComponent, {
			data: {
				chainGuid: chainGuid,
				triggerGuid: triggerGuid
			}
		});
	}

	viewProcessErrorPool(chainGuid: any, triggerGuid: any) {
		this.processErrorPoolDialogRef = this.dialog.open(JobProcessErrorPoolComponent, {
			data: {
				chainGuid: chainGuid,
				triggerGuid: triggerGuid
			}
		});
	}

	millisecondFormat(ms: any) {
		var date = moment.utc(ms);
		return date.format('HH:mm:ss:SSS');
	}

	getStatusIcon(triggerGuid, isGroup): string {
		if (triggerGuid == 'Start') {
			return './../../../../../assets/mxgraph/images/start.svg';
		}

		let processingIcon = './../../../../../assets/mxgraph/images/processing.gif';
		let skipIcon = './../../../../../assets/mxgraph/images/skip.svg';
		let pauseIcon = './../../../../../assets/mxgraph/images/pause.svg';
		let handledIcon = './../../../../../assets/mxgraph/images/sandclock.svg';
		let finishIcon = './../../../../../assets/mxgraph/images/checked.svg';
		let errorIcon = './../../../../../assets/mxgraph/images/error.svg';
		let defaultIcon = './../../../../../assets/icon-pack/Cloud TPU.svg';
		let defaultGroupIcon = './../../../../../assets/icon-pack/Dialogflow Enterprise Edition.svg';
		let stat = this.trigerStats.find(x => x.triggerGuid == triggerGuid);

		if (!isNullOrUndefined(stat)) {
			if (stat.stat === 'S') {
				return skipIcon;
			} else if (stat.stat === 'H') {
				return handledIcon;
			} else if (stat.stat === 'E') {
				return errorIcon;
			} else if (stat.stat === 'W') {
				return processingIcon;
			} else if (stat.stat === 'F') {
				return finishIcon;
			} else if (stat.stat === 'P') {
				return pauseIcon;
			}
		} else if (isGroup) {
			return defaultGroupIcon;
		}

		return defaultIcon;
	}

	skip(trigger: BtcJobChainTriggerModel) {
		trigger.isSkip = true;
		trigger.isPause = false;
		this.btcJobChainDefService.updateTrigger(trigger).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 10000, true, false);
			let updatedTrigger = this.chainInfo.triggers.find(x => x.guid === trigger.guid);
			updatedTrigger.isSkip = true;
			updatedTrigger.isPause = false;
			this.graph.refresh();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	skipOneTime(triggerGuid: number) {
		const _title: string = this.translate.instant('General.Confirmation');
		const _description: string = this.translate.instant('System.JobChain.AreYouSureSkipOneTime');
		const _waitDesciption: string = this.translate.instant('System.JobChain.TriggerStatUpdating');

		const dialogRef = this.layoutUtilsService.yesNoElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.btcJobChainTriggerStatService.skipTriggerOneTime(this.chainInfo.guid, triggerGuid).subscribe(() => {
				this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 10000, true, false);
				let updatedTrigger = this.trigerStats.find(x => x.triggerGuid === triggerGuid);
				updatedTrigger.stat = 'F';
				this.graph.refresh();
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
		});
	}

	takeOn(trigger: BtcJobChainTriggerModel) {
		trigger.isSkip = false;
		this.btcJobChainDefService.updateTrigger(trigger).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 10000, true, false);
			let updatedTrigger = this.chainInfo.triggers.find(x => x.guid === trigger.guid);
			updatedTrigger.isSkip = false;
			this.graph.refresh();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	pause(trigger: BtcJobChainTriggerModel) {
		trigger.isSkip = false;
		trigger.isPause = true;
		this.btcJobChainDefService.updateTrigger(trigger).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 10000, true, false);
			let updatedTrigger = this.chainInfo.triggers.find(x => x.guid === trigger.guid);
			updatedTrigger.isSkip = false;
			updatedTrigger.isPause = true;
			this.graph.refresh();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	resume(trigger: BtcJobChainTriggerModel) {
		trigger.isPause = false;
		this.btcJobChainDefService.updateTrigger(trigger).subscribe(() => {
			this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Create, 10000, true, false);
			let updatedTrigger = this.chainInfo.triggers.find(x => x.guid === trigger.guid);
			updatedTrigger.isPause = false;
			this.graph.refresh();
		}, (error) => {
			this.layoutUtilsService.showError(error);
		});
	}

	onSelectedChainChanged(event) {
		//chainInfo.chainGuid changed by ngModel
		this.get();
	}
}
