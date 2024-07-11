import { disableSendButton } from "/static/js/send_message.js";
import { updateSendButtonState } from "/static/js/send_message.js";
import { handleSendAction } from "/static/js/send_message.js";
import {setImageUploaded} from "/static/js/send_message.js";

import { finding_llm_response } from "/static/js/analyze_problem.js";


export let base64ImageData = '';
export const chatInput = document.getElementById('chat-input');
const moreButton = document.querySelector('.more-button');

// export function addMessage(message, isUser) {  // OLD
//     const messageElement = document.createElement('div');
//     messageElement.classList.add('message');
//     messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
//     messageElement.textContent = message;
//     chatContainer.appendChild(messageElement);
//     chatContainer.scrollTop = chatContainer.scrollHeight;
// }

let lastMessageSender = null; // NEW

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

        const profilePicture = document.createElement('div');
        profilePicture.classList.add('ai-profile-picture');
        
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

export function addMessage(message, isUser) {  // NEW
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

export function addSequentialMessages(messages, interval = 3000) {  // NEW
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

let callCount = 0;

let messageCount = 0;

// export function addSequentialMessages(message, interval = 3000) {  // NEW
//     const messageElement = createMessageElement(false);
//     chatContainer.appendChild(messageElement);

//     const messageContent = messageElement.querySelector('.ai-message-content');

//     setTimeout(() => {
//         if (messageCount > 0) {
//             // Gray out the previous message
//             const previousMessage = messageContent.lastElementChild;
//             if (previousMessage) {
//                 previousMessage.classList.add('grayed-out');
//             }
//             // Add a div for increased spacing
//             const spacer = document.createElement('div');
//             spacer.classList.add('message-spacer');
//             messageContent.appendChild(spacer);
//         }
//         const messageDiv = document.createElement('div');
//         messageDiv.textContent = message;
//         messageDiv.classList.add('sequential-message');
//         messageContent.appendChild(messageDiv);
//         chatContainer.scrollTop = chatContainer.scrollHeight;
        
//         // Update the message count
//         messageCount += 1;
//     }, messageCount * interval);

//     lastMessageSender = 'ai';
// }



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

    let currentModal = 1;
    let isTransitioning = false;
    let selectedTopic = '';
    let isCarouselFromImageUpload = false;
    let isImageCapture = false;
    
    // let stepCount = 0; // NEW
    const maxSteps = 3; // NEW

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

    ////////////////////////////////// DELETED ///////////////////////////////////////
    // // Prevent clicks on modalOverlay2 and modalOverlay3 from triggering the transition again
    // modalOverlay2.addEventListener('click', function (event) {
    //     event.stopPropagation();
    // });
    // modalOverlay3.addEventListener('click', function (event) {
    //     event.stopPropagation();
    // });
            
    // // Initial button state
    // updateSendButtonState();
    
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

    //////////////// 원조 base64 코드 ////////////////
    // imageInput.addEventListener('change', function(event) {
    //     console.log('Image selected');
    //     event.stopPropagation();
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = function(e) {
    //             imagePreview.src = e.target.result;
    //             base64ImageData = e.target.result.split(',')[1]; // base64 데이터 저장
    //             console.log('Image base64 data:', base64ImageData);
    //             showImagePreview();
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // });

    //////////////// 어?? 이러면 안되는데... ////////////////
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
    ////////////////////////////////////////////////////////

    function showImagePreview() {
        imagePreviewContainer.style.display = 'flex';
        imageUploadOverlay.style.display = 'none';
    }

    confirmImageButton.addEventListener('click', function() {  // EDITED
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

    // function addImageMessage(imageUrl, isUser) {  // OLD
    //     const messageElement = document.createElement('div');
    //     messageElement.classList.add('message');
    //     messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
        
    //     const imageElement = document.createElement('img');
    //     imageElement.src = imageUrl;
    //     imageElement.classList.add('uploaded-image');
        
    //     messageElement.appendChild(imageElement);
    //     chatContainer.appendChild(messageElement);
    //     chatContainer.scrollTop = chatContainer.scrollHeight;
    // }

    function addImageMessage(imageUrl, isUser) {  // NEW
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
});