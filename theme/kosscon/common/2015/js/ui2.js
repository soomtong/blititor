/*
*@ Author : Sehan. An(with AshAPI2.2 - plandas@gmail.com)
*/
var shareSNS =
{
	title: document.title,
	backUrl: document.location.href,
	pwWidth: 1000,
	pwHeight: 500,
	defaultText: 'TOMBOY Style',
	defaultTwitterVia: 'TOMBOY_fashion',
	defaultImageSrc: '',
	defaultBlockedPopupMessage: '팝업 차단을 해제해 주시기 바랍니다.',

	facebook: function(title, text, imgsrc) {			
		var parameter =
		'&p[url]='+this.encode(this.backUrl)+
		'&p[title]='+this.encode(title || this.title)+
		'&p[summary]='+this.encode( text || this.defaultText);
		imgsrc = this.encode( imgsrc || this.defaultImageSrc);
		if(imgsrc) parameter += '&p[images][0]='+this.encode(imgsrc);
		this._openWin(
			'http://www.facebook.com/sharer.php?s=100'+parameter
		);
	},

	facebook_test: function(title, text, imgsrc) {			
/*
		var parameter =
		'&p[url]='+this.encode(this.backUrl)+
		'&p[title]='+this.encode(title || this.title)+
		'&p[summary]='+this.encode( text || this.defaultText);
		imgsrc = this.encode( imgsrc || this.defaultImageSrc);
*/

/*
		var aspParameter = 
		  'http://www.tomboy.co.kr/v_2012/index_test.asp'
		  + '?title='+this.encode(title || this.title) +
		  '&summary='+this.encode( text || this.defaultText);
*/

		var aspParameter = 
		  'http://www.tomboy.co.kr/v_2012/index_test.asp'
		  + '?title='+(title || this.title) +
		  '&summary='+( text || this.defaultText);
		//imgsrc = this.encode( imgsrc || this.defaultImageSrc);
		//if(imgsrc) aspParameter += '&images='+this.encode(imgsrc);
		//imgsrc = ( imgsrc || this.defaultImageSrc);
		if(imgsrc) aspParameter += '&images='+(imgsrc);

		this._openWin(
			'http://www.facebook.com/sharer.php?src=bm&u='+aspParameter + '&t=' + title
		);
	},

	twitter: function(title, text, imgsrc, via) { // (https://dev.twitter.com/docs/tweet-button)
		text = this.encode( text || this.defaultText);
		via = this.encode( via || this.defaultTwitterVia);
		imgsrc = this.encode( imgsrc || this.defaultImageSrc);
		this._openWin(
			'http://twitter.com/share?url='+imgsrc+'&text='+text+'&via='+via
			//'http://twitter.com/share?url='+this.encode(this.backUrl)+'&text='+text+'&via='+via
		);
	},
	pinterest: function(title, text, imgsrc) {
		text = this.encode( text || this.defaultText);
		url = this.encode(this.backUrl);
		imgsrc = this.encode( imgsrc || this.defaultImageSrc);
		this._openWin(
			'http://www.pinterest.com/pin/create/button/?url='+url+'&media='+imgsrc+'&description='+text
		);
	},
	
	_openWin: function(url, width, height, noPopup) {
		var w = width || this.pwWidth, h = height || this.pwHeight,
		pWin = window.open(url, 'snsWin', noPopup? '': 'width='+w+',height='+h);
		if(!pWin) alert( this.defaultBlockedPopupMessage );
		return pWin;
	},
	encode: encodeURIComponent
},

uic = {
	container: null,
	snb: {
		initialized: false,
		cmds: null, // atags
		tween: null,
		tweening: false,

		init: function() {
			if(this.initialized) return; this.initialized = true;
			var own = this, 
				uc = uic.container, 
				cmds = this.cmds = {},
				tween = this.tween = new AshTween;
				tween.setEasing('inout');

			var scrolling = function(a) {
				tween.duration = 1200;
				tween.startValue = AshUtil.document.scrollInfo().top;
				tween.endValue = a.starget? AshUtil.globalCoordinates(a.starget).y: 0;
				tween.play( function(e) {
					window.scrollTo(0, e.parameters.tweenedValue);
					if(e.type == AshTween.FINISH) {
						own.tweening = false;
					}
				});
			};

			var aHome = Qsa('a.home')[0];
			if(aHome) {
				aHome.onclick = function() {
					own.tweening = true;
					scrolling(this);
					return false;
				};
			}
			Qsa('nav. li a', function(i, a) {
				cmds[a.className] = a;
				a.onclick = function() { if(this.target.toLowerCase() == '_blank') window.open(this.href); else location.href = this.href; return false; };
			}, uc, this);
			Qsa('> section', function(i, section) {
				var cname = section.className, a = cmds[cname];
				if(a) {
					a.starget = section;
					a.onclick = function() {
						own.tweening = true;
						scrolling(this);
						return false;
					};
				}
				section.index = i;
				switch(cname) {
					case 'lookbook':
						Qsa('li div.box div.btn_over', function(i, div) {
							div.index = i;
							Qsa('a', function(i, a) {
								a.index = i;
								a.onclick = function() {
									switch(this.className)
									{
										case 'facebook':
											var dTarget = uic.layer.elements['layer_lookbook'], so = dTarget.SS, k = div.index;
											uic.setFacebook(so, k);
											break;

										case 'facebook_test':
											var dTarget = uic.layer.elements['layer_lookbook'], so = dTarget.SS, k = div.index;
											uic.setFacebook_test(so, k);
											break;

										case 'twitter':
											var dTarget = uic.layer.elements['layer_lookbook'], so = dTarget.SS, k = div.index;
											uic.setTwitter(so, k);
											break;

										case 'pinterest':
											var dTarget = uic.layer.elements['layer_lookbook'], so = dTarget.SS, k = div.index;
											uic.setPinterest(so, k);
											break;

										case 'view':
											uic.layer.show('layer_lookbook', function() {
												if(!this.interaction) return;
												this.interaction.selectItemAt(div.index, true);
											});
											break;
									}
									return false;
								};
							}, div);
						}, section);
						Qsa('article > a[title*=more]', function(i, a) {
							a.onclick = function() {
								var ediv = uic.layer.show('layer_lookbook_list');
								return false;
							};
						}, section);
						break;

					case 'collection':
						Qsa('li a', function(i, a) {
							a.index = i;
							a._img = a.getElementsByTagName('img')[0];
							a.motioner = new AshMotioner(a._img);
							a.onmouseover = function() {
								this.motioner.alpha(0.6, 300, 'none.out');
							};
							a.onmouseout = function() {
								this.motioner.alpha(1, 300, 'none.out');
							};
							a.onclick = function() {
								uic.layer.show('layer_collection', function() {
									if(!this.interaction) return;
									this.interaction.selectItemAt(a.index, true);
								});
								return false;
							};
						}, section);
						break;

					case 'campaign':
						Qsa('div.hgroup div.btn_over a', function(i, a) {
							a.index = i;
							a.onclick = function() {
								switch(this.className) {
									case 'ad':
										var ediv = uic.layer.show('layer_ad');
										break;

									case 'film':
										uic.layer.show('layer_film', function() {
											if(!this.interaction) return;
											this.interaction.openData.setFilm(this.interaction.selectedItem, true);
										});
										break;
								}
								return false;
							};
						}, section);
						break;
				}

			}, uc, this);

			this._onBreakWheelListener = function(e) {
				if(!own.tweening) return;
				own.tweening = false;
				own.tween.stop();
			};
			AshEventDispatcher.subscribe(document, 'DOMMouseScroll', this._onBreakWheelListener);
			AshEventDispatcher.subscribe(document, 'mousewheel', this._onBreakWheelListener);
		}
	},

	layer: {
		initialized: false,
		elements: null,

		init: function() {
			if(this.initialized) return; this.initialized = true;
			var own = this,
				uc = uic.container,
				eles = this.elements = [];

			Qsa('div.view_layer', function(i, div) {
				var id = div.id;
				if(!id) return;

				eles[id] = div;
				div.style.display = 'block';
				switch(id) 
				{
					case 'layer_lookbook_list':
						var sTarget = Qsa('div.roll_cont', null, div)[0];
						div.scroller = new AshContentScrollerEX(sTarget, true);
						(function() {
							this.setEasing('inout');
							this.disableMouseWheel = true;
							AshUtil.move(this.scrollTarget, 0,0);
							for(var l = this.scrollTarget.children.length, c, i = 0; i < l; i++) {
								c = this.scrollTarget.children[i];
								c.style.position = 'absolute';
								c.style.width = this.width+'px';
								AshUtil.move(c, this.width*i, 0);
							}
							this.setScrollTargetWidth(this.width*l);
						}).call(div.scroller);
						div.rollBtns = Qsa('span.roll_btn a', function(i, a) {
							a.index = i;
							a.onclick = function() {
								if(div.scroller.isScrolling) return false;
								div.scroller.scrollByX( this.index == 0? -div.scroller.width: div.scroller.width, 1000, true);
								return false;
							};
						},div);
						Qsa('div.roll_cont div.cont li ul li a', function(i, a) {
							a.index = i;
							a.onmouseover = function() {
							};
							a.onmouseout = function() {
							};
							a.onclick = function() {
								var ediv = uic.layer.show('layer_lookbook', function() {
									if( !this.interaction) return;
									this.interaction.selectItemAt(a.index);
								});
								return false;
							};
						}, div);
						Qsa('div.btn_over a.close', function(i, a) {
							a.index = i;
							a.onclick = function() {
								own.hide('layer_lookbook_list');
								return false;
							};
						}, div);
						break;

					case 'layer_lookbook':
						var iTarget = Qsa('div.roll_cont div.cont', null, div)[0],
						btnOver = Qsa('div.btn_over', null, div)[0],
						cw = iTarget.offsetWidth, ch = iTarget.offsetHeight,
						imgs = Qsa('img', null, iTarget);

						div.interaction = new AshCoverInteraction(iTarget, { packIndex:0, cellLength:10, direction:'vh', vCellLength:7, hCellLength:7 });
						div.interaction._remoteReceiveEventItem = function(item, type) {
							if(!item._resizingChild) return;
							var rc = item._resizingChild;
							switch(type) {
								case 'position':
									if(rc._initPosition) return; rc._initPosition = true;
									var w = rc.offsetWidth, h = rc.offsetHeight;
									rc.style.position = 'absolute';
									AshUtil.move(rc, cw/2 - w/2, ch/2 - h/2);
									break;

								case 'rebound':
									var t = this.interactioner.container;
									AshUtil.rebound(btnOver, t.offsetLeft, t.offsetTop, t.offsetWidth, t.offsetHeight);
									break;

								case 'container':
									var w = this.interactioner.itemSizeW = rc.offsetWidth, h = this.interactioner.itemSizeH = rc.offsetHeight;
									this.interactioner.container.style.display = 'block';
									AshUtil.rebound(this.interactioner.container, cw/2 - w/2, ch/2 - h/2, w, h);
									break;
							}
						};

						/** item_code 추가  */
						btnOver._oItemCode = null;
						btnOver._itemcodes = Qsa('span', function(i, span) {
							span.style.display = 'none';
						}, btnOver);
						div.interaction.addEventListener(AshCoverInteraction.SELECT_ITEM, function(e) {
							var index = e.parameters.selectedItemIndex;
							var icode = btnOver._itemcodes[index];
							if(btnOver._oItemCode) btnOver._oItemCode.style.display = 'none';
							if(icode) icode.style.display = 'inline';
							btnOver._oItemCode = icode;
						});

						for(var l = imgs.length, item, i = 0; i < l; i++) {
							item = div.interaction.target.children[i];
							if(item) item._resizingChild = imgs[i];
						}
						div.interaction.selectItemAt(0, true);
						div.rollBtns = Qsa('span.roll_btn a', function(i, a) {
							a.index = i;
							a.onclick = function() {
								div.interaction[ this.index == 0? 'selectPrev': 'selectNext' ]();
								return false;
							};
						},div);
						div._onclickAtag = function() {
							switch(this.className) {
								case 'close':
									own.hide('layer_lookbook');
									break;

								case 'list':
									own.show('layer_lookbook_list');
									break;

								case 'facebook':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setFacebook(so, k);
									break;

								case 'twitter':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setTwitter(so, k);
									break;
									
								case 'pinterest':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setPinterest(so, k);
									break;
							}
							return false;
						};
						Qsa('div.btn_over a', function(i, a) {
							a.index = i;
							a.onclick = div._onclickAtag;
						}, div);

						// share sns
						div.SS = {
							imgs: Qsa('div.roll_cont div.share_sns span[type=img]', null, div),
							titles: Qsa('div.roll_cont div.share_sns span[type=title]', null, div),
							contents: Qsa('div.roll_cont div.share_sns span[type=content]', null, div)
						};
						break;

					case 'layer_collection':
						var iTarget = Qsa('div.roll_cont div.cont', null, div)[0],
						btnOver = Qsa('div.btn_over', null, div)[0],
						cw = iTarget.offsetWidth, ch = iTarget.offsetHeight,
						imgs = Qsa('img', null, iTarget);

						div.interaction = new AshCoverInteraction(iTarget, { packIndex:1, cellLength:10, direction:'vh', vCellLength:7, hCellLength:7 });
						div.interaction._remoteReceiveEventItem = function(item, type) {
							if(!item._resizingChild) return;
							var rc = item._resizingChild;
							switch(type) {
								case 'position':
									if(rc._initPosition) return; rc._initPosition = true;
									var w = rc.offsetWidth, h = rc.offsetHeight;
									rc.style.position = 'absolute';
									AshUtil.move(rc, cw/2 - w/2, ch/2 - h/2);
									break;

								case 'rebound':
									var t = this.interactioner.container;
									AshUtil.rebound(btnOver, t.offsetLeft, t.offsetTop, t.offsetWidth, t.offsetHeight);
									break;

								case 'container':
									var w = this.interactioner.itemSizeW = this.width = rc.offsetWidth, h = this.interactioner.itemSizeH = this.height = rc.offsetHeight;
									this.interactioner.container.style.display = 'block';
									AshUtil.rebound(this.interactioner.container, cw/2 - w/2, ch/2 - h/2, w, h);
									try {
										var m2 = this.interactioner.getMotioner(1);
										m2.owner.style.top = h+'px'; m2.owner.style.height = '0px';
									}catch(error){};
									break;
							}
						};
						

						for(var l = imgs.length, item, i = 0; i < l; i++) {
							item = div.interaction.target.children[i];
							if(item) item._resizingChild = imgs[i];
						}
						div.interaction.selectItemAt(0, true);
						div.rollBtns = Qsa('span.roll_btn a', function(i, a) {
							a.index = i;
							a.onclick = function() {
								div.interaction[ this.index == 0? 'selectPrev': 'selectNext' ]();
								return false;
							};
						},div);
						div._onclickAtag = function() {
							switch(this.className) {
								case 'close':
									own.hide('layer_collection');
									break;

								case 'facebook':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setFacebook(so, k);
									break;

								case 'twitter':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setTwitter(so, k);
									break;
									
								case 'pinterest':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setPinterest(so, k);
									break;
							}
							return false;
						};
						Qsa('div.btn_over a', function(i, a) {
							a.index = i;
							a.onclick = div._onclickAtag;
						}, div);

						// share sns
						div.SS = {
							imgs: Qsa('div.roll_cont div.share_sns span[type=img]', null, div),
							titles: Qsa('div.roll_cont div.share_sns span[type=title]', null, div),
							contents: Qsa('div.roll_cont div.share_sns span[type=content]', null, div)
						};
						break;

					case 'layer_ad':
						var iTarget = Qsa('div.roll_cont div.cont', null, div)[0],
						btnOver = Qsa('div.btn_over', null, div)[0],
						cw = iTarget.offsetWidth, ch = iTarget.offsetHeight,
						imgs = Qsa('img', null, iTarget);

						div.interaction = new AshCoverInteraction(iTarget, { packIndex:0, cellLength:10, direction:'vh', vCellLength:7, hCellLength:7 });
						div.interaction._remoteReceiveEventItem = function(item, type) {
							if(!item._resizingChild) return;
							var rc = item._resizingChild;
							switch(type) {
								case 'position':
									if(rc._initPosition) return; rc._initPosition = true;
									var w = rc.offsetWidth, h = rc.offsetHeight;
									rc.style.position = 'absolute';
									AshUtil.move(rc, cw/2 - w/2, ch/2 - h/2);
									break;

								case 'rebound':
									var t = this.interactioner.container;
									AshUtil.rebound(btnOver, t.offsetLeft, t.offsetTop, t.offsetWidth, t.offsetHeight);
									break;

								case 'container':
									var w = this.interactioner.itemSizeW = rc.offsetWidth, h = this.interactioner.itemSizeH = rc.offsetHeight;
									this.interactioner.container.style.display = 'block';
									AshUtil.rebound(this.interactioner.container, cw/2 - w/2, ch/2 - h/2, w, h);
									break;
							}
						};

						for(var l = imgs.length, item, i = 0; i < l; i++) {
							item = div.interaction.target.children[i];
							if(item) item._resizingChild = imgs[i];
						}
						div.interaction.selectItemAt(0, true);
						div.rollBtns = Qsa('span.roll_btn a', function(i, a) {
							a.index = i;
							a.onclick = function() {
								div.interaction[ this.index == 0? 'selectPrev': 'selectNext' ]();
								return false;
							};
						},div);

						div._onclickAtag = function() {
							switch(this.className) {
								case 'close':
									own.hide('layer_ad');
									break;

								case 'film':
									own.show('layer_film', function() {
										if(!this.interaction) return;
										this.interaction.openData.setFilm(this.interaction.selectedItem, true);
									});
									break;

								case 'facebook':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setFacebook(so, k);
									break;

								case 'twitter':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setTwitter(so, k);
									break;
									
								case 'pinterest':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setPinterest(so, k);
									break;
							}
							return false;
						};
						Qsa('div.btn_over a', function(i, a) {
							a.index = i;
							a.onclick = div._onclickAtag;
						}, div);

						// share sns
						div.SS = {
							imgs: Qsa('div.roll_cont div.share_sns span[type=img]', null, div),
							titles: Qsa('div.roll_cont div.share_sns span[type=title]', null, div),
							contents: Qsa('div.roll_cont div.share_sns span[type=content]', null, div)
						};
						break;

					case 'layer_film':
						var iTarget = Qsa('div.roll_cont div.cont', null, div)[0],
						btnOver = Qsa('div.btn_over', null, div)[0],
						cw = iTarget.offsetWidth, ch = iTarget.offsetHeight,
						divs = Qsa('div', null, iTarget);

						div.interaction = new AshCoverInteraction(iTarget, { packIndex:0, cellLength:10, direction:'vh', vCellLength:7, hCellLength:7 });
						div.interaction._remoteReceiveEventItem = function(item, type) {
							if(!item._resizingChild) return;
							var rc = item._resizingChild;
							switch(type) {
								case 'position':
									if(rc._initPosition) return; rc._initPosition = true;
									var w = rc.offsetWidth, h = rc.offsetHeight;
									rc.style.position = 'absolute';
									AshUtil.move(rc, cw/2 - w/2, ch/2 - h/2);
									break;

								case 'rebound':
									var t = this.interactioner.container;
									AshUtil.rebound(btnOver, t.offsetLeft, t.offsetTop, t.offsetWidth, t.offsetHeight);
									break;

								case 'container':
									var w = this.interactioner.itemSizeW = rc.offsetWidth, h = this.interactioner.itemSizeH = rc.offsetHeight;
									this.interactioner.container.style.display = 'block';
									AshUtil.rebound(this.interactioner.container, cw/2 - w/2, ch/2 - h/2, w, h);
									break;
							}
						};

						for(var l = divs.length, item, i = 0; i < l; i++) {
							item = div.interaction.target.children[i];
							if(item) item._resizingChild = divs[i];
						}
						div.interaction.selectItemAt(0, true);
						div.interaction.openData.setFilm = function(item, onOff) {
							if(!item) return;
							item.innerHTML = onOff? item.getAttribute('ifrcode'): '';
						};
						//div.interaction.openData.setFilm(div.interaction.selectedItem, true);

						div.rollBtns = Qsa('span.roll_btn a', function(i, a) {
							a.index = i;
							a.onclick = function() {
								div.interaction.openData.setFilm(div.interaction.selectedItem, false);
								div.interaction[ this.index == 0? 'selectPrev': 'selectNext' ](true);
								div.interaction.openData.setFilm(div.interaction.selectedItem, true);
								return false;
							};
						},div);

						div._onclickAtag = function() {
							switch(this.className) {
								case 'close':
									own.hide('layer_film');
									div.interaction.openData.setFilm(div.interaction.selectedItem, false);
									break;

								case 'ad':
									own.show('layer_ad');
									div.interaction.openData.setFilm(div.interaction.selectedItem, false);
									break;

								case 'facebook':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setFacebook(so, k);
									break;

								case 'twitter':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setTwitter(so, k);
									break;
									
								case 'pinterest':
									var so = div.SS, k = div.interaction.selectedItemIndex;
									uic.setPinterest(so, k);
									break;
							}
							return false;
						};
						Qsa('div.btn_over a', function(i, a) {
							a.index = i;
							a.onclick = div._onclickAtag;
						}, div);

						// share sns
						div.SS = {
							imgs: Qsa('div.roll_cont div.share_sns span[type=img]', null, div),
							titles: Qsa('div.roll_cont div.share_sns span[type=title]', null, div),
							contents: Qsa('div.roll_cont div.share_sns span[type=content]', null, div)
						};
						break;
				}
				div.style.display = 'none';
			});

		},

		show: function(id, callback, hideCallback) {
			var own = this;
			PopupLayer.show(id, NaN, NaN, callback, hideCallback);
			this._sid_ = id;
			if(!PopupLayer.dimmer.onclick) {
				PopupLayer.dimmer.style.cursor = 'pointer';
				PopupLayer.dimmer.onclick = function(e) {
					own.hide(own._sid_);
					if(own._sid_ == 'layer_film') {
						var interaction = own.elements['layer_film'].interaction;
						interaction.openData.setFilm(interaction.selectedItem, false);
					}
					return false;
				};
			}
			return this.elements[id];
		},
		hide: function(id) {
			PopupLayer.hide(id);
		}
	},

	init: function() {
		var own = this, c = this.container = Qsa('#wrap_ad')[0];
		if(!c) return;
		this.snb.init();
		this.layer.init();

		/* sets to move the intro as center.
		*/
		//var intro = Qsa('section.intro', null, c)[0];
		//intro.style.position = 'fixed';
		var header = Qsa('header', null, c)[0];
		this.resizeHeader = function(e) {
			var dw = document.documentElement.clientWidth || document.body.clientWidth;
			if(dw > 1600) {
				header.style.left = (dw-1600)/2+(1600*0.97)+'px';
				header.style.right = 'auto';
			}
			else {
				header.style.left = 'auto';
				header.style.right = '3%';
			}
		}
		this.resizeHeader();
		AshEventDispatcher.subscribe(window, 'resize', this.resizeHeader);
	},

	setFacebook: function(snsElement, index) {
		var t = snsElement.titles[index], c = snsElement.contents[index], i = snsElement.imgs[index];
		shareSNS.facebook( t? t.innerHTML: '', c? c.innerHTML: '', i? i.innerHTML: '');
	},

	setFacebook_test: function(snsElement, index) {
		var t = snsElement.titles[index], c = snsElement.contents[index], i = snsElement.imgs[index];
		shareSNS.facebook_test( t? t.innerHTML: '', c? c.innerHTML: '', i? i.innerHTML: '');
	},

	setTwitter: function(snsElement, index) {
		var t = snsElement.titles[index], c = snsElement.contents[index], i = snsElement.imgs[index];
		shareSNS.twitter( t? t.innerHTML: '', c? c.innerHTML: '', i? i.innerHTML: '');
		//var t = snsElement.titles[index];
		//shareSNS.twitter( t? t.innerHTML: '');
	},
	setPinterest: function(snsElement, index) {
		var t = snsElement.titles[index], c = snsElement.contents[index], i = snsElement.imgs[index];
		shareSNS.pinterest( t? t.innerHTML: '', c? c.innerHTML: '', i? i.innerHTML: '');
	}
}

function fn_over(bt , target , bool){

	if(target == null || bt == null) return;
	
	$(bt).bind("mouseover mouseleave", function(e){
			switch(e.type){
				case "mouseover":	
					if($(target).get(0)){
						$(target).get(0).on = true;
						$(target).show();
						$(bt).addClass("on");
					}
					break;
				case "mouseleave":
					if($(target).get(0)){
						$(target).get(0).on = false;
						$(bt).removeClass("on");					
						setTimeout(function(){
							if($(target).get(0).on == false){
								$(target).hide();
							}
						} , 100);
					}
					break
			}
	});
	if(bool){
		$(target).bind("mouseover mouseleave", function(e){
			switch(e.type){
				case "mouseover":
					if($(target).get(0)){
						$(target).get(0).on = true;
						$(target).show();
						$(bt).addClass("on");
					}
					break;
				case "mouseleave":
					if($(target).get(0)){
						$(target).get(0).on = false;
						$(target).hide();
						$(bt).removeClass("on");
					}
					break
			}
	});
		
	}
}

function initUI(e) {
	window.setTimeout(function() {
		PopupLayer.dimmerOpacity = 0.6;
		PopupLayer.ignoreBindingEmbededClose = true;
		uic.init();
	},100);
};

if(window['jQuery']) window['jQuery'](document).ready(initUI);
else {
	AshEventDispatcher.subscribe(window, 'load', initUI);
	//AshUtil.document.readyForElement('SUEDOLoaded', initUI);
}
