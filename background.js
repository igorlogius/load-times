
let tabLoadTimes = {};


async function onBAClicked(tab) {

        const tabs = await browser.tabs.query({status:'complete', currentWindow: true, url: ['http://*/*','https://*/*']});
        let text = '';
        for(const tab of tabs){
            text = text + "idx: " + tab.index + ", url: " + tab.url + ", loadtime: " + tabLoadTimes[tab.id] + "ms\n";
        }

        const loadTime = tabLoadTimes[tab.id];

        const title = 'Total Load Time';
        const msg = 'Copied load times of all tabs';


        await navigator.clipboard.writeText(text);

        const nID = await browser.notifications.create(""+tab.id, // <= "download id" is "notification id"
            {
                "type": "basic"
                ,"iconUrl": browser.runtime.getURL("icon.png")
                ,"title": title
                ,"message": msg
                //,"buttons": buttons, // <= not availabe in firefox yet
            });

        setTimeout(() => {
            browser.notifications.clear(nID);
        },6000);
}

async function onPAClicked(tab) {
        const loadTime = tabLoadTimes[tab.id];

        const title = 'Total Load Time';
        const msg = 'Copied load time of active tab';


        let text = "idx: " + tab.index + ", url: " + tab.url + ", loadtime: " + loadTime + "ms\n";
        await navigator.clipboard.writeText(text);

        const nID = await browser.notifications.create(""+tab.id, // <= "download id" is "notification id"
            {
                "type": "basic"
                ,"iconUrl": browser.runtime.getURL("icon.png")
                ,"title": title
                ,"message": msg
                //,"buttons": buttons, // <= not availabe in firefox yet
            });

        setTimeout(() => {
            browser.notifications.clear(nID);
        },6000);
}

function onBefore(details){
    if (details.frameId === 0){ // is top-level frame
        tabLoadTimes[details.tabId] = details.timeStamp;
    }
}

function onCompleted(details){
    if (details.frameId === 0){ // is top-level frame
        tabLoadTimes[details.tabId] = details.timeStamp - tabLoadTimes[details.tabId];
        const loadTime = tabLoadTimes[details.tabId];
        browser.pageAction.setIcon({
            'imageData': getIconImageData(loadTime)
            ,'tabId': details.tabId
        });
        browser.pageAction.setTitle({title: 'Total Load Time: ' + loadTime + " ms", tabId: details.tabId });
        browser.pageAction.show(details.tabId);
    }
}

filter = {
    url: [{schemes: ["http", "https"]}]
};


function onRemoved(tabId){
    if(typeof tabLoadTimes[tabId] !== 'undefined') {
        tabLoadTimes[tabId] = undefined;
        delete tabLoadTimes[tabId];
    }
}

browser.webNavigation.onBeforeNavigate.addListener(onBefore, filter);
browser.webNavigation.onCompleted.addListener(onCompleted, filter);
browser.webNavigation.onErrorOccurred.addListener(onCompleted); // also calc the time for navigation errors
browser.pageAction.onClicked.addListener(onPAClicked);
browser.browserAction.onClicked.addListener(onBAClicked);
browser.tabs.onRemoved.addListener(onRemoved);


function getIconImageData(rank) {
    const imageWidth = 42;
    const imageHeight = 42;
    const markerSize = 8;
    const font = "bold 18pt 'Arial'";
    const color = "#000000";
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const addText = function(ctx, text, centerX, centerY) {
        // yellow fill
        ctx.fillStyle = getHexColorStringForNumber(rank);// '#ff6';
        ctx.fillRect(0, 0, imageWidth, imageHeight);

        // text / number
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        var maxWidth = imageWidth
        ctx.fillText(text, centerX, centerY, maxWidth);
    }
    const textOffset = 2; // trying to align text beautifully here
    const text = rank !== null ? shortTextForNumber(rank) : "n/a";
    addText(ctx, text, imageWidth / 2, imageHeight / 2 + textOffset)
    return ctx.getImageData(0, 0, imageWidth, imageHeight);
}

function getHexColorStringForNumber(number){
	if (number < 1000) {
        return "green"; // green
	} else if (number < 2500) {
		return "yellow"; // yellow
	} else if (number < 5000) {
		return "orange"; // orange
	} else {
		return "red"; // red
	}
}

function shortTextForNumber (number) {
	if (number < 1000) {
		return number.toString()
	} else if (number < 100000) {
		return Math.floor(number / 1000)
			.toString() + "k"
	} else if (number < 1000000) {
		return Math.floor(number / 100000)
			.toString() + "hk"
	} else {
		return Math.floor(number / 1000000)
			.toString() + "m"
	}
}


