/* =========================================================
	满足条件的网站，点击插件图标显示popup.html
const _MatchHost = [
	/^((https|http)?:\/\/.*\.chinahrt\.com\/)/, 
	/^((https|http)?:\/\/.*\.chinahrt\.com\.cn\/)/, 
	/^((https|http)?:\/\/.*\.teacheredu\.cn\/)/, 
	/^((edge|chrome)?:\/\/extensions)/
];
*/
// 开启插件popup.html的域名
const _MatchHost = [
	/^((https|http)?:\/\/(web|jntspx)?\.chinahrt\.com\/)/, 
	/^((https|http)?:\/\/.*\.teacheredu\.cn\/)/, 
	/^((edge|chrome)?:\/\/extensions)/
];
//当tab激活时
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab) {
		setPageActionShow(tab);
	});
});
//当tab更新时
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {   
	setPageActionShow(tab);
});

function setPageActionShow(tab) {
	if (getIsShowPageAction(tab)) {
		chrome.pageAction.show(tab.id);
	} else {
		chrome.pageAction.hide(tab.id);
	}
}
//判断域名是否符合
function getIsShowPageAction(tab) {
	var rtn = false;
	for (var i=0; i<_MatchHost.length; i++) {
		if (tab.url.search(_MatchHost[i]) != -1) {
			rtn = true;
			break;
		}
	}
	return rtn;
}

/* ========================================================= */
