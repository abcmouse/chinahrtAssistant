// 
"use strict";

const _HrtDomain = {
	"jsFile":"js/hrtlogininject.js",
	"objectId": {
		"userName":"userName",
		"password":"password"
	}
}

var _UsrInfo = {};
getLoginUserInfo();

document.addEventListener('DOMContentLoaded', function()
	{
		// 注入自定义JS
		injectCustomJs(_HrtDomain.jsFile);
		setLoginUserInfo();
	}
)

// 向页面注入JS
function injectCustomJs(jsFile)
{
	let temp = document.createElement('script');
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

function getLoginUserInfo(){
	chrome.storage.sync.get('userInfo', function(res) {
    	_UsrInfo.autoLogin=(typeof res.userInfo != 'undefined' && res.userInfo.autoLogin == '0')?"0":"1";
    	_UsrInfo.userName=(typeof res.userInfo != 'undefined')?res.userInfo.userName:"";
    	_UsrInfo.userPswd=(typeof res.userInfo != 'undefined')?res.userInfo.userPswd:"";
    });
}

function setLoginUserInfo() {
	let oUsr = document.getElementById(_HrtDomain.objectId.userName);
	let oPwd = document.getElementById(_HrtDomain.objectId.password);
	oUsr.value = _UsrInfo.userName;
	oPwd.value = _UsrInfo.userPswd;
	
    let tmp = document.createElement('input');
    tmp.setAttribute('type', 'hidden');
    tmp.setAttribute('id', 'autoLogin');
    tmp.setAttribute('value', _UsrInfo.autoLogin);
    document.body.appendChild(tmp);
}
