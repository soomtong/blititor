/**
*@ AshAPI	|
 Author : 			An.sehan (www.happyfri.com / plandas@naver.com)
 Creation Date : 	2007.12.04
 Last Modified : 	2011.07.22
 Version : 		2.2
 * Released under the MIT Licenses.
*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if( !Array.prototype.indexOf){
	
	Array.prototype.indexOf=function(o){for(var l=this.length,i=0;i<l;i++)if(this[i]==o)return i;return-1;}}
if( !Array.prototype.remoteCall){
	Array.prototype.remoteCall=function(callback,thisObj,descending){if(!callback)return false;for(var l=descending?0:this.length,i=descending?this.length-1:0;descending?i>=l:i<l;i+=(descending?-1:1))if(callback.call( thisObj||this,i,this[i])===false)return false;return true;}}
var Ash=function(){};Ash.prototype={_class:null,initialize:null,
	windowLoaded:false,
	instancedCount:0,
	getClass:function(){return this._class?this._class:this.constructor;},
	getClassName:function(){return this.getClass()._className;},
	toString:function(){var cls=this.constructor;return'object '+(cls._className?cls._className:'Ash');}}
Ash._className='Ash';
Ash.createClass=function(className,extendClass){var cls=function(){if(arguments[0]=='ashclassextended'){if(this.initialize)this.initialize(arguments[0]+'&DDAKZZI');}
else{this.instancedCount=++this.constructor._instancedCount;if(this.__commonAshreMembers!=null)this.__commonAshreMembers();
			if(this.initialize)this.initialize.apply(this,arguments);
		}}
cls._instancedCount=0;if(className)cls._className=className;if(extendClass){cls.prototype=new extendClass('ashclassextended');cls.prototype.constructor=cls;
		cls.superClass=extendClass;
		 
		cls.callSuperMethod=function(superMethodName,thisInstance,argsArray){cls.superClass.prototype[superMethodName].apply(thisInstance,argsArray?argsArray:[null]);};}
return cls;}
Ash.addPrototype=function(theClass,protoObj){for(var pro in protoObj)theClass.prototype[pro]=protoObj[pro];}
Ash.multiInheritance=function(superClass,subClass){for(var pro in superClass.prototype)subClass.prototype[pro]=superClass.prototype[pro];subClass.prototype.constructor=subClass;}  
Ash.NAMESPACE_URL='http://www.happyfri.com';Ash.support=function(){window.open(Ash.NAMESPACE_URL);};
Ash.MAX_ZINDEX=999999999;
var AshUtil=Ash.createClass('AshUtil',Ash);
AshUtil.toProperty=function(obj){var value='';for(var p in obj)value+=","+p+"="+obj[p];value=value.replace(/,/,'');return"{"+value+"}";}
AshUtil.availableBrowser=function(){var na=navigator.appVersion,nu=navigator.userAgent;return{win:/win/i.test(na),ie:/msie/i.test(na),ie8:/MSIE 8/i.test(na),ie7:/MSIE 7/i.test(na),ie6:/MSIE 6/i.test(na),ff:/firefox/i.test(nu),opera:/opera/i.test(nu),safari:/AppleWebKit/i.test(nu)&&!/chrome/i.test(nu),chrome:/chrome/i.test(nu)};}
AshUtil.browser=AshUtil.availableBrowser();var BI=AshUtil.browser;
AshUtil.random=function(max){return Math.floor(Math.random()*max);}
AshUtil.randomRange=function(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
AshUtil.minToMax=function(value,min,max){return Math.min(Math.max(value,min),max);}
AshUtil.arrayShuffle=function(arr,callback){for(var ran1,ran2,save,l=arr.length,i=0;i<l;i++){ran1=AshUtil.random(l);ran2=AshUtil.random(l);save=arr[ran1];arr[ran1]=arr[ran2];arr[ran2]=save;if(callback!=null)callback(i,arr[i]);}
return arr;}
AshUtil.cloneObject=function(obj){var cloner=function(){};cloner.prototype=obj;return new cloner();}
AshUtil.obj=function(id,win){win=win||window;return win.document.getElementById(id);}
AshUtil.getElementsByCName=function(target,cname){var elements=[];var g=function(t){for(var l=t.childNodes.length,c=null,i=0;i<l;i++){c=t.childNodes[i];if(c.nodeType==1&&c.getAttribute('cname')==cname)elements.push(c);if(c.hasChildNodes())g(c);}}
g(target);return elements;}
AshUtil.getChildByName=function(obj,name){if(!obj||!name)return null;for(var l=obj.childNodes.length,c=null,cn=null,i=0;i<l;i++){cn=obj.childNodes[i];if(cn.nodeType==1&&cn.getAttribute('name')==name)return cn;if(cn.hasChildNodes())c=AshUtil.getChildByName(cn,name);if(c)return c;}
return c;}
AshUtil.getChildByDotTree=function(dotTree){var getChild=function(obj,name){for(var l=obj.childNodes.length,c,o=null,i=0;i<l;i++){c=obj.childNodes[i];if(c.nodeType==1){if(c.getAttribute('id')==name||c.getAttribute('name')==name)return c;o=getChild(c,name);if(o)return o;}}
return o;}
var trees=dotTree.split('.');var obj=AshUtil.obj(trees[0]);for(var l=trees.length,i=1;i<l;i++){obj=getChild(obj,trees[i]);if(!obj)return null;}
try{return obj;}
finally{
	};}
AshUtil.getChildByClassName=function(obj,className){if(!obj||!className)return null;for(var l=obj.childNodes.length,c=null,cn=null,i=0;i<l;i++){cn=obj.childNodes[i];if(cn.nodeType==1&&cn.className==className)return cn;if(cn.hasChildNodes())c=AshUtil.getChildByClassName(cn,className);if(c)return c;}
return c;}
AshUtil.getChildByClassNameDotTree=function(dotTree){var getChild=function(obj,className){for(var l=obj.childNodes.length,c,o=null,i=0;i<l;i++){c=obj.childNodes[i];if(c.nodeType==1){if( c.className==className)return c;o=getChild(c,className);if(o)return o;}}
return o;}
var trees=dotTree.split('.');var obj=AshUtil.obj(trees[0]);for(var l=trees.length,i=1;i<l;i++){obj=getChild(obj,trees[i]);if(!obj)return null;}
return obj;}
AshUtil.contains=function(parent,child){while(child){if(child==parent)return true;child=child.parentNode;}
return false;}
AshUtil.removeAllChild=function(target){if(!target)return;try{target.innerHTML='';}
catch(error){for(var l=target.childNodes.length,i=l-1;i>=0;i--)target.removeChild(target.childNodes[i]);};}
AshUtil.move=function(target,x,y){if(target&&target.style)target.style.left=x+'px',target.style.top=y+'px';}
AshUtil.resize=function(target,w,h){
	if(target&&target.style){target.style.width=(typeof w=='string')?w:w+'px';target.style.height=(typeof h=='string')?h:h+'px';}}
AshUtil.rebound=function(target,x,y,w,h){AshUtil.move(target,x,y);AshUtil.resize(target,w,h);}
AshUtil.getStyle=function(obj,prop){if(obj.style[prop])return obj.style[prop];else if(obj.currentStyle&&obj.currentStyle[prop])return obj.currentStyle[prop];else if(window.getComputedStyle){
		var styleobj=obj.ownerDocument.defaultView.getComputedStyle(obj,null);if(styleobj)return styleobj[prop];}
return'';}
AshUtil.getBounds=function(obj){if(!obj)return{x:0,y:0,width:0,height:0};var pl=parseInt(AshUtil.getStyle(obj,'paddingLeft')),pr=parseInt(AshUtil.getStyle(obj,'paddingRight')),pt=parseInt(AshUtil.getStyle(obj,'paddingTop')),pb=parseInt(AshUtil.getStyle(obj,'paddingBottom'));if(isNaN(pl))pl=0;if(isNaN(pr))pr=0;if(isNaN(pt))pt=0;if(isNaN(pb))pb=0;var x=obj.offsetLeft?obj.offsetLeft:parseInt(AshUtil.getStyle(obj,'left')),y=obj.offsetTop?obj.offsetTop:parseInt(AshUtil.getStyle(obj,'top')),w=obj.offsetWidth?obj.offsetWidth-(pl+pr):parseInt(AshUtil.getStyle(obj,'width')),h=obj.offsetHeight?obj.offsetHeight-(pt+pb):parseInt(AshUtil.getStyle(obj,'height'));if(isNaN(x))x=0;if(isNaN(y))y=0;if(isNaN(w))w=0;if(isNaN(h))h=0;return{x:x,y:y,width:w,height:h};}
AshUtil.globalCoordinates=function(obj){var x=0,y=0,cobj=obj;try{while(obj){x+=obj.offsetLeft||0;y+=obj.offsetTop||0;obj=obj.offsetParent;}
		if(AshUtil.browser.ie){for(;;){if( !cobj||cobj==document.body||cobj.parentNode==document.body)break;else cobj=cobj.parentNode;}
if(cobj){x+=-parseInt(AshUtil.getStyle(cobj,'paddingLeft'))||0;y+=-parseInt(AshUtil.getStyle(cobj,'paddingTop'))||0}}}
catch(error){x=0,y=0;}
return{x:x,y:y};}
AshUtil.hitTest=function(target1,target2){if(!target1||!target2)return false;var p1=AshUtil.globalCoordinates(target1),p2=AshUtil.globalCoordinates(target2);var w1=target1.offsetWidth,h1=target1.offsetHeight,w2=target2.offsetWidth,h2=target2.offsetHeight;if((p1.x-w2<p2.x&&p2.x<p1.x+w1)&&(p1.y-h2<p2.y&&p2.y<p1.y+h1))return true;return false;}
AshUtil.setInnerText=function(obj,value,win){win=win||window;if(obj)obj.replaceChild(win.document.createTextNode(value),obj.firstChild);}
AshUtil.getInnerText=function(obj){if(obj){if(obj.innerText)return obj.innerText;
		if(obj.textContent)return obj.textContent;
		return obj.nodeType==3?obj.nodeValue:obj.innerHTML;
	}
return'';}
AshUtil.toJSON=function(data){var result='';switch(typeof data){case'boolean':return data?'true':'false';case'number':return data;case'string':return'"'+data.replace(/\\/g,'\\\\').replace(/\r\n/g,'\\n').replace(/\r/g,'\\n').replace(/\"/g,'\\"')+'"';case'object':if(!data)return'null';var isArray=data.constructor==Array?true:false;for(var i in data)result+=isArray?AshUtil.toJSON(data[i])+', ':_SAVN(i)+':'+AshUtil.toJSON(data[i])+', ';result=isArray?'['+result.substr(0,result.length-2)+']':'{'+result.substr(0,result.length-2)+'}';break;}
return result;}
function _SAVN(n){
		if(n.search(/^[0-9]+|[^a-zA-Z0-9_$]/)!=-1)return'"'+n+'"';return n;}
AshUtil.jsonToValue=function(json){eval('var value='+json);return value;}
AshUtil.trim=function(value){return value.replace(/^\s*|\s*$/g,'');}
AshUtil.removeWhiteSpace=function(target){target.innerHTML=target.innerHTML.replace(/<!--(.|\s)*?-->/g,''). replace(/^\s*|\s*$/g,''). replace(/>[\s]+</g,'><');
}
AshUtil.document=Ash.createClass('AshUtil.document',Ash);
AshUtil.document.importJS=function(src,callback){var scriptElem=document.createElement('script'),node=document.getElementsByTagName('head')[0]||document.body;scriptElem.setAttribute('src',src);scriptElem.setAttribute('type','text/javascript');if(callback)scriptElem.onload=callback;node.appendChild(scriptElem);}
AshUtil.document.importCSS=function(href,callback){var linkElem=document.createElement('link'),node=document.getElementsByTagName('head')[0]||document.body;linkElem.setAttribute('rel','stylesheet');linkElem.setAttribute('type','text/css');linkElem.setAttribute('media','screen');linkElem.setAttribute('href',href);if(callback)linkElem.onload=callback;node.appendChild(linkElem);}
AshUtil.document.runtimeAddCSS=function(cssFullSyntax,index){var styleSheet;if(!document.getElementsByTagName('style')[index||0]){document.getElementsByTagName('head')[0].appendChild(document.createElement('style'));styleSheet=document.styleSheets[0];}
else styleSheet=document.styleSheets[index||0];if(AshUtil.browser.ie){var selectors=cssFullSyntax.replace(/\{.*/,'').split(','),style=cssFullSyntax.replace(/^.*\{/,'').replace(/\}.*$/,'');for(var l=selectors.length,i=0;i<l;i++)styleSheet.addRule(selectors[i],style);}
else styleSheet.insertRule(cssFullSyntax,styleSheet.cssRules.length);}
AshUtil.document.runtimeReplaceCSS=function(cssFullSyntax,index){var styleSheet;if(!document.getElementsByTagName('style')[index||0]){document.getElementsByTagName('head')[0].appendChild(document.createElement('style'));styleSheet=document.styleSheets[0];}
else styleSheet=document.styleSheets[index||0];if(AshUtil.browser.ie)for(var i=styleSheet.rules.length-1;i>=0;i--)styleSheet.removeRule(i);else for(var i=styleSheet.cssRules.length-1;i>=0;i--)styleSheet.deleteRule(i);AshUtil.document.runtimeAddCSS(cssFullSyntax,index);}
AshUtil.document.getCSSInStyleElement=function(index){return document.getElementsByTagName('style')[index||0].innerHTML;}
AshUtil.document.scrollInfo=function(){try{return{left:document.documentElement.scrollLeft||document.body.scrollLeft,top:document.documentElement.scrollTop||document.body.scrollTop};}
catch(error){return{left:0,top:0};}}
AshUtil.document.addOption=function(selectObj,values){if(selectObj&&values){var o=document.createElement("option");selectObj.options.add(o);o.value=values.value;o.innerHTML=values.text;}}
AshUtil.document.readyForElement=function(idOrDOMName,callback,checkInterval,abortTime){var f=arguments.callee,target,n=idOrDOMName,interval,check=function(){try{target=eval(n)}
catch(err){target=document.getElementById(n);};if(typeof target=='object')return target;return null;};if(!f.loadedInfo)f.loadedInfo={};if(f.loadedInfo[n]||check())callback(target);else{interval=window.setInterval(function(){if(check()){window.clearInterval( interval);f.loadedInfo[n]=true;if(callback)callback(target);}},checkInterval||10);window.setTimeout(function(){window.clearInterval( interval);},abortTime||10000);}}
AshUtil.document.querySelectorAll=function(selector,callback,contextTarget,callbackThisObj,callbackDescending){var result;try{result=AshUtil.document._sizzle(selector,contextTarget);}
catch(error){};if(result&&callback)result.remoteCall(callback,callbackThisObj,callbackDescending);return result;};var Qsa=AshUtil.document.querySelectorAll;
AshUtil.document.getCookie=function(name){var cookies=document.cookie.split(';'),result='';cookies.remoteCall( function(i,v){var nPart=v.substr(0,v.indexOf('='));if(AshUtil.trim(nPart)==name){result=unescape(v.substr(v.indexOf('=')+1));return false;}});return result;};
AshUtil.document.setCookie=function(name,value,expireDate){var expire='',date;if(expireDate!=null){date=new Date();date.setDate(date.getDate()+expireDate);expire='; expires=' +date.toUTCString();}
document.cookie=name+'=' +escape(value)+expire+'; path=/';};
AshUtil.filter=Ash.createClass('AshUtil.filter',AshUtil);
AshUtil.filter.opacity=function(obj,value){try{if(obj){value=AshUtil.minToMax(value,0,1);obj.style.opacity=value;if(AshUtil.browser.ie)obj.style.filter="alpha(opacity="+(value*100)+")";
		}}
catch(error){}}
AshUtil.filter.blur=function(obj,enabled,radius){try{var availbro=AshUtil.browser;enabled=enabled?true:false;radius=radius||3;if(obj&&availbro.ie){
			if( isNaN(parseInt(obj.style.width)))obj.style.width=obj.offsetWidth+'px';if( isNaN(parseInt(obj.style.height)))obj.style.height=obj.offsetHeight+'px';obj.style.filter="progid:DXImageTransform.Microsoft.Blur(pixelradius="+radius+", enabled='"+enabled+"')";}}
catch(error){}}
AshUtil.color=Ash.createClass('AshUtil.color',AshUtil);
AshUtil.color.toRGB=function(value){if(value.search(/rgb/i)!=-1){
		value=value.replace(/rgb.*\(/,'');value=value.split(',');return Math.floor(parseInt(value[0]))*65536+Math.floor(parseInt(value[1]))*256+Math.floor(parseInt(value[2]));}
return parseInt(value.replace(/#/,'0x'))}
AshUtil.color.toHEX=function(value){if(typeof value=='string'){if(value.search(/rgb/i)!=-1){
			value=AshUtil.color.toRGB(value);}}
var c=function(v){var r=v.toString(16);if(r.length==1)r='0'+r;return r.toUpperCase();};var r=(value>>16),g=(value>>8^ r<<8),b=(value^ (r<<16|g<<8));return'#'+c(r)+c(g)+c(b);}
AshUtil.color.brightness=function(color,ratio){var colors=AshUtil.color.getGradient(color,0xffffff,100);return colors[ratio*100];}
AshUtil.color.darkness=function(color,ratio){var colors=AshUtil.color.getGradient(color,0x000000,100);return colors[ratio*100];}
AshUtil.color.getGradientMap=function(seqeunceColors,seqeunceLength){var colors=[],scs=seqeunceColors,n=seqeunceLength;for(var l=scs.length,i=0;i<l;i++)colors=colors.concat(AshUtil.color.getGradient(scs[i][0],scs[i][1],n));return colors;}
AshUtil.color.drawGradient=function(target,seqeunceColors,seqeunceLength,w,h,vertical){var colors=AshUtil.color.getGradientMap(seqeunceColors,seqeunceLength),dw,dh,l,c;var dummy=document.createElement('DIV');dummy.style.border='0px';dummy.style.position='absolute';l=colors.length;dw=Math.round(w/l);dh=Math.round(h/l);AshUtil.removeAllChild(target);for(var i=0;i<l;i++){c=target.appendChild(dummy.cloneNode(true));c.style.backgroundColor=AshUtil.color.toHEX(colors[i]);if(vertical)AshUtil.rebound(c,0,dh*i,w,dh);else AshUtil.rebound(c,dw*i,0,dw,h);}}
AshUtil.color.getGradient=function(beginColor,endColor,gLength){var colors=[],b=beginColor,e=endColor,n=gLength||100;var b1=b%256,b2=e%256;var g1=((b-b1)/256)%256,g2=((e-b2)/256)%256;var r1=(b-b1-g1*256)/65536,r2=(e-b2-g2*256)/65536;for(var i=0;i<n;i++)colors[i]=b1+(b2-b1)*i/(n-1)+Math.floor((g1+(g2-g1)*i/(n-1)))*256+Math.floor((r1+(r2-r1)*i/(n-1)))*65536;return colors;}
AshUtil.color.drawSwatch=function(target,size){var c,i,j,x,y,ri=0,gi=0,bi=0;var cols=['00','33','66','99','cc','ff'];var extraCols=[0x000000,0x333333,0x666666,0x999999,0xcccccc,0xffffff,0xff0000,0x00ff00,0x0000ff,0xffff00,0x00ffff,0xff00ff];var r=cols[0],g=cols[0],b=cols[0],col;var dummy=document.createElement('DIV'),createPallet;dummy.style.border='0px';dummy.style.position='absolute';size=size||9;createPallet=function(color){var d=dummy.cloneNode(true);AshUtil.resize(d,size,size);d.style.backgroundColor=AshUtil.color.toHEX(color);try{return d;}
finally{
		};}
for(i=0;i<36;i++){if(i%6==0)r=cols[ri++];g=cols[gi++];if(gi>5)gi=0;for(j=0;j<6;j++){b=cols[j];col='0x'+r+g+b;c=createPallet(parseInt(col));x=size+(i*size-(i<18?0:18*size));y=j*size+(i<18?0:6*size);target.appendChild(c);AshUtil.move(c,x,y);}}
for(i=0;i<12;i++){c=createPallet(extraCols[i]);target.appendChild(c);AshUtil.move(c,0,i*size);}}
AshUtil.validity=Ash.createClass('AshUtil.validity',Ash);
AshUtil.validity.toPriceType=function(value){value=AshUtil.trim(String(value)).replace(/,/g,'');for(var i=value.length-1,j=0,str='';i>=0;i--){str=value.charAt(i)+str;if(++j%3==0&&i!=0)str=','+str;}
return str?str:'0';}
AshUtil.validity.priceToNumber=function(value){return typeof value=='number'?value:+(value.replace(/,/g,''));}
AshUtil.validity.onlyNumber=function(o,addPatStr){addPatStr=addPatStr||'';var pattern=new RegExp('[^0-9'+addPatStr+'].*','gi');var chkFunc=function(o){o.value=o.value.replace(pattern,'');};this._regRuntimeEvent(o,chkFunc);chkFunc(o);};AshUtil.validity._regRuntimeEvent=function(o,chkFunc){if(o._eventset31)return;o._eventset31=true;o._onkeyup=o.onkeyup;o.onkeyup=function(){chkFunc(this);if(this._onkeyup)this._onkeyup();}
o._onmousedown=o.onmousedown;o.onmousedown=function(){chkFunc(this);if(this._onmousedown)this._onmousedown();}
o._onblur=o.onblur;o.onblur=function(){chkFunc(this);if(this._onblur)this._onblur();}}
AshUtil.validity.onlyNumberWithEvent=function(e,useComma){var flag=useComma?e.keyCode!=188:true;if(((e.keyCode<48)||(e.keyCode>57))&&(e.keyCode!=8)&&(e.keyCode!=46)&&flag){e.returnValue=false;if(e.preventDefault)e.preventDefault();}}
AshUtil.validity.setCountToTextField=function(o,isUp,fromZero){var chkv=fromZero?0:1;var value=+o.value;if(!value||isNaN(value))o.value=+chkv;else{value+=isUp?1:-1;if(value<chkv)value=chkv;o.value=String(value);}}
var AshEvent=Ash.createClass('AshEvent',Ash);Ash.addPrototype(AshEvent,{
	type:null,
	bubbles:false,
	cancelable:false,
	target:null,
	eventPhase:null,
	currentTarget:null,
	parameters:null});
AshEvent.prototype.initialize=function(){var args=arguments;this.type=args[0]||null,this.bubbles=args[1]?true:false,this.cancelable=args[2]?true:false;}
var AshEventDispatcher=Ash.createClass('AshEventDispatcher',Ash);
AshEventDispatcher.subscribe=function(target,type,listener){if(!target||!type||!listener)return;if(!target._eventAgent)target._eventAgent=new AshEventDispatcher(target);target._eventAgent.addEventListener(type,listener);};
AshEventDispatcher.unsubscribe=function(target,type,listener){if(!target||!target._eventAgent||!type||!listener)return;target._eventAgent.removeEventListener(type,listener);};Ash.addPrototype(AshEventDispatcher,{
	owner:null,
	_listenerObj:null,
	tempData:null,
	openData:null,
	_processDispatchEvent:function(event){var listeners=this._listenerObj[event.type];if(listeners){for(var listener,l=listeners.length,i=0;i<l;i++){listener=listeners[i];listener.call(this,event);}}}});
AshEventDispatcher.prototype.__commonAshreMembers=function(){this._listenerObj={};this.tempData={},this.openData={};}
AshEventDispatcher.prototype.initialize=function(){this.owner=arguments[0]||null;}
AshEventDispatcher.prototype.addEventListener=function(type,listener,useCapture){try{if(!this._listenerObj[type])this._listenerObj[type]=[];this.removeEventListener(type,listener,useCapture);this._listenerObj[type].push(listener);if(this.owner){if(this.owner.addEventListener)this.owner.addEventListener(type,listener,useCapture);else if(this.owner.attachEvent)this.owner.attachEvent('on' +type,listener);}}
catch(err){};}
AshEventDispatcher.prototype.removeEventListener=function(type,listener,useCapture){try{var listeners=this._listenerObj[type];if(this.owner){if(this.owner.removeEventListener)this.owner.removeEventListener(type,listener,useCapture);else if(this.owner.attachEvent)this.owner.detachEvent('on' +type,listener);}
if(listeners){for(var l=listeners.length,i=0;i<l;i++){if(listeners[i]==listener){listeners.splice(i,1);return;}}}}
catch(err){};}
AshEventDispatcher.prototype.dispatchEvent=function(event,parameters){if(!event||!event.type||typeof event!='object')return;if(!event.target)event.target=this.owner?this.owner:this;if(parameters)event.parameters=parameters;this._processDispatchEvent(event);}
AshEventDispatcher.prototype.hasEventListener=function(type){return this._listenerObj[type]?true:false;}
AshEventDispatcher.prototype.getEventListeners=function(type){return this._listenerObj[type];};AshEventDispatcher.subscribe(window,'load',function(e){Ash.windowLoaded=true;});
var AshTimer=Ash.createClass('AshTimer',AshEventDispatcher);
AshTimer.TIMER="timer";
AshTimer.FINISH="finish ";
AshTimer.DEFAULT_DELAY=Math.round(1000/60);
AshTimer.engine=(function(){var isAF=true,f=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame;if(!f){isAF=false;f=function(callback){return window.setTimeout(callback,1000/60);};}
return{isAF:isAF,f:f};})();Ash.addPrototype(AshTimer,{
	delay:0,
	repeatCount:0,
	currentCount:0,
	running:false,
	onTimer:null,
	onFinish:null,
		_intervalID:null,
	initialize:function(delay,repeatCount){this.delay=delay||AshTimer.DEFAULT_DELAY;this.repeatCount=repeatCount||0;var eventHandler=function(e){switch(e.type){case AshTimer.TIMER:this.running=true;if(this.onTimer)this.onTimer(e);if((this.currentCount>=this.repeatCount)&&this.repeatCount!=0)this.stop();else this.currentCount++;break;case AshTimer.FINISH:this.running=false;if(this.onFinish)this.onFinish(e);break;}}
this.addEventListener(AshTimer.TIMER,eventHandler);this.addEventListener(AshTimer.FINISH,eventHandler);},
	start:function(){var own=this,isAF=AshTimer.engine.isAF,f=AshTimer.engine.f;this._timingFunciton=function(){own.dispatchEvent(new AshEvent(AshTimer.TIMER),{delay:own.delay,repeatCount:own.repeatCount,currentCount:own.currentCount,running:own.running});}
		if(isAF&&this.delay<=AshTimer.DEFAULT_DELAY){this._aFCallback=function(){if(own._timingFunciton)own._timingFunciton();f(own._aFCallback);}
f(this._aFCallback);}
else{window.clearInterval(this._intervalID);this._intervalID=window.setInterval(this._timingFunciton,this.delay);}},
	stop:function(){this._timingFunciton=null;this._aFCallback=null;window.clearInterval(this._intervalID);if(this.running)this.dispatchEvent(new AshEvent(AshTimer.FINISH),{delay:this.delay,repeatCount:this.repeatCount,currentCount:this.currentCount,running:this.running});},
	reset:function(){this.stop();this.currentCount=0;}});
var AshTween=Ash.createClass('AshTween',AshEventDispatcher);
AshTween.START='start';
AshTween.PLAYING='playing';
AshTween.REPEAT='repeat';
AshTween.FINISH='finish';
AshTween.EASING_DEFAULT='out';
AshTween.EASING_NONE_IN='none.in';
AshTween.EASING_NONE_OUT='none.out';
AshTween.EASING_NONE_INOUT='none.inout';
AshTween.EASING_REGULAR_IN='regular.in';
AshTween.EASING_REGULAR_OUT='regular.out';
AshTween.EASING_REGULAR_INOUT='regular.inout';
AshTween.EASING_STRONG_IN='strong.in';
AshTween.EASING_STRONG_OUT='strong.out';
AshTween.EASING_STRONG_INOUT='strong.inout';
AshTween.EASING_BACK_IN='back.in';
AshTween.EASING_BACK_OUT='back.out';
AshTween.EASING_BACK_INOUT='back.inout';
AshTween.EASING_BOUNCE_IN='bounce.in';
AshTween.EASING_BOUNCE_OUT='bounce.out';
AshTween.EASING_BOUNCE_INOUT='bounce.inout';
AshTween.EASING_EXPO_IN='expo.in';
AshTween.EASING_EXPO_OUT='expo.out';
AshTween.EASING_EXPO_INOUT='expo.inout';
AshTween.EASING_CIR_IN='cir.in';
AshTween.EASING_CIR_OUT='cir.out';
AshTween.EASING_CIR_INOUT='cir.inout';
AshTween.EASING_SINE_IN='sine.in';
AshTween.EASING_SINE_OUT='sine.out';
AshTween.EASING_SINE_INOUT='sine.inout';
AshTween.EASING_ELASTIC_IN='elastic.in';
AshTween.EASING_ELASTIC_OUT='elastic.out';
AshTween.EASING_ELASTIC_INOUT='elastic.inout';
AshTween.tweenLength=0;
AshTween.listeners=[];AshTween.timer=new AshTimer;AshTween.ct=0;AshTween.started=false;AshTween.easing={none:{_in:function(t,b,c,d){return c*t/d+b;},_out:function(t,b,c,d){return c*t/d+b;},_inout:function(t,b,c,d){return c*t/d+b;}},regular:{_in:function(t,b,c,d){return c*(t/=d)*t+b;},_out:function(t,b,c,d){return-c*(t/=d)*(t-2)+b;},_inout:function(t,b,c,d){if((t/=d/2)<1)return c/2*t*t+b;return-c/2*((--t)*(t-2)-1)+b;}},strong:{_in:function(t,b,c,d){return c*(t/=d)*t*t*t*t+b;},_out:function(t,b,c,d){return c*((t=t/d-1)*t*t*t*t+1)+b;},_inout:function(t,b,c,d){if((t/=d/2)<1)return c/2*t*t*t*t*t+b;return c/2*((t-=2)*t*t*t*t+2)+b;}},back:{_in:function(t,b,c,d){var s=1.70158;return c*(t/=d)*t*((s+1)*t-s)+b;},_out:function(t,b,c,d){var s=1.70158;return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;},_inout:function(t,b,c,d){var s=1.70158;if((t/=d/2)<1)return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b;return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b;}},bounce:{_in:function(t,b,c,d){return c-AshTween.easing.bounce._out(d-t,0,c,d)+b;},_out:function(t,b,c,d){if((t/=d)<(1/2.75))return c*(7.5625*t*t)+b;else if(t<(2/2.75))return c*(7.5625*(t-=(1.5/2.75))*t+.75)+b;else if(t<(2.5/2.75))return c*(7.5625*(t-=(2.25/2.75))*t+.9375)+b;else return c*(7.5625*(t-=(2.625/2.75))*t+.984375)+b;},_inout:function(t,b,c,d){if(t<d/2)return AshTween.easing.bounce._in(t*2,0,c,d)*.5+b;else return AshTween.easing.bounce._out(t*2-d,0,c,d)*.5+c*.5+b;}},expo:{_in:function(t,b,c,d){return(t==0)?b:c*Math.pow(2,10*(t/d-1))+b;},_out:function(t,b,c,d){return(t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b;},_inout:function(t,b,c,d){if(t==0)return b;if(t==d)return b+c;if((t/=d/2)<1)return c/2*Math.pow(2,10*(t-1))+b;return c/2*(-Math.pow(2,-10*--t)+2)+b;}},cir:{_in:function(t,b,c,d){return-c*(Math.sqrt(1-(t/=d)*t)-1)+b;},_out:function(t,b,c,d){return c*Math.sqrt(1-(t=t/d-1)*t)+b;},_inout:function(t,b,c,d){if((t/=d/2)<1)return-c/2*(Math.sqrt(1-t*t)-1)+b;return c/2*(Math.sqrt(1-(t-=2)*t)+1)+b;}},sine:{_in:function(t,b,c,d){return-c*Math.cos(t/d*(Math.PI/2))+c+b;},_out:function(t,b,c,d){return c*Math.sin(t/d*(Math.PI/2))+b;},_inout:function(t,b,c,d){return-c/2*(Math.cos(Math.PI*t/d)-1)+b;}},elastic:{_in:function(t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d)==1)return b+c;if(!p)p=d*.3;if(a<Math.abs(c)){a=c;var s=p/4;}
else var s=p/(2*Math.PI)*Math.asin(c/a);return-(a*Math.pow(2,10*(t-=1))*Math.sin( (t*d-s)*(2*Math.PI)/p))+b;},_out:function(t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d)==1)return b+c;if(!p)p=d*.3;if(a<Math.abs(c)){a=c;var s=p/4;}
else var s=p/(2*Math.PI)*Math.asin(c/a);return a*Math.pow(2,-10*t)*Math.sin( (t*d-s)*(2*Math.PI)/p)+c+b;},_inout:function(t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0)return b;if((t/=d/2)==2)return b+c;if(!p)p=d*(.3*1.5);if(a<Math.abs(c)){a=c;var s=p/4;}
else var s=p/(2*Math.PI)*Math.asin(c/a);if(t<1)return-.5*(a*Math.pow(2,10*(t-=1))*Math.sin( (t*d-s)*(2*Math.PI)/p))+b;return a*Math.pow(2,-10*(t-=1))*Math.sin( (t*d-s)*(2*Math.PI)/p)*.5+c+b;}}}
	
	
	AshTween.getEasing=function(easingName){easingName=easingName||'out';var f=AshTween.easing;var dotStr=(easingName.toLowerCase()).split('.');if(dotStr.length==1)dotStr=['expo'].concat(dotStr);dotStr[1]='_'+dotStr[1];for(var i=0;i<dotStr.length;i++){f=f[dotStr[i]];if(!f)return AshTween.easing.bounce._out;}
return f;}
	AshTween.addListener=function(tween){var index=AshTween.listeners.length;if(AshTween.existTween(tween))return;AshTween.listeners[index]=tween;tween.tweenIndex=index;}
	AshTween.removeListenerToIndex=function(index){return delete AshTween.listeners[index];}
	AshTween.removeListener=function(tween){for(var i in AshTween.listeners){if(AshTween.listeners[i]==tween){return delete AshTween.listeners[i];}}
return false;}
AshTween.existTween=function(tween){for(var i in AshTween.listeners){if(AshTween.listeners[i]==tween){return true;}}
return false;}
AshTween.start=function(){if(this.started)return;this.started=true;var internalFunc=function(){var t=AshTween.ct=(new Date).getTime(),tween,leng=0;for(var i in AshTween.listeners){tween=AshTween.listeners[i];if(tween.isPlaying)tween.tweenValidate(t);leng++;}
AshTween.tweenLength=leng;}
this.timer.addEventListener(AshTimer.TIMER,internalFunc);this.timer.start();internalFunc();}
Ash.addPrototype(AshTween,{
	useCountDuration:false,
	startValue:null,
	endValue:null,
	tweenedValue:null,
	duration:0,
	position:0,
	repeatCount:0,
	isPlaying:false,
	coworkMotioner:null,
	coworkName:null,
	easing:null,tweenIndex:0,repeatCountLength:0,callback:null,st:0,
	initialize:function(){var own=this;var args=arguments;this.startValue=args[0];this.endValue=args[1];this.duration=args[2]||1000;this.setEasing(args[3]);this.repeatCount=args[4]!=null?args[4]:1;this.useCountDuration=args[5]?true:false;},
	setEasing:function(easingName){this.easing=AshTween.getEasing(easingName||'out');},
	play:function(callback){this.callback=null;
		if( callback!=null)this.callback=callback;this.position=this.repeatCountLength=0;this.isPlaying=true;if( !this.useCountDuration)this.st=AshTween.ct;this.tweenedValue=this.ipv( this.startValue,this.endValue,this.easing(this.position,0,1,this.duration));this.castEvent(AshTween.START);AshTween.addListener(this);},
	stop:function(){this.callback=null;this.isPlaying=false;AshTween.removeListenerToIndex(this.tweenIndex);},
	pause:function(){this.isPlaying=false;},
	resume:function(){this.isPlaying=true;if( !this.useCountDuration)this.st=AshTween.ct-this.position;},
		tweenValidate:function(t){if( this.useCountDuration)this.position++;else this.position=(t-this.st);if( this.position<=this.duration){this.tweenedValue=this.ipv( this.startValue,this.endValue,this.easing(this.position,0,1,this.duration));this.castEvent( AshTween.PLAYING);}
else{this.repeatCountLength++;if( this.repeatCount==0?true:this.repeatCountLength<this.repeatCount)
				{this.castEvent( AshTween.REPEAT);this.position=0;if( !this.useCountDuration)this.st=t;}
else{this.tweenedValue=this.endValue;this.position=0;this.isPlaying=false;this.castEvent( AshTween.FINISH);
					
					
					if(this.isPlaying)return;this.stop();}}},ipv:function(s,e,p){var r;if(typeof e=='number')r=Number(s)*(1-p)+Number(e)*p;else if( typeof e=='object' ){r=new e['constructor'];
				for(var i in e)r[i]=this.ipv( s[i],e[i],p);}
return r;},castEvent:function(type){var e=new AshEvent(type);e.parameters={tweenedValue:this.tweenedValue,position:this.position,duration:this.duration};if(this.coworkMotioner)this.coworkMotioner.remoteCallAshTween(e,this.coworkName);else{if(this.callback)this.callback.call(this,e);}
this.dispatchEvent( e);}});AshTween.start();
var AshMotioner=Ash.createClass('AshMotioner',AshEventDispatcher);
AshMotioner.MOTION='motion';
Ash.addPrototype(AshMotioner,{
	duration:1000,
	easingName:'out',
	repeatCount:1,
	useCountDuration:false,
	tweens:null,fromV:null,toV:null,allp:null,
	
	initialize:function(){var own=this;var args=arguments;this.tweens={};this.fromV={};this.toV={};this.allp={};this.owner=args[0]||null;if(args[1])this.duration=args[1];if(args[2])this.easingName=args[2];if(args[3])this.repeatCount=Number(args[3]);if(args[4])this.useCountDuration=true;},
	x:function(value,duration,easingName,callback,repeatCount,useCountDuration){this._playAsOne('x',value,duration,easingName,callback,repeatCount,useCountDuration);},
	y:function(value,duration,easingName,callback,repeatCount,useCountDuration){this._playAsOne('y',value,duration,easingName,callback,repeatCount,useCountDuration);},
	width:function(value,duration,easingName,callback,repeatCount,useCountDuration){this._playAsOne('width',value,duration,easingName,callback,repeatCount,useCountDuration);},
	height:function(value,duration,easingName,callback,repeatCount,useCountDuration){this._playAsOne('height',value,duration,easingName,callback,repeatCount,useCountDuration);},
	alpha:function(value,duration,easingName,callback,repeatCount,useCountDuration){this._playAsOne('alpha',value,duration,easingName,callback,repeatCount,useCountDuration);},_playAsOne:function( p,value,duration,easingName,callback,repeatCount,useCountDuration){if(!this.owner)return;var at=this.getTween(p);at.startValue=0;at.endValue=1;this.fromV[p]=this.getFromValue(p);this.toV[p]=value;if(duration)at.duration=duration;if(repeatCount!=null)at.repeatCount=repeatCount;if(useCountDuration)at.useCountDuration=useCountDuration;if(easingName)at.setEasing(easingName);at.play(callback);},
	play:function( values,duration,easingName,callback,repeatCount,useCountDuration){if(!this.owner)return;var at=this.getTween('all');
		at.startValue=0;at.endValue=1;this.allp={};for(var p in values){this.clearTween(p);
			this.fromV[p]=this.getFromValue(p);this.toV[p]=values[p];this.allp[p]=true;}
if(duration)at.duration=duration;if(repeatCount!=null)at.repeatCount=repeatCount;if(useCountDuration)at.useCountDuration=useCountDuration;if(easingName)at.setEasing(easingName);at.play(callback);},
	stop:function(){for(var n in this.tweens)this.clearTween(n);this.tweens={};},
	getTween:function(name){var at=this.tweens[name];if(!at){at=this.tweens[name]=new AshTween();at.duration=this.duration;at.repeatCount=this.repeatCount;at.useCountDuration=this.useCountDuration;at.setEasing(this.easingName);at.coworkMotioner=this;at.coworkName=name;}
return at;},
	clearTween:function( name){if( this.tweens[name]){this.tweens[name].coworkMotioner=null;this.tweens[name].coworkName=null;this.tweens[name].stop();delete this.tweens[name];}},
	existTween:function(name){if( this.tweens[name])return true;return false;},
		getFromValue:function(p){var value,p1,p2;if(p=='alpha'){if(AshUtil.browser.ie){value=this.owner.style.filter.indexOf('opacity')!=-1?parseInt((this.owner.style.filter.split('='))[1])/100:(parseFloat(this.owner.style.opacity)||1);}
else{value=parseFloat(this.owner.style.opacity);}
if(isNaN(value))value=1;}
else{switch(p){case'x':p1='left',p2='offsetLeft';break;case'y':p1='top',p2='offsetTop';break;case'width':p1='width',p2='offsetWidth';break;case'height':p1='height',p2='offsetHeight';break;}
value=parseInt(this.owner.style[p1]);if(isNaN(value)){value=parseInt(this.owner[p2]);if(isNaN(value))value=0;}}
return value;},remoteCallAshTween:function(e,name){var tv=e.parameters.tweenedValue;if(name=='all')for(var n in this.allp)this.processMotion(n,tv);else this.processMotion( name,tv);if(this.tweens[name].callback)this.tweens[name].callback.call(this.tweens[name],e);if(e.type==AshTween.FINISH)this.clearTween(name);this.dispatchEvent(new AshEvent(AshMotioner.MOTION),{motionType:name,type:e.type,tweenedValue:tv,tweenEvent:e});},processMotion:function(n,p){var value=this.fromV[n]*(1-p)+this.toV[n]*p,value2=Math.round(value);switch(n){case'x':this.owner.style.left=value2+'px';break;case'y':this.owner.style.top=value2+'px';break;case'width':this.owner.style.width=Math.abs(value2)+'px';break;case'height':this.owner.style.height=Math.abs(value2)+'px';break;case'alpha':if( /[^.0-9]/g.test(value.toString()))value=Math.round(value);
					this.owner.style.opacity=value;if(AshUtil.browser.ie)this.owner.style.filter="alpha(opacity="+(value*100)+")";break;}}});
AshMotioner.prototype.left=AshMotioner.prototype.x;
AshMotioner.prototype.top=AshMotioner.prototype.y;
AshMotioner.prototype.tween=AshMotioner.prototype.play;
var AshMotionAgent=Ash.createClass('AshMotionAgent',AshMotioner);
AshMotionAgent.tween=function(target,props,duration,easingName,callback,repeatCount,useCountDuration){var sma=new AshMotionAgent(target);sma.tween(props,duration,easingName,callback,repeatCount,useCountDuration);return sma;}
var AshAgent=Ash.createClass('AshAgent',AshMotionAgent);Ash.addPrototype(AshAgent,{
	initialize:function(){
		this.tweens={};this.fromV={};this.toV={};this.allp={};this.owner=arguments[0];if(arguments[1]&&typeof arguments[1]=='function')arguments[1].call(this);
	},
	getHTML:function(){return this.owner.innerHTML;},
	getOuterHTML:function(){try{if(this.owner.outerHTML)return this.owner.outerHTML;else return(new XMLSerializer).serializeToString(this.owner);}
catch(err){};return'';},
	setHTML:function(htmlText){if(htmlText=='reset')htmlText='';this.owner.innerHTML=htmlText;},
	insertHTML:function(htmlText){var dummy=document.createElement('div');dummy.innerHTML=htmlText;try{return this.addChild(dummy.firstChild);}
finally{
		};},
	insertBeforeHTML:function(htmlText,targetElement){var dummy=document.createElement('div');dummy.innerHTML=htmlText;try{return this.insertBefore(dummy.firstChild,targetElement);}
finally{
		};},
	setInnerText:function(text){AshUtil.setInnerText(this.owner,text);},
	getInnerText:function(){return AshUtil.getInnerText(this.owner);},
	addChild:function(element){return this.owner.appendChild(element);},
	removeChild:function(element){return this.owner.removeChild(element);},
	insertBefore:function(element,targetElement){return this.owner.insertBefore(element,targetElement);},
	getChildAt:function(index){return this.owner.childNodes[index];},
	getFirstChild:function(){return this.owner.firstChild;},
	getLastChild:function(){return this.owner.lastChild;},
	getChildByName:function(name){return AshUtil.getChildByName(this.owner,name);},
	contains:function(child){return AshUtil.contains(this.owner,child);},
	getStyle:function(prop){return AshUtil.getStyle(this.owner,prop);},
	setStyle:function(prop,value){this.owner.style[prop]=value;},
	resetWidth:function(){this.setStyle('width','auto');},
	resetHeight:function(){this.setStyle('height','auto');},
	getWidth:function(){return this.owner.offsetWidth;},
	settWidth:function(value){this.setStyle('width',value+'px');},
	getHeight:function(){return this.owner.offsetHeight;},
	setHeight:function(value){this.setStyle('height',value+'px');},
	move:function(x,y){AshUtil.move(this.owner,x,y);},
	resize:function(w,h){AshUtil.resize(this.owner,w,h);},
	rebound:function(x,y,w,h){AshUtil.rebound(this.owner,x,y,w,h);},
	getBounds:function(){return AshUtil.getBounds(this.owner);},
	globalCoordinates:function(){return AshUtil.globalCoordinates(this.owner);},
	hitTest:function(targetElement){return AshUtil.hitTest(this.owner,targetElement);},
	setOpacity:function(value){AshUtil.filter.opacity(this.owner,value);}});
var AshAJAX=Ash.createClass('AshAJAX',AshEventDispatcher);
AshAJAX.ABORTED='aborted';
AshAJAX.COMPLETED='completed';
AshAJAX.LOAD_ERROR='loadError';
AshAJAX.limitTime=10000;
AshAJAX.createXMLHttp=function(){var xhr;
	try{if(window.ActiveXObject){
			try{
				xhr=new ActiveXObject("Msxml2.XMLHTTP");}
catch(e){try{xhr=new ActiveXObject("Microsoft.XMLHTTP");}
catch(e2){}}}
		else if(window.XMLHttpRequest)xhr=new XMLHttpRequest();return xhr;}
finally{
	}}
AshAJAX.send=function(callback,content,method,url,async,user,password){var ajax=new AshAJAX(content,method,url,async,user,password);ajax.onCompleted=callback;ajax.send();return ajax;}
Ash.addPrototype(AshAJAX,{
	xhr:null,
	content:null,
	method:'POST',
	url:'',
	async:true,
	user:null,
	password:null,
	running:false,
	responseText:null,
	responseXML:null,
	_interval:null,
	onAborted:null,
	onCompleted:null,
	onLoadError:null,
	_onAborted:function(event){if(this.onAborted!=null)this.onAborted(event);},_onCompleted:function(event){if(this.onCompleted!=null)this.onCompleted(event);},_onLoadError:function(event){if(this.onLoadError!=null)this.onLoadError(event);},_reset:function(){this.running=false;clearTimeout(this._interval);},_loadComplete:function(){try{this._reset();this.responseText=this.xhr.responseText;this.responseXML=this.xhr.responseXML;this.dispatchEvent(new AshEvent(AshAJAX.COMPLETED),{readyState:this.xhr.readyState,responseText:this.xhr.responseText,status:this.xhr.status});
			this.xhr.abort();this.xhr=null;}
catch(error){}},_encode:function(data){var result='';for(var p in data)result+=p+'=' +encodeURIComponent(data[p])+'&';return result;}});
AshAJAX.prototype.initialize=function(){args=arguments;this.content=args[0]||null;if(args[1]&&args[1].toUpperCase()=='GET')this.method=args[1];if(args[2])this.url=encodeURI(args[2]);if(args[3]!=null)this.async=args[3];if(args[4])this.user=args[4];if(args[5])this.password=args[5];this.addEventListener(AshAJAX.ABORTED,this._onAborted);this.addEventListener(AshAJAX.COMPLETED,this._onCompleted);this.addEventListener(AshAJAX.LOAD_ERROR,this._onLoadError);}
AshAJAX.prototype.send=function(content,method,url,async,user,password){if(this.running)return;this.running=true;try{var own=this,xhr=this.xhr=AshAJAX.createXMLHttp();this.content=content||this.content;this.method=method||this.method;this.url=url?encodeURI(url):this.url;this.async=async!=null?async:this.async;this.user=user||this.user;this.password=password||this.password;if(!this.url){this._reset();return;}
if(AshUtil.browser.ie){xhr.onreadystatechange=function(){if(xhr.readyState==4)own._loadComplete();};}
else{xhr.onreadystatechange=function(){if(xhr.readyState==4)own._loadComplete();};}
xhr.open(this.method,this.url,this.async,this.user,this.password);if(this.method.toUpperCase()=='POST')xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");xhr.send(this.method.toUpperCase()=='POST'?this._encode(this.content):'unique='+(new Date()).getTime());clearTimeout(this._interval);this._interval=setTimeout(function(){own.abort();own.dispatchEvent(new AshEvent(AshAJAX.LOAD_ERROR));},AshAJAX.limitTime);}
catch(error){this._reset();}}
AshAJAX.prototype.abort=function(){this._reset();if(this.xhr){this.dispatchEvent(new AshEvent(AshAJAX.ABORTED));this.xhr.abort();}}
var AshDepthManager=Ash.createClass('AshDepthManager',AshEventDispatcher);
AshDepthManager.MANAGED='managed';
Ash.addPrototype(AshDepthManager,{
	extraDepth:100,
	lastManagedDepth:100,targets:null,onManaged:null,
	_onManaged:function(e){if(this.onManaged!=null)this.onManaged(e);},isAvailable:function(target){
		if(target&&target.style&&AshUtil.getStyle(target,'position')=='absolute' )return true;return false;},duplieCheckAndReconstruction:function(target){for(var t,ts=this.targets,l=ts.length,i=0;i<l;i++){if(ts[i]==target){ts[i]=null;ts.splice(i,1);return;}}},applyDepth:function(target,mode){this.duplieCheckAndReconstruction(target);switch(mode){case'front':this.targets.push(target);break;case'back':this.targets.unshift(target);break;case'next':if(target.__saveDepthIndex!=null)this.targets.splice(target.__saveDepthIndex+1,0,1);else this.targets.push(target);break;case'prev':if(target.__saveDepthIndex!=null)this.targets.splice(target.__saveDepthIndex-1,0,1);else this.targets.unshift(target);break;}
for(var t,ts=this.targets,l=ts.length,i=0;i<l;i++){t=ts[i];if(t){t.__saveDepthIndex=i;t.style.zIndex=i+this.extraDepth;}
else ts.splice(i,1);}
if( target.__saveDepthIndex!=null){this.lastManagedDepth=target.style.zIndex;this.dispatchEvent(new AshEvent(AshDepthManager.MANAGED),{target:t,depth:t.__saveDepthIndex});}}});
AshDepthManager.prototype.initialize=function(){if(this.instancedCount>=2)throw new Error('no more can’t create an instance[AshDepthManager]');this.targets=[];this.addEventListener(AshDepthManager.MANAGED,this._onManaged);}
AshDepthManager.prototype.register=function(target,applyDepthNow){if(this.isAvailable(target)){this.duplieCheckAndReconstruction(target);this.targets.push(target);if(applyDepthNow)target.style.zIndex=this.lastManagedDepth;}}
AshDepthManager.prototype.unRegister=function(target){if(this.isAvailable(target))this.duplieCheckAndReconstruction(target);}
AshDepthManager.prototype.front=function(target){if(this.isAvailable(target))this.applyDepth(target,'front');}
AshDepthManager.prototype.back=function(target){if(this.isAvailable(target))this.applyDepth(target,'back');}
AshDepthManager.prototype.next=function(target){if(this.isAvailable(target))this.applyDepth(target,'next');}
AshDepthManager.prototype.prev=function(target){if(this.isAvailable(target))this.applyDepth(target,'prev');}
AshDepthManager.manager=new AshDepthManager();
var AshDrag=Ash.createClass('AshDrag',AshEventDispatcher);
AshDrag.DRAG_START='dragStart';
AshDrag.DRAGGING='dragging';
AshDrag.DRAG_STOP='dragStop';
AshDrag.createInitPositionValueForRelative=function(t){if(t){if( !t.__init_for_relative){try{var left=parseInt(AshUtil.getStyle(t,'left')),top=parseInt(AshUtil.getStyle(t,'top'));t.__init_for_relative={x:t.offsetLeft-left||t.offsetLeft,y:t.offsetTop-top||t.offsetTop};}
catch(error){t.__init_for_relative={x:0,y:0};};}}}
Ash.addPrototype(AshDrag,{
	target:null,
	x:0,
	y:0,
	left:0,
	top:0,
	result:{x:0,y:0,left:0,top:0,target:null},
	draggable:true,
	onDragStart:null,
	onDragging:null,
	onDragStop:null,
	_agent:new AshEventDispatcher(document),sx:0,sy:0,useok:false,_onDragStart:function(e){if(this.onDragStart!=null)this.onDragStart(e);},_onDragging:function(e){if(this.onDragging!=null)this.onDragging(e);},_onDragStop:function(e){if(this.onDragStop!=null)this.onDragStop(e);},_pv:function(value){return parseInt(value);},_castEvent:function(eventType){var r=this.result,t=r.target=this.target;r.x=r.left=this.x=this.left=this._pv(t.style.left);r.y=r.top=this.y=this.top=this._pv(t.style.top);this.dispatchEvent(new AshEvent(eventType),r);},
	_onMouseDownRemoteTarget:function(e,callOwner){if(!e||callOwner!=AshDragAndDrop.manager)return;this._onMouseDown(e);},_onMouseDown:function(e){
		var own=arguments.callee.owner,t=e.target||e.srcElement,targetName=null,sinfo=AshUtil.document.scrollInfo();if(!own.useok)return;if(t&&t.getAttribute('ashdrag')=='true'){targetName=t.getAttribute('ashdragtarget');if(targetName){ns=targetName.split('.');if(ns.length==1&&ns[0]!='parent')t=AshUtil.obj(ns[0]);else{for(var i=0;i<ns.length;i++)if(ns[i]=='parent')t=t.parentNode;}}
if(!t)return;if(t.__remoteAccessResizeable)return;
			if(e.preventDefault)e.preventDefault();
			if('onselectstart' in document){if(document.onselectstart!=null)document._ash_onselectstart=document.onselectstart;document.onselectstart=function(){if(this._ash_onselectstart!=null)this._ash_onselectstart();return false;}}
own.draggable=true;own.target=own.result.target=t;own.sx=sinfo.left+(e.clientX-t.offsetLeft);own.sy=sinfo.top+(e.clientY-t.offsetTop);AshDrag.createInitPositionValueForRelative(t);
			if(AshUtil.getStyle(t,'position')=='relative')own.sx+=t.__init_for_relative.x,own.sy+=t.__init_for_relative.y;own._castEvent(AshDrag.DRAG_START);}},_onMouseMove:function(e){var own=arguments.callee.owner,r=own.result,t=own.target,x,y,dragArea,b,sinfo=AshUtil.document.scrollInfo();if(!own.useok)return;if(t&&own.draggable){x=sinfo.left+(e.clientX-own.sx);y=sinfo.top+(e.clientY-own.sy);dragArea=t.getAttribute('ashdragarea');if(dragArea){b=dragArea.split(',');x=AshUtil.minToMax(x,parseInt(b[0]),parseInt(b[0])+parseInt(b[2]));y=AshUtil.minToMax(y,parseInt(b[1]),parseInt(b[1])+parseInt(b[3]));}
AshUtil.move(t,x,y);own._castEvent(AshDrag.DRAGGING);}},_onMouseUp:function(e){var own=arguments.callee.owner;if(!own.useok)return;own.draggable=false;if( own.target)own._castEvent(AshDrag.DRAG_STOP);own.target=null;
		if('onselectstart' in document){if(document._ash_onselectstart!=null){document.onselectstart=document._ash_onselectstart;document._ash_onselectstart=null;}
else document.onselectstart=null;}},initialize:function(){if(this.instancedCount>=2)throw new Error('no more can’t create an instance[AshDrag]');
		this._onMouseDown.owner=this._onMouseMove.owner=this._onMouseUp.owner=this;this._agent.addEventListener('mousedown',this._onMouseDown);this._agent.addEventListener('mousemove',this._onMouseMove);this._agent.addEventListener('mouseup',this._onMouseUp);this.addEventListener(AshDrag.DRAG_START,this._onDragStart);this.addEventListener(AshDrag.DRAGGING,this._onDragging);this.addEventListener(AshDrag.DRAG_STOP,this._onDragStop);}});
AshDrag.prototype.start=function(){this.useok=true;this.draggable=false;}
AshDrag.prototype.stop=function(){this.useok=false;this.draggable=false;}
AshDrag.prototype.abort=function(){if(this.draggable)this._onMouseUp();}
AshDrag.manager=new AshDrag();AshDrag.manager.start();
var AshDragAndDrop=Ash.createClass('AshDragAndDrop',AshEventDispatcher);
Ash.addPrototype(AshDragAndDrop,{
	target:null,
	targetOwner:null,
	result:{x:0,y:0,left:0,top:0,target:null,targetOwner:null},
	alpha:0.5,
	onDragStart:null,
	onDragging:null,
	onDragStop:null,
	useok:false,_agent:new AshEventDispatcher(document),_onDragStart:function(e){if(this.onDragStart!=null)this.onDragStart(e);},_onDragging:function(e){if(this.onDragging!=null)this.onDragging(e);},_onDragStop:function(e){if(this.onDragStop!=null)this.onDragStop(e);},_clearTarget:function(){if(this.target){if(this.target.parentNode)this.target.parentNode.removeChild(this.target);AshDepthManager.manager.unRegister(this.target);}},_onAshDragCastEvent:function(e){var own=arguments.callee.owner;own.result=e.parameters;own.result.targetOwner=own.targetOwner;own.dispatchEvent(new AshEvent(e.type),own.result);switch(e.type){case AshDrag.DRAG_STOP:own._clearTarget();break;}},_onMouseDown:function(e){var own=arguments.callee.owner,t=e.target||e.srcElement,targetName,b=document.body,c,p,se;own._clearTarget();if(!own.useok)return;try{if(t&&(t=own._findParent(t))){targetName=t.getAttribute('ashdragtarget');if(targetName){ns=targetName.split('.');if(ns.length==1&&ns[0]!='parent')t=AshUtil.obj(ns[0]);else{for(var i=0;i<ns.length;i++)if(ns[i]=='parent')t=t.parentNode;}}
if(!t)return;p=AshUtil.globalCoordinates(t);c=own.target=b.appendChild(t.cloneNode(true));c.owner=own.targetOwner=t;c.setAttribute('ashdrag','true');c.style.position='absolute';c.onselectstart=c.ondragtstart=function(){return false;};if( t.parentNode&&!AshUtil.browser.opera){
					if(t.parentNode.scrollLeft)p.x-=parseInt(t.parentNode.scrollLeft);if(t.parentNode.scrollTop)p.y-=parseInt(t.parentNode.scrollTop);}
AshUtil.rebound(c,p.x,p.y,t.offsetWidth,t.offsetHeight);AshUtil.filter.opacity(c,own.alpha);AshDepthManager.manager.front(c);se=new AshEvent();se.target=c;se.clientX=e.clientX;se.clientY=e.clientY;AshDrag.manager._onMouseDownRemoteTarget(se,own);c.style.display='none';
			}}
catch(error){};},_onMouseMove:function(){var own=arguments.callee.owner;if(own.target){if(own.target.moving)return;own.target.moving=true;own.target.style.display='block';}},_findParent:function(t){var gp=function(t){var obj=null;if(t.nodeName.toUpperCase()=='HTML')return null;if( t.getAttribute('ashdraganddrop')=='true' )return t;else{if(t.parentNode&&t.parentNode!=document.body)obj=gp(t.parentNode);}
return obj;}
try{return gp(t)}
finally{
			};},
	initialize:function(){if(this.instancedCount>=2)throw new Error('no more can’t create an instance[AshDragAndDrop]');this._onMouseDown.owner=this._onMouseMove.owner=this._onAshDragCastEvent.owner=this;this._agent.addEventListener('mousedown',this._onMouseDown);this._agent.addEventListener('mousemove',this._onMouseMove);AshDrag.manager.addEventListener(AshDrag.DRAG_START,this._onAshDragCastEvent);AshDrag.manager.addEventListener(AshDrag.DRAGGING,this._onAshDragCastEvent);AshDrag.manager.addEventListener(AshDrag.DRAG_STOP,this._onAshDragCastEvent);this.addEventListener(AshDrag.DRAG_START,this._onDragStart);this.addEventListener(AshDrag.DRAGGING,this._onDragging);this.addEventListener(AshDrag.DRAG_STOP,this._onDragStop);}});
AshDragAndDrop.prototype.start=function(){this.useok=true;}
AshDragAndDrop.prototype.stop=function(){this.useok=false;}
AshDragAndDrop.manager=new AshDragAndDrop();AshDragAndDrop.manager.start();
var AshResize=Ash.createClass('AshResize',AshEventDispatcher);
AshResize.RESIZE_START='resizeStart';
AshResize.RESIZING='resizing';
AshResize.RESIZE_STOP='resizeStop';
Ash.addPrototype(AshResize,{
	target:null,
	x:0,
	y:0,
	width:0,
	height:0,
	direction:'',
	result:{x:0,y:0,width:0,height:0,direction:'',target:null},
	resizeable:false,
	onResizeStart:null,
	onResizing:null,		
	onResizeStop:null,
	_agent:new AshEventDispatcher(document),useok:false,captured:false,sx:0,sy:0,sl:0,st:0,sw:0,sh:0,_onResizeStart:function(e){if(this.onResizeStart!=null)this.onResizeStart(e);},_onResizing:function(e){if(this.onResizing!=null)this.onResizing(e);},_onResizeStop:function(e){if(this.onResizeStop!=null)this.onResizeStop(e);},_castEvent:function(eventType){var r=this.result,t=this.target;r.x=this.x=t.offsetLeft;r.y=this.y=t.offsetTop;r.width=this.width=t.offsetWidth;r.height=this.height=t.offsetHeight;r.direction=this.direction;this.dispatchEvent(new AshEvent(eventType),r);},_available:function(v){switch(v){case'n':case'e':case's':case'w':case'ne':case'nw':case'se':case'sw':return true;break;};return false;},
	initialize:function(){this.setTarget(arguments[0]);
		var td=this.tempData;
		td.onMouseDown=function(e){var own=arguments.callee.owner,t=own.target;if(!own.useok||!t)return;var sinfo=AshUtil.document.scrollInfo();
			var pl=parseInt(AshUtil.getStyle(t,'paddingLeft')),pr=parseInt(AshUtil.getStyle(t,'paddingRight')),pt=parseInt(AshUtil.getStyle(t,'paddingTop')),pb=parseInt(AshUtil.getStyle(t,'paddingBottom'));if(isNaN(pl))pl=0;if(isNaN(pr))pr=0;if(isNaN(pt))pt=0;if(isNaN(pb))pb=0;if(own.resizeable){own.captured=true;own.sx=sinfo.left+e.clientX,own.sy=sinfo.top+e.clientY;own.sl=t.offsetLeft,own.st=t.offsetTop,own.sw=t.offsetWidth-(pl+pr),own.sh=t.offsetHeight-(pt+pb);AshDrag.createInitPositionValueForRelative(t);
				if(AshUtil.getStyle(t,'position')=='relative')own.sl-=t.__init_for_relative.x,own.st-=t.__init_for_relative.y;own._castEvent(AshResize.RESIZE_START);}}
td.onMouseMove=function(e){var own=arguments.callee.owner,t=own.target,d='';if(!own.useok||!t)return;if(own.captured){try{var x=e.clientX,y=e.clientY,d=own.direction,minW=own.minWidth,maxW=own.maxWidth,minH=own.minHeight,maxH=own.maxHeight;var isMaxW=(maxW>-1&&maxW>minW)?true:false,isMaxH=(maxH>-1&&maxH>minH)?true:false,conditionX,conditionY;var sinfo=AshUtil.document.scrollInfo();x+=sinfo.left;y+=sinfo.top;if(d.search(/n/)!=-1){conditionY=isMaxH?((own.sy+own.sh)-maxH<y&&y<(own.sy+own.sh)-minH):(y<(own.sy+own.sh)-minH);if(conditionY)t.style.top=own.st+(y-own.sy)+'px';t.style.height=isMaxH?AshUtil.minToMax(own.sh+(own.sy-y),minH,maxH)+'px':Math.max(own.sh+(own.sy-y),minH)+'px';}
if(d.search(/e/)!=-1){t.style.width=isMaxW?AshUtil.minToMax(own.sw+(x-own.sx),minW,maxW)+'px':Math.max(own.sw+(x-own.sx),minW)+'px';}
if(d.search(/s/)!=-1){t.style.height=isMaxH?AshUtil.minToMax(own.sh+(y-own.sy),minH,maxH)+'px':Math.max(own.sh+(y-own.sy),minH)+'px';}
if(d.search(/w/)!=-1){conditionX=isMaxW?((own.sx+own.sw)-maxW<x&&x<(own.sx+own.sw)-minW):(x<(own.sx+own.sw)-minW);if(conditionX)t.style.left=own.sl+(x-own.sx)+'px';t.style.width=isMaxW?AshUtil.minToMax(own.sw+(own.sx-x),minW,maxW)+'px':Math.max(own.sw+(own.sx-x),minW)+'px';}
own._castEvent(AshResize.RESIZING);}
catch(error){};}
else{own.resizeable=false;own.direction='';t.__remoteAccessResizeable=false;
				if(AshUtil.getStyle(t,'position')!='static'){var x=e.clientX,y=e.clientY,tl=t.offsetLeft,tt=t.offsetTop,tw=t.offsetWidth,th=t.offsetHeight,s=own.sensitivity;var sinfo=AshUtil.document.scrollInfo();x+=sinfo.left;y+=sinfo.top;if(tt<=y&&y<=tt+s)d='n';if(tt+th-s<=y&&y<=tt+th)d='s';if(tl<=x&&x<=tl+s)d+='w';if(tl+tw-s<=x&&x<=tl+tw)d+='e';if(own.allowedDirection){var cds=own.allowedDirection.split(',');chk=function(v){for(var l=cds.length,i=0;i<l;i++){if(cds[i]==v)return true;}
return false;};if(!chk(d))d='';
					}
t.style.cursor=d?(d+"-resize"):(own.defaultCursor?own.defaultCursor:"default");if(own._available(d)){
						own.resizeable=true;own.direction=d;t.__remoteAccessResizeable=true;}}}}
td.onMouseUp=function(e){var own=arguments.callee.owner,t=own.target;if(!own.useok||!t||!own.resizeable)return;own.resizeable=own.captured=false;own._castEvent(AshResize.RESIZE_STOP);t.style.cursor=own.defaultCursor?own.defaultCursor:"default";t.__remoteAccessResizeable=false;}
td.onMouseDown.owner=td.onMouseMove.owner=td.onMouseUp.owner=this;
		this._agent.addEventListener('mousedown',td.onMouseDown);this._agent.addEventListener('mousemove',td.onMouseMove);this._agent.addEventListener('mouseup',td.onMouseUp);this.addEventListener(AshResize.RESIZE_START,this._onResizeStart);this.addEventListener(AshResize.RESIZING,this._onResizing);this.addEventListener(AshResize.RESIZE_STOP,this._onResizeStop);}});
AshResize.prototype.sensitivity=10;
AshResize.prototype.minWidth=20;
AshResize.prototype.minHeight=20;
AshResize.prototype.maxWidth=-1;
AshResize.prototype.maxHeight=-1;
AshResize.prototype.allowedDirection='';
AshResize.prototype.defaultCursor='';
AshResize.prototype.setTarget=function(target){if(target)this.target=this.owner=target;}
AshResize.prototype.start=function(){this.useok=true;this.resizeable=this.captured=false;}
AshResize.prototype.stop=function(){this.useok=false;this.resizeable=this.captured=false;}
AshResize.prototype.abort=function(){if(this.resizeable)this.tempData.onMouseUp();}
var AshPopup=Ash.createClass('AshPopup',AshEventDispatcher);
AshPopup.CREATE='create';
AshPopup.CLEAR='clear';
Ash.addPrototype(AshPopup,{
	target:null,
	cloner:null,
	coordinates:null,
	useMotion:true,
	onCreate:null,
	onClear:null,
	callback:null,
	useAutoClearAsRollout:true,
	_agent:null,event:null,rollover:false,_onCreate:function(e){if(this.onCreate!=null)this.onCreate(e);},_onClear:function(e){if(this.onClear!=null)this.onClear(e);},_createDummyElement:function(){var d=this.tempData.lineDummy=document.createElement('DIV');d.style.backgroundColor='transparent';d.style.border='1px solid #000000';d.style.position='absolute';},_createLineMotioner:function(){var d=this.tempData.lineDummy.cloneNode(true);var m=this.tempData.currentLineMotioner=new AshMotionAgent( document.body.appendChild(d));var b=this.tempData.lineMotionBoundsOut;AshUtil.rebound(d,b.x,b.y,0,0);AshDepthManager.manager.register(d,true);},_motionOrder:function(mode){if(!this.tempData.currentLineMotioner)return;var own=this,m=this.tempData.currentLineMotioner,b;if(mode=='in'){own.cloner.style.display='none';b=this.tempData.lineMotionBoundsIn;m.tween({x:b.x,y:b.y,width:b.width,height:b.height,alpha:0},200,'in',function(e){if(e.type==AshTween.FINISH){own.cloner.style.display='block';AshUtil.move(own.cloner,b.x,b.y);}});}
else{b=this.tempData.lineMotionBoundsOut;AshUtil.move(m.owner,this.cloner.offsetLeft,this.cloner.offsetTop);m.tween({x:b.x,y:b.y,width:0,height:0,alpha:0.5},200,'out',function(e){if(e.type==AshTween.FINISH){AshDepthManager.manager.unRegister(m.owner);document.body.removeChild(m.owner);}});}},_process:function(t){var doc=document,docElement=doc.documentElement,c=null,e=this.event,coor=this.coordinates;var sinfo=AshUtil.document.scrollInfo(),x,y,p,b;if(!t)return c;try{this.target=t;c=this.cloner=t.cloneNode(true);c.className=t.className;c.style.position='absolute';doc.body.appendChild(c);if(coor){if(coor.nodeName){p=AshUtil.globalCoordinates(coor);x=p.x;y=p.y;y+=coor.offsetHeight;x-=sinfo.left;y-=sinfo.top;}
else if(coor.target){p=AshUtil.globalCoordinates(coor.target);x=p.x;y=p.y;x+=coor.x||0;y+=coor.y||0;x-=sinfo.left;y-=sinfo.top;}
else{x=coor.x;y=coor.y;}}
else{x=e?e.clientX:0;y=e?e.clientY:0;}
x+=sinfo.left;y+=sinfo.top;bx=x;by=y;
			c.style.left=x+'px';c.style.top=y+'px';
			if(x+c.offsetWidth>docElement.clientWidth+sinfo.left)x=x-( x+c.offsetWidth-docElement.clientWidth);if(y+c.offsetHeight>docElement.clientHeight+sinfo.top)y=y-c.offsetHeight;if(this.useMotion){
				b=this.tempData.lineMotionBoundsOut=AshUtil.getBounds(this.cloner);this.tempData.lineMotionBoundsIn={x:x,y:y,width:b.width,height:b.height};this._createLineMotioner();this._motionOrder('in');}
else{c.style.left=x+'px';c.style.top=y+'px';}
AshDepthManager.manager.front(c);if(this.useAutoClearAsRollout)this._agent.addEventListener('mouseover',this._onMouseOver);this.dispatchEvent(new AshEvent(AshPopup.CREATE),{target:t,cloner:c,left:c.offsetLeft,top:c.offsetTop});}
catch(error){};return c;},_onMouseOver:function(e){var own=arguments.callee.owner,t=e.target||e.srcElement;if(own.cloner){if(own.callback!=null)own.callback.call(own,'mouseover');if(own.coordinates&&own.coordinates.nodeName){
				if(t!=own.coordinates&&!AshUtil.contains(own.cloner,t))own.clear();}
else
			{if(AshUtil.contains(own.cloner,t)){if(own.rollover==false)own.rollover=true;}
else{if(own.rollover)own.clear();}}}},_onMouseDown:function(e){var own=arguments.callee.owner,t=e.target||e.srcElement;if(own.cloner){if(own.callback!=null)own.callback.call(own,'mousedown');if(!AshUtil.contains(own.cloner,t))own.clear();}
own.event=e;},_onMouseUp:function(e){var own=arguments.callee.owner,t=e.target||e.srcElement;if(own.cloner&&own.callback!=null){setTimeout(function(){if(own.cloner&&own.callback!=null)own.callback.call(own,'mouseup');},1);
		}},
	initialize:function(){if(this.instancedCount>=2)throw new Error('no more can’t create an instance[AshPopup]');this._agent=new AshEventDispatcher(document);this.tempData.clonerMotioner=new AshMotionAgent();this._onMouseDown.owner=this._onMouseOver.owner=this._onMouseUp.owner=this;this._agent.addEventListener('mousedown',this._onMouseDown);this._agent.addEventListener('mouseup',this._onMouseUp);this.addEventListener(AshPopup.CREATE,this._onCreate);this.addEventListener(AshPopup.CLEAR,this._onClear);this._createDummyElement();}});
AshPopup.prototype.create=function(target,coordinates,useMotion,callback,useAutoClearAsRollout){if(!target)return this.cloner;if(typeof target=='string'){target=AshUtil.getChildByDotTree(target);if(!target)return this.cloner;}
if(this.target==target)return this.cloner;this.clear();this.coordinates=coordinates;this.useMotion=useMotion==false?false:true;this.callback=callback;this.useAutoClearAsRollout=useAutoClearAsRollout==false?false:true;return this._process(target);}
AshPopup.prototype.clear=function(){if(!this.cloner)return;if(this.useMotion)this._motionOrder('out');if(this.cloner&&this.cloner.parentNode){AshDepthManager.manager.unRegister(this.cloner);this.cloner.parentNode.removeChild(this.cloner);this.dispatchEvent(new AshEvent(AshPopup.CLEAR),{target:this.target,cloner:this.cloner});}
this.target=null;this.cloner=null;this.coordinates=null;this.useMotion=true;this.callback=null;this.rollover=false;this.useAutoClearAsRollout=true;this._agent.removeEventListener('mouseover',this._onMouseOver);}
AshPopup.manager=new AshPopup();
var AshLocationHistory=new AshEventDispatcher();
AshLocationHistory.RECALL='recall'
AshLocationHistory.autoExecute=true;
AshLocationHistory.contentURL='history.html';
AshLocationHistory.initialize=function(){var own=this;var createIframe=function(){var ele=document.createElement('iframe');ele.setAttribute('frameBorder','0');ele.style.display='none';AshUtil.resize(ele,0,0);return ele;}
this._convert=function(data,mode){if(mode=='encoding')return'?'+encodeURIComponent(AshUtil.toJSON(data));var cdata={};if(data.length>0)return AshUtil.jsonToValue(decodeURIComponent(data.substr(1)));}
this.iframe=document.body.appendChild(createIframe());this._agent=new AshEventDispatcher(this.iframe);this._agent.addEventListener('load',function(e){if(own.ulcerativecolitisfucku){own.ulcerativecolitisfucku=false;return;}
var data=own._convert(own.iframe.contentWindow.location.search);if(own.autoExecute&&typeof data=='object' &&data.exec)eval(data.exec);own.dispatchEvent(new AshEvent(AshLocationHistory.RECALL),data);});}
AshLocationHistory.setHistory=function(data){if(!this._initialized){this._initialized=true;this.initialize();}
this.ulcerativecolitisfucku=true;this.iframe.contentWindow.location.href=this.contentURL+this._convert(data,'encoding');}
var AshCalendar=Ash.createClass('AshCalendar',AshEventDispatcher);
AshCalendar.EXTRACT='extract';
AshCalendar.ELEMENTS_LENGTH=42;AshCalendar.MONTH_LAST_DAYS=[31,28,31,30,31,30,31,31,30,31,30,31];AshCalendar.DAY_TO_STRING=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];Ash.addPrototype(AshCalendar,{
	elements:null,
	theDate:null,todayDate:null,
	onExtract:null,
	_onExtract:function(e){if(this.onExtract!=null)this.onExtract(e);},
	initialize:function(){this.theDate=new Date();this.todayDate=new Date();this.addEventListener(AshCalendar.EXTRACT,this._onExtract);},
	today:function(){this.extract();},
	getYear:function(){return this.theDate.getFullYear();},
	setYear:function(value){if(value==this.getYear())return;this.theDate.setFullYear(value);this.extract();},
	getMonth:function(){return this.theDate.getMonth();},
	setMonth:function(value){if(value==this.getMonth())return;this.theDate.setMonth(value);this.extract();},
	getRealMonth:function(){return this.theDate.getMonth()+1;},
	setRealMonth:function(value){if(value-1!=this.getMonth())this.setMonth(value-1);},
	getDate:function(){return this.theDate.getDate();},
	setDate:function(value){if(value==this.getDate())return;this.theDate.setDate(value);this.extract();},
	getDay:function(){return this.theDate.getDay();},
	getDayToString:function(){return AshCalendar.DAY_TO_STRING[this.getDay()];},
	getFirstWeekDay:function(){var date=new Date( this.getYear(),this.getMonth(),1);return date.getDay();},
	thisYear:function(){this.setYear(this.todayDate.getFullYear());},
	prevYear:function(){this.setYear(this.getYear()-1);},
	nextYear:function(){this.setYear(this.getYear()+1);},
	thisMonth:function(){this.theDate.setFullYear( this.todayDate.getFullYear());this.theDate.setMonth( this.todayDate.getMonth());this.extract();},
	prevMonth:function(){this.setMonth(this.getMonth()-1);},
	nextMonth:function(){this.setMonth(this.getMonth()+1);},
	anyMonth:function(year,realMonth){this.theDate.setFullYear(year||this.todayDate.getFullYear());this.theDate.setMonth(realMonth>0?realMonth-1:this.todayDate.getMonth());this.extract();},
	extract:function(){var lastDay=AshCalendar.MONTH_LAST_DAYS[this.getMonth()],leng=AshCalendar.ELEMENTS_LENGTH;
		if(this.getMonth()==1)lastDay+=(this.getYear()%4==0)?1:0;var elements=[];for(var i=0,wd=0,j=0,firstWeekDay=this.getFirstWeekDay();i<leng;i++){if(i<firstWeekDay)elements[i]={value:'',today:false};else{j++;if(j<=lastDay){elements[i]={value:j,today:false};
					if( this.getYear()==this.todayDate.getFullYear()&&this.getMonth()==this.todayDate.getMonth()&&j==this.todayDate.getDate())elements[i].today=true;}
else elements[i]={value:'',today:false};}
wd++;if(i%7==0)wd=0;elements[i].day=wd;}
this.dispatchEvent(new AshEvent(AshCalendar.EXTRACT),{elements:elements});return(this.elements=elements);}});
var AshImageViewer=Ash.createClass('AshImageViewer',AshAgent);
AshImageViewer.LOADED='loaded';
AshImageViewer.APPLY='apply';
Ash.addPrototype(AshImageViewer,{
	cover:null,
	body:null,
	fileInfo:null,
	img:null,
	resizer:null,
	onLoaded:null,
	onApply:null,
		bnds:null,
	initialize:function(){var own=this;this.owner=(function(){var ele=document.createElement('div');ele.innerHTML="<div style='position:absolute; display:none; padding:5px 5px 30px 5px; background-color:#000000; width:1px; height:1px;' ashdrag='true' onselectstart='return false;' ondragstart='return false;'>"+"<div name='cover' style='position:absolute; z-index:1; left:0px; top:0px; width:100%; height:100%; background-color:#000000; _height:expression(parentNode.offsetHeight-10);'></div>"+"<div name='body' style='width:100%; height:100%;'></div>"+"<div name='fileInfo' style='position:absolute; left:5px; bottom:10px; color:#999999; font-family:arial; font-size:9px; cursor:default; '></div>"+"<div onclick='Ash.support();' style='position:absolute; right:5px; bottom:10px; color:#666666; font-family:arial; font-size:10px; cursor:pointer; font-weight:bold;'>"+"AshImageViewer<span style='color:#444444; font-size:9px; font-weight:normal;'> (ver 0.2)</span><span style='color:#CA6500; font-size:9px;'> By AshAPI</span></div>"+"</div>";return document.body.appendChild(ele.firstChild);})();this.cover=new AshAgent(this.getChildByName('cover'));this.body=this.getChildByName('body');this.fileInfo=this.getChildByName('fileInfo');this.resizer=new AshResize(this.owner);this.resizer.start();this.resizer.onResizeStart=function(){own.setBounds();}
		if(arguments[0]){this.cover.setHTML("<table width='100%' height='100%' onclick='siv.hide();'><tr><td align='center' valign='middle'><img src='"+arguments[0]+"'></td></tr></table>");this.cover.getFirstChild().siv=own;}
		if(arguments[1]&&typeof arguments[1]=='function')arguments[1].call(this);this.addEventListener(AshImageViewer.LOADED,function(e){if(this.onLoaded!=null)this.onLoaded(e);});this.addEventListener(AshImageViewer.APPLY,function(e){if(this.onApply!=null)this.onApply(e);});},
	show:function(src){this.owner.style.display='block';AshDepthManager.manager.front(this.owner);if(src){this.resizer.defaultCursor='default';this.cover.owner.style.display='block';this.cover.setOpacity(1);this.body.innerHTML="<img src='"+src+"' style='visibility:hidden;' onload='siv.onImageLoaded(event);' ashdrag='true' ashdragtarget='parent.parent' "+"onmousedown='siv.setBounds(); return false;' onmousemove='return false;' onclick='siv.checkAndHide();'>";this.body.firstChild.siv=this;}},
	hide:function(){this.owner.style.display='none';},
	setBounds:function(){this.bnds=this.getBounds();AshDepthManager.manager.front(this.owner);},checkAndHide:function(){var bnds=this.getBounds();if(bnds.x==this.bnds.x&&bnds.y==this.bnds.y&&bnds.width==this.bnds.width&&bnds.height==this.bnds.height)this.hide();},onImageLoaded:function(e){var own=this,img=this.img=e.target||e.srcElement;var d=document.documentElement,dw=d.clientWidth,dh=d.clientHeight,sinfo=AshUtil.document.scrollInfo();var w=img.width,h=img.height;var x=sinfo.left+(dw/2-w/2),y=sinfo.top+(dh/2-h/2);AshUtil.resize(img,'100%','100%');this.tween( {x:x,y:y,width:w,height:h},800,'back.out',function(e2){if(e2.type==AshTween.FINISH){img.style.visibility='visible';own.resizer.defaultCursor='move';own.cover.alpha(0,800,'out',function(e3){if(e3.type==AshTween.FINISH)own.cover.owner.style.display='none';});own.dispatchEvent(new AshEvent(AshImageViewer.APPLY));}});this.dispatchEvent(new AshEvent(AshImageViewer.LOADED),{src:img.src,img:img});if(AshUtil.browser.ie)this.fileInfo.innerHTML=this.getFileSize(img.fileSize);},getFileSize:function(size){size=+size;size=size/1024;if(size<1024)return Math.ceil(size)+" K byte";else{size=size/1024;if(size<1024)return Math.ceil(size)+" M byte";else{size=size/1024;if(size<1024)return Math.ceil(size)+" G byte";}}
return'0 byte';}});
var AshAccordion=Ash.createClass('AshAccordion',AshEventDispatcher);
AshAccordion.APPLY='apply';
AshAccordion.FINISH='finish';
AshAccordion.apply=function(target,mode,duration,easingName,callback){if(!target)return;if(!target.__r_accoditon__)target.__r_accoditon__=new AshAccordion(target);if(target.__r_accoditon__.targetChild)target.__r_accoditon__.apply(mode,duration,easingName,callback);return target.__r_accoditon__;}
Ash.addPrototype(AshAccordion,{
	target:null,
	targetChild:null,
	motioner:null,
	mode:'auto',
	onApply:null,
	onFinish:null,
	initialize:function(target){var targetChild=this.getTargetChild(target);if(!target||!targetChild)throw new Error('can’t create an instance[missing arguments]');
		target.style.cssText+=';overflow:hidden; position:relative;';this.motioner=new AshMotionAgent(target);this.target=target;this.targetChild=targetChild;this.addEventListener(AshAccordion.APPLY,function(e){if(this.onApply!=null)this.onApply(e);});this.addEventListener(AshAccordion.FINISH,function(e){if(this.onFinish!=null)this.onFinish(e);});},
	apply:function(mode,duration,easingName,callback){var own=this,h=this.target.offsetHeight,value;this.target.accorIsMotioning=true;if(!mode||mode=='auto')mode=AshUtil.getStyle(this.targetChild,'display')=='none'?'open':'close';this.mode=mode;this.target.style.height='auto';this.targetChild.style.display=mode=='open'?'block':'none';value=this.target.offsetHeight;this.target.style.height=h+'px';this.targetChild.style.display='block';this.motioner.height(value,duration||700,easingName,function(e){if(e.type==AshTween.FINISH){if(mode=='close')own.targetChild.style.display='none';else own.target.style.height='auto';own.target.accorIsMotioning=false;own.dispatchEvent(new AshEvent(AshAccordion.FINISH),{mode:mode,event:e});if(callback!=null)callback(e);}});this.dispatchEvent(new AshEvent(AshAccordion.APPLY),{mode:mode});},
	getTargetChild:function(o){for(var children=o.getElementsByTagName('*'),l=children.length,i=0;i<l;i++)if(children[i].className.indexOf('Accordion')!=-1)return children[i];return null;}});
var AshTextMarquee=Ash.createClass('AshTextMarquee',AshEventDispatcher);
AshTextMarquee.PLAY="play";
AshTextMarquee.STOP="stop ";
AshTextMarquee.SCROLLING='scrolling';
Ash.addPrototype(AshTextMarquee,{
	marqueer:null,
	delay:100,
	text:'',
	onPlay:null,
	onStop:null,
	onScrolling:null,
	_timer:null,_text:'',_onTimer:function(e){var own=this.tempData.owner;if(own.marqueer&&own._text){var n=own.marqueer.tagName.toLowerCase();own.marqueer[n=='input'?'value':'innerHTML']=(own._text=own._text.substring(1,own._text.length)+own._text.substring(0,1));own.dispatchEvent(new AshEvent(AshTextMarquee.SCROLLING),{marqueer:own.marqueer,delay:own.delay,text:own.text});}},_onPlay:function(e){if(this.onPlay!=null)this.onPlay(e);},_onStop:function(e){if(this.onStop!=null)this.onStop(e);},_onScrolling:function(e){if(this.onScrolling!=null)this.onScrolling(e);},
	initialize:function(){this._timer=new AshTimer(100);this._timer.tempData.owner=this;this._timer.addEventListener(AshTimer.TIMER,this._onTimer);this.addEventListener(AshTextMarquee.PLAY,this._onPlay);this.addEventListener(AshTextMarquee.STOP,this._onStop);this.addEventListener(AshTextMarquee.SCROLLING,this._onScrolling);this.setMarquee.apply(this,arguments);},
	setMarquee:function(element,delay,text){this.stop();if( element.nodeType==1){
			this.marqueer=element;if(this.text=='')this.setText(element.innerHTML||element.value);
		}
if(delay)this.delay=this._timer.delay=delay;this.setText(text);},
	setText:function(text){if(!text)return;this.text=text;this._text=' '+text;},
	play:function(delay,text){if(delay)this.delay=this._timer.delay=delay;this.setText(text);this._timer.start();this.dispatchEvent(new AshEvent(AshTextMarquee.PLAY),{marqueer:this.marqueer,delay:this.delay,text:this.text});},
	stop:function(){this._timer.stop();this.dispatchEvent(new AshEvent(AshTextMarquee.STOP),{marqueer:this.marqueer,delay:this.delay,text:this.text});}});
var AshMarquee=Ash.createClass('AshMarquee',AshEventDispatcher);
AshMarquee.PLAY="play";
AshMarquee.STOP="stop ";
AshMarquee.SCROLLING='scrolling';
Ash.addPrototype(AshMarquee,{
	marqueer:null,
	width:100,
	height:100,
	delay:100,
	content:null,
	scrollValue:1,
	direction:'left',
	onPlay:null,
	onStop:null,
	onScrolling:null,
	_timer:null,_contentWidth:0,_contentHeight:0,_setScroll:function(o,p,v){o.style[p]=v+'px';},_getScroll:function(o,p,p2){var v=parseInt(o.style[p]);if(isNaN(v)){v=parseInt(o[p2]);if(isNaN(v))v=0;}
return v;},_onTimer:function(e){var own=this.tempData.owner,mq=own.marqueer,c=own.content,v=own.scrollValue,w=own._contentWidth,h=own._contentHeight;if(!mq||!c)return;if(own.direction=='left'){var cx=own._getScroll(c,'left','offsetLeft'),x=cx-v;if(x+w<0)x=own.width;own._setScroll(c,'left',x);}
else{var cy=own._getScroll(c,'top','offsetTop'),y=cy-v;if(y+h<0)y=own.height;own._setScroll(c,'top',y);}
own.dispatchEvent(new AshEvent(AshMarquee.SCROLLING),{marqueer:own.marqueer,width:own.width,height:own.height,delay:own.delay,content:own.content,scrollValue:own.scrollValue,direction:own.direction});},_onPlay:function(e){if(this.onPlay!=null)this.onPlay(e);},_onStop:function(e){if(this.onStop!=null)this.onStop(e);},_onScrolling:function(e){if(this.onScrolling!=null)this.onScrolling(e);},
	initialize:function(){this._timer=new AshTimer(100);this._timer.tempData.owner=this;this._timer.addEventListener(AshTimer.TIMER,this._onTimer);this.addEventListener(AshMarquee.PLAY,this._onPlay);this.addEventListener(AshMarquee.STOP,this._onStop);this.addEventListener(AshMarquee.SCROLLING,this._onScrolling);this.setMarquee.apply(this,arguments);},
	setMarquee:function(element,width,height,delay,content,scrollValue,direction){this.stop();if(element){var n=element.nodeName.toLowerCase();if( n=='div' ||n=='span' ){var position=AshUtil.getStyle(element,'position')=='absolute'?'absolute':'relative',display=n=='div'?'block':'inline-block';this.marqueer=element;this.marqueer.style.cssText+='; position:'+position+'; display:'+display+'; overflow:hidden;';}}
if(width!=null)this.setWidth(width);if(height!=null)this.setHeight(height);if(delay)this.delay=this._timer.delay=delay;if(content!=null)this.setContent(content);if(scrollValue!=null)this.setScrollValue(scrollValue);if(direction!=null)this.setDirection(direction);},
	setWidth:function(value){var w=this.width=Math.abs(value||100);if(this.marqueer)this.marqueer.style.width=w+'px';},
	setHeight:function(value){var h=this.height=Math.abs(value||100);if(this.marqueer)this.marqueer.style.height=h+'px';},
	resize:function(w,h){this.setWidth(w);this.setHeight(h);},
	setContent:function(content){if(!content)return;if(this.content){if(this.marqueer)this.marqueer.removeChild(this.content);}
this.content=content;if((typeof content)=='string'){this.content=document.createElement('span');this.content.innerHTML=content;}
if(this.content.nodeType!=1)return;if(this.marqueer)this.marqueer.appendChild(this.content);this._updateContent();},
		_updateContent:function(){
			var d,bw,bh;if(this.marqueer){d=document.documentElement;bw=this.marqueer.offsetWidth,bh=this.marqueer.offsetHeight;AshUtil.resize(this.marqueer,d.clientWidth,d.clientHeight);}
this.content.style.width='auto';this.content.style.height='auto';this._contentWidth=this.content.offsetWidth;this._contentHeight=this.content.offsetHeight;this.content.style.cssText+='; position:absolute; width:'+this._contentWidth+'px; height:'+this._contentHeight+'px; ';
			if(d)AshUtil.resize(this.marqueer,bw,bh);},
	setScrollValue:function(value){this.scrollValue=Math.abs(value||1);},
	setDirection:function(value){value=value=='top'?'top':'left';if(value==this.direction)return;this.direction=value;if(this.content)this.content.style[this.direction=='left'?'top':'left']='0px';this.refresh();this.play();},
	play:function(delay,content,scrollValue,direction){if(delay)this.delay=this._timer.delay=delay;if(content!=null)this.setContent(content);if(scrollValue!=null)this.setScrollValue(scrollValue);if(direction!=null)this.setDirection(direction);this._timer.start();this.dispatchEvent(new AshEvent(AshMarquee.PLAY),{marqueer:this.marqueer,width:this.width,height:this.height,delay:this.delay,content:this.content,scrollValue:this.scrollValue,direction:this.direction});},
	stop:function(){this._timer.stop();this.dispatchEvent(new AshEvent(AshMarquee.STOP),{marqueer:this.marqueer,width:this.width,height:this.height,delay:this.delay,content:this.content,scrollValue:this.scrollValue,direction:this.direction});},
	refresh:function(){if(this.marqueer){this.setWidth(this.marqueer.offsetWidth);this.setHeight(this.marqueer.offsetHeight);}
if(this.content)this._updateContent();}});
var AshScrollBar=Ash.createClass('AshScrollBar',AshEventDispatcher);
AshScrollBar.SCROLLING='scrolling';
AshScrollBar.UPDATE='update';
Ash.addPrototype(AshScrollBar,{
	scrollbarType:'vertical',
	scrollTarget:null,
	scrollbarElement:null,
	tracker:null,
	firstArrow:null,
	secondArrow:null,
	autoHide:true,
	fixedSize:-1,
	scrollable:false,
	scrollDistance:0,
	arrowScrollingValue:20,
	wheelScrollingValue:-1,
	trackerMinSize:10,
	useMotionInScroll:true,
	firstArrowMargin:0,
	secondArrowMargin:0,
	onScrolling:null,
	onUpdate:null,
	_scrollAreaSize:0,_clientAreaSize:0,_startValue:0,_trackDistance:0,_scrolledValue:0,_trackerSize:0,_wheelEvent:null,_timer:null,_interval:null,_saveScrollValue:0,_tween:null,_fakeScrollTarget:null,_updateTimer:null,
	initialize:function(){if(arguments[0]=='ashclassextended&DDAKZZI')return;
		this._initialize.apply(this,arguments);},_initialize:function(){var own=this;this.register.apply(this,arguments);if(!AshScrollBar.docEvent){AshScrollBar.docEvent=new AshEventDispatcher(document);}
this._timer=new AshTimer(50);this._timer.addEventListener(AshTimer.TIMER,function(e){own.scrollBy(own._saveScrollValue);});this._onDocMouseUpEvent=function(e){window.clearTimeout(own._interval);own._timer.stop();AshScrollBar.docEvent.removeEventListener('mouseup',this._onDocMouseUpEvent);}
this.addEventListener(AshScrollBar.SCROLLING,function(e){if(own.onScrolling!=null)own.onScrolling(e);});this.addEventListener(AshScrollBar.UPDATE,function(e){if(own.onUpdate!=null)own.onUpdate(e);});AshDrag.manager.addEventListener(AshDrag.DRAGGING,function(e){if(this.target!=own.tracker)return;var fromV=0,toV=own.scrollDistance;var value=own.scrollbarType=='horizontal'?this.x:this.y;var p=(value-own._startValue)/own._trackDistance;var scrollValue=fromV*(1-p)+toV*p;own._scrollTo(scrollValue,true);});this._tween=new AshTween();this._tween.duration=500;this._updateTimer=new AshTimer(1000);this._updateTimer.addEventListener(AshTimer.TIMER,function(e){if(!own.scrollTarget)return;try{if( own.scrollTarget[own.scrollbarType=='horizontal'?'scrollWidth':'scrollHeight' ]!=own._scrollAreaSize||own.scrollTarget[own.scrollbarType=='horizontal'?'clientWidth':'clientHeight' ]!=own._clientAreaSize)own.update();}
catch(err){own.scrollTarget=null;}});if(this.scrollTarget)this.setAutoUpdate(true);},_createMouseUpEvent:function(){AshScrollBar.docEvent.addEventListener('mouseup',this._onDocMouseUpEvent);},
	register:function(scrollTarget,scrollbarElement,autoHide,fixedSize){if(!scrollTarget||!scrollbarElement)return;var own=this;this.scrollbarElement=scrollbarElement;for(var l=scrollbarElement.childNodes.length,i=0,c,n;i<l;i++){c=scrollbarElement.childNodes[i];if(c.nodeType==1){n=c.getAttribute('asbname');if(n=='firstArrow')this.firstArrow=c;if(n=='tracker')this.tracker=c;if(n=='secondArrow')this.secondArrow=c;}}
if(!this.tracker)return;if(scrollbarElement.getAttribute('asbtype')=='horizontal')this.scrollbarType='horizontal';if( AshUtil.getStyle(scrollbarElement,'position')=='static')scrollbarElement.style.position='relative';this.tracker.style.position='absolute';if(this.firstArrow){this.firstArrow.onmousedown=function(){own.scrollBy( (own._saveScrollValue=-own.arrowScrollingValue));window.clearTimeout(own._interval);own._interval=setTimeout(function(){own._timer.start();},500);own._createMouseUpEvent();}}
if(this.secondArrow){this.secondArrow.onmousedown=function(){own.scrollBy(  (own._saveScrollValue=own.arrowScrollingValue));window.clearTimeout(own._interval);own._interval=setTimeout(function(){own._timer.start();},500);own._createMouseUpEvent();}}
this.tracker.setAttribute('ashdrag','true');this.setScrollTarget(scrollTarget);this.autoHide=autoHide==false?false:true;this.fixedSize=fixedSize>0?fixedSize:-1;
		var imgs=this.tracker.getElementsByTagName('img'),img;for(l=imgs.length,i=0;i<l;i++){img=imgs[i];img.style.position='absolute';img.setAttribute('ashdrag','true');img.setAttribute('ashdragtarget','parent');img.onmousedown=function(){return false;};img.onmousemove=function(){return false;};AshUtil.move(img,0,0);}
scrollbarElement.onmousedown=function(e){var e=e||window.event;var t=e.target||e.srcElement,x=e.layerX||(e.offsetX||0),y=e.layerY||(e.offsetY||0),val;if(t!=this||!own.scrollTarget)return;if(own.scrollbarType=='horizontal'){val=own.scrollTarget.clientWidth;if(x<own.tracker.offsetLeft)val=-val;}
else{val=own.scrollTarget.clientHeight;if(y<own.tracker.offsetTop)val=-val;}
own.scrollBy( (own._saveScrollValue=val));window.clearTimeout(own._interval);own._interval=setTimeout(function(){own._timer.start();},500);own._createMouseUpEvent();}
this.update();if(!scrollbarElement._wheelEvent){scrollbarElement._wheelEvent=new AshEventDispatcher(scrollbarElement);scrollbarElement._wheelEventListener=function(e){var own=arguments.callee.owner;own._wheelScroll(e);}
scrollbarElement._wheelEvent.addEventListener('DOMMouseScroll',scrollbarElement._wheelEventListener);scrollbarElement._wheelEvent.addEventListener('mousewheel',scrollbarElement._wheelEventListener);}
scrollbarElement._wheelEventListener.owner=this;},
	update:function(){if(!this.scrollTarget)return;try{var hs=this.scrollbarType=='horizontal'?true:false;var t=this.scrollTarget,scb=this.scrollbarElement,tr=this.tracker,fa=this.firstArrow,sa=this.secondArrow;var dsize,darea,triv=200;
			if(AshUtil.getStyle(t,'display')=='none')return;this._updateGetScroll();this._scrollAreaSize=t[hs?'scrollWidth':'scrollHeight'];this._clientAreaSize=t[hs?'clientWidth':'clientHeight'];this.scrollDistance=Math.max(0,this._scrollAreaSize-this._clientAreaSize);this.scrollable=this.scrollDistance>0?true:false;if( !this.scrollable&&this.autoHide){tr.style.visibility='hidden';return;}
tr.style.visibility='visible';this._startValue=(fa&&fa[hs?'offsetWidth':'offsetHeight']>1)?fa[hs?'offsetLeft':'offsetTop']+fa[hs?'offsetWidth':'offsetHeight']:0;this._startValue+=this.firstArrowMargin;dsize=((sa&&sa[hs?'offsetWidth':'offsetHeight']>1)?sa[hs?'offsetLeft':'offsetTop']:scb[hs?'clientWidth':'clientHeight'])-this._startValue;dsize+=this.secondArrowMargin;this._trackerSize=this.fixedSize;if(  this.fixedSize==-1){this._trackerSize=dsize*(triv/(this.scrollDistance+triv));if( this._trackerSize<this.trackerMinSize)this._trackerSize=this.trackerMinSize;}
this._trackDistance=(dsize-this._trackerSize);
			var bl=0,bt=0;if(BI.ie8){bl=parseInt(AshUtil.getStyle(scb,'borderLeftWidth'));bt=parseInt(AshUtil.getStyle(scb,'borderTopWidth'));if(isNaN(bl))bl=0;if(isNaN(bt))bt=0;}
darea=hs?(this._startValue+','+(tr.offsetTop-bt)+','+this._trackDistance+',0'):( (tr.offsetLeft-bl)+','+this._startValue+',0,'+this._trackDistance);tr.setAttribute('ashdragarea',darea);tr.style[hs?'width':'height']=this._trackerSize+'px';this._moveTracker(hs?'left':'top');
			var imgs=this.tracker.getElementsByTagName('img');for(var l=imgs.length,i=0;i<l;i++){AshUtil.resize(imgs[i],this.tracker.clientWidth,this.tracker.clientHeight);imgs[i].style.zIndex=100+i;}
this.dispatchEvent(new AshEvent(AshScrollBar.UPDATE),{scroll:this.getScroll()});}
catch(err){this.scrollTarget=null;}},
	setScrollTarget:function(scrollTarget){if(!scrollTarget||!scrollTarget.style||this.scrollTarget==scrollTarget)return;
		if(this.scrollTarget&&this.scrollTarget.asbWheelSystem){this.scrollTarget.asbWheelSystem[this.scrollbarType=='horizontal'?'hasb':'vasb' ]=null;delete this.scrollTarget.asbWheelSystem[this.scrollbarType=='horizontal'?'hasb':'vasb' ];}
		this.scrollTarget=scrollTarget;scrollTarget.style.overflow='hidden';this._fakeScrollTarget=null;
		if( scrollTarget.tagName.toLowerCase()=='html' &&(BI.safari||BI.chrome)){this._fakeScrollTarget=scrollTarget.getElementsByTagName('body')[0];}
		if(!scrollTarget.asbWheelSystem){scrollTarget.asbWheelSystem={hasb:null,vasb:null,event:new AshEventDispatcher(scrollTarget),eventListener:null};scrollTarget.asbWheelSystem.eventListener=function(e){var s=arguments.callee.system,a,h=s.hasb,v=s.vasb;if(v&&v.scrollable)a=v;else if(h&&h.scrollable)a=h;if(a)a._wheelScroll(e);}
scrollTarget.asbWheelSystem.eventListener.system=scrollTarget.asbWheelSystem;scrollTarget.asbWheelSystem.event.addEventListener('DOMMouseScroll',scrollTarget.asbWheelSystem.eventListener);scrollTarget.asbWheelSystem.event.addEventListener('mousewheel',scrollTarget.asbWheelSystem.eventListener);}
scrollTarget.asbWheelSystem[this.scrollbarType=='horizontal'?'hasb':'vasb' ]=this;},
		_wheelScroll:function(e){e=e||window.event;var delta=0;if(e.wheelDelta)delta=-e.wheelDelta;else if(e.detail)delta=e.detail;if(this.wheelScrollingValue!=-1)delta=delta>0?this.wheelScrollingValue:-this.wheelScrollingValue;else{delta=this.scrollDistance/(delta>0?20:-20);delta+=(delta>0?15:-15);}
this.scrollBy(delta);
			if(e.preventDefault!=null)e.preventDefault();e.returnValue=false;},
	scrollTo:function(value){this._scrollTo(value,false);},_scrollTo:function(value,noMoveTracker){if( !this.scrollTarget||!this.scrollable)return;if(this.useMotionInScroll){var own=this;this._tween.startValue=this.getScroll();this._tween.endValue=value;this._tween.play(function(e){own._processScroll(e.parameters.tweenedValue,noMoveTracker);});}
else this._processScroll(value,noMoveTracker);},_processScroll:function(value,noMoveTracker){var t=this._fakeScrollTarget?this._fakeScrollTarget:this.scrollTarget;if(!t)return;try{t[this.scrollbarType=='horizontal'?'scrollLeft':'scrollTop' ]=value;this._scrolledValue=t[this.scrollbarType=='horizontal'?'scrollLeft':'scrollTop' ];if(!noMoveTracker)this._moveTracker( this.scrollbarType=='horizontal'?'left':'top');this.dispatchEvent(new AshEvent(AshScrollBar.SCROLLING),{scroll:this.getScroll()});}
catch(err){this.scrollTargt=null;}},_moveTracker:function(prop,refresh){var trackValue=this._startValue+( this.getScroll(refresh)/this.scrollDistance*this._trackDistance);trackValue=AshUtil.minToMax(trackValue,this._startValue,this._startValue+this._trackDistance);if(isNaN(trackValue))trackValue=0;this.tracker.style[prop]=trackValue+'px';},
	scrollBy:function(value){if( !this.scrollTarget||!this.scrollable)return;this.scrollTo( this.getScroll()+value);},
	getScroll:function(refresh){if(refresh)this._updateGetScroll();return this._scrolledValue;},_updateGetScroll:function(){var t=this._fakeScrollTarget?this._fakeScrollTarget:this.scrollTarget;try{if(t)this._scrolledValue=t[this.scrollbarType=='horizontal'?'scrollLeft':'scrollTop' ];}
catch(err){this.scrollTarget=null;}},
	setAutoUpdate:function(doApply,updateInterval){if(doApply){if(updateInterval)this._updateTime.delay=updateInterval;this._updateTimer.start();}
else this._updateTimer.stop();}});
var AshScrollBarEX=Ash.createClass('AshScrollBarEX',AshScrollBar);Ash.addPrototype(AshScrollBarEX,{
	iframe:null,
	doc:null,
		_docEvent:null,
	initialize:function(){if( !arguments[0])throw new Error("Sorry, an AshScrollBarEX's instance aborted! because the scrollTarget isn't iframe or null");var own=this;this.onIframeLoaded=function(e){var doc=own.iframe.contentWindow.document;if(own.doc==doc&&own.scrollTarget==doc.documentElement)return;own.setScrollTarget(doc.documentElement);}
		this.onContentResized=function(e){own.update();}
this.onMouseDownForTrackMover=function(e){own.doc.asbEvent.addEventListener('mousemove',own.onMouseMoveScroll);}
this.onMouseMoveScroll=function(e){own._moveTracker( own.scrollbarType=='horizontal'?'left':'top',true);}
this.onApplyKeyScroll=function(e){switch(e.keyCode){case 33:case 34:case 37:case 38:case 39:case 40:own._moveTracker( own.scrollbarType=='horizontal'?'left':'top',true);break;}}
this.onUnfireMouseup=function(e){
			AshDrag.manager.abort();own._onDocMouseUpEvent();own.doc.asbEvent.removeEventListener('mousemove',own.onMouseMoveScroll);}
this._initialize.apply(this,arguments);},_clearEvents:function(){try{if(this.iframe){
					if(this.iframe.asbEvent)this.iframe.asbEvent.removeEventListener('load',this.onIframeLoaded);if(this.iframe.contentWindow.asbEvent)this.iframe.contentWindow.asbEvent.removeEventListener('resize',this.onContentResized);if(this.doc&&this.doc.asbEvent){this.doc.asbEvent.removeEventListener('mousedown',this.onMouseDownForTrackMover);this.doc.asbEvent.removeEventListener('mousemove',this.onApplyKeyScroll);this.doc.asbEvent.removeEventListener('keydown',this.onApplyKeyScroll);this.doc.asbEvent.removeEventListener('mouseup',this.onUnfireMouseup);}}}
catch(err){}
finally{this.iframe=this.doc=null;this.scrollTarget=null;}},
	setScrollTarget:function(scrollTarget){if(!scrollTarget||!scrollTarget.style||this.scrollTarget==scrollTarget)return;var own=this;
		this._clearEvents();if(scrollTarget.tagName.toLowerCase()=='iframe'){this.iframe=scrollTarget;this.iframe.setAttribute('scrolling','no');this.doc=this.iframe.contentWindow.document;if( !this.iframe.asbEvent)this.iframe.asbEvent=new AshEventDispatcher(this.iframe);if( !this.iframe.contentWindow.asbEvent)this.iframe.contentWindow.asbEvent=new AshEventDispatcher(this.iframe.contentWindow);this.iframe.asbEvent.addEventListener('load',this.onIframeLoaded);this.iframe.contentWindow.asbEvent.addEventListener('resize',this.onContentResized);if( !this.doc.asbEvent){this.doc.asbEvent=new AshEventDispatcher(this.doc);}
this.doc.asbEvent.addEventListener('mousedown',this.onMouseDownForTrackMover);this.doc.asbEvent.addEventListener('keydown',this.onApplyKeyScroll);this.doc.asbEvent.addEventListener('mouseup',this.onUnfireMouseup);scrollTarget=this.doc.documentElement;}
		if(this.scrollTarget&&this.scrollTarget.asbWheelSystem){this.scrollTarget.asbWheelSystem[this.scrollbarType=='horizontal'?'hasb':'vasb' ]=null;delete this.scrollTarget.asbWheelSystem[this.scrollbarType=='horizontal'?'hasb':'vasb' ];}
		this.scrollTarget=scrollTarget;scrollTarget.style.overflow='hidden';this._fakeScrollTarget=null;
		if( scrollTarget.tagName.toLowerCase()=='html' &&(BI.safari||BI.chrome)){this._fakeScrollTarget=scrollTarget.getElementsByTagName('body')[0];}
		if(!scrollTarget.asbWheelSystem){scrollTarget.asbWheelSystem={hasb:null,vasb:null,event:new AshEventDispatcher(scrollTarget),eventListener:null};scrollTarget.asbWheelSystem.eventListener=function(e){var s=arguments.callee.system,a,h=s.hasb,v=s.vasb;if(v&&v.scrollable)a=v;else if(h&&h.scrollable)a=h;if(a)a._wheelScroll(e);}
scrollTarget.asbWheelSystem.eventListener.system=scrollTarget.asbWheelSystem;scrollTarget.asbWheelSystem.event.addEventListener('DOMMouseScroll',scrollTarget.asbWheelSystem.eventListener);scrollTarget.asbWheelSystem.event.addEventListener('mousewheel',scrollTarget.asbWheelSystem.eventListener);}
scrollTarget.asbWheelSystem[this.scrollbarType=='horizontal'?'hasb':'vasb' ]=this;this.update();}});
(function(){var n=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,i="sizcache"+(Math.random()+"").replace(".",""),o=0,r=Object.prototype.toString,h=false,g=true,q=/\\/g,u=/\r\n/g,w=/\W/;[0,0].sort(function(){g=false;return 0});var d=function(B,e,E,F){E=E||[];e=e||document;var H=e;if(e.nodeType!==1&&e.nodeType!==9){return[]}if(!B||typeof B!=="string"){return E}var y,J,M,x,I,L,K,D,A=true,z=d.isXML(e),C=[],G=B;do{n.exec("");y=n.exec(G);if(y){G=y[3];C.push(y[1]);if(y[2]){x=y[3];break}}}while(y);if(C.length>1&&j.exec(B)){if(C.length===2&&k.relative[C[0]]){J=s(C[0]+C[1],e,F)}else{J=k.relative[C[0]]?[e]:d(C.shift(),e);while(C.length){B=C.shift();if(k.relative[B]){B+=C.shift()}J=s(B,J,F)}}}else{if(!F&&C.length>1&&e.nodeType===9&&!z&&k.match.ID.test(C[0])&&!k.match.ID.test(C[C.length-1])){I=d.find(C.shift(),e,z);e=I.expr?d.filter(I.expr,I.set)[0]:I.set[0]}if(e){I=F?{expr:C.pop(),set:l(F)}:d.find(C.pop(),C.length===1&&(C[0]==="~"||C[0]==="+")&&e.parentNode?e.parentNode:e,z);J=I.expr?d.filter(I.expr,I.set):I.set;if(C.length>0){M=l(J)}else{A=false}while(C.length){L=C.pop();K=L;if(!k.relative[L]){L=""}else{K=C.pop()}if(K==null){K=e}k.relative[L](M,K,z)}}else{M=C=[]}}if(!M){M=J}if(!M){d.error(L||B)}if(r.call(M)==="[object Array]"){if(!A){E.push.apply(E,M)}else{if(e&&e.nodeType===1){for(D=0;M[D]!=null;D++){if(M[D]&&(M[D]===true||M[D].nodeType===1&&d.contains(e,M[D]))){E.push(J[D])}}}else{for(D=0;M[D]!=null;D++){if(M[D]&&M[D].nodeType===1){E.push(J[D])}}}}}else{l(M,E)}if(x){d(x,H,E,F);d.uniqueSort(E)}return E};d.uniqueSort=function(x){if(p){h=g;x.sort(p);if(h){for(var e=1;e<x.length;e++){if(x[e]===x[e-1]){x.splice(e--,1)}}}}return x};d.matches=function(e,x){return d(e,null,null,x)};d.matchesSelector=function(e,x){return d(x,null,null,[e]).length>0};d.find=function(D,e,E){var C,y,A,z,B,x;if(!D){return[]}for(y=0,A=k.order.length;y<A;y++){B=k.order[y];if((z=k.leftMatch[B].exec(D))){x=z[1];z.splice(1,1);if(x.substr(x.length-1)!=="\\"){z[1]=(z[1]||"").replace(q,"");C=k.find[B](z,e,E);if(C!=null){D=D.replace(k.match[B],"");break}}}}if(!C){C=typeof e.getElementsByTagName!=="undefined"?e.getElementsByTagName("*"):[]}return{set:C,expr:D}};d.filter=function(H,G,K,A){var C,e,F,M,J,x,z,B,I,y=H,L=[],E=G,D=G&&G[0]&&d.isXML(G[0]);while(H&&G.length){for(F in k.filter){if((C=k.leftMatch[F].exec(H))!=null&&C[2]){x=k.filter[F];z=C[1];e=false;C.splice(1,1);if(z.substr(z.length-1)==="\\"){continue}if(E===L){L=[]}if(k.preFilter[F]){C=k.preFilter[F](C,E,K,L,A,D);if(!C){e=M=true}else{if(C===true){continue}}}if(C){for(B=0;(J=E[B])!=null;B++){if(J){M=x(J,C,B,E);I=A^M;if(K&&M!=null){if(I){e=true}else{E[B]=false}}else{if(I){L.push(J);e=true}}}}}if(M!==undefined){if(!K){E=L}H=H.replace(k.match[F],"");if(!e){return[]}break}}}if(H===y){if(e==null){d.error(H)}else{break}}y=H}return E};d.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)};var b=d.getText=function(A){var y,z,e=A.nodeType,x="";if(e){if(e===1||e===9){if(typeof A.textContent==="string"){return A.textContent}else{if(typeof A.innerText==="string"){return A.innerText.replace(u,"")}else{for(A=A.firstChild;A;A=A.nextSibling){x+=b(A)}}}}else{if(e===3||e===4){return A.nodeValue}}}else{for(y=0;(z=A[y]);y++){if(z.nodeType!==8){x+=b(z)}}}return x};var k=d.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(e){return e.getAttribute("href")},type:function(e){return e.getAttribute("type")}},relative:{"+":function(C,x){var z=typeof x==="string",B=z&&!w.test(x),D=z&&!B;if(B){x=x.toLowerCase()}for(var y=0,e=C.length,A;y<e;y++){if((A=C[y])){while((A=A.previousSibling)&&A.nodeType!==1){}C[y]=D||A&&A.nodeName.toLowerCase()===x?A||false:A===x}}if(D){d.filter(x,C,true)}},">":function(C,x){var B,A=typeof x==="string",y=0,e=C.length;if(A&&!w.test(x)){x=x.toLowerCase();for(;y<e;y++){B=C[y];if(B){var z=B.parentNode;C[y]=z.nodeName.toLowerCase()===x?z:false}}}else{for(;y<e;y++){B=C[y];if(B){C[y]=A?B.parentNode:B.parentNode===x}}if(A){d.filter(x,C,true)}}},"":function(z,x,B){var A,y=o++,e=t;if(typeof x==="string"&&!w.test(x)){x=x.toLowerCase();A=x;e=a}e("parentNode",x,y,z,A,B)},"~":function(z,x,B){var A,y=o++,e=t;if(typeof x==="string"&&!w.test(x)){x=x.toLowerCase();A=x;e=a}e("previousSibling",x,y,z,A,B)}},find:{ID:function(x,y,z){if(typeof y.getElementById!=="undefined"&&!z){var e=y.getElementById(x[1]);return e&&e.parentNode?[e]:[]}},NAME:function(y,B){if(typeof B.getElementsByName!=="undefined"){var x=[],A=B.getElementsByName(y[1]);for(var z=0,e=A.length;z<e;z++){if(A[z].getAttribute("name")===y[1]){x.push(A[z])}}return x.length===0?null:x}},TAG:function(e,x){if(typeof x.getElementsByTagName!=="undefined"){return x.getElementsByTagName(e[1])}}},preFilter:{CLASS:function(z,x,y,e,C,D){z=" "+z[1].replace(q,"")+" ";if(D){return z}for(var A=0,B;(B=x[A])!=null;A++){if(B){if(C^(B.className&&(" "+B.className+" ").replace(/[\t\n\r]/g," ").indexOf(z)>=0)){if(!y){e.push(B)}}else{if(y){x[A]=false}}}}return false},ID:function(e){return e[1].replace(q,"")},TAG:function(x,e){return x[1].replace(q,"").toLowerCase()},CHILD:function(e){if(e[1]==="nth"){if(!e[2]){d.error(e[0])}e[2]=e[2].replace(/^\+|\s*/g,"");var x=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(e[2]==="even"&&"2n"||e[2]==="odd"&&"2n+1"||!/\D/.test(e[2])&&"0n+"+e[2]||e[2]);e[2]=(x[1]+(x[2]||1))-0;e[3]=x[3]-0}else{if(e[2]){d.error(e[0])}}e[0]=o++;return e},ATTR:function(A,x,y,e,B,C){var z=A[1]=A[1].replace(q,"");if(!C&&k.attrMap[z]){A[1]=k.attrMap[z]}A[4]=(A[4]||A[5]||"").replace(q,"");if(A[2]==="~="){A[4]=" "+A[4]+" "}return A},PSEUDO:function(A,x,y,e,B){if(A[1]==="not"){if((n.exec(A[3])||"").length>1||/^\w/.test(A[3])){A[3]=d(A[3],null,null,x)}else{var z=d.filter(A[3],x,y,true^B);if(!y){e.push.apply(e,z)}return false}}else{if(k.match.POS.test(A[0])||k.match.CHILD.test(A[0])){return true}}return A},POS:function(e){e.unshift(true);return e}},filters:{enabled:function(e){return e.disabled===false&&e.type!=="hidden"},disabled:function(e){return e.disabled===true},checked:function(e){return e.checked===true},selected:function(e){if(e.parentNode){e.parentNode.selectedIndex}return e.selected===true},parent:function(e){return !!e.firstChild},empty:function(e){return !e.firstChild},has:function(y,x,e){return !!d(e[3],y).length},header:function(e){return(/h\d/i).test(e.nodeName)},text:function(y){var e=y.getAttribute("type"),x=y.type;return y.nodeName.toLowerCase()==="input"&&"text"===x&&(e===x||e===null)},radio:function(e){return e.nodeName.toLowerCase()==="input"&&"radio"===e.type},checkbox:function(e){return e.nodeName.toLowerCase()==="input"&&"checkbox"===e.type},file:function(e){return e.nodeName.toLowerCase()==="input"&&"file"===e.type},password:function(e){return e.nodeName.toLowerCase()==="input"&&"password"===e.type},submit:function(x){var e=x.nodeName.toLowerCase();return(e==="input"||e==="button")&&"submit"===x.type},image:function(e){return e.nodeName.toLowerCase()==="input"&&"image"===e.type},reset:function(x){var e=x.nodeName.toLowerCase();return(e==="input"||e==="button")&&"reset"===x.type},button:function(x){var e=x.nodeName.toLowerCase();return e==="input"&&"button"===x.type||e==="button"},input:function(e){return(/input|select|textarea|button/i).test(e.nodeName)},focus:function(e){return e===e.ownerDocument.activeElement}},setFilters:{first:function(x,e){return e===0},last:function(y,x,e,z){return x===z.length-1},even:function(x,e){return e%2===0},odd:function(x,e){return e%2===1},lt:function(y,x,e){return x<e[3]-0},gt:function(y,x,e){return x>e[3]-0},nth:function(y,x,e){return e[3]-0===x},eq:function(y,x,e){return e[3]-0===x}},filter:{PSEUDO:function(y,D,C,E){var e=D[1],x=k.filters[e];if(x){return x(y,C,D,E)}else{if(e==="contains"){return(y.textContent||y.innerText||b([y])||"").indexOf(D[3])>=0}else{if(e==="not"){var z=D[3];for(var B=0,A=z.length;B<A;B++){if(z[B]===y){return false}}return true}else{d.error(e)}}}},CHILD:function(y,A){var z,G,C,F,e,B,E,D=A[1],x=y;switch(D){case"only":case"first":while((x=x.previousSibling)){if(x.nodeType===1){return false}}if(D==="first"){return true}x=y;case"last":while((x=x.nextSibling)){if(x.nodeType===1){return false}}return true;case"nth":z=A[2];G=A[3];if(z===1&&G===0){return true}C=A[0];F=y.parentNode;if(F&&(F[i]!==C||!y.nodeIndex)){B=0;for(x=F.firstChild;x;x=x.nextSibling){if(x.nodeType===1){x.nodeIndex=++B}}F[i]=C}E=y.nodeIndex-G;if(z===0){return E===0}else{return(E%z===0&&E/z>=0)}}},ID:function(x,e){return x.nodeType===1&&x.getAttribute("id")===e},TAG:function(x,e){return(e==="*"&&x.nodeType===1)||!!x.nodeName&&x.nodeName.toLowerCase()===e},CLASS:function(x,e){return(" "+(x.className||x.getAttribute("class"))+" ").indexOf(e)>-1},ATTR:function(B,z){var y=z[1],e=d.attr?d.attr(B,y):k.attrHandle[y]?k.attrHandle[y](B):B[y]!=null?B[y]:B.getAttribute(y),C=e+"",A=z[2],x=z[4];return e==null?A==="!=":!A&&d.attr?e!=null:A==="="?C===x:A==="*="?C.indexOf(x)>=0:A==="~="?(" "+C+" ").indexOf(x)>=0:!x?C&&e!==false:A==="!="?C!==x:A==="^="?C.indexOf(x)===0:A==="$="?C.substr(C.length-x.length)===x:A==="|="?C===x||C.substr(0,x.length+1)===x+"-":false},POS:function(A,x,y,B){var e=x[2],z=k.setFilters[e];if(z){return z(A,y,x,B)}}}};var j=k.match.POS,c=function(x,e){return"\\"+(e-0+1)};for(var f in k.match){k.match[f]=new RegExp(k.match[f].source+(/(?![^\[]*\])(?![^\(]*\))/.source));k.leftMatch[f]=new RegExp(/(^(?:.|\r|\n)*?)/.source+k.match[f].source.replace(/\\(\d+)/g,c))}
var l=function(x,e){x=Array.prototype.slice.call(x,0);if(e){e.push.apply(e,x);return e}
return x};try{Array.prototype.slice.call(document.documentElement.childNodes,0)[0].nodeType}
catch(v){l=function(A,z){var y=0,x=z||[];if(r.call(A)==="[object Array]"){Array.prototype.push.apply(x,A)}
else{if(typeof A.length==="number"){for(var e=A.length;y<e;y++){x.push(A[y])}}
else{for(;A[y];y++){x.push(A[y])}}}
return x}}
var p,m;if(document.documentElement.compareDocumentPosition){p=function(x,e){if(x===e){h=true;return 0}
if(!x.compareDocumentPosition||!e.compareDocumentPosition){return x.compareDocumentPosition?-1:1}
return x.compareDocumentPosition(e)&4?-1:1}}
else{p=function(E,D){if(E===D){h=true;return 0}
else{if(E.sourceIndex&&D.sourceIndex){return E.sourceIndex-D.sourceIndex}}
var B,x,y=[],e=[],A=E.parentNode,C=D.parentNode,F=A;if(A===C){return m(E,D)}
else{if(!A){return-1}
else{if(!C){return 1}}}
while(F){y.unshift(F);F=F.parentNode}
F=C;while(F){e.unshift(F);F=F.parentNode}
B=y.length;x=e.length;for(var z=0;z<B&&z<x;z++){if(y[z]!==e[z]){return m(y[z],e[z])}}
return z===B?m(E,e[z],-1):m(y[z],D,1)};m=function(x,e,y){if(x===e){return y}
var z=x.nextSibling;while(z){if(z===e){return-1}
z=z.nextSibling}
return 1}}
(function(){var x=document.createElement("div"),y="script"+(new Date()).getTime(),e=document.documentElement;x.innerHTML="<a name='"+y+"'/>";e.insertBefore(x,e.firstChild);if(document.getElementById(y)){k.find.ID=function(A,B,C){if(typeof B.getElementById!=="undefined"&&!C){var z=B.getElementById(A[1]);return z?z.id===A[1]||typeof z.getAttributeNode!=="undefined"&&z.getAttributeNode("id").nodeValue===A[1]?[z]:undefined:[]}};k.filter.ID=function(B,z){var A=typeof B.getAttributeNode!=="undefined"&&B.getAttributeNode("id");return B.nodeType===1&&A&&A.nodeValue===z}}
e.removeChild(x);e=x=null})();(function(){var e=document.createElement("div");e.appendChild(document.createComment(""));if(e.getElementsByTagName("*").length>0){k.find.TAG=function(x,B){var A=B.getElementsByTagName(x[1]);if(x[1]==="*"){var z=[];for(var y=0;A[y];y++){if(A[y].nodeType===1){z.push(A[y])}}
A=z}
return A}}
e.innerHTML="<a href='#'></a>";if(e.firstChild&&typeof e.firstChild.getAttribute!=="undefined"&&e.firstChild.getAttribute("href")!=="#"){k.attrHandle.href=function(x){return x.getAttribute("href",2)}}
e=null})();if(document.querySelectorAll){(function(){var e=d,z=document.createElement("div"),y="__sizzle__";z.innerHTML="<p class='TEST'></p>";if(z.querySelectorAll&&z.querySelectorAll(".TEST").length===0){return}
d=function(K,B,F,J){B=B||document;if(!J&&!d.isXML(B)){var I=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(K);if(I&&(B.nodeType===1||B.nodeType===9)){if(I[1]){return l(B.getElementsByTagName(K),F)}
else{if(I[2]&&k.find.CLASS&&B.getElementsByClassName){return l(B.getElementsByClassName(I[2]),F)}}}
if(B.nodeType===9){if(K==="body"&&B.body){return l([B.body],F)}
else{if(I&&I[3]){var E=B.getElementById(I[3]);if(E&&E.parentNode){if(E.id===I[3]){return l([E],F)}}
else{return l([],F)}}}
try{return l(B.querySelectorAll(K),F)}
catch(G){}}
else{if(B.nodeType===1&&B.nodeName.toLowerCase()!=="object"){var C=B,D=B.getAttribute("id"),A=D||y,M=B.parentNode,L=/^\s*[+~]/.test(K);if(!D){B.setAttribute("id",A)}
else{A=A.replace(/'/g,"\\$&")}if(L&&M){B=B.parentNode}try{if(!L||M){return l(B.querySelectorAll("[id='"+A+"'] "+K),F)}}catch(H){}finally{if(!D){C.removeAttribute("id")}}}}}return e(K,B,F,J)};for(var x in e){d[x]=e[x]}z=null})()}(function(){var e=document.documentElement,y=e.matchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.msMatchesSelector;if(y){var A=!y.call(document.createElement("div"),"div"),x=false;try{y.call(document.documentElement,"[test!='']:sizzle")}catch(z){x=true}d.matchesSelector=function(C,E){E=E.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!d.isXML(C)){try{if(x||!k.match.PSEUDO.test(E)&&!/!=/.test(E)){var B=y.call(C,E);if(B||!A||C.document&&C.document.nodeType!==11){return B}}}catch(D){}}return d(E,null,null,[C]).length>0}}})();(function(){var e=document.createElement("div");e.innerHTML="<div class='test e'></div><div class='test'></div>";if(!e.getElementsByClassName||e.getElementsByClassName("e").length===0){return}e.lastChild.className="e";if(e.getElementsByClassName("e").length===1){return}k.order.splice(1,0,"CLASS");k.find.CLASS=function(x,y,z){if(typeof y.getElementsByClassName!=="undefined"&&!z){return y.getElementsByClassName(x[1])}};e=null})();function a(x,C,B,F,D,E){for(var z=0,y=F.length;z<y;z++){var e=F[z];if(e){var A=false;e=e[x];while(e){if(e[i]===B){A=F[e.sizset];break}if(e.nodeType===1&&!E){e[i]=B;e.sizset=z}if(e.nodeName.toLowerCase()===C){A=e;break}e=e[x]}F[z]=A}}}function t(x,C,B,F,D,E){for(var z=0,y=F.length;z<y;z++){var e=F[z];if(e){var A=false;e=e[x];while(e){if(e[i]===B){A=F[e.sizset];break}if(e.nodeType===1){if(!E){e[i]=B;e.sizset=z}if(typeof C!=="string"){if(e===C){A=true;break}}else{if(d.filter(C,[e]).length>0){A=e;break}}}e=e[x]}F[z]=A}}}if(document.documentElement.contains){d.contains=function(x,e){return x!==e&&(x.contains?x.contains(e):true)}}else{if(document.documentElement.compareDocumentPosition){d.contains=function(x,e){return !!(x.compareDocumentPosition(e)&16)}}else{d.contains=function(){return false}}}d.isXML=function(e){var x=(e?e.ownerDocument||e:0).documentElement;return x?x.nodeName!=="HTML":false};var s=function(y,e,C){var B,D=[],A="",E=e.nodeType?[e]:e;while((B=k.match.PSEUDO.exec(y))){A+=B[0];y=y.replace(k.match.PSEUDO,"")}y=k.relative[y]?y+"*":y;for(var z=0,x=E.length;z<x;z++){d(y,E[z],D,C)}return d.filter(A,D)};

// EXPOSE
AshUtil.document._sizzle = d;
})();