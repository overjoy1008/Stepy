const chattingScreen = document.getElementById('chattingScreen');

const modalOverlay1 = document.getElementById('modalOverlay1');
const modalOverlay2 = document.getElementById('modalOverlay2');
const modalOverlay3 = document.getElementById('modalOverlay3');
const chatContainer = document.getElementById('chatContainer');

const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('sendButton');
const sendButtonImage = sendButton.querySelector('img');

const moreButton = document.querySelector('.more-button');
const imageUploadOverlay = document.getElementById('imageUploadOverlay');
const imageUploadModal = document.getElementById('imageUploadModal');
const takePhotoButton = document.getElementById('takePhotoButton');
const uploadImageButton = document.getElementById('uploadImageButton');
const imageInput = document.getElementById('imageInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const confirmImageButton = document.getElementById('confirmImageButton');
const cancelImageButton = document.getElementById('cancelImageButton');


const modalOverlayCarousel = document.getElementById('modalOverlayCarousel');
// const carouselButtons = document.querySelectorAll('.carousel-button');

let isWaitingForResponse = false;

function disableChatInputAndMoreButton() {
    chatInput.disabled = true;
    moreButton.style.pointerEvents = 'none';
}

function enableChatInputAndMoreButton() {
    chatInput.disabled = false;
    moreButton.style.pointerEvents = 'auto';
}

function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function disableSendButton() {
    sendButton.disabled = true;
    sendButton.style.backgroundColor = '#EBEBEB';
    sendButton.style.pointerEvents = 'none';
    sendButtonImage.src = '../static/img/sending_button_off.png';
}

function enableSendButton() {
    sendButton.disabled = false;
    sendButton.style.backgroundColor = '#3182F6';
    sendButton.style.pointerEvents = 'auto';
    sendButtonImage.src = '../static/img/sending_button.png';
}

function updateSendButtonState() {
    if (chatInput.value.trim() === '' || isWaitingForResponse) {
        disableSendButton();
    } else {
        enableSendButton();
    }
}