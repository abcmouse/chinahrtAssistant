// 
"use strict";
const _HrtDomain = {
	"url":{
		"mainHost":"http://jntspx.chinahrt.com/",
		"videoHost":"" + getVideoPlayHost() + ""
	},
	"files":{
		"video":"js/hrtvideoinject.js",
		"sweetjs":"js/sweetalert.min.js",
		"sweetcss":"css/sweetalert.css"
	},
	"message":{
		"isVideoConfig":"isHrtVideoConfig",
		"videoConfigUpdate":"video config was updated."
	}
}
var _VideoConfig = {};
getVideoConfig();

chrome.runtime.onMessage.addListener(function(req, sender, resp) {
	switch(req.message) {
		case _HrtDomain.message.isVideoConfig:
			getVideoConfig(true);
			resp({'message': _HrtDomain.message.videoConfigUpdate});
			break;
	}
});

document.addEventListener('DOMContentLoaded', function()
	{
		// 注入自定义JS
		injectCustomCss(_HrtDomain.files.sweetcss);
		injectCustomJs(_HrtDomain.files.sweetjs);
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
	document.getElementsByTagName("head")[0].appendChild(tmp);
}

function getVideoConfig(isUpdate=false){
	chrome.storage.sync.get('videoConfig', function(res) {
		_VideoConfig.videoCanSeek=(typeof res.videoConfig!='undefined' && res.videoConfig.videoCanSeek == '0')?"0":"1";
		_VideoConfig.videoSeekPos=(typeof res.videoConfig=='undefined' || res.videoConfig.videoSeekPos == '')?"0":res.videoConfig.videoSeekPos;
		_VideoConfig.onBlurPause=(typeof res.videoConfig!='undefined' && res.videoConfig.onBlurPause == '0')?"0":"1";
		_VideoConfig.videoAutoPlay=(typeof res.videoConfig!='undefined' && res.videoConfig.videoAutoPlay == '0')?"0":"1";
		
		if (isUpdate) {setVideoConfig(true);}
	});
}

function setVideoConfig(isUpdate=false){
	let sVal = '{"videoCanSeek":"' + _VideoConfig.videoCanSeek;
	sVal += '","videoSeekPos":"' + _VideoConfig.videoSeekPos;
	sVal += '","onBlurPause":"' + _VideoConfig.onBlurPause;
	sVal += '","videoAutoPlay":"' + _VideoConfig.videoAutoPlay + '"}';
	
	let tmp = document.getElementById("videoConfig");
	if (tmp == null) {
		tmp = document.createElement('input');
		tmp.setAttribute('type', 'hidden');
		tmp.setAttribute('id', 'videoConfig');
		document.body.appendChild(tmp);
	}
	tmp.setAttribute('value', sVal);
	
	if (isUpdate) {
		window.postMessage(_HrtDomain.message.isVideoConfig, _HrtDomain.url.videoHost);
	}
}


function getVideoPlayHost() {
	return window.location.protocol + "//" + window.location.hostname;
}