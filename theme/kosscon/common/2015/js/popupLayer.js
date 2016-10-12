
/**
*@class PopupLayer
*@extends AshEventDispatcher
*@constructor
*@param target:HTMLElement The target element for popup
*@desc
<pre>
 Author : Sehan.An (plandas@gmali.com)
 Creation Date : 	2011.08.30
 Last Modified : 	2011.11.22
<code>
 * description |
	- 본 클래스는 팝업처리를 수행하기 위해서 고안된 클래스이다.
</code>
</pre>
*/
var PopupLayer = Ash.createClass('PopupLayer', AshEventDispatcher);
PopupLayer.hasTouch = 'ontouchstart' in window;
PopupLayer.isAndroid = PopupLayer.hasTouch && ((/android/gi).test(navigator.appVersion));
PopupLayer.isPhone = PopupLayer.hasTouch && (/iphone/gi).test(navigator.appVersion);
PopupLayer.isMobile = PopupLayer.isAndroid || PopupLayer.isPhone? true: false;
PopupLayer.forceAbsolute = BI.ie6 || PopupLayer.isAndroid || PopupLayer.isPhone? true: false;

/**@private */
	PopupLayer.createdDefaultEvent = false, PopupLayer.dimmer = null; PopupLayer.instances = {}; PopupLayer.beforeActivator = null; PopupLayer._iframeContainer = null;

/** Sets the opacity value of dimmer.
*@static
*@return Number
*/
PopupLayer.dimmerOpacity = 0.6;

/** Sets the background color of dimmer based on css-style.
*@static
*@return String
*/
PopupLayer.dimmerBackgroundColor = '#000000';

/** The bg icon url for loading progress.
*@static
*@return String
*/
PopupLayer.loadingIconSrc = '/img/loding.gif';

/** The size of iframe container while being standby.
*@static
*@return String
*/
PopupLayer.iframeContainerReadySize = '260,155';

/** Ignores to set closing to be binded.
*@static
*@return String
*/
PopupLayer.ignoreBindingEmbededClose = false;

/** Shows the popup layer to be registered in the specified target element.
*@static
*@param idOrElementOrIframeURL:Object The specified taget element, id name or the iframe src path to refer the target to show.
*@param width:uint=NaN Optional, the width value of popup to resize. this param is only used as iframe content.
*@param height:uint=NaN Optional, the height value of popup to resize. this param is only used as iframe content.
*@param callback:Function=null Optional, the callback handler to recieve when popup is shown immediately.
*@param hideCallback:Function=null Optional, the callback handler to recieve when popup has been hidden.
*@param hideCloseBtn:Boolean=false Optional, if this value is true, the close button will be hidden at the iframe container.
*@return Boolean
*/
PopupLayer.show = function(idOrElementOrIframeURL, width, height, callback, hideCallback, hideCloseBtn)
{
	var own = this, v = idOrElementOrIframeURL, target, ic, initializeIframe;
	var showAgent = function(t, _callback, _hideCallback) {
		if(!t.popupAgent) t.popupAgent = new PopupLayer(t);
		PopupLayer.instances[t.popupAgent.uid] = t.popupAgent;
		t.popupAgent.show(_callback, _hideCallback);
	};

	 // iframe
	if( (typeof v == 'string') && /[/.]/g.test(v)) 
	{
		ic = this._iframeContainer;
		if(!ic)
		{
			ic = this._iframeContainer = document.body.appendChild(document.createElement('div'));
			(function() {
				this._iframeLoaded = false;
				this.style.background = 'url('+own.loadingIconSrc+') no-repeat center center';

				this._btnClose =  this.appendChild(document.createElement('span'));
				this._btnClose.className = 'close';
				this._btnClose.onclick = function() { PopupLayer.hide(null); };

				this._iframe = this.appendChild( (function() {
					var ele = document.createElement('div'), iframe, eventAgent;
					ele.innerHTML = "<iframe width='100%' height='100%' scrolling='no' frameborder='0' ALLOWTRANSPARENCY='true' ></iframe>";
					iframe = ele.firstChild;
					eventAgent = new AshEventDispatcher(iframe);
					eventAgent.addEventListener('load', function(e) {
						if(ic._iframeLoaded) return;
						ic._updateLayout();
					});
					return iframe;
				})());
				this._iframeEvent = new AshEventDispatcher(ic._iframe);

				this._readyForIframe = function(w, h, noUpdate) {
					this._iframeLoaded = noUpdate;
					this._iframe.style.visibility = 'visible';
					AshUtil.resize(this, w, h);
					if(!noUpdate) own.updatePosition(this);
				};
				this._updateLayout = function() {
					if( !this._iframe) return;
					var win = this._iframe.contentWindow, doc = win.document;
					var w = doc.documentElement.scrollWidth || doc.body.scrollWidth;
					var h = doc.documentElement.scrollHeight || doc.body.scrollHeight;
					this._readyForIframe( w, h);
				};
			}).call(ic);
		}

		ic.className = hideCloseBtn? 'lay_pop layer': 'layerpop_iframe';
		ic._btnClose.style.display = hideCloseBtn? 'none': 'block';

		var readySize = own.iframeContainerReadySize.split(',');
		AshUtil.resize(ic, +readySize[0] || 10, +readySize[1] || 10);
		this.show(ic, null, null, callback);

		ic._iframeLoaded = false;
		ic._iframe.style.visibility = 'hidden';
		ic._iframe.src = v;

		if(width && height) ic._readyForIframe(+width, +height, true);
		return false;
	}

	// embeded element
	else target = typeof v == 'string'? document.getElementById(v): v;

	if(target && typeof target == 'object') showAgent(target, callback, hideCallback);
	return false; // for onclick event of atag in a coding page.
}

/** Hides the popup layer to be registered in the specified target element.
*@static
*@param idOrElement:HTMLElement The specified taget element or id name to refer the target to show.
*/
PopupLayer.hide = function(idOrElement) {
	var target = idOrElement? ( typeof idOrElement == 'string'? document.getElementById(idOrElement): idOrElement ): this._iframeContainer;
	if(!target || !target.popupAgent) return;
	target.popupAgent.hide();
};

/** Updates the layer's position for only a iframe layer.
*/
PopupLayer.reload = function(){
	var ic = this._iframeContainer;
	if(!ic) return; ic._updateLayout();
};


/** Updates the related position of target's layout.
*@static
*@param targetHasInstance:HTMLElement The target element that creates the PopupLayer and has the instance of PopupLayer.
*/
PopupLayer.updatePosition = function(targetHasInstance) {
	if(!targetHasInstance || !targetHasInstance.popupAgent) return;
	targetHasInstance.popupAgent._reposition();
};

Ash.addPrototype(PopupLayer,
{
	target: null, uid: 0, btnClose: null, displayed: false, callback: null,

	/**@private override(defined by Ash) */
	initialize: function(target) {
		var own = this;
		this.uid = this.getClassName() + this.instancedCount;
		this.target = target;
		target.style.position = PopupLayer.forceAbsolute? 'absolute': 'fixed';
		if(!PopupLayer.ignoreBindingEmbededClose) {
			for(var atags = target.getElementsByTagName('a'), l = atags.length, i = 0; i < l; i++) {
				if(atags[i].className=='close') {
					this.btnClose = atags[i];
					this.btnClose.onclick = function() { own.hide(); return false; };
					break;
				}
			}
		}
		if(!PopupLayer.createdDefaultEvent) {
			PopupLayer.createdDefaultEvent = true;
			PopupLayer.dimmer = document.createElement('div');
			PopupLayer.dimmer.style.cssText = 'z-index:'+(Ash.MAX_ZINDEX - 1)+'; position:'+(PopupLayer.forceAbsolute? 'absolute': 'fixed')+'; left:0px; top:0px; background-color:'+PopupLayer.dimmerBackgroundColor+';';
			PopupLayer.dimmer.motioner = new AshMotioner(PopupLayer.dimmer);
			AshUtil.filter.opacity(PopupLayer.dimmer, 0);

			AshEventDispatcher.subscribe(window, 'resize', function(e) {
				for(var i in PopupLayer.instances) PopupLayer.instances[i]._reposition();
			});
			AshEventDispatcher.subscribe(window, 'scroll', function(e) {
				for(var i in PopupLayer.instances) PopupLayer.instances[i]._reposition();
			});
		}
		target.motioner = new AshMotioner(target);
		
	},

	/** Shows the popup
	*@param callback:Function=null Optional, the callback handler to recieve when popup is shown immediately.
	*@param hideCallback:Function=null Optional, the callback handler to recieve when popup has been hidden.
	*/
	show: function(callback, hideCallback) {
		var own = this;
		
		if(PopupLayer.beforeActivator && PopupLayer.beforeActivator != this) PopupLayer.beforeActivator.hide();
		this.displayed = true;

		document.body.appendChild( PopupLayer.dimmer );
		PopupLayer.dimmer.motioner.alpha(PopupLayer.dimmerOpacity,300,'none.out', function(e) {
			if(e.type == AshTween.FINISH) {

			}
		});

		window.clearTimeout( this._intervalDim );
		this._intervalDim = window.setTimeout( function() {
			own.target.style.display = 'block';
			own.target.style.zIndex = Ash.MAX_ZINDEX;
			document.body.appendChild( own.target);
			own._reposition();
			PopupLayer.beforeActivator = own;
			own.callback = hideCallback;
			if(callback) callback.call( own.target );
		},150);
		
		/*
		if(PopupLayer.beforeActivator && PopupLayer.beforeActivator != this) PopupLayer.beforeActivator.hide();
		this.displayed = true;
		document.body.appendChild( PopupLayer.dimmer );
		PopupLayer.dimmer.motioner.alpha(PopupLayer.dimmerOpacity,300,'none.out');

		AshUtil.filter.opacity(this.target, 0);
		this.target.style.display = 'block';
		this.target.motioner.alpha(1, 500, 'none.out');
		document.body.appendChild( this.target);
		this.target.style.zIndex = Ash.MAX_ZINDEX;
		this.callback = callback;
		this._reposition();
		PopupLayer.beforeActivator = this;
		*/
	},

	/** Hides the popup
	*/
	hide: function() {
		var own = this;
		this.displayed = false;
		this.target.style.display = 'none';
		PopupLayer.instances[this.uid] = null;
		delete PopupLayer.instances[this.uid];
		if(this.callback) {
			this.callback.call(window);
			this.callback = null;
		}
		PopupLayer.dimmer.motioner.alpha(0,500,'none.out', function(e) {
			if(e.type == AshTween.FINISH) {
				if( PopupLayer.dimmer.parentNode) PopupLayer.dimmer.parentNode.removeChild( PopupLayer.dimmer );
			}
		});
	},
		
		/**@private */
		_reposition: function() {
			if(!this.displayed) return;
			var t = this.target, d = document, 
			dw = d.documentElement.clientWidth || d.body.clientWidth, 
			dh = d.documentElement.clientHeight || d.body.clientHeight, 
			tw = t.offsetWidth, th = t.offsetHeight, x = dw / 2 - tw/2, y = dh / 2 - th/2;

			if(th > dh) {
				y =  -AshUtil.document.scrollInfo().top;
				if(y+th < dh) y = dh - th;
			}
			AshUtil.move(t, x, y);
			AshUtil.resize(PopupLayer.dimmer, dw, dh);

			if(PopupLayer.forceAbsolute) {
				var sinfo = AshUtil.document.scrollInfo();
				t.style.top = (y+sinfo.top)+'px';
				PopupLayer.dimmer.style.top = sinfo.top+'px';
			}
		}
});


/* Third-party : Open Popup Window.
*@param url:String The specified url to open as the pop window style.
*@param w:uint The width value of popup window.
*@param h:uint The height value of popup window.
*@param callback:Function=null Optional, the callback handler to recieve when pop win has been closed.
*@param winName:String='' Optional, the popup win's name. if this value is defined, the pop win will always be opened as the same with before.
*@param notCenter:Boolean=false Optional, if true, the pop win isn't positioned in the center of screen.
*@param scrollbars:Boolean=false Optional, if true, scrollbars always appears in the p.w
*/
PopupLayer.popWindow = function(url, w, h, callback, winName, notCenter, scrollbars) {
	var own = this;
	var x = parseInt(window.screen.width/2 - w/2) || 100;
	var y = parseInt(window.screen.height/2 - h/2) || 100;
	var param = notCenter? 'width='+w+', height='+h: 'left='+x+', top='+y+', width='+w+', height='+h;
	if(scrollbars) param += ', scrollbars=yes ';

	var win = window.open(url || 'about:blank', winName || '_popupLayerWin', param);
	window.clearInterval(own._popWinInterval);
	own._popWinInterval = window.setInterval(function() {
		if(win.closed) {
			window.clearInterval(own._popWinInterval);
			if(callback) callback();
		}
	},200);
	win.focus();
	//return win;
	return false; // for onclick event of atag in a coding page.
};

/** Third-party : Auto-Resizing Pop-up behavior with the browser compatibility at the loaded time.

AshEventDispatcher.subscribe(window, 'load', function(e) {
	if(!this.opener) return;
	var doc = document, x = 0, y = 0, w = 0, h = 0, wm = 10, hm = 22;
	w = (doc.documentElement.scrollWidth || doc.body.scrollWidth) + wm;
	h = (doc.documentElement.scrollHeight || doc.body.scrollHeight) + hm;

	x = parseInt(window.screen.width/2 - w/2) || 100;
	y = parseInt(window.screen.height/2 - h/2) || 100;

	window.resizeTo(w, h);
	window.moveTo(x, y);
});
*/