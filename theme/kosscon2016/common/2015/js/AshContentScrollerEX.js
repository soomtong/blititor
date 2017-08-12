/** 
*@class AshContentScrollerEX
*@extends AshEventDispatcher
*@constructor
*@param idOrElement:HTMLElement The target element's id or target for AshContentScrollerEX
*@param autoScrollTargetWidth:Boolean=false Optional, if this value is defined and true, the scrollTarget's width will be resized at the time to create the instance.
*@param autoScrollTargetHeight:Boolean=false Optional, if this value is defined and true, the scrollTarget's height will be resized at the time to create the instance.
*@desc
<pre>
 Author			: Sehan. An (plandas@gmail.com)
 Creation Date : 	2011.10.04
 Last Modified : 	2011.10.25

 * description |
	- 본 클래스는 컨텐츠 스크롤을 위한 최상위 클래스이며, AshContentScroller의 기본기능을 확장한 고급클래스이다.
	- 타입별 커스텀 옵션을 위해 하위클래스는 본 클래스를 상속한다.
	- 스크롤 처리를 위해서 css의  left / top 노멀 속성을 사용한다. 만약 scrollLeft / scrollTop 속성을 이용한 처리를 하고자 한다면
	  AshContentScroller를 사용토록 한다.
	- 이 클래스에서는 onEvent 핸들러가 코드로 직접 정의되어 있지 않지만 내부적으로  기본 이벤트 발생에 맞게 자동으로 처리되도록 구현되어 있다.
	따라서 그것을 감안하고 실제 사용을 하면 된다.(ex, itemChange => onItemChange);
	향후 AshAPI3.0 모듈에서는 onEvent는 옵셔널로 이와같은 방식으로 자동 바인딩 될 예정이다.
	주의, target으로 등록되는 container 엘리먼트의 하위에 반드시 스크롤처리를 위한 대상 엘리먼트를 집합한 자식 container 엘리먼트가 존재해야 한다.

	[2011.10.25]
	- 무한 스크롤 기능이 추가되었다. 이것은 스크롤할 자식 대상요소의 위치를 런타임에 스크롤할 left, top 어떤위치와 방향에 관계없이 무한적으로
	 스크롤링을 자유롭게 할수 있는 기능이다. 이기능이 활성화 되면, limitInfinityScrolling 은 자동으로 true가 된다.
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

* usage|
<code>

</code>
</pre>
*/
var AshContentScrollerEX = Ash.createClass('AshContentScrollerEX', AshEventDispatcher);

/**
*@static
*@constant 'scrollingStart'
*@return String
*/
AshContentScrollerEX.SCROLLING_START = 'scrollingStart';

/** Fires when the scrolling order is requested.
*@event scrollingStart AshContentScrollerEX.SCROLLING_START
스크롤링일때 항시 발생.
*/
// Event

/**
*@static
*@constant 'scrolling'
*@return String
*/
AshContentScrollerEX.SCROLLING = 'scrolling';

/** Fires when the scrolling goes on.
*@event scrolling AshContentScrollerEX.SCROLLING
스크롤링일때 항시 발생.
*/
// Event

/**
*@static
*@constant 'scrollingEnd'
*@return String
*/
AshContentScrollerEX.SCROLLING_END = 'scrollingEnd';

/** Fires when the scrolling is finished.
*@event scrollingEnd AshContentScrollerEX.SCROLLING_END
스크롤링이 종료되었을때 발생.
*/
// Event

/**
*@static
*@constant 'update'
*@return String
*/
AshContentScrollerEX.UPDATE = 'update';

/** Fires when the current situation is updated in latest.
*@event update AshContentScrollerEX.UPDATE
최신상태로 업데이트 반영이 되었을때 발생.
*/
// Event

/**
*@static
*@constant 'mouseWheel'
*@return String
*/
AshContentScrollerEX.MOUSE_WHEEL = 'mouseWheel';

/** Fires when the mouseWheel event is activated.
*@event mouseWheel AshContentScrollerEX.WHEEL_SCROLLING
마우스 휠링이 발동할때 발생. 참고로 useWheelScroll과는 관계없이 항상 이 이벤트는 발생한다.
*/
// Event


Ash.addPrototype(AshContentScrollerEX, {
	
	/** The target element for implementing to scroll. it's the same with scrollTarget's parent node.
	*@read-only
	*@return HTMLElement
	*/
	target: null,

	/** The target element to scroll the content. it's the same with the target's firstChild.
	*@read-only
	*@return HTMLElement
	*/
	scrollTarget: null,

	/** The motioner for transforming the target.
	*@read-only
	*@return AshMotioner
	*/
	motioner: null,

	/** Returns the info to Indicate the states whether is available or not to scroll the left, right, top or bottom area.
	*@read-only
	*@return Object
	*@desc ex) { horizontal: true, vertical: true, left: true, top: false, right: false, bottom: true }
	*/
	scrollables: null,

	/** Gets the content's width to be shown as it seems. it's the same with the clientWidth of scrollTarget.
	*@read-only
	*@return uint
	*/
	width: 0,

	/** Gets the content's height to be shown as it seems. it's the same with the clientHeight of scrollTarget.
	*@read-only
	*@return uint
	*/
	height: 0,
	
	/** Gets the full width size of the content to be a scroll target.
	*@read-only
	*@return uint
	*/
	scrollWidth: 0,

	/** Gets the full height size of the content to be a scroll target.
	*@read-only
	*@return uint
	*/
	scrollHeight: 0,

	/** Gets the horizontal distance to scroll the content area.
	*@read-only
	*@return uint
	*/
	hScrollDistance: 0,
	
	/** Gets the vertical distance to scroll the content area.
	*@read-only
	*@return uint
	*/
	vScrollDistance: 0,

	/** Gets the horizontal position value to be scrolled.
	*@read-only
	*@return int
	*/
	hScrollValue: 0,

	/** Gets the vertical position value to be scrolled.
	*@read-only
	*@return int
	*/
	vScrollValue: 0,

	/** Indicates the state whether the scrollTarget is being scrolling or not.
	*@read-only
	*@return int
	*/
	isScrolling: false,

	/** Gets and sets the value to scroll when is invoked wheel event.
	*@return Number
	*/
	wheelScrollSize: 0,

	/** Sets using the horizontal scroll mode or gets the state about the result to set. default is to use,
	*@return Boolean
	*/
	useHScroll: true,

	/** Sets using the vertical scroll mode or gets the state about the result to set. default is to use,
	*@return Boolean
	*/
	useVScroll: true,

	/** Specifies whether uses the default mouse wheel scrolling or not. default is to use it.
	*@return Boolean
	*/
	useWheelScroll: true,

	/** Disables the default wheel system when user mouse point is setted over the scrollTarget. notes it isn't the same with useWheelScroll essentially.
	*@return Boolean
	*/
	disableMouseWheel: false,

	/** Indicates to restrict scrolling the scrollTarget from the available min to max value. 
	if value is true, it restricts the scrolling from max to min, otherwise allows the infinity scroll range. default is true.
	*@return Boolean
	*/
	limitInfinityScrolling: true,


		/**@private */
		_tween: null, _infinityScrollInfo: null, _infinityWheel: false, _notStaticItemInfo: null,


	/**@private override(defined by Ash) */
	initialize: function(idOrElement, autoScrollTargetWidth, autoScrollTargetHeight) {
		if(String(arguments[0]).toLowerCase().indexOf('ddakzzi') != -1) return; // for extending any subclass.

		var own = this, t = this.target = typeof idOrElement == 'string'? document.getElementById(idOrElement): idOrElement, st = this.scrollTarget = t.children[0];
		if(!t || !st) throw new Error('It cannot create the instance for ['+this.getClassName()+'] because is not valid target');
		AshUtil.removeWhiteSpace(st); // for removing img tag's white space.

		this.motioner = new AshMotioner(t);
		this._tween = new AshTween();
		this.scrollables = { horizontal: false, vertical: false, left: false, top: false, right: false, bottom: false };
		this._resetInfinityScrollInfo();
		
		if(AshUtil.getStyle(t, 'width') == 'auto') t.style.width = t.scrollWidth+'px';
		if(AshUtil.getStyle(t, 'height') == 'auto') t.style.height = t.scrollHeight+'px';

		t.style.overflow = 'hidden';
		if( AshUtil.getStyle(t, 'position') == 'static' ) t.style.position = 'relative';
		st.style.cssText += '; position: absolute; overflow: visible;';
		
		this.motioner.addEventListener(AshMotioner.MOTION, function(e) {
			var p = e.parameters;
			if(p.type ==  AshTween.FINISH) own.update(true);
		});

		this._onEventHandler = function(e) {
			if(e.type == AshContentScrollerEX.SCROLLING_END) {
				this.isScrolling = false;
				this._finishInfinity();
			}
			var funcName = 'on'+e.type.charAt(0).toUpperCase() + e.type.substr(1), f = own[funcName];
			if(f != null) f.call(this, e);
		}

		this.addEventListener(AshContentScrollerEX.SCROLLING_START, this._onEventHandler);
		this.addEventListener(AshContentScrollerEX.SCROLLING, this._onEventHandler);
		this.addEventListener(AshContentScrollerEX.SCROLLING_END, this._onEventHandler);
		this.addEventListener(AshContentScrollerEX.UPDATE, this._onEventHandler);
		this.addEventListener(AshContentScrollerEX.MOUSE_WHEEL, this._onEventHandler);
		this._registerWheelScroll();

		if(autoScrollTargetWidth || autoScrollTargetHeight) {
			for(var l = st.children.length, item, rw = 0, rh = 0, i = 0; i < l; i++) {
				item = st.children[i];
				rw += this._getElementWidth(item);
				rh += this._getElementHeight(item);
			}
			if(autoScrollTargetWidth) st.style.width = rw+'px';
			if(autoScrollTargetHeight) st.style.height = rh+'px';
		}
		this.update(true);
	},

	/** Updates the scrolling states about the scrollTarget in latest.
	*@desc 대상 컨텐츠의 사이즈가 변경되거나 스크롤 영역이 변화되었다면, 본 메소드를 호출 후 최신상태를 반영해야 한다.
	*/
	update: function(noEvent) {
		var t = this.target, st = this.scrollTarget, sa = this.scrollables;
		this.width			= t.clientWidth;
		this.height			= t.clientHeight;
		this.scrollWidth		= st.offsetWidth || t.scrollWidth;
		this.scrollHeight		= st.offsetHeight || t.scrollHeight;
		this.hScrollDistance	= Math.max(0, this.scrollWidth - this.width);
		this.vScrollDistance	= Math.max(0, this.scrollHeight - this.height);
		sa.horizontal			= this.hScrollDistance > 0? true: false;
		sa.vertical			= this.vScrollDistance > 0? true: false;


		// only for infinityScroll.
		var nsinfo = this._notStaticItemInfo = { position: 'static', pos: [] };
		if(st.children.length > 1) {
			var chkitem = st.children[1], position = AshUtil.getStyle(chkitem, 'position'), left = parseInt(AshUtil.getStyle(chkitem, 'left')),  top = parseInt(AshUtil.getStyle(chkitem, 'top'));
			if( position != 'static' && ( !isNaN(left) || !isNaN(top) ) ) 
			{
				nsinfo.position = position;
				for(var l = st.children.length, item, i = 0; i < l; i++) {
					item = st.children[i];
					nsinfo.pos.push( { x: parseInt(AshUtil.getStyle(item, 'left')) || 0, y: parseInt(AshUtil.getStyle(item, 'top')) || 0 });
				}
			}
		}

		this._updateScrollValue();
		if(!noEvent) this.dispatchEvent(new AshEvent(AshContentScrollerEX.UPDATE), { size:this.size, contentSize: this.contentSize, scrollDistance: this.scrollDistance,
			isLTScroll: this.isLTScroll, isRBScroll: this.isRBScroll } );
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
		this._updateAfterResize(this.target, 'resize', w, h);
	},

	/** Gets the scrollTarget's width.
	*@return uint
	*/
	getScrollTargetWidth: function() {
		return this._getElementWidth(this.scrollTarget);
	},

	/** Sets the scrollTarget's width.
	*@param value:uint The width to set.
	*/
	setScrollTargetWidth: function(value) {
		this._updateAfterResize(this.scrollTarget, 'width', value);
	},

	/** Gets the scrollTarget's height.
	*@return uint
	*/
	getScrollTargetHeight: function() {
		return this._getElementHeight(this.scrollTarget);
	},

	/** Sets the scrollTarget's height.
	*@param value:uint The height to set.
	*/
	setScrollTargetHeight: function(value) {
		this._updateAfterResize(this.scrollTarget, 'height', value);
	},

	/** Resizes the scrollTarget's area.
	*@param w:uint The width's value to resize.
	*@param h:uint The height's value to resize.
	*/
	resizeScrollTarget: function(w, h) {
		this._updateAfterResize(this.scrollTarget, 'resize', w, h);
	},
		_updateAfterResize: function(o, p, v1, v2) {
			switch(p) {
				case 'resize': AshUtil.resize(o, v1, v2); break;
				default: o.style[p] = v1+'px'; break;
			}
			this.update(true);
		},


	/** Scrolls the scrollTarget to the specified position.
	*@param x:int The x(left) position to scroll.
	*@param y:int The y(top) position to scroll.
	*@param duration:Number=0 Optional, the duration base on milisecond for scrolling the scrollTarget with scroll animation.
	*@desc 절대 포지션으로 스크롤 명령을 수행한다.
	*/
	scrollTo: function(x, y, duration) {
		var own = this, sa = this.scrollables, tv;
		if(!sa.horizontal && !sa.vertical) return;
		duration = +duration;

		this.dispatchEvent(new AshEvent(AshContentScrollerEX.SCROLLING_START), { hScrollValue: this.hScrollValue, vScrollValue: this.vScrollValue, scrollables: sa } );
		if( duration > 0) {
			this._tween.duration = duration;
			this._tween.startValue = { x: this.hScrollValue, y: this.vScrollValue };
			this._tween.endValue = { x: x, y: y };
			this._tween.play( function(e) {
				tv = e.parameters.tweenedValue;
				own._doScroll( tv.x, tv.y );
				if(e.type == AshTween.FINISH) {
					own._updateScrollValue();
					own.dispatchEvent(new AshEvent(AshContentScrollerEX.SCROLLING_END), { hScrollValue: own.hScrollValue, vScrollValue: own.vScrollValue, scrollables: sa } );
				}
			});
		}
		else {
			this._doScroll(x, y);
			this._updateScrollValue();
			this.dispatchEvent(new AshEvent(AshContentScrollerEX.SCROLLING_END), { hScrollValue: this.hScrollValue, vScrollValue: this.vScrollValue, scrollables: sa } );
		}
	},
		_doScroll: function(x, y) {
			var st = this.scrollTarget;
			this.isScrolling = true;

			x = Math.round(x);
			y = Math.round(y);
			if( x != this.hScrollValue) {
				if(this.limitInfinityScrolling) x = Math.min( Math.max(0, x), this.hScrollDistance);
				st.style.left = -x+'px';
				this.hScrollValue = x;
			}
			if( y != this.vScrollValue) {
				if(this.limitInfinityScrolling) y = Math.min( Math.max(0, y), this.vScrollDistance);
				st.style.top = -y+'px';
				this.vScrollValue = y;
			}
			this.dispatchEvent(new AshEvent(AshContentScrollerEX.SCROLLING), { hScrollValue: this.hScrollValue, vScrollValue: this.vScrollValue, scrollables: this.scrollables } );
		},


		/**@private */
		_registerWheelScroll: function() {
			var own = this, st = this.scrollTarget;
			if(!st._wheelSystem) {
				st._wheelSystem = { agent: new AshEventDispatcher(st), listener: function(e) {
					var s = arguments.callee.system;
					own._wheelScroll(e);
				}};
				st._wheelSystem.listener.system = st._wheelSystem;
				st._wheelSystem.agent.addEventListener('DOMMouseScroll', st._wheelSystem.listener );
				st._wheelSystem.agent.addEventListener('mousewheel', st._wheelSystem.listener );	
			}
		},
		_wheelScroll: function(e) {
			if(this.disableMouseWheel) return;
			if(!e) e = window.event;
			var delta = 0, sa = this.scrollables, scrollingValue = 0;
			if (e.wheelDelta) delta = -e.wheelDelta;
			else if (e.detail) delta = e.detail;
			
			if(sa.vertical) {
				scrollingValue = this.wheelScrollSize || this.height;
				scrollingValue = delta>0? scrollingValue: -scrollingValue;
				if(this.useWheelScroll && !this.isScrolling) this.scrollByY(scrollingValue, 1000, this._infinityWheel);
			}
			else if(sa.horizontal) {
				scrollingValue = this.wheelScrollSize || this.width;
				scrollingValue = delta>0? scrollingValue: -scrollingValue;
				if(this.useWheelScroll && !this.isScrolling) this.scrollByX(scrollingValue, 1000, this._infinityWheel);
			}
			this.dispatchEvent(new AshEvent(AshContentScrollerEX.MOUSE_WHEEL), { scrollingValue: scrollingValue } );

			// protect the outside wheel scrolling.
			if (e.preventDefault != null)  e.preventDefault();
			e.returnValue = false;
		},
		_resetInfinityScrollInfo: function( info ) {
			var isi =  this._infinityScrollInfo = { active: false, direction: 'x', negative: true, itemInfos: [], citems: [], scrollValue: 0, scrollFixValue: 0 };
			if(info) for(var p in info) isi[p] = info[p];
			return isi;
		},
		_scrollAsInfinity: function(direction, value, duration) {
			if(this.limitInfinityScrolling) this.limitInfinityScrolling = false;
			var isi =  this._infinityScrollInfo, osv, csv, scrollValue;
			if(isi.active) {
				osv = direction == 'x'? this.hScrollValue: this.vScrollValue;
				this._finishInfinity();
				csv = direction == 'x'? this.hScrollValue: this.vScrollValue; csv -= osv;
				value += csv;
			}
			scrollValue = value - (direction == 'x'? this.hScrollValue: this.vScrollValue ),
			this._resetInfinityScrollInfo({ active: true, direction: direction, negative: scrollValue > 0? true: false, scrollValue: scrollValue } );
			this._startInfinity();
			this['scrollTo'+direction.toUpperCase()] (value, duration, 'pass');
		},
		_startInfinity: function() {
			var st = this.scrollTarget, isi = this._infinityScrollInfo, nsinfo = this._notStaticItemInfo,
			d = isi.direction, p = d == 'x'? 'width': 'height', l = st.children.length, i = isi.negative? 0: l - 1,
			pbnds = this._getBounds(st), bnds = this._getBounds( st.children[ isi.negative? l - 1: 0] ),
			tValue = 0, lastv = bnds[d] + ( isi.negative? bnds[p]: 0 ), size, citem, isFirst = true,
	
			cloneItem = function() {
				try {
					var citem = st.appendChild(st.children[i].cloneNode(true));
					citem.style.position = 'absolute';
					i += ( isi.negative? 1: -1);
					return citem;
				} catch(error) { return null; }
			};
			while( tValue <= Math.abs(isi.scrollValue) ) {
				citem = cloneItem();
				if(!citem) break;

				size = this[d == 'x'? '_getElementWidth': '_getElementHeight'] (citem);
				if(!isi.negative && isFirst) {
					isFirst = false; lastv += -size;
				}
				AshUtil.move(citem, (d == 'x'? lastv: bnds.x),  (d == 'x'? bnds.y: lastv));
				
				lastv += ( isi.negative? size: -size);
				tValue += size;
				isi.citems.push(citem);
			}
		},
		_finishInfinity: function() {
			var st = this.scrollTarget, isi = this._infinityScrollInfo;
			if(!isi || !isi.active) return;

			var d = isi.direction, p = d == 'x'? 'width': 'height', sp = this.getScrollPosition(), pbnds = this._getBounds(st),
			chkAndUpdate = function()
			{
				var l = isi.negative? st.children.length: 0, i = isi.negative? 0: st.children.length - 1;
				for( ; isi.negative? i < l: i >= l; i+=( isi.negative? 1: -1) ) isi.itemInfos.push( { item: st.children[i], bnds: this._getBounds(st.children[i]) } );

				isi.itemInfos.remoteCall( function(index, info) {
					if( isi.negative? (pbnds[d] + info.bnds[d] + info.bnds[p] <= 0): pbnds[d] + info.bnds[d] >= this[p] ) {
						isi.scrollFixValue += info.bnds[p];
						isi.negative? st.appendChild(info.item): st.insertBefore(info.item, st.firstChild);
					}
				}, this);

				// for only items that isn't a static position.
				var nsinfo = this._notStaticItemInfo, item;
				if( nsinfo.position != 'static' ) {
					nsinfo.pos.remoteCall( function(i, p) {
						item = st.children[i];
						item.style.position = nsinfo.position;
						AshUtil.move(item, p.x, p.y);
					}, this);
				}

				if(!isi.negative) isi.scrollFixValue = -isi.scrollFixValue;
				st.style[ d == 'x'? 'left': 'top' ] = (sp[d] + isi.scrollFixValue)+'px';
				this._updateScrollValue();
			}

			// Removes the all cloned items at the _startInfinity.
			isi.citems.remoteCall( function(index, item) {
				if(item.parentNode && 'removeChild' in item.parentNode)
					item.parentNode.removeChild(item);
			});

			chkAndUpdate.call(this);
			this._resetInfinityScrollInfo();
		},
		_getBounds: function(ele) {
			return {
				x: parseInt(AshUtil.getStyle(ele, 'left')) || ele.offsetLeft,
				y: parseInt(AshUtil.getStyle(ele, 'top')) || ele.offsetTop,
				width: this._getElementWidth(ele),
				height: this._getElementHeight(ele)
			};
		},
		_getElementWidth: function(ele) {
			return ele.offsetWidth || parseInt(AshUtil.getStyle(ele, 'width')) || 0;
		},
		_getElementHeight: function(ele) {
			return ele.offsetHeight || parseInt(AshUtil.getStyle(ele, 'height')) || 0;
		},


	/** Scrolls the scrollTarget to the specified position as relative type.
	*@param x:int The x(left) position to scroll.
	*@param y:int The y(top) position to scroll.
	*@param duration:Number=0 Optional, the duration base on milisecond for scrolling the scrollTarget with scroll animation.
	*@desc 상대값으로 지정된 포지션에 스크롤 명령을 수행한다.
	*/
	scrollBy: function(x, y, duration) {
		this.scrollTo( this.hScrollValue + x, this.vScrollValue + y, duration);
	},

	/** Scrolls the scrollTarget toward the specified x position.
	*@param value:int The x(left) position to scroll.
	*@param duration:Number=0 Optional, the duration base on milisecond for scrolling the scrollTarget with scroll animation.
	*@param infinityMode:Boolean=false Optional, if this is defined and true, it scrolls the content as infinity without the limit scrolling for target position.
	if the target position is negative, the child items to be overhand the limited area is moved or attached to the last item automatically.
	else positive, moved or attached to the first item.
	*/
	scrollToX: function(value, duration, infinityMode) {
		if( !this.useHScroll) return;
		if( infinityMode != 'pass' ) this._infinityWheel = infinityMode == true? true: false;
		if( infinityMode == true ) this._scrollAsInfinity('x', value, duration);
		else this.scrollTo( value, this.vScrollValue, duration);
	},

	/** Scrolls the scrollTarget toward the specified y position.
	*@param value:int The y(left) position to scroll.
	*@param duration:Number=0 Optional, the duration base on milisecond for scrolling the scrollTarget with scroll animation.
	*@param infinityMode:Boolean=false Optional, if this is defined and true, it scrolls the content as infinity without the limit scrolling for target position.
	if the target position is negative, the child items to be overhand the limited area is moved or attached to the last item automatically.
	else positive, moved or attached to the first item.
	*/
	scrollToY: function(value, duration, infinityMode) {
		if( !this.useVScroll) return;
		if( infinityMode != 'pass' ) this._infinityWheel = infinityMode == true? true: false;
		if( infinityMode == true ) this._scrollAsInfinity('y', value, duration);
		else this.scrollTo( this.hScrollValue, value, duration);
	},

	/** Scrolls the scrollTarget toward the specified x position as relative type.
	*@param value:int The x(left) position to scroll.
	*@param duration:Number=0 Optional, the duration base on milisecond for scrolling the scrollTarget with scroll animation.
	*@param infinityMode:Boolean=false Optional, if this is defined and true, it scrolls the content as infinity without the limit scrolling for target position.
	if the target position is negative, the child items to be overhand the limited area is moved or attached to the last item automatically.
	else positive, moved or attached to the first item.
	*/
	scrollByX: function(value, duration, infinityMode) {
		this.scrollToX( this.hScrollValue + value, duration, infinityMode);
	},

	/** Scrolls the scrollTarget toward the specified y position as relative type.
	*@param value:int The y(top) position to scroll.
	*@param duration:Number=0 Optional, the duration base on milisecond for scrolling the scrollTarget with scroll animation.
	*@param infinityMode:Boolean=false Optional, if this is defined and true, it scrolls the content as infinity without the limit scrolling for target position.
	if the target position is negative, the child items to be overhand the limited area is moved or attached to the last item automatically.
	else positive, moved or attached to the first item.
	*/
	scrollByY: function(value, duration, infinityMode) {
		this.scrollToY( this.vScrollValue + value, duration, infinityMode);
	},

	/** Scrolls the scrollTarget to the result position that the target child element indicates.
	*@param idOrElement:Object The id value or itself of the specified child element to scroll.
	*@param duration:Number=0 Optional, the duration base on milisecond for scrolling the scrollTarget with scroll animation.
	*@desc 지정된 자식 엘리먼트가 위치하는 포지션으로 스크롤 처리를 수행한다.
	*/
	scrollToElement: function(idOrElement, duration) {
		var sv = this.getScrollValueToElement(idOrElement);
		if(sv) {
			this.scrollTo(sv.x, sv.y, duration);
		}
	},

	/** Gets the scroll value of itself to the result position that the target child element indicates.
	*@param idOrElement:Object The id value or itself of the specified child element to scroll.
	*@param Object The position value of the target child element = { x:xScrollValue, y:yScrollValue }
	*/
	getScrollValueToElement: function(idOrElement) {
		var st = this.scrollTarget, child = typeof idOrElement == 'string'? document.getElementById(idOrElement): idOrElement;
		if(!AshUtil.contains(st, child)) return null;

		var x = 0, y = 0;
		while (child && child != st) {
			x +=  child.offsetLeft || 0;
			y +=  child.offsetTop || 0;
			child = child.offsetParent;
		}
		return {x:x, y:y };
	},

	/** Gets the scroll position. this method provides the compeleted scroll value compared with scrollValue property.
	and synchronize the scrollValue to latest.
	*@return Object 항상 최신의 스크롤된 값을 구한다.(리턴값은 x, y 속성을 포함한 스크롤정보 객체이다.)
	*/
	getScroll: function() {
		this._updateScrollValue();
		return { x: this.hScrollValue, y: this.vScrollValue };
	},
		_updateScrollValue: function() {
			var sa = this.scrollables, st = this.scrollTarget, left = parseInt(st.style.left), top = parseInt(st.style.top);
			this.hScrollValue = -(left == 0? 0: left || st.offsetLeft);
			this.vScrollValue = -(top == 0? 0: top || st.offsetTop);

			sa.left		= !this.limitInfinityScrolling || ( sa.horizontal && -this.hScrollValue < 0 )? true: false;
			sa.right		= !this.limitInfinityScrolling || ( sa.horizontal && this.scrollWidth - this.hScrollValue > this.width )? true: false;
			sa.top		= !this.limitInfinityScrolling || ( sa.vertical && -this.vScrollValue < 0 )? true: false;
			sa.bottom	= !this.limitInfinityScrolling || ( sa.vertical && this.scrollHeight - this.vScrollValue > this.height )? true: false;
		},

	/** Gets the real postion of scrollTarget that is scrolled inner the target.
	ommonly this position are negative value of the scrollValues.
	*@return Object 실제 scrollTarget이 target의 위치상에서 스크롤된 좌표값(left, top)을 구한다.
	*/
	getScrollPosition: function() {
		return { x: -this.hScrollValue, y: -this.vScrollValue };
	},

	/** Sets the name of easing type.
	*@param easingName:String The easing name to set.
	*@desc 스크롤 모션에 사용될 이징엔진을 지정한다. AshTween에 상수로 지정된 이징 엔진들이 사용될 수 있다
	*/
	setEasing:function(easingName) {
		this._tween.setEasing(easingName);
	}

});