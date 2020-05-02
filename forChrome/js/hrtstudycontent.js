// 
"use strict";
const _HrtDomain = {
	"url":{
		"mainHost":"http://jntspx.chinahrt.com/"
	},
	"files":{
		"study":"js/hrtstudyinject.js"
	},
	"message":{
		"isVideoOver":"videoOver",
		"isVideoReady":"videoReady",
		"isVideoPlay":"videoPlay",
		"isCourseOver":"isCourseOver",
		"isDayMaxTime":"isDayMaxTime",
		"isCourseConfig":"isHrtCourseConfig"
	}
}
var _HrtVideoHost = "";
var _CourseConfig = {};
var _LimitedConfig = {};
getCourseConfig();
getLimitedConfig();

function getVideoPlayHostName() {
	let url = document.getElementById("iframe").getAttribute("src");
	if (url == "") {
		setTimeout(getVideoPlayHostName, 1000);
	} else {
		_HrtVideoHost = url.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
	}
}

chrome.runtime.onMessage.addListener(function(req, sender, resp) {
	switch(req.message) {
		case _HrtDomain.message.isCourseConfig:
			getCourseConfig();
			resp({'message': 'course config update'});
			break;
	}
});


document.addEventListener('DOMContentLoaded', function()
	{
		// 注入自定义JS
		injectCustomJs(_HrtDomain.files.study);
		addCourseWindowEvent();
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
	
	function msgHandler(e) {
		let msg = e.data.split(':');
		switch (msg[0]) {
			case _HrtDomain.message.isVideoReady:
				getVideoPlayHostName();
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
				let oCur = document.querySelector("li.n-learning.current span");
				if (oCur != null && oCur.innerText == "已学完") {
					let sID = oCur.parentNode.querySelector("a").getAttribute("id");
					doPlayNextChapter(sID);
				} else {
					window.frames[0].postMessage(_HrtDomain.message.isVideoPlay, _HrtVideoHost);
				}
			}
		}
		
		// 当前视频播放完了后播放下一个
		function doPlayNextChapter(sID) {
			let oChapters = getCourseChapters();
			let isNext = false;
			for (var i=0; i<oChapters.length; i++) {
				//找到当前章节
				if (oChapters[i].id==sID) {
					isNext = true;
					if (i+1==oChapters.length) {showCourseOverTips();}
					continue;
				} else if (isNext) {
					if (_CourseConfig.chapterAutoPlay=='1' && oChapters[i].state == "已学完") {
						if (i+1==oChapters.length) {
							showCourseOverTips();
							return;
						}
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
			window.frames[0].postMessage(_HrtDomain.message.isDayMaxTime, _HrtVideoHost);
		}
		
		function showCourseOverTips() {
			window.frames[0].postMessage(_HrtDomain.message.isCourseOver, _HrtVideoHost);
		}
		
		function createChapter(sID, sName, sClick, sState) {
			this.id = sID;
			this.name = sName;
			this.click = sClick;
			this.state = sState;
		}

		function getCourseChapters() {
			var oChapters = new Array();
			var oCours = document.getElementById("audition-chapter");
			var oChaps = oCours.querySelectorAll("a.f12.fl");
			var oStats = oCours.querySelectorAll("span.f12.fr");
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
