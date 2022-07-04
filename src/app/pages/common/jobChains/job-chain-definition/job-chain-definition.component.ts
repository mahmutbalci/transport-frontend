import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { BtcJobChainDefService } from '@common/framework/btcJobChainDef.service'
import { BtcJobChainDefModel } from '@common/btcJobChains/BtcJobChainDef.model'
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { JobChainTriggerDefComponent } from '../job-chain-trigger-def/job-chain-trigger-def.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { JobChainFlowDefComponent } from '../job-chain-flow-def/job-chain-flow-def.component';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { isNullOrUndefined } from 'util';

declare var require: any;

const mx = require('mxgraph')({
	mxImageBasePath: './../../../../../assets/mxgraph/images',
	mxBasePath: '../../../../../../assets/mxgraph'
});

@Component({
	selector: 'm-job-chain-definition',
	templateUrl: './job-chain-definition.component.html'
})

export class JobChainDefinitionComponent implements OnInit {
	@ViewChild('graphContainer') graphContainer: ElementRef;
	isDisabled: boolean = false;

	chainInfo: BtcJobChainDefModel = new BtcJobChainDefModel();
	jobChainDefForm: FormGroup = new FormGroup({});
	triggerDialogRef: MatDialogRef<JobChainTriggerDefComponent>;
	flowDialogRef: MatDialogRef<JobChainFlowDefComponent>;
	graph: any;
	isHorizontal: boolean = false;

	@HostListener('window:click', ['$event'])
	documentClick(event: MouseEvent) {
		// your click logic
		if (!isNullOrUndefined(this.graph)) {
			this.graph.popupMenuHandler.hideMenu();
		}
	}

	constructor(private activatedRoute: ActivatedRoute,
		public dialog: MatDialog,
		private router: Router,
		private btcJobChainDefService: BtcJobChainDefService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) { }

	ngOnInit() {
		Object.keys(this.chainInfo).forEach(name => {
			this.jobChainDefForm.addControl(name, new FormControl(this.chainInfo[name]));
		});

		const dynSub = this.activatedRoute.queryParams.subscribe(params => {
			const guid = params.guid;
			this.isDisabled = (params.type === 'show');
			if (guid && guid !== null) {
				this.getChainInfo(guid);
			} else {

				this.chainInfo = new BtcJobChainDefModel();
				this.chainInfo._isNew = true;
				this.initForm();
			}
		});
		dynSub.unsubscribe();
	}

	directionChange(checked) {
		this.buildTree();
	}

	getChainInfo(chainGuid) {
		this.chainInfo = new BtcJobChainDefModel();
		this.chainInfo._isNew = false;
		this.btcJobChainDefService.get(chainGuid).subscribe((res: any) => {
			this.chainInfo = res.result;
			this.initForm();
			this.buildTree();
		},
			(error) => {
				this.layoutUtilsService.showError(error);
			});
	}

	initForm() {
		const controls = this.jobChainDefForm.controls;
		Object.keys(this.chainInfo).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.chainInfo[name]);
			}
		});
	}

	onSubmit() {
		if (this.jobChainDefForm.invalid) {
			Object.keys(this.jobChainDefForm.controls).forEach(controlName =>
				this.jobChainDefForm.controls[controlName].markAsTouched()
			);
			return;
		}

		this.chainInfo = <BtcJobChainDefModel>this.jobChainDefForm.value;
		if (this.chainInfo._isNew) {
			this.create();
		} else {
			this.update();
		}
	}

	create() {
		this.btcJobChainDefService.create(this.chainInfo)
			.subscribe((response: any) => {
				this.chainInfo.guid = response.result;

				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 1000, true, false)
					.afterClosed().subscribe(res => {
						this.router.navigate(['/common/jobChains/jobChainDef']);
					});
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
	}

	update() {
		this.btcJobChainDefService.update(this.chainInfo)
			.subscribe((response: any) => {
				this.layoutUtilsService.showNotification(response.message, MessageType.Create, 10000, true, false)
					.afterClosed().subscribe(res => {
						this.router.navigate(['/common/jobChains/jobChainDef']);
					});
			}, (error) => {
				this.layoutUtilsService.showError(error);
			});
	}

	goBack() {
		let _backUrl = '/common/jobChains/jobChainDef';
		this.router.navigateByUrl(_backUrl);
	}

	buildTree(): any {
		// Checks if browser is supported
		if (!mx.mxClient.isBrowserSupported()) {
			// Displays an error message if the browser is
			// not supported.
			mx.mxUtils.error('Browser is not supported!', 200, false);
		} else {
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

				style = this.graph.getStylesheet().getDefaultEdgeStyle();
				style[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.ElbowConnector;
				style[mx.mxConstants.STYLE_ENDARROW] = mx.mxConstants.ARROW_BLOCK;
				style[mx.mxConstants.STYLE_CURVED] = '1';
				style[mx.mxConstants.STYLE_ROUNDED] = false;
				style[mx.mxConstants.STYLE_FONTCOLOR] = '#5184F3';
				style[mx.mxConstants.STYLE_STROKECOLOR] = '#5184F3';
				style[mx.mxConstants.STYLE_STROKEWIDTH] = '2';

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.EntityRelation;
				style[mx.mxConstants.STYLE_CURVED] = '1';
				style[mx.mxConstants.STYLE_FONTCOLOR] = '#dd6b4d';
				style[mx.mxConstants.STYLE_STROKECOLOR] = '#dd6b4d';
				style[mx.mxConstants.STYLE_STROKEWIDTH] = '3';
				this.graph.getStylesheet().putCellStyle('swimlaneEdge', style);

				style = mx.mxUtils.clone(style);
				style[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.ElbowConnector;
				style[mx.mxConstants.STYLE_CURVED] = '1';
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

						return parent != null && model.getChildCount(parent) > 0;//model.getParent(parent) == model.getRoot();
					};

					// Changes swimlane orientation while collapsed
					this.graph.model.getStyle = function (cell) {
						var style = mx.mxGraphModel.prototype.getStyle.apply(this, arguments);

						if (base.graph.isCellCollapsed(cell)) {
							if (style != null) {
								style += ';';
							} else {
								style = '';
							}

							style += 'horizontal=1;align=left;spacingLeft=14;';
						}

						return style;
					};

					// Keeps widths on collapse/expand					
					var foldingHandler = function (sender, evt) {
						var cells = evt.getProperty('cells');

						for (var i = 0; i < cells.length; i++) {
							var geo = base.graph.model.getGeometry(cells[i]);

							if (geo.alternateBounds != null) {
								{
									geo.width = geo.alternateBounds.width;
								}
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
						} else if (cell.vertex) {
							let text: string;
							let prevGuids: string = '';

							_.orderBy(base.chainInfo.flows.filter(x => x.triggerGuid == cell.value.guid), ['guid']).forEach(item => {
								prevGuids += item.prevTriggerGuid + ',';
							});

							text = 'Trigger Guid   : ' + cell.value.guid + '\n'
								+ 'Description  : ' + cell.value.description + '\n'
								+ 'Parent Trigger  : ' + cell.value.parentTriggerGuid + '\n'
								+ 'Prev Trigger(s) : ' + prevGuids.slice(0, -1) + '\n'
								+ 'Class Name      : ' + cell.value.className + '\n'
								+ 'Max Error Count : ' + cell.value.maxErrorCount + '\n'
								+ 'Is Pause        : ' + cell.value.isPause + '\n'
								+ 'Is Skip         : ' + cell.value.isSkip;

							return text;
						}
						return cell.id.toString();
					}

					// Installs a popupmenu handler using local function (see below).					
					this.graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
						if (cell && cell.id != null) {
							if (!model.isEdge(cell)) {
								menu.addItem(base.translate.instant('System.JobChain.CreateFlow'), './../../../../../assets/mxgraph/images/connection.svg', function () {
									base.createFlow(cell.value.guid);
								});
							}
							menu.addItem(base.translate.instant('General.Edit'), './../../../../../assets/mxgraph/images/edit.svg', function () {
								if (model.isEdge(cell)) {
									base.editFlow(cell.value.guid);
								} else {
									base.editTrigger(cell.value.guid);
								}
							});
							menu.addItem(base.translate.instant('General.Delete'), './../../../../../assets/mxgraph/images/delete.svg', function () {
								base.delete(base.graph, model, cell);
							});
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
							var table = document.createElement('table');
							table.style.height = '100%';
							table.style.width = '100%';
							table.style.marginTop = '10px';
							var body = document.createElement('tbody');
							var tr1 = document.createElement('tr');
							var tdIcon = document.createElement('td');
							tdIcon.style.textAlign = 'center';
							tdIcon.style.fontSize = '12px';
							tdIcon.rowSpan = 3;
							tdIcon.style.width = '30%'
							var i = document.createElement('img');

							if (cell.value.type == 'G') {
								i.src = './../../../../../assets/icon-pack/Dialogflow Enterprise Edition.svg';
							} else {
								i.src = './../../../../../assets/icon-pack/Cloud TPU.svg';
							}

							i.style.width = '30px';
							i.style.height = '30px';
							tdIcon.appendChild(i);


							var tdJobGuid = document.createElement('td');
							tdJobGuid.style.textAlign = 'left';
							tdJobGuid.style.fontSize = '12px';
							tdJobGuid.style.color = '#000000';
							mx.mxUtils.write(tdJobGuid, cell.value.guid);

							var tr2 = document.createElement('tr');
							var td2 = document.createElement('td');
							td2.style.textAlign = 'left';
							td2.style.fontSize = '10px';
							td2.style.color = 'gray';
							td2.style.paddingBottom = '5px';

							if (cell.value.description.length > 40) {
								mx.mxUtils.write(td2, cell.value.description.substring(0, 40) + '...');
							} else {
								mx.mxUtils.write(td2, cell.value.description);
							}

							var tr3 = document.createElement('tr');
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
				} else {
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

				var tree: any[] = [];

				this.chainInfo.triggers.forEach(job => {
					tree[job.guid] = this.graph.insertVertex(parent, job.guid, job, 0, 0, 200, 90, 'process');
				});

				this.chainInfo.flows.filter(x => x.prevTriggerGuid != null).forEach(flow => {
					if (tree[flow.prevTriggerGuid].value.type == 'G' && tree[flow.triggerGuid].value.type == 'G') {
						this.graph.insertEdge(parent, flow.guid, flow, tree[flow.prevTriggerGuid], tree[flow.triggerGuid], 'swimlaneEdge');
					} else if (tree[flow.prevTriggerGuid].value.type == 'G' && tree[flow.triggerGuid].value.type != 'G'
						|| tree[flow.prevTriggerGuid].value.type != 'G' && tree[flow.triggerGuid].value.type == 'G') {
						this.graph.insertEdge(parent, flow.guid, flow, tree[flow.prevTriggerGuid], tree[flow.triggerGuid], 'groupToJobEdge');
					} else {
						this.graph.insertEdge(parent, flow.guid, flow, tree[flow.prevTriggerGuid], tree[flow.triggerGuid]);
					}
				});
			} finally {
				model.endUpdate();
			}
		}
	}

	createTrigger() {
		this.triggerDialogRef = this.dialog.open(JobChainTriggerDefComponent, {
			data: {
				chainGuid: this.chainInfo.guid,
				triggerGuid: null
			}
		});

		const subTrigger = this.triggerDialogRef.componentInstance.saveEmitter.subscribe(result => {
			this.getChainInfo(this.chainInfo.guid);
		});
	}

	createFlow(targetGuid) {
		this.flowDialogRef = this.dialog.open(JobChainFlowDefComponent, {
			data: {
				chainGuid: this.chainInfo.guid,
				flowGuid: null,
				targetTriggerGuid: targetGuid
			}
		});

		const subFlow = this.flowDialogRef.componentInstance.saveEmitter.subscribe(result => {
			this.getChainInfo(this.chainInfo.guid);
		});
	}

	editTrigger(triggerGuid) {
		this.triggerDialogRef = this.dialog.open(JobChainTriggerDefComponent, {
			data: {
				chainGuid: this.chainInfo.guid,
				triggerGuid: triggerGuid
			}
		});

		const sub = this.triggerDialogRef.componentInstance.saveEmitter.subscribe(result => {
			this.getChainInfo(this.chainInfo.guid);
		});
	}

	editFlow(flowGuid) {
		this.flowDialogRef = this.dialog.open(JobChainFlowDefComponent, {
			data: {
				chainGuid: this.chainInfo.guid,
				flowGuid: flowGuid
			}
		});

		const sub = this.flowDialogRef.componentInstance.saveEmitter.subscribe(result => {
			this.getChainInfo(this.chainInfo.guid);
		});
	}

	delete(graph, model, cell) {
		const _title: string = this.translate.instant('General.Confirmation');
		const _description: string = this.translate.instant('General.AreYouSureToPermanentlyDeleteThisRecord');
		const _waitDesciption: string = this.translate.instant('General.RecordIsBeingDeleted');
		const _deleteMessage = this.translate.instant('General.RecordHasBeenDeleted');

		if (model.isEdge(cell)) {
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}

				this.btcJobChainDefService.deleteFlow(cell.value.guid).subscribe(delFlowRes => {
					this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
					this.getChainInfo(this.chainInfo.guid);
				}, (error) => {
					this.layoutUtilsService.showError(error);
				});
			});
		} else {
			if (model.isVertex(cell) && cell.value != null && cell.value.guid != undefined && cell.value.type != 'G') {
				if (graph.getModel().getChildCount(cell) > 0) {
					this.layoutUtilsService.showError(this.translate.instant('System.JobChain.TriggerGroupDeleteError'));
					return;
				}
			}
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
				this.btcJobChainDefService.deleteTrigger(cell.value.guid).subscribe(delTriggerRes => {
					this.layoutUtilsService.showNotification(_deleteMessage, MessageType.Delete);
					this.getChainInfo(this.chainInfo.guid);
				}, (error) => {
					this.layoutUtilsService.showError(error);
				});
			});
		}
	}
}
