//window.addEventListener('load', windowOnLoad, false);
"use strict";
const _HrtDomain = {
	"url":{
		"study":"http://jntspx.chinahrt.com/userStudyResource/studyResourceDetailInfo"
	},
	"message":{
		"isVideoConfig":"isVideoConfig",
		"isCourseConfig":"isCourseConfig"
	}
}

window.onload = windowOnLoad();

function sendMessageToContentScript(message, callback) {
	chrome.tabs.query({}, function(tabs)
	{
		tabs.forEach(function (tab) {
			if (tab.url.indexOf(_HrtDomain.url.study)!=-1) {
				chrome.tabs.sendMessage(tab.id, message, function(response) {
					if (callback) callback(response);
				});
			}
		});
	});
}

function windowOnLoad() {
	let oUsr = document.getElementById("userName");
    let oPwd = document.getElementById("userPswd");
    let oEye = document.getElementById("passwordEye");
    let oLog = document.getElementById('autoLogin');
    let oVsk = document.getElementById('videoCanSeek');
    let oPos = document.getElementById('videoSeekPos');
    let oTip = document.getElementById('courseOverTips');
    let oBlu = document.getElementById('onBlurPause');
    let oVap = document.getElementById('videoAutoPlay');
    let oCap = document.getElementById('chapterAutoPlay');
    let oCmt = document.getElementById('chkMaxTime');
    let oDmt = document.getElementById('oneDayMaxTime');
    
    oLog.addEventListener('click', autoLogin_click);
    oUsr.addEventListener('change', userInfo_change);
	oPwd.addEventListener('change', userInfo_change);
	oUsr.addEventListener('input', function(){this.value=this.value.replace(/(^\s*)|(\s*$)/g, "")});
	oPwd.addEventListener('input', function(){this.value=this.value.replace(/(^\s*)|(\s*$)/g, "")});
	oEye.addEventListener('click', passwordEye_click);

    oVsk.addEventListener('click', videoCanSeek_click);
	oPos.addEventListener('change', videoSeekPos_change);
	oPos.addEventListener('input', function(){this.value=this.value.replace(/[^\d]/g,'')});
	oBlu.addEventListener('click', videoSeekPos_change);
	oVap.addEventListener('click', videoSeekPos_change);
	
	oTip.addEventListener('click', overTips_click);
	oCap.addEventListener('click', overTips_click);
	oCmt.addEventListener('click', overTips_click);
	oDmt.addEventListener('change', overTips_click);
	oDmt.addEventListener('input', function(){this.value=this.value.replace(/[^\d]/g,'')});

	chrome.storage.sync.get(['userInfo','videoConfig','courseConfig'], function(res) {
		// user info
		oUsr.value=(typeof res.userInfo != 'undefined')?res.userInfo.userName:"";
		oPwd.value=(typeof res.userInfo != 'undefined')?res.userInfo.userPswd:"";
		oLog.checked=(typeof res.userInfo != 'undefined' && res.userInfo.autoLogin == '0')?false:true;
    	autoLogin_click();
    	// video config
		oPos.value=(typeof res.videoConfig != 'undefined')?res.videoConfig.videoSeekPos:"0";
		oVsk.checked=(typeof res.videoConfig != 'undefined' && res.videoConfig.videoCanSeek == '0')?false:true;
    	videoCanSeek_click();
    	oBlu.checked=(typeof res.videoConfig != 'undefined' && res.videoConfig.onBlurPause == '0')?false:true;
    	oVap.checked=(typeof res.videoConfig != 'undefined' && res.videoConfig.videoAutoPlay == '0')?false:true;
		// Course Config
    	oTip.checked=(typeof res.courseConfig != 'undefined' && res.courseConfig.courseOverTips == '0')?false:true;
    	oCap.checked=(typeof res.courseConfig != 'undefined' && res.courseConfig.chapterAutoPlay == '0')?false:true;
    	oCmt.checked=(typeof res.courseConfig != 'undefined' && res.courseConfig.oneDayLimited == '0')?false:true;
    	oDmt.value=(typeof res.courseConfig != 'undefined')?res.courseConfig.oneDayMaxTime:"0";
	});
}

function autoLogin_click(){
	let oUsr = document.getElementById("userName");
    let oPwd = document.getElementById("userPswd");
    let oUif = document.getElementById("userInfo");
    let oChk = document.getElementById('autoLogin').checked
    oUsr.disabled=(oChk)?false:true;
    oUsr.focus();
    oPwd.disabled=(oChk)?false:true;
    oUif.style.opacity=(oChk)?"1":"0.5";
    
	let oUserInfo={};
	oUserInfo.autoLogin=(!oChk)?'0':'1';
	oUserInfo.userName=oUsr.value.replace(/(^\s*)|(\s*$)/g, "");
	oUserInfo.userPswd=oPwd.value.replace(/(^\s*)|(\s*$)/g, "");
	chrome.storage.sync.set({'userInfo':oUserInfo}, function() {});
}

function passwordEye_click(){
	let oPwd = document.getElementById("userPswd");
	let oEye = document.getElementById("passwordEye");
	oPwd.type = (oPwd.type=="password")?"text":"password";
	oEye.src = (oPwd.type=="text")?"../images/eyein.png":"../images/eyevi.png";
}

function videoCanSeek_click(){
	function videoCanSeek_Control() {
		let oPos = document.getElementById("videoSeekPos");
	    let oSek = document.getElementById("videoSeek");
	    let oVcs = document.getElementById('videoCanSeek').checked;
	    oPos.disabled=(oVcs)?false:true;
	    oPos.focus();
	    oSek.style.opacity=(oVcs)?"1":"0.5";
	}
	videoCanSeek_Control();
	videoSeekPos_change();
}

function videoSeekPos_change(){
	let sPos = document.getElementById('videoSeekPos').value.replace(/(^\s*)|(\s*$)/g, "");
	let oVcs = document.getElementById('videoCanSeek').checked;
    let oBlu = document.getElementById('onBlurPause').checked;
    let oVap = document.getElementById('videoAutoPlay').checked;
    
    let oVideo = {};
	oVideo.videoCanSeek=(!oVcs)?"0":"1";
	oVideo.videoSeekPos=sPos;
	oVideo.onBlurPause=(!oBlu)?"0":"1";
	oVideo.videoAutoPlay=(!oVap)?"0":"1";

	chrome.storage.sync.set({'videoConfig': oVideo}, function() {
		sendMessageToContentScript({'message': _HrtDomain.message.isVideoConfig}, function(response) {
			console.log(response.message);
		});
	});
}


function overTips_click(){
	let oCot = document.getElementById('courseOverTips').checked;
	let oCap = document.getElementById('chapterAutoPlay').checked;
	let oCmt = document.getElementById('chkMaxTime').checked;
	let sDmt = document.getElementById('oneDayMaxTime').value.replace(/(^\s*)|(\s*$)/g, "");
	
	let oCourse = {};
	oCourse.courseOverTips=(!oCot)?'0':'1';
	oCourse.chapterAutoPlay=(!oCap)?'0':'1';
	oCourse.oneDayLimited=(!oCmt)?'0':'1';
	oCourse.oneDayMaxTime=sDmt;
	
	chrome.storage.sync.set({'courseConfig': oCourse}, function() {
		sendMessageToContentScript({'message': _HrtDomain.message.isCourseConfig}, function(response) {
			console.log(response.message);
		});
	});
}


function userInfo_change(){
	let oChk = document.getElementById('autoLogin').checked
	let sUsr = document.getElementById('userName').value.replace(/(^\s*)|(\s*$)/g, "");
	let sPwd = document.getElementById('userPswd').value.replace(/(^\s*)|(\s*$)/g, "");
	let oUserInfo={};
	oUserInfo.autoLogin=(!oChk)?'0':'1';
	oUserInfo.userName=sUsr;
	oUserInfo.userPswd=sPwd;
	chrome.storage.sync.set({'userInfo':oUserInfo}, function() {});
}
