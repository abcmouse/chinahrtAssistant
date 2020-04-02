// 
"use strict";
const _HrtDomain = {
	"url":{
		"mainHost":"http://jntspx.chinahrt.com/",
		"videoHost":"http://videoadmin1.chinahrt.com.cn/",
		"login":"http://jntspx.chinahrt.com/user/login",
		"video":"http://videoadmin1.chinahrt.com.cn/videoPlay/play",
		"study":"http://jntspx.chinahrt.com/userStudyResource/studyResourceDetailInfo"
	},
	"page":{
		"isLogin":"isLogin",
		"isVideo":"isVideo",
		"isStudy":"isStudy"
	},
	"files":{
		"login":"js/hrtlogininject.js",
		"study":"js/hrtstudyinject.js",
		"video":"js/hrtvideoinject.js"
	},
	"message":{
		"isVideoOver":"videoOver",
		"isVideoReady":"videoReady",
		"isVideoPlay":"videoPlay",
		"isCourseOver":"isCourseOver",
		"isDayMaxTime":"isDayMaxTime",
		"isVideoConfig":"isVideoConfig",
		"isCourseConfig":"isCourseConfig"
	}
}
var _UsrInfo = {};
var _VideoConfig = {};
var _CourseConfig = {};
var _LimitedConfig = {};


chrome.runtime.onMessage.addListener(function(req, sender, resp) {
	switch(req.message) {
		case _HrtDomain.message.isVideoConfig:
			getVideoConfig();
			resp({'message': 'video config update'});
			break;
		case _HrtDomain.message.isCourseConfig:
			getCourseConfig();
			resp({'message': 'course config update'});
			break;
	}
});


document.addEventListener('DOMContentLoaded', function()
	{
		// 注入自定义JS
		injectCustomCss("css/sweetalert.css");
		injectCustomJs("js/sweetalert.min.js");
		injectCustomJs(getInjectJsFile());
		injectCustomEvent();
		injectCustomHtml();
	}
)

// 判断是哪个画面
function getHrtPageFlag() {
	var rtnVal = "";
	var sUrl = window.location.href;
	
	if (sUrl.indexOf(_HrtDomain.url.login) != -1) {
		rtnVal = _HrtDomain.page.isLogin;
	} else if (sUrl.indexOf(_HrtDomain.url.video) != -1) {
		rtnVal = _HrtDomain.page.isVideo;
	} else if (sUrl.indexOf(_HrtDomain.url.study) != -1) {
		rtnVal = _HrtDomain.page.isStudy;
	}
	return rtnVal;
}

function getInjectJsFile() {
	let jsFile = "";
	switch (getHrtPageFlag()) {
		case _HrtDomain.page.isLogin:
			jsFile = _HrtDomain.files.login;
			break;
		case _HrtDomain.page.isVideo:
			jsFile = _HrtDomain.files.video;
			break;
		case _HrtDomain.page.isStudy:
			jsFile = _HrtDomain.files.study;
		default:
	}
	return jsFile;
}

function injectCustomHtml() {
	switch (getHrtPageFlag()) {
		case _HrtDomain.page.isLogin:
			setLoginUserInfo();
			break;
		case _HrtDomain.page.isVideo:
			setVideoConfig();
			break;
		case _HrtDomain.page.isStudy:
			//setCourseConfig();
			break;
		default:
	}
}

// 向页面注入JS
function injectCustomJs(jsFile)
{
	//var jsFile = getInjectJsFile();
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

function injectCustomEvent(){
	switch (getHrtPageFlag()) {
		case _HrtDomain.page.isLogin:
			break;
		case _HrtDomain.page.isVideo:
			break;
		case _HrtDomain.page.isStudy:
			addCourseWindowEvent();
			break;
		default:
	}
}

Date.prototype.pattern=function(fmt) {
	var o = {  
		"M+" : this.getMonth()+1, 									//月份
		"d+" : this.getDate(), 										//日
		"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, 	//小时
		"H+" : this.getHours(), 									//小时
		"m+" : this.getMinutes(), 									//分
		"s+" : this.getSeconds(), 									//秒
		"q+" : Math.floor((this.getMonth()+3)/3), 					//季度
		"S" : this.getMilliseconds() 								//毫秒
	};
	var week = {  
		"0" : "/u65e5",
		"1" : "/u4e00",
		"2" : "/u4e8c",
		"3" : "/u4e09",
		"4" : "/u56db",
		"5" : "/u4e94",
		"6" : "/u516d"
	};
	if(/(y+)/.test(fmt)){
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}  
	if(/(E+)/.test(fmt)){
		fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
	}  
	for(var k in o){
		if(new RegExp("("+ k +")").test(fmt)){
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
		}
	}
	return fmt;
}

//**********************************************************
// for Login start
//**********************************************************
getLoginUserInfo();

function getLoginUserInfo(){
	chrome.storage.sync.get('userInfo', function(res) {
    	_UsrInfo.autoLogin=(typeof res.userInfo != 'undefined' && res.userInfo.autoLogin == '0')?"0":"1";
    	_UsrInfo.userName=(typeof res.userInfo != 'undefined')?res.userInfo.userName:"";
    	_UsrInfo.userPswd=(typeof res.userInfo != 'undefined')?res.userInfo.userPswd:"";
    });
}

function setLoginUserInfo() {
	let oUsr = document.getElementById("userName");
	let oPwd = document.getElementById("password");
	oUsr.value = _UsrInfo.userName;
	oPwd.value = _UsrInfo.userPswd;
	
    var tmp = document.createElement('input');
    tmp.setAttribute('type', 'hidden');
    tmp.setAttribute('id', 'autoLogin');
    tmp.setAttribute('value', _UsrInfo.autoLogin);
    document.body.appendChild(tmp);
}
//**********************************************************
// for Login end
//**********************************************************

//**********************************************************
// for Video start
//**********************************************************
getVideoConfig();

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
//**********************************************************
// for Video end
//**********************************************************


//**********************************************************
// for course start
//**********************************************************
getCourseConfig();
getLimitedConfig();

function getLimitedConfig(){
	chrome.storage.sync.get('dayLimitedConfig', function(res) {
		let sDate = new Date().pattern("yyyy-MM-dd");
		let rDate = (typeof res.dayLimitedConfig != 'undefined')?res.dayLimitedConfig.limitedDate:sDate;
		let nTime = ((rDate == sDate)?((typeof res.dayLimitedConfig != 'undefined')?res.dayLimitedConfig.PlayedTime:0):0);
		_LimitedConfig.limitedDate = sDate;
		_LimitedConfig.PlayedTime = nTime;
	});
}
function getCourseConfig(){
	chrome.storage.sync.get('courseConfig', function(res) {
    	_CourseConfig.courseOverTips=(typeof res.courseConfig!='undefined' && res.courseConfig.courseOverTips == '0')?"0":"1";
    	_CourseConfig.chapterAutoPlay=(typeof res.courseConfig!='undefined' && res.courseConfig.chapterAutoPlay == '0')?"0":"1";
    	_CourseConfig.oneDayLimited=(typeof res.courseConfig!='undefined' && res.courseConfig.oneDayLimited == '0')?"0":"1";
    	_CourseConfig.oneDayMaxTime=(typeof res.courseConfig!='undefined')?res.courseConfig.oneDayMaxTime:"0";
    });
}

function setCourseConfig(){
	let sVal = '{"courseOverTips":"' + _CourseConfig.courseOverTips;
	sVal += '","chapterAutoPlay":"' + _CourseConfig.chapterAutoPlay + '"}';
	let tmp = document.createElement('input');
	tmp.setAttribute('type', 'hidden');
    tmp.setAttribute('id', 'CourseConfig');
    tmp.setAttribute('value', sVal);
    document.body.appendChild(tmp);
}

function addCourseWindowEvent(){
	window.addEventListener("message", msgHandler, false);
	//addCurChapterToPage();
	
	function addCurChapterToPage() {
		let tmp = document.createElement('input');
		tmp.setAttribute('type', 'hidden');
	    tmp.setAttribute('id', 'curChapter');
	    tmp.setAttribute('value', '0');
		document.body.appendChild(tmp);
	}
	
	function msgHandler(e) {
		let msg = e.data.split(':');
		switch (msg[0]) {
			case _HrtDomain.message.isVideoReady:
				doPlayCurrentChapter();
				break;
			case _HrtDomain.message.isVideoOver:
				doVideoOverAction(msg[1], msg[2]);
				break;
			default:
		}
		
		function doVideoOverAction(nTime, sID) {
			if (getOneDayContinuePlay(parseInt(nTime))) {
				doPlayNextChapter(sID);
			} else {
				showDayMaxTimeTips();
			}
		}
		
		// 当前视频播放
		function doPlayCurrentChapter() {
			if (_CourseConfig.chapterAutoPlay=='1') {
				window.frames[0].postMessage(_HrtDomain.message.isVideoPlay, _HrtDomain.url.videoHost);
			}
		}
		
		// 当前视频播放完了后播放下一个
		function doPlayNextChapter(sID) {
			let oChapters = getCourseChapters();
			let isNext = false;
			for (var i=0; i<oChapters.length; i++) {
				if (oChapters[i].id.indexOf(sID)!=-1) {
					if (i+1==oChapters.length) {
						showCourseOverTips();
					} else {
						isNext = true;
						continue;
					}
				}
				
				if (isNext) {
					if (_CourseConfig.chapterAutoPlay=='1' && oChapters[i].state == "已学完") {
						continue;
					} else {
						let oCour = document.getElementById(oChapters[i].id);
						oCour.click();
						return;
					}
				}
			}
		}
		
		function getOneDayContinuePlay(nTime) {
			_LimitedConfig.PlayedTime += nTime;
			chrome.storage.sync.set({'dayLimitedConfig':_LimitedConfig}, function() {});
			return (_CourseConfig.oneDayLimited == "1" && _LimitedConfig.PlayedTime > _CourseConfig.oneDayMaxTime)?false:true;
		}
		
		function showDayMaxTimeTips() {
			window.frames[0].postMessage(_HrtDomain.message.isDayMaxTime, _HrtDomain.url.videoHost);
		}
		
		function showCourseOverTips() {
			window.frames[0].postMessage(_HrtDomain.message.isCourseOver, _HrtDomain.url.videoHost);
		}
		
		function createChapter(sID, sName, sClick, sState) {
			this.id = sID;
			this.name = sName;
			this.click = sClick;
			this.state = sState;
		}

		function getCourseChapters() {
			var oChapters = new Array();
			var oCours = $("#audition-chapter");
			var oChaps = oCours.find("a.f12.fl");
			var oStats = oCours.find("span.f12.fr");
			if (oChaps.length > 0) {
				for (var i=0; i<oChaps.length; i++) {
					let sID = oChaps[i].getAttribute("id");
					let sName = oChaps[i].innerText;
					let sClick = oChaps[i].getAttribute("onclick");
					let sState = oStats[i].innerText;
					
					oChapters.push(new createChapter(sID, sName, sClick, sState));
				}
			} else {
				console.log("未找到课程章节内容。");
			}
			return oChapters;
		}

		function doPlayChapter(idx) {
			var oChapters = getCourseChapters();
			if (idx < oChapters.length) {
				for (var i=idx; i<oChapters.length; i++) {
					if (oChapters[i].state != "已学完") {
						let oCour = document.getElementById(oChapters[i].id);
						oCour.click();
						document.getElementById("curChapter").value = i+1;
						break;
					}
				}
			}
		}
	}
}
//**********************************************************
// for course end
//**********************************************************
