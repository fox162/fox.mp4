document.addEventListener('DOMContentLoaded', function() {
    // Initialize Sortable
    const queueEl = document.querySelector('.queue');
    new Sortable(queueEl, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: function(evt) {
            // Handle the end of sorting (e.g., update order in backend)
            console.log('Sorting ended', evt.oldIndex, evt.newIndex);
        }
    });

    // Toggle queue visibility
    const showQueueBtn = document.querySelector('.head button');
    const downloadSection = document.querySelector('.download');
    const queueSection = document.querySelector('.queue-container');

    showQueueBtn.addEventListener('click', function() {
        if (downloadSection.style.display === 'none') {
            downloadSection.style.display = 'flex';
            queueSection.style.display = 'none';
            this.innerHTML = '<img src="assets/svg/queue.svg" alt="queue icon" class="svg">Show Queue';
        } else {
            downloadSection.style.display = 'none';
            queueSection.style.display = 'block';
            this.innerHTML = '<img src="assets/svg/download.svg" alt="download icon" class="svg">Show Download';
        }
    });

    // Example: Update progress bar
    function updateProgress(nodeEl, percentage) {
        const bar = nodeEl.querySelector('.bar');
        const percentageEl = nodeEl.querySelector('.percentage');
        bar.style.width = `${percentage}%`;
        percentageEl.textContent = `${percentage}%`;
    }

    // Example usage: Update progress of first node to 50%
    const firstNode = document.querySelector('.queue-container .node');
    if (firstNode) {
        updateProgress(firstNode, 50);
    }

    async function loadVideo(videoId) {
        try {
            const data = await formattedApi(videoId);
            if (!data) {
                console.error('No data found');
                return;
            }

            const videoEl = document.querySelector('.video');
            videoEl.src = data.streamingData.formats[0].url;
            const qualitySelect = document.querySelector('#qualitySelect');
            qualitySelect.innerHTML = '';
            function addOption(itag, label) {
                const option = document.createElement('option');
                option.value = itag;
                option.textContent = label;
                qualitySelect.appendChild(option);
            }
            function toBitrate(bitrate) {
                return `${Math.round(bitrate / 1000)}k`;
            }
            data.streamingData.formats.forEach(format => {
                addOption(format.itag, `video ${format.qualityLabel}/${toBitrate(format.bitrate)}`);
            });
            data.streamingData.audio.forEach(format => {
                addOption(format.itag, `audio ${toBitrate(format.bitrate)}`);

            });
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Sending the message to get the current tab URL
    browser.runtime.sendMessage('getCurrentTabInfo').then((response) => {
        if (response.success) {
            const url = response.tabInfo.url;
            const videoId = new URL(url).searchParams.get('v');
            const inputEl = document.querySelector('.videoId');
            inputEl.value = videoId;
            videoTitleEl = document.querySelector('.videoTitle');
            const title = response.tabInfo.title.replace(/ - YouTube$/, '');
            videoTitleEl.textContent = title;
            loadVideo(videoId);
        } else {
            console.error('Error:', response.error);  // Logs an error message if something goes wrong
        }
    }).catch((error) => {
        console.error('Failed to send message:', error);  // Handle errors in sending the message
    });

});