//
"use strict";

const _HrtDomain = {
	"url":{
		"mainHost":"http://jntspx.chinahrt.com/"
	},
	"message":{
		"isVideoOver":"videoOver",
		"isVideoReady":"videoReady",
		"isVideoPlay":"videoPlay",
		"isCourseOver":"isCourseOver",
		"isDayMaxTime":"isDayMaxTime",
		"isVideoConfig":"isHrtVideoConfig"
	}
}

var _IsVideoReadySended = false;
var _VideoConfig = {};
getVideoConfig();

function getVideoConfig() {
	_VideoConfig = JSON.parse(document.getElementById("videoConfig").value);
}

// 获取当前视频的ID
function getHrtVideoSectionID() {
	return "sec_" + document.body.innerHTML.match(/(?<=attrset\.sectionId\=\")(.*)(?=\";)/g)[0];
}

// 获取video的播放时长,单位：秒
function getHrtVideoTime() {
	var sText = document.body.innerHTML.match(/(?<=\"videoTime\"\:\")(.*)(?=\"videoTransStatus\")/g)[0];
	var sTime = sText.replace(/\"/g, "").split(",")[0];
	var rtnVal = 0;
	if (sTime != ""){
		var arrTimes = sTime.split(":");
		switch (arrTimes.length) {
			case 1:
				rtnVal = parseInt(arrTimes[0]);
				break;
			case 2:
				rtnVal = parseInt(arrTimes[0]) * 60 + parseInt(arrTimes[1]);
				break;
			case 3:
				rtnVal = parseInt(arrTimes[0]) * 3600 + parseInt(arrTimes[1]) * 60 + parseInt(arrTimes[2]);
				break;
			default:
				rtnVal = 0;
		}
		
	} else {
		console.log("注意：未能取得视频的时长！");
	}
	return rtnVal
}

function getHrtVideoSeekTime(seek) {
	var vTime = getHrtVideoTime();
	var nTime = 0;
	if (vTime > seek) {
		nTime = vTime - seek;
	}
	return nTime;
}

// 使video自动播放
function doVideoPlay() {
	window.attrset.ifCanDrag = true;
	window.attrset.ifShowPauseAd = false;
	window.attrset.ifPauseBlur = false;
	window.attrset.ifRecord = true;
	(_VideoConfig.videoAutoPlay == "1")?(window.videoObject.autoplay = true):"";
	setVideoStartTime();
	window.addEventListener("message", msgHandler, false);
	//getVideoReadyStatus();
	
	function setVideoStartTime() {
		if (_VideoConfig.videoCanSeek == "1") {
			let nSeek = parseInt(_VideoConfig.videoSeekPos);
			if (nSeek != 0) {
				let nTime = getHrtVideoSeekTime(nSeek);
				window.attrset.lastPlayTime = nTime;
				window.attrset.actualLearnTime += nTime;
				window.startTime = new Date().getTime() - (nTime + 60) * 1000;
			}
		}
	}
	
	function msgHandler(e) {
		switch (e.data) {
			case _HrtDomain.message.isVideoPlay:
				setVideoSeekTime();
				break;
			case _HrtDomain.message.isCourseOver:
				showCourseOverTips();
				break;
			case _HrtDomain.message.isDayMaxTime:
				showDayMaxTimeTips();
				break;
			case _HrtDomain.message.isVideoConfig:
				getVideoConfig();
				break;
			default:
				break;
		}
		
		function showCourseOverTips() {
			swal({title: "Good job!",text: "该课程的内容已经全部学习完毕！",icon: "success",});
		}
		
		function showDayMaxTimeTips() {
			swal({title: "Good job!",text: "今天的学习时间已达成，请明天继续。",icon: "success",});
		}
	}
}

function getVideoReadyStatus() {
	if ($("div[class^=timetext").length == 0) {
		setTimeout(getVideoReadyStatus, 500);
	} else {
		// 延时2秒后发送
		setTimeout(sendVideoReady, 2000);
	}
}
	
// 向父画面发送Videoready消息
function sendVideoReady() {
	let sMsg = _HrtDomain.message.isVideoReady + ":" + getHrtVideoSectionID();
	window.top.postMessage(sMsg, _HrtDomain.url.mainHost);
}

// 向父画面发送videoover消息
function videoOverHandler() {
	let sMsg = _HrtDomain.message.isVideoOver + ":" + getHrtVideoTime() + ":" + getHrtVideoSectionID();
	window.top.postMessage(sMsg, _HrtDomain.url.mainHost);
}

// 视频画面进行视频控制
function setVideoSeekTime() {
	if (_VideoConfig.videoCanSeek == "1") {
		let nTime = 0;
		let nSeek = parseInt(_VideoConfig.videoSeekPos);
		if (nSeek != 0) {
			nTime = getHrtVideoSeekTime(nSeek);
			//window.attrset.actualLearnTime += nTime;
			player.videoSeek(nTime);
		}
	}
}

// 控制焦点离开
function blurStop() {
	(_VideoConfig.onBlurPause == "1")?"":player.videoPause();
}

function loadedHandler(){
	// site code
    attrset.maxTime=attrset.lastPlayTime;
    player.addListener('time',timeHandler);
    if(attrset.ifRecord){
        setInterval("courseyunRecord()",30000);
    }
    player.addListener('ended',endedHandler);
    player.addListener('seekTime',seekingHandler);
    player.addListener('definitionChange',definitionChangeHandler);
    player.addListener('play',playHandler);
    // remove pauseHandler
    // player.addListener('pause',pauseHandler);
    // new Listener
    player.addListener('ended',videoOverHandler);
    player.addListener('play',playSendReadyHandler);
}

function playSendReadyHandler() {
	if (!_IsVideoReadySended) {
		_IsVideoReadySended = true;
		sendVideoReady();
	}
}

doVideoPlay();
