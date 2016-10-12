/** 
*@class AshCoverInteraction
*@extends AshEventDispatcher
*@constructor
*@param idOrElement:HTMLElement The target element's id or target for AshCoverInteraction
*@param interOption:Object=null Optional, the type index or object to be defined the option that likes to apply the interaction for the specified content. 
for reference, this index is available for supporting the interaction pack.
<code>
	interOption = 
	{
		packIndex: 2									// { use: all, value [0 <= int v] }
		cellLength: interOption.cellLength || 5,			// { use:pack2, value: [0 < int v] }
		vCellLength: interOption.vCellLength || 5,		// { use:pack2 or 3 or 4, value: [0 < int v] }
		hCellLength: interOption.hCellLength || 5,		// { use:pack2 or 3 or 4, value: [0 < int v] }
		startMode: 'f',									// { use:pack2, value: ['f' or 'b' or 'fb'] }
		reverse: true,									// { use:pack2, value: [true or false or 'random'] }
		direction: interOption.direction || 'v',				// { use:pack2, value: ['v' or 'h' or 'hv'] }
		bgColor: interOption.bgColor ||  '#ffffff'			// { use: all, value: [hexcolor] }
		duration1:  interOption.duration1 ||  null,			// { use: all, value: [0 < int v] }
		duration2:  interOption.duration2 ||  null			// { use: all, value: [0 < int v] }
	}
</code>
*
*@desc
<pre>
 Author			: Sehan. An (plandas@gmail.com)
 Creation Date : 	2011.10.28
 Last Modified : 	2011.10.28

 * description |
	- 본 클래스는 지정된 대상엘리먼트에 커버 인터렉션 효과를 주기 위해서 고안된 클래스이다.
	따라서, 해당 대상 타겟에는 최소 1개 이상의 자식 요소가 리스팅 되어 있어야 한다.

	- 이 클래스에서는 onEvent 핸들러가 코드로 직접 정의되어 있지 않지만 내부적으로  기본 이벤트 발생에 맞게 자동으로 처리되도록 구현되어 있다.
	따라서 그것을 감안하고 실제 사용을 하면 된다.(ex, update => onUpdate);
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

* usage|
<code>

</code>
</pre>
*/
var AshCoverInteraction = Ash.createClass('AshCoverInteraction', AshEventDispatcher);

/**
*@static
*@constant 'update'
*@return String
*/
AshCoverInteraction.UPDATE = 'update';

/** Fires when updating is invoked.
*@event update AshCoverInteraction.UPDATE
업데이트가 수행되었을때 발생.
*/
// Event

/**
*@static
*@constant 'selectItem'
*@return String
*/
AshCoverInteraction.SELECT_ITEM = 'selectItem';

/** Fires when new item is selected.
*@event selectItem AshCoverInteraction.SELECT_ITEM
새로운 아이템이 선택되었을때 발생.
*/
// Event

/**
*@static
*@constant 'invertInteraction'
*@return String
*/
AshCoverInteraction.INVERT_INTERACTION = 'invertInteraction';

/** Fires when interactions between before and after are crossed.
*@event invertInteraction AshCoverInteraction.INVERT_INTERACTION
인터렉션 효과가 크로스(역전환) 될때 발생한다.
*/
// Event


Ash.addPrototype(AshCoverInteraction, {

	/** The target element to apply the interaction.
	*@read-only
	*@return HTMLElement
	*/
	target: null,
	
	/** The engine to ineractive for the specified target.
	*@read-only
	*@return AshCoverInteractioner
	*/
	interactioner: null,

	/** The interaction option object to be setted to apply the interaction for the specified content.
	*@read-only
	*@return uint
	*/
	interOption: null,

	/** The cell's length to be created as a child for interaction. this property only is available and used for the interaction pack's 2 and 3. default length is 5.
	*@read-only
	*@return uint
	*/
	cellLength: 5,

	/** Gets the x position of interactioner for customizing.
	*@read-only
	*@return uint
	*/
	x: 0,

	/** Gets the y position of interactioner for customizing.
	*@read-only
	*@return uint
	*/
	y: 0,

	/** Gets the target's width to be shown as it seems. it's the same with the clientWidth of target.
	*@read-only
	*@return uint
	*/
	width: 0,

	/** Gets the target's height to be shown as it seems. it's the same with the clientHeight of target.
	*@read-only
	*@return uint
	*/
	height: 0,

	/** Returns the new item to apply the interaction.
	*@read-only
	*@return HTMLElement
	*/
	newItem: null,

	/** Returns the selected item to apply the interaction.
	*@read-only
	*@return HTMLElement
	*/
	selectedItem: null,

	/** The index of the selected item.
	*@read-only
	*@return int
	*/
	selectedItemIndex: -1,

	/** Gets the total item's count.
	*/
	length: -1,
	

		/**@private */
		_interactionPacks: null, _callback: null,

	/**@private override(defined by Ash) */
	initialize: function(idOrElement, interOption) {
		var own = this, t = this.target = typeof idOrElement == 'string'? AshUtil.obj(idOrElement): idOrElement;
		if(!t) throw new Error('It cannot create the instance for ['+this.getClassName()+'] because is not valid target');
		t.style.overflow = 'hidden';
		
		if( AshUtil.getStyle(t, 'position') == 'static' ) t.style.position = 'relative';

		for(var l = this.length = t.children.length, item, i = 0; i < l; i++) {
			item = t.children[i];
			if(!item.style.display) item.style.display = 'none'; // 크리티컬 패치(기본적으로 style 어트리뷰트로 직접지정한경우 맨처음부터 활성화된 상태의 녀석을 보여줘야 할경우는 예외처리 - 이것으로 일부 브라우져에서 순간깜빡이는 문제를 해결할 수 있슴)
		}

		this.interactioner = new AshCoverInteractioner(this);
		this.interOption = typeof interOption == 'object'? {
			packIndex: interOption.packIndex != undefined? (interOption.packIndex == -1? -1: Math.min(this.interactioner.packs.length-1, Math.max(0, interOption.packIndex || 0))): 0,
			cellLength: interOption.cellLength || 5,													// { use:pack2, value: [0 < int v] }
			vCellLength: interOption.vCellLength || 5,												// { use:pack2 or 3 or 4, value: [0 < int v] }
			hCellLength: interOption.hCellLength || 5,												// { use:pack2 or 3 or 4, value: [0 < int v] }
			startMode: interOption.startMode || 'fb',													// { use:pack2, value: ['f' or 'b' or 'fb'] }
			reverse: interOption.reverse==true? true: (interOption.reverse==false? false: 'random'),		// { use:pack2, value: [true or false or 'random'] }
			direction: interOption.direction || 'hv',													// { use:pack2, value: ['v' or 'h' or 'hv'] }
			bgColor: interOption.bgColor ||  '#ffffff',													// { use: all, value: [hexcolor] }
			duration1:  interOption.duration1 ||  null,													// { use: all, value: [0 < int v] }
			duration2:  interOption.duration2 ||  null													// { use: all, value: [0 < int v] }
		}: {
			packIndex: (typeof interOption == 'number') || interOption.undefined? Math.min(this.interactioner.packs.length-1, Math.max(0, interOption || 0)): 0,
			cellLength: 5, vCellLength: 5, hCellLength: 5, startMode: 'fb', reverse: 'random', direction: 'hv', bgColor: '#ffffff', duration1: null, duration2: null
		};

		this._onEventHandler = function(e) {
			var funcName = 'on'+e.type.charAt(0).toUpperCase() + e.type.substr(1), f = own[funcName];
			if(f != null) f.call(this, e);
		}

		this.addEventListener(AshCoverInteraction.UPDATE, this._onEventHandler);
		this.addEventListener(AshCoverInteraction.SELECT_ITEM, this._onEventHandler);
		this.addEventListener(AshCoverInteraction.INVERT_INTERACTION, this._onEventHandler);

		this.update();
	},

	/** Updates the configuation for target in latest.
	*@desc 대상 컨텐츠의 사이즈가 변경되거나 조건이 변경되었다면 이 메소드를 호출후 최신상태를 반영해야 한다.
	단, 리사이즈 발동시, 묵시적으로 이 메소드는 자동 실행된다.
	*/
	update: function(noEvent) {
		var t = this.target;
		this.width = t.clientWidth || t.scrollWidth || parseInt(AshUtil.getStyle(t,'width')) || 0;
		this.height = t.clientHeight || t.scrollHeight || parseInt(AshUtil.getStyle(t,'height')) || 0;
		this.interactioner.update();
		if(!noEvent) this.dispatchEvent(new AshEvent(AshCoverInteraction.UPDATE), { width: this.width, height: this.height } );
	},

	/** Sets the z-index for the interaction's container. it can be used in fixing layout the z-order of the group elements to be batched.
	*@param value:int The z-index to set.
	*/
	setZIndex: function(value) {
		this.interactioner.container.style.zIndex = value;
	},

	/** Sets the target's width.
	*@param value:uint The width to set.
	*/
	setWidth: function(value) {
		this._updateAfterResize(this.target, 'width', value);
	},
	
	/** Sets the target's height.
	*@param value:uint The height to set.
	*/
	setHeight: function(value) {
		this._updateAfterResize(this.target, 'height', value);
	},

	/** Resizes the target's area.
	*@param w:uint The width's value to resize.
	*@param h:uint The height's value to resize.
	*/
	resize: function(w, h) {
		this._updateAfterResize('resize', w, h);
	},

	/** Set to resize for customizing to the interactioner.
	*/
	resizeCustomizingInteractioner: function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.interactioner.update();
		this.interactioner.container.style.overflow = 'hidden';
		AshUtil.rebound(this.interactioner.container, x, y, width, height);
	},

		_updateAfterResize: function(p, v1, v2) {
			switch(p) {
				case 'resize': AshUtil.resize(this.target, v1, v2); break;
				default: this.target.style[p] = v1+'px'; break;
			}
			this.update();
		},

	/** Applies the interaction to the specfied item.
	*@param item:HTMLElement The target item to apply the interaction.
	*@param noInteraction:Boolean=false Optional, the state to indicate whether applies or not the interaction to the specified item.
	*/
	selectItem: function(item, noInteraction) {
		if(this.selectedItem == item || this.interactioner.container == item || !item) return;
		if(this._callback && this._callback.item) this._callback.item.style.display = 'none';
		var updated = false,
		updateItem = function() {
			if(updated) return; updated = true;
			this.selectedItem = item;
			this.selectedItemIndex = this.getItemIndex(item);
		};
		this._callback = function(updateNow) {
			this._callback = null;
			
			var oitem = arguments.callee.item;
			if( oitem ) oitem.style.display = 'none';
			item.style.display = 'block';

			if(updateNow) updateItem.call(this);
			if(!noInteraction) this.dispatchEvent(new AshEvent(AshCoverInteraction.INVERT_INTERACTION), { item: item, selectedItemIndex: this.selectedItemIndex } );

			if(this._remoteReceiveEventItem) // 2012.03.12 커스터마이징 추가.
				this._remoteReceiveEventItem(item, 'position');
		};
		this.newItem = item;
		this._callback.item = this.selectedItem;
		if(noInteraction) {
			this._callback();
			if(this._remoteReceiveEventItem) this._remoteReceiveEventItem(item, 'container');
			if(this._remoteReceiveEventItem) this._remoteReceiveEventItem(item, 'rebound');
		}
		else this.interactioner.apply();

		updateItem.call(this);
		this.dispatchEvent(new AshEvent(AshCoverInteraction.SELECT_ITEM), { item: item, selectedItemIndex: this.selectedItemIndex } );
	},

	/** Applies the interaction to the item has the specfied index.
	*@param index:uint The index to select the specified item.
	*@param noInteraction:Boolean=false Optional, the state to indicate whether applies or not the interaction to the specified item.
	*/
	selectItemAt: function(index, noInteraction) {
		index = Math.min( this.length - 1, Math.max(0, index));
		this.selectItem( this.target.children[index], noInteraction);
	},

	/** Applies the interaction to the item for next.
	*@param noInteraction:Boolean=false Optional, the state to indicate whether applies or not the interaction to the specified item.
	*/
	selectNext: function(noInteraction) {
		var index = this.selectedItemIndex + 1;
		if(index > this.length-1) index = 0;
		this.selectItemAt(index, noInteraction);
	},

	/** Applies the interaction to the item for next.
	*@param noInteraction:Boolean=false Optional, the state to indicate whether applies or not the interaction to the specified item.
	*/
	selectPrev: function(noInteraction) {
		var index = this.selectedItemIndex - 1;
		if(index < 0) index = this.length - 1;
		this.selectItemAt(index, noInteraction);
	},

	/** Gets the index value of the specified item.
	*@param item:HTMLElement The specified item to get the index.
	*@return uint The result index to be gotten.
	*/
	getItemIndex: function(item) {
		for(var l = this.target.children.length, i = 0; i < l; i++) if(this.target.children[i] == item) return i;
		return -1;
	},
	
	/** Sets a index of the pack to use to interact the item in runtime.
	*@param index:int The pack's index.
	*/
	selectPackAt: function(index) {
		this.interOption.packIndex = index;
	}
});

var AshCoverInteractioner = Ash.createClass('AshCoverInteractioner', Ash);
Ash.addPrototype(AshCoverInteractioner, {

	owner: null, container: null, motioners: null, packIndex: -1, packs: null, itemSizeW: 0, itemSizeH: 0,
	
	/**@private override(defined by Ash) */
	initialize: function(owner) {
		this.owner = owner;
		this.container = owner.target.appendChild(document.createElement('div'));
		this.container.style.cssText = ' overflow:hidden; display:none; position:absolute; left:'+owner.x+'px; top:'+owner.y+'px; ';
		this.container.motioner = new AshMotioner(this.container);
		this.packs = 
		[
			// packindex: 0
			{
				apply: function() {
					var own = this, owner = this.owner, t = owner.target, c = this.container, option = owner.interOption, motioner;
					this.startInteraction();

					this.resetCells(0, function() {
						var cell = c.appendChild(document.createElement('div'));
						cell.style.cssText = 'position:absolute; left:0px; top:0px; width:100%; height:100%; background-color:'+option.bgColor+'; ';
						AshUtil.filter.opacity(cell, 0);
						this.setMotioner(0, cell);
						this.update();
					});
					motioner = this.getMotioner(0);
					motioner.alpha(1, option.duration1 || 200, 'regular.in', function(e) {
						if(e.type == AshTween.FINISH) {
							own.changeInteraction();

							var outMotion = function() {
								motioner.alpha(0, option.duration2 || 400, 'regular.out', function(e2) {
									if(e2.type == AshTween.FINISH) own.finishInteraction();
								});
							};
							/* 2012 03 12 커스터마이징
							*/
							var item = owner.selectedItem, rc = item._resizingChild, rw, rh, rx, ry;
							if(rc) {
								rw = rc.offsetWidth; rh = rc.offsetHeight;

								if(rw != own.itemSizeW || rh != own.itemSizeH) {
									rx = rc.offsetLeft; ry = rc.offsetTop;
									own.itemSizeW = rw; own.itemSizeH = rh;
									
									rc.style.display = 'none';
									window.setTimeout(function() {
										c.motioner.play( {x: rx, y: ry, width: rw, height: rh }, 500, 'inout', function(e) {
											if(owner._remoteReceiveEventItem) owner._remoteReceiveEventItem(item, 'rebound');

											if(e.type == AshTween.FINISH) {
												rc.style.display = 'inline';
												window.setTimeout(outMotion,1);
											}
										});
									},1);
								}
								else {
									window.setTimeout(outMotion,1);
								}
							}
							else window.setTimeout(outMotion,1);
						}
					});
				},
				update: function() {
					var motioner = this.getMotioner(0);
					if(motioner.owner) {
						this.itemSizeW = this.itemSizeW || this.owner.width;
						this.itemSizeH = this.itemSizeH || this.owner.height;
						AshUtil.resize(this.container, this.itemSizeW, this.itemSizeH);	
					}
				}
			},
			// packindex: 1
			{
				apply: function() {
					var own = this, owner = this.owner, t = owner.target, c = this.container, option = owner.interOption, h = Math.round( (own.itemSizeH || owner.height) / 2), motioner1, motioner2;
					this.startInteraction();

					this.resetCells(1, function() {
						var cell1 = c.appendChild(document.createElement('div')), cell2 = c.appendChild(document.createElement('div'));
						cell1.style.cssText = 'position:absolute; left:0px; top:0px; width:100%; height:0px; background-color:'+option.bgColor+'; ';
						cell2.style.cssText = 'position:absolute; left:0px; top:0px; width:100%; height:0px; background-color:'+option.bgColor+'; ';
						this.setMotioner(0, cell1);
						this.setMotioner(1, cell2);
						this.update();
					});

					motioner1 = this.getMotioner(0); motioner2 = this.getMotioner(1);
					motioner1.height(h, 300, 'out');
					motioner2.play( { y: h, height: h}, 300, 'out', function(e) {
						if(e.type == AshTween.FINISH) {
							own.changeInteraction();

							var outMotion = function() {
								motioner1.height(0, 300, 'in');
								motioner2.play( { y: owner.height, height: 0}, 300, 'in', function(e2) {
									if(e2.type == AshTween.FINISH) own.finishInteraction();
								});
							};
							/* 2012 03 12 커스터마이징
							*/
							var item = owner.selectedItem, rc = item._resizingChild, rw, rh, rx, ry;
							if(rc) {
								rw = rc.offsetWidth; rh = rc.offsetHeight;
								if(rw != own.itemSizeW || rh != own.itemSizeH) {
									rx = rc.offsetLeft;
									ry = rc.offsetTop;
									own.itemSizeW = owner.width = rw;
									own.itemSizeH = owner.height = rh;
									
									rc.style.display = 'none';

									window.setTimeout(function() {
										motioner1.height( owner.height /2, 500, 'inout');
										motioner2.play({y: owner.height /2, height: owner.height /2}, 500, 'inout');
										c.motioner.play( {x: rx, y: ry, width: rw, height: rh }, 500, 'inout', function(e) {
											if(owner._remoteReceiveEventItem) owner._remoteReceiveEventItem(item, 'rebound');

											if(e.type == AshTween.FINISH) {
												rc.style.display = 'inline';
												window.setTimeout(outMotion,1);
											}
										});
									},1);
								}
								else window.setTimeout(outMotion,1);
							}
							else window.setTimeout(outMotion,1);
						}
					});
				},
				update: function() {
					var motioner1 = this.getMotioner(0), motioner2 = this.getMotioner(1), cell1 = motioner1.owner, cell2 = motioner2.owner;
					if(!cell1 || !cell2) return;
					this.itemSizeW = this.itemSizeW || this.owner.width;
					this.itemSizeH = this.itemSizeH || this.owner.height;
					cell2.style.top = this.itemSizeH+'px';
					AshUtil.resize(this.container, this.itemSizeW, this.itemSizeH );	
				}
			},
			// packindex: 2
			{
				apply: function() {
					var own = this, owner = this.owner, t = owner.target, c = this.container, option = owner.interOption, w = owner.width, h = owner.height;
					this.startInteraction();

					this.resetCells(2, function() {
						for(var i = 0, cell; i < (option.cellLength || option.vCellLength || option.hCellLength); i++) {
							cell = c.appendChild(document.createElement('div'));
							cell.style.cssText = 'position:absolute; left:0px; top:0px; background-color:'+option.bgColor+'; ';
							AshUtil.filter.opacity(cell, 0);
							this.setMotioner(i, cell);
						}
						this.update();
					});

					var cl = this.motioners.length, starting = true,
					inverse = option.startMode == 'fb'? [true, false][Math.round(Math.random()*1)]: (option.startMode == 'f'? false: true),
					reverse = option.reverse == 'random'? [true, false][Math.round(Math.random()*1)]: option.reverse,
					rcHandler = function(i, m) {
						var f = function() {
							var o = arguments.callee.info;
							o.m.alpha( (starting? 1: 0), 200, (starting? 'none.out': 'none.in'), o.i == (inverse? 0: cl-1)? function(e) {
								if(e.type == AshTween.FINISH) {
									if(starting) {
										starting = false;
										own.changeInteraction();
										window.setTimeout( function() {
											if(reverse) inverse = !inverse;
											own.motioners.remoteCall(rcHandler, own, rcHandler.inverse);
										},1);
									}
									else own.finishInteraction();
								}
							}: null);
						};
						f.info = { i:i, m:m };
						window.clearTimeout(m.openData.interval);
						m.openData.interval = window.setTimeout( f, (inverse? ((cl-1) - i): i) * Math.round(5/cl*50) );
					};
					this.motioners.remoteCall(rcHandler, this, inverse);
				},
				update: function() {
					var own = this, owner = this.owner, option = owner.interOption, d = option.direction == 'hv'? ['v','h'][Math.round(Math.random()*1)]: option.direction,
					cl = this.motioners.length, cw = Math.ceil(owner.width / cl), ch = Math.ceil(owner.height / cl);
					this.motioners.remoteCall( function(i, motioner) {
						var w = d == 'v'? owner.width: cw, h = d == 'v'? ch: owner.height, x = d == 'v'? 0: i*cw, y = d == 'v'? i*ch: 0;
						AshUtil.rebound(motioner.owner, x,y,w,h);
					}, this);
				}
			},
			// packindex: 3
			{
				apply: function() {
					var own = this, owner = this.owner, t = owner.target, c = this.container, option = owner.interOption, w = owner.width, h = owner.height;
					this.startInteraction();

					this.resetCells(3, function() {
						for(var hl = option.hCellLength, vl = option.vCellLength, w = Math.ceil(owner.width/hl), h = Math.ceil(owner.height/vl), j, i = 0, k = 0; i < hl; i++) {
							for(j = 0; j < vl; j++, k++) {
								cell = c.appendChild(document.createElement('div'));
								cell.style.cssText = 'position:absolute; overflow:hidden; background-color:'+option.bgColor+';';
								cell._interInfo = { indexs: [i, j], item: null, w:w, h:h };
								this.setMotioner(k, cell);
							}
						}
						this.update();
					});
					

					var source = owner.selectedItem, i, x, w, h, item, rp = ['x', 'y'], rpos, f, p, o, intv, maxintv = 0, maxindex = 0;
					this.changeInteraction(true);
					this.motioners.remoteCall( function(index, motioner) {
						cell = motioner.owner;
						cell.innerHTML = '';
						info = cell._interInfo;
						i = info.indexs[0]; j = info.indexs[1]; w = info.w; h = info.h;
						x = i*w; y = j*h;
						AshUtil.rebound(cell, x,y,w,h);
						if(source) {
							info.item = cell.appendChild(source.cloneNode(true));
							info.item.style.cssText += ';position:absolute; display:block;';
							AshUtil.move(info.item, -x, -y);
						}
						if(!rpos) rpos = { x: [-w, owner.width], y: [-h, owner.height] };
						f = function() {
							o = arguments.callee.info;
							p = rp[Math.round(Math.random()*1)];
							o.motioner[p]( rpos[p][Math.round(Math.random()*1)], 700, 'in', o.index == maxindex? function(e) {
								if(e.type == AshTween.FINISH) own.finishInteraction();
							}: null);
						};
						intv = Math.round(Math.random()*500);
						if(intv > maxintv) {
							maxintv = intv;
							maxindex = index;
						}
						f.info = { index: index, motioner:motioner };
						window.clearTimeout(motioner.openData.interval);
						motioner.openData.interval = window.setTimeout( f, intv );
					}, this);
				},
				update: function() {
					var own = this, owner = this.owner, option = owner.interOption;
					var hl = option.hCellLength, vl = option.vCellLength, w = Math.ceil(owner.width/hl), h = Math.ceil(owner.height/vl), i, j, x, y, cell, info;
					this.motioners.remoteCall( function(index, motioner) {
						cell = motioner.owner;
						info = cell._interInfo;
						i = info.indexs[0]; j = info.indexs[1];
						x = i*w; y = j*h;
						info.w = w; info.h = h;
						AshUtil.rebound(cell, x,y,w,h);
						if(info.item) AshUtil.move(info.item, -x, -y);
					}, this);
				}
			},
			// packindex: 4
			{
				apply: function() {
					var own = this, owner = this.owner, t = owner.target, c = this.container, option = owner.interOption, w = owner.width, h = owner.height;
					this.startInteraction();

					this.resetCells(4, function() {
						for(var hl = option.hCellLength, vl = option.vCellLength, w = Math.ceil(owner.width/hl), h = Math.ceil(owner.height/vl), j, i = 0, k = 0; i < hl; i++) {
							for(j = 0; j < vl; j++, k++) {
								cell = c.appendChild(document.createElement('div'));
								cell.style.cssText = 'position:absolute; overflow:hidden; background-color:'+option.bgColor+';';
								cell._interInfo = { indexs: [i, j], item: null, w:w, h:h };
								this.setMotioner(k, cell);
							}
						}
						this.update();
					});
					
					var source = owner.selectedItem, i, x, w, h, item, f, o, intv, maxintv = 0, maxindex = 0;
					this.changeInteraction(true);
					this.motioners.remoteCall( function(index, motioner) {
						cell = motioner.owner;
						cell.innerHTML = '';
						AshUtil.filter.opacity(cell,1);
						info = cell._interInfo;
						i = info.indexs[0]; j = info.indexs[1]; w = info.w; h = info.h;
						x = i*w; y = j*h;
						AshUtil.rebound(cell, x,y,w,h);
						if(source) {
							info.item = cell.appendChild(source.cloneNode(true));
							info.item.style.cssText = 'position:absolute; display:block;';
							AshUtil.move(info.item, -x, -y);
						}
						f = function() {
							o = arguments.callee.info;
							o.motioner.alpha(0, 300, 'none.in', o.index == maxindex? function(e) {
								if(e.type == AshTween.FINISH) own.finishInteraction();
							}: null);
						};
						intv = Math.round(Math.random()*800);
						if(intv > maxintv) {
							maxintv = intv;
							maxindex = index;
						}
						f.info = { index: index, motioner:motioner };
						window.clearTimeout(motioner.openData.interval);
						motioner.openData.interval = window.setTimeout( f, intv );
					}, this);
				},
				update: function() {
					var own = this, owner = this.owner, option = owner.interOption;
					var hl = option.hCellLength, vl = option.vCellLength, w = Math.ceil(owner.width/hl), h = Math.ceil(owner.height/vl), i, j, x, y, cell, info;
					this.motioners.remoteCall( function(index, motioner) {
						cell = motioner.owner;
						info = cell._interInfo;
						i = info.indexs[0]; j = info.indexs[1];
						x = i*w; y = j*h;
						info.w = w; info.h = h;
						AshUtil.rebound(cell, x,y,w,h);
						if(info.item) AshUtil.move(info.item, -x, -y);
					}, this);
				}
			}
		];
	},

	update: function() {
		var pack = this.packs[this.packIndex];
		if(pack) pack.update.call(this);
	},
	apply: function() {
		var own = this, owner = this.owner, c = this.container, interOption = owner.interOption;
		var index = interOption.packIndex == -1? Math.round(Math.random()*(this.packs.length-1)): interOption.packIndex;
		var pack = this.packs[ index ];
		if(pack) pack.apply.call(this);
	},

	getMotioner: function(index) {
		if(index < 0) index = 0;
		if(!this.motioners[index]) this.motioners[index] = new AshMotioner;
		return this.motioners[index];
	},
	setMotioner: function(index, motionOwner) {
		var motioner = this.getMotioner(index);
		if(motionOwner) motioner.owner = motionOwner;
		return motioner;
	},
	resetCells: function(packIndex, callback) {
		if(this.packIndex == packIndex) return;
		this.packIndex = packIndex;
		this.container.innerHTML = '';
		if(this.motioners) this.motioners.remoteCall(function(i, m) { m.stop(); delete this[i]; }, this.motioners);
		this.motioners = [];
		callback.call(this);
	},
	changeInteraction: function(updateNow) {
		if(this.owner._callback) this.owner._callback.call(this.owner, updateNow);
	},
	startInteraction: function() {
		this.container.style.display = 'block';
	},
	finishInteraction: function() {
		this.container.style.display = 'none';
	},

	addPack: function(pack) {
		this.packs.push(pack);
	},
	removePack: function(pack) {
		var index = this.packs.indexOf(pack);
		if(index != -1) this.packs.splice(index, 1);
	},
	removePackAt: function(index) {
		this.removePack(this.packs[index]);
	},
	replacePack: function(oldPack, pack) {
		var index = this.packs.indexOf(oldPack);
		if(index != -1) this.packs.splice(index, 1, pack);
	},
	replacePackAt: function(index, pack) {
		this.replacePack(this.packs[index], pack);
	}
});