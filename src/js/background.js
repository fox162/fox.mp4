function getCurrentTabInfo() {
    return new Promise((resolve, reject) => {
        browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length > 0) {
                resolve({ url: tabs[0].url, title: tabs[0].title });
            } else {
                reject('No active tab found');
            }
        });
    });
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'getCurrentTabInfo') {
        getCurrentTabInfo().then((tabInfo) => {
            sendResponse({success: true, tabInfo: tabInfo});
        }).catch((error) => {
            sendResponse({success: false, error: error});
        });
        return true;  // Keep the message channel open for the async response
    }
});

// web request listener
browser.webRequest.onBeforeSendHeaders.addListener((details) => {
    if (details.requestHeaders.some(header => header.name.toLowerCase() === 'fox.mp4')) {
        console.log('fox.mp4 header found ' + details.requestHeaders.find(header => header.name.toLowerCase() === 'fox.mp4').value);
        if(details.requestHeaders.find(header => header.name.toLowerCase() === 'fox.mp4').value === 'dl'){
            console.log('Download request');
            const videoId = details.requestHeaders.find(header => header.name.toLowerCase() === 'videoid').value;
            downloadVideo('', videoId);
            return { cancel: true };
        }else if(details.requestHeaders.find(header => header.name.toLowerCase() === 'fox.mp4').value === 'api'){
            const headers = details.requestHeaders.filter(header => header.name.toLowerCase() !== 'origin' && header.name.toLowerCase() !== 'referer' && header.name.toLowerCase() !== 'fox.mp4');
            headers.push({ name: 'Origin', value: 'https://youtube.com' });
            headers.push({ name: 'Referer', value: 'https://youtube.com' });
            return { requestHeaders: headers };
        }
    }
}, { urls: ['<all_urls>'] }, ['blocking', 'requestHeaders']);