import { disableSendButton } from "/static/js/send_message.js";
import { updateSendButtonState } from "/static/js/send_message.js";
import { handleSendAction } from "/static/js/send_message.js";
import { setImageUploaded } from "/static/js/send_message.js";

import { finding_llm_response } from "/static/js/analyze_problem.js";


export let base64ImageData = '';
export const chatInput = document.getElementById('chat-input');
const moreButton = document.querySelector('.more-button');

let lastMessageSender = null;

//------------| Chatting Status |------------//
    
export function disableChatInputAndMoreButton() {
    chatInput.disabled = true;
    moreButton.style.pointerEvents = 'none';
}

export function enableChatInputAndMoreButton() {
    chatInput.disabled = false;
    moreButton.style.pointerEvents = 'auto';
}

//------------| SIMULATION |------------//

function createMessageElement(isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'ai-message');

    if (!isUser) {
        const aiMessageContainer = document.createElement('div');
        aiMessageContainer.classList.add('ai-message-container');

        const profilePicture = document.createElement('img');
        profilePicture.classList.add('ai-profile-picture');
        profilePicture.src = '../static/img/ai-profile-image.png';
        profilePicture.alt = 'AI 프로필 사진';

        
        if (lastMessageSender === 'user' || lastMessageSender === null) {
            profilePicture.textContent = 'Stepy';
            profilePicture.style.visibility = 'visible';
        } else {
            profilePicture.style.visibility = 'hidden';
        }
        
        aiMessageContainer.appendChild(profilePicture);

        const messageContent = document.createElement('div');
        messageContent.classList.add('ai-message-content');
        aiMessageContainer.appendChild(messageContent);

        messageElement.appendChild(aiMessageContainer);
    }

    return messageElement;
}

export function addMessage(message, isUser) {
    const messageElement = createMessageElement(isUser);

    if (isUser) {
        messageElement.textContent = message;
    } else {
        const messageContent = messageElement.querySelector('.ai-message-content');
        messageContent.textContent = message;
    }

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    lastMessageSender = isUser ? 'user' : 'ai';
}

export function addSequentialMessages(messages, interval = 7000) {
    const messageElement = createMessageElement(false);
    chatContainer.appendChild(messageElement);

    const messageContent = messageElement.querySelector('.ai-message-content');

    messages.forEach((message, index) => {
        setTimeout(() => {
            if (index > 0) {
                // Gray out the previous message
                const previousMessage = messageContent.lastElementChild;
                if (previousMessage) {
                    previousMessage.classList.add('grayed-out');
                }
                // Add a div for increased spacing
                const spacer = document.createElement('div');
                spacer.classList.add('message-spacer');
                messageContent.appendChild(spacer);
            }
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
            messageDiv.classList.add('sequential-message');
            messageContent.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, index * interval);
    });

    lastMessageSender = 'ai';
}

// let callCount = 0;

// let messageCount = 0;


window.addEventListener('load', function () {

    const chattingScreen = document.getElementById('chattingScreen');
    const modalOverlay1 = document.getElementById('modalOverlay1');
    const modalOverlay2 = document.getElementById('modalOverlay2');
    const modalOverlay3 = document.getElementById('modalOverlay3');

    const chatContainer = document.getElementById('chatContainer');
    const sendButton = document.getElementById('sendButton');

    const imageUploadOverlay = document.getElementById('imageUploadOverlay');
    const takePhotoButton = document.getElementById('takePhotoButton');
    const uploadImageButton = document.getElementById('uploadImageButton');
    const imageInput = document.getElementById('imageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const confirmImageButton = document.getElementById('confirmImageButton');
    const cancelImageButton = document.getElementById('cancelImageButton');

    const modalOverlayCarousel = document.getElementById('modalOverlayCarousel');
    const carouselButtons = document.querySelectorAll('.carousel-button');
    const carouselButtons2 = document.querySelectorAll('.carousel-button2');

    let currentModal = 1;
    let isTransitioning = false;
    let selectedTopic = '';
    let isCarouselFromImageUpload = false;
    let isImageCapture = false;
    
    // let stepCount = 0;
    // const maxSteps = 3;

    disableChatInputAndMoreButton();
    
    disableSendButton();

    setTimeout(function () {
        modalOverlay1.style.opacity = '1';
    }, 1000);

    chattingScreen.addEventListener('click', function (event) {
        if (!isTransitioning) {
            isTransitioning = true;
            if (currentModal === 1) {
                transitionToNextModal(modalOverlay1, modalOverlay2);
                currentModal = 2;
            }
        }
        event.stopPropagation();
    });

    modalOverlay2.addEventListener('click', function (event) {
        if (!isTransitioning && currentModal === 2) {
            isTransitioning = true;
            transitionToNextModal(modalOverlay2, modalOverlay3);
            currentModal = 3;
        }
        event.stopPropagation();
    });

    modalOverlay3.addEventListener('click', function (event) {
        if (!isTransitioning && currentModal === 3) {
            isTransitioning = true;
            hideAllModals();
            currentModal = 0;
        }
        event.stopPropagation();
    });

    function transitionToNextModal(currentOverlay, nextOverlay) {
        currentOverlay.style.opacity = '0';
        setTimeout(function () {
            currentOverlay.style.display = 'none';
            nextOverlay.style.display = 'flex';
            nextOverlay.style.pointerEvents = 'auto';
            setTimeout(function () {
                nextOverlay.style.opacity = '1';
                isTransitioning = false;
            }, 50);
        }, 300);
    }

    function hideAllModals() {
        [modalOverlay1, modalOverlay2, modalOverlay3].forEach(overlay => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        });
        isTransitioning = false;
        enableChatInputAndMoreButton();
    }


    //------------| Sending & Receiving Chat |------------//
    
    sendButton.addEventListener('click', function (event) {  // EDITED
        // console.log('Send button clicked');
        event.preventDefault();
        handleSendAction();
    });

    chatInput.addEventListener('keypress', function (e) {  // EDITED
        if (e.key === 'Enter') {
            // console.log('Enter key pressed');
            e.preventDefault();
            handleSendAction();
        }
    });

    chatInput.addEventListener('input', updateSendButtonState);  // EDITED

    chatInput.addEventListener('focus', function () {  // EDITED
        setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
    });

    //------------| Image Upload |------------//

    // Prevent default touch behavior to ensure smooth transitions
    document.body.addEventListener('touchstart', function (e) {
        if (e.target === modalOverlay3) {
            e.preventDefault();
        }
    }, { passive: false });
    
    moreButton.addEventListener('click', function(event) {
        console.log('More button clicked');
        event.stopPropagation();
        imageUploadOverlay.style.display = 'block';
    });

    imageUploadOverlay.addEventListener('click', function(event) {
        if (event.target === imageUploadOverlay) {
            imageUploadOverlay.style.display = 'none';
        }
    });

    takePhotoButton.addEventListener('click', function() {
        isImageCapture = true;
        imageInput.setAttribute('capture', 'environment');
        imageInput.setAttribute('accept', 'image/*');
        imageInput.click();
    });

    uploadImageButton.addEventListener('click', function() {
        isImageCapture = false;
        imageInput.removeAttribute('capture');
        imageInput.setAttribute('accept', 'image/*');
        imageInput.click();
    });

    imageInput.addEventListener('change', function(event) {
        event.stopPropagation();
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                base64ImageData = e.target.result.split(',')[1]; // base64 데이터 저장
                console.log('Image base64 data:', base64ImageData);
                showImagePreview();
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    });

    function showImagePreview() {
        imagePreviewContainer.style.display = 'flex';
        imageUploadOverlay.style.display = 'none';
    }

    confirmImageButton.addEventListener('click', function() {
        const imageUrl = imagePreview.src;
        addImageMessage(imageUrl, true);
        imagePreviewContainer.style.display = 'none';
        imageInput.value = '';
        modalOverlayCarousel.style.display = 'flex';
        isCarouselFromImageUpload = true;
        setImageUploaded(true); // isImageUploaded = true;
        // console.log('Image uploaded, isImageUploaded set to true');
        updateSendButtonState();
    });
    cancelImageButton.addEventListener('click', function() {
        imagePreviewContainer.style.display = 'none';
        imageInput.click();
    });

    function addImageMessage(imageUrl, isUser) {
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.classList.add('uploaded-image');
        
        chatContainer.appendChild(imageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    //------------| Select Topic |------------//

    carouselButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isCarouselFromImageUpload) {
                selectedTopic = this.dataset.topic;
                modalOverlayCarousel.style.display = 'none';
                console.log('Selected topic:', selectedTopic);
                addMessage(`${selectedTopic}`, true);
                isCarouselFromImageUpload = false; // Reset the flag

                const formData = new URLSearchParams();
                formData.append('topic', selectedTopic);
                finding_llm_response(base64ImageData); // 버튼을 누르자마자 ChatGPT의 문제 분석 시작하기
            
            } else if (currentModal === 2) {
                transitionToNextModal(modalOverlay2, modalOverlay3);
                currentModal = 3;
            }
        });
    });

    carouselButtons2.forEach(function(button) {
        button.addEventListener('click', function() {
            var topic = this.getAttribute('data-topic');
            var messageElement = document.querySelector('.modal-message-carousel');
            messageElement.textContent = `${topic}은 준비중이야!`;
        });
    });
});