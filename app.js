$(document).ready(function() {
    // Function to handle login
    $('#login-btn').click(async function() {
        const username = $('#username').val();
        const password = $('#password').val();

        try {
            await authenticate(username, password);
            $('#login-form').fadeOut(300, function() {
                $('#content').fadeIn(300);
            });
            fetchActivityReports();
            fetchComments();
            fetchChannelName();
        } catch (error) {
            alert(error.message);
        }
    });

    $('#logout-btn').click(function() {
        $('#content').fadeOut(300, function() {
            $('#login-form').fadeIn(300);
        });
    });
});

function authenticate(username, password) {
    return new Promise((resolve, reject) => {
        if (username === 'admin' && password === '123') {
            resolve(true);
        } else {
            reject(new Error('Invalid username or password'));
        }
    });
}

let VIDEO_ID = 'Yj4FgtE3d2M';

// Function to remove a comment
async function removeComment(commentId) {
    const url = `https://www.googleapis.com/youtube/v3/comments/delete?part=snippet&id=${commentId}`;

    try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`Failed to remove comment: ${response.statusText}`);
        }
        console.log('Comment removed successfully.');
        fetchComments();
    } catch (error) {
        console.error('Error removing comment:', error);
    }
}

// Function to reply to a comment
async function replyToComment() {
    const replyText = $('#reply-text').val();
    if (!replyText) {
        alert('Please enter a reply text.');
        return;
    }

    try {
        const response = await insertComment(VIDEO_ID, replyText);
        console.log('Reply added successfully:', response);
        $('#reply-text').val('');
        fetchComments();
    } catch (error) {
        console.error('Error replying to comment:', error);
    }
}

async function insertComment(videoId, commentText) {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=${'AIzaSyA0avnK4_PFEznBpN_sct2C-oMby1KOwXQ'}`;
    const requestBody = {
        snippet: {
            videoId: videoId,
            topLevelComment: {
                snippet: {
                    textOriginal: commentText
                }
            }
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Failed to insert comment: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error inserting comment:', error);
        throw error; 
    }
}

// Function to fetch and display the channel name
async function fetchChannelName() {
    const videoInfoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${VIDEO_ID}`;

    try {
        const response = await fetch(videoInfoUrl);
        const data = await response.json();
        const channelTitle = data.items[0].snippet.channelTitle;
        $('#channel-name').text(`Channel: ${channelTitle}`);
    } catch (error) {
        console.error('Error fetching channel name:', error);
    }
}

// Function to fetch and display activity reports
async function fetchActivityReports() {
    const CHANNEL_ID = 'UCAdnJAf2mWeX8ba97U662Ew';
    const url = `https://www.googleapis.com/youtube/v3/activities?part=snippet&channelId=${CHANNEL_ID}`;

    try {
        const data = await fetchData(url);
        const activityList = $('#activity-list');
        activityList.empty(); 
        data.items.forEach(item => {
            const date = new Date(item.snippet.publishedAt).toLocaleDateString();
            const type = item.snippet.type;
            const title = item.snippet.title;
            const row = `<tr><td>${date}</td><td>${type}</td><td>${title}</td></tr>`;
            activityList.append(row);
        });
        $('#activity-reports').removeClass('hidden');
    } catch (error) {
        console.error('Error fetching activity reports:', error);
    }
}

// Function to fetch and display comments
async function fetchComments() {
    const videoInfoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${VIDEO_ID}`;
    const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${VIDEO_ID}`;

    try {
        // Fetch video information
        const videoInfoResponse = await fetchData(videoInfoUrl);
        const videoTitle = videoInfoResponse.items[0].snippet.title;
        const channelId = videoInfoResponse.items[0].snippet.channelId;

        // Fetch channel name
        const channelInfoUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}`;
        const channelInfoResponse = await fetchData(channelInfoUrl);
        const channelName = channelInfoResponse.items[0].snippet.title;

        // Fetch comments
        const commentsResponse = await fetchData(commentsUrl);
        const commentList = $('#comment-list');
        commentList.empty(); 
        commentsResponse.items.forEach(item => {
            const comment = item.snippet.topLevelComment.snippet.textDisplay;
            const commentId = item.id;
            const videoLink = `<a href="https://www.youtube.com/watch?v=${VIDEO_ID}" target="_blank">${videoTitle}</a>`;
            const li = `<li><strong>${channelName}</strong> - ${videoLink}: ${comment} <button onclick="removeComment('${commentId}')">Remove</button></li>`;
            commentList.append(li);
        });
        $('#comment-section').removeClass('hidden');
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

// Function to fetch data from YouTube API
async function fetchData(url) {
    const API_KEY = 'AIzaSyA0avnK4_PFEznBpN_sct2C-oMby1KOwXQ'; // YouTube Data API key

    try {
        const response = await fetch(`${url}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}