// 
"use strict";
const _HrtDomain = {
	"files":{
		"video":"js/hrtvideoinject.js"
	},
	"message":{
		"isVideoConfig":"isVideoConfig",
		"videoConfigUpdate":"video config was updated."
	}
}
var _VideoConfig = {};
getVideoConfig();

chrome.runtime.onMessage.addListener(function(req, sender, resp) {
	switch(req.message) {
		case _HrtDomain.message.isVideoConfig:
			getVideoConfig();
			resp({'message': _HrtDomain.message.videoConfigUpdate});
			break;
	}
});

document.addEventListener('DOMContentLoaded', function()
	{
		// 注入自定义JS
		injectCustomCss("css/sweetalert.css");
		injectCustomJs("js/sweetalert.min.js");
		injectCustomJs(_HrtDomain.files.video);
		setVideoConfig();
	}
)

// 向页面注入JS
function injectCustomJs(jsFile)
{
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	temp.src = chrome.extension.getURL(jsFile);
	temp.onload = function()
	{
		// 放在页面不好看，执行完后移除掉
		this.parentNode.removeChild(this);
	};
	document.body.appendChild(temp);
}

function injectCustomCss(cssFile){
	var tmp = document.createElement('link');
	tmp.setAttribute('rel', 'stylesheet');
	tmp.setAttribute('type', 'text/css');
	tmp.setAttribute('href', chrome.extension.getURL(cssFile));
	tmp.onload = function()
	{
		// 放在页面不好看，执行完后移除掉
		//this.parentNode.removeChild(this);
	};
	document.getElementsByTagName("head")[0].appendChild(tmp);
}

function getVideoConfig(){
	chrome.storage.sync.get('videoConfig', function(res) {
    	_VideoConfig.videoCanSeek=(typeof res.videoConfig!='undefined' && res.videoConfig.videoCanSeek == '0')?"0":"1";
		_VideoConfig.videoSeekPos=(typeof res.videoConfig!='undefined' && res.videoConfig.videoSeekPos == '')?"0":res.videoConfig.videoSeekPos;
    	_VideoConfig.onBlurPause=(typeof res.videoConfig!='undefined' && res.videoConfig.onBlurPause == '0')?"0":"1";
    	_VideoConfig.videoAutoPlay=(typeof res.videoConfig!='undefined' && res.videoConfig.videoAutoPlay == '0')?"0":"1";
    });
}

function setVideoConfig(){
	let sVal = '{"videoCanSeek":"' + _VideoConfig.videoCanSeek;
	sVal += '","videoSeekPos":"' + _VideoConfig.videoSeekPos;
	sVal += '","onBlurPause":"' + _VideoConfig.onBlurPause;
	sVal += '","videoAutoPlay":"' + _VideoConfig.videoAutoPlay + '"}';
	
	let tmp = document.createElement('input');
	tmp.setAttribute('type', 'hidden');
    tmp.setAttribute('id', 'videoConfig');
    tmp.setAttribute('value', sVal);
    document.body.appendChild(tmp);
}
