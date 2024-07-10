// const chattingScreen = document.getElementById('chattingScreen');

// const modalOverlay1 = document.getElementById('modalOverlay1');
// const modalOverlay2 = document.getElementById('modalOverlay2');
// const modalOverlay3 = document.getElementById('modalOverlay3');
// const chatContainer = document.getElementById('chatContainer');

// const chatInput = document.getElementById('chat-input');
// const sendButton = document.getElementById('sendButton');
// const sendButtonImage = sendButton.querySelector('img');

// const moreButton = document.querySelector('.more-button');
// const imageUploadOverlay = document.getElementById('imageUploadOverlay');
// const imageUploadModal = document.getElementById('imageUploadModal');
// const takePhotoButton = document.getElementById('takePhotoButton');
// const uploadImageButton = document.getElementById('uploadImageButton');
// const imageInput = document.getElementById('imageInput');
// const imagePreviewContainer = document.getElementById('imagePreviewContainer');
// const imagePreview = document.getElementById('imagePreview');
// const confirmImageButton = document.getElementById('confirmImageButton');
// const cancelImageButton = document.getElementById('cancelImageButton');


// const modalOverlayCarousel = document.getElementById('modalOverlayCarousel');
// const carouselButtons = document.querySelectorAll('.carousel-button');

async function sendMessage() {
    if (isWaitingForResponse || chatInput.value.trim() === '') return;
    const message = chatInput.value.trim();
    console.log('Sending message:', message);
    addMessage(message, true);
    chatInput.value = '';
    isWaitingForResponse = true;
    updateSendButtonState();

    try {
        const formData = new URLSearchParams();

        if (base64ImageData) {
            if (chat_history.length === 0) {
                console.log("chat_history.length: ", chat_history.length);
                addMessage("문제를 빠르게 분석하고 있어! 잠시만 30초 정도만 기다려줘~!", false);
                return;
            } else {
                chat_history.push(message);
                console.log("chat_history.length: ", chat_history.length);
                
            }
            console.log('Sending image data');
            formData.append('base64_image', base64ImageData);
        } else {
            console.log('No image data to send');
            formData.append('base64_image', '');  // 이미지가 없을 경우 빈 문자열을 보냄
        }

        formData.append('chat_history', chat_history);

        const response = await fetch('/get-chatgpt-response/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        const result = await response.json();
        const gpt_message = result.response;
        console.log('Received ChatGPT response:', gpt_message);
        addMessage(gpt_message, false);
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        addMessage('Error fetching response. Please try again.', false);
    } finally {
        isWaitingForResponse = false;
        updateSendButtonState();
    }
}


sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !isWaitingForResponse && chatInput.value.trim() !== '') {
        sendMessage();
    }
});

chatInput.addEventListener('input', updateSendButtonState);

chatInput.addEventListener('focus', function () {
    // Ensure the chat container scrolls to the bottom when the keyboard appears
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
});