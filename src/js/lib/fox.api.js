async function sendApi(videoId, music = false) {
    const data = JSON.stringify({
        "context": {
            "client": {
                "hl": "en",
                "gl": "US",
                "clientName": (music ? "ANDROID_MUSIC" : "MWEB"),
                "clientVersion": (music ? "5.26.1" : "2.20220918"),
                "clientScreen": "WATCH",
                "androidSdkVersion": 31
            },
            "thirdParty": {
                "embedUrl": "https://www.youtube.com/"
            }
        },
        "videoId": videoId,
    });

    try {
        const response = await fetch("https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'fox.mp4/1.0',
                'Accept': '*/*',
                'Accept-Language': 'de,de-DE;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                'fox.mp4': 'api'
            },
            body: data
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const jsonResponse = await response.json();
        return jsonResponse;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function formattedApi(videoId) {
    try {
        const [normal, music] = await Promise.all([sendApi(videoId, false), sendApi(videoId, true)]);

        let type, obj;

        if (normal.streamingData.formats[0].url) {
            type = "normal";
            obj = normal;
        } else if (music.streamingData.formats[0].url) {
            type = "music";
            obj = music;
        } else {
            return;
        }

        const audio = obj.streamingData.adaptiveFormats.filter(format => format.bitrate);
        const video = obj.streamingData.adaptiveFormats.filter(format => format.qualityLabel);

        const data = {
            type: type,
            streamingData: {
                formats: obj.streamingData.formats,
                audio: audio,
                video: video
            },
            videoDetails: {
                title: obj.videoDetails.title,
                artist: obj.videoDetails.author,
                thumbnail: obj.videoDetails.thumbnail.thumbnails[0].url
            }
        };
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
