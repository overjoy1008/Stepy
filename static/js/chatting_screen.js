import { sendMessage } from "/static/js/send_message.js";
import { updateSendButtonState } from "/static/js/send_message.js";

import { finding_llm_response } from "/static/js/analyze_problem.js";
import { isWaitingForResponse } from "/static/js/analyze_problem.js";

export let base64ImageData = '';
export const chatInput = document.getElementById('chat-input');

export function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

window.addEventListener('load', function () {
    const chattingScreen = document.getElementById('chattingScreen');

    const modalOverlay1 = document.getElementById('modalOverlay1');
    const modalOverlay2 = document.getElementById('modalOverlay2');
    const modalOverlay3 = document.getElementById('modalOverlay3');
    const chatContainer = document.getElementById('chatContainer');

    // const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('sendButton');

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
    const carouselButtons = document.querySelectorAll('.carousel-button');

    let currentModal = 1;
    let isTransitioning = false;
    // let isWaitingForResponse = false;
    let isImageCapture = false;
    let selectedTopic = '';
    let isCarouselFromImageUpload = false;
    // let base64ImageData = '';
    // let chat_history = '';

    disableChatInputAndMoreButton();

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

    //------------| Chatting Status |------------//
    
    function disableChatInputAndMoreButton() {
        chatInput.disabled = true;
        moreButton.style.pointerEvents = 'none';
    }

    function enableChatInputAndMoreButton() {
        chatInput.disabled = false;
        moreButton.style.pointerEvents = 'auto';
    }

    // function addMessage(message, isUser) {
    //     const messageElement = document.createElement('div');
    //     messageElement.classList.add('message');
    //     messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
    //     messageElement.textContent = message;
    //     chatContainer.appendChild(messageElement);
    //     chatContainer.scrollTop = chatContainer.scrollHeight;
    // }


    //------------| Sending & Receiving Chat |------------//

    // async function sendMessage() {
    //     if (isWaitingForResponse || chatInput.value.trim() === '') return;
    //     const message = chatInput.value.trim();
    //     console.log('Sending message:', message);
    //     addMessage(message, true);
    //     chatInput.value = '';
    //     isWaitingForResponse = true;
    //     updateSendButtonState();
    
    //     try {
    //         const formData = new URLSearchParams();

    //         if (base64ImageData) {
    //             if (chat_history.length === 0) {
    //                 console.log("chat_history.length: ", chat_history.length);
    //                 addMessage("문제를 빠르게 분석하고 있어! 잠시만 30초 정도만 기다려줘~!", false);
    //                 return;
    //             } else {
    //                 chat_history.push(message);
    //                 console.log("chat_history.length: ", chat_history.length);
                    
    //             }
    //             console.log('Sending image data');
    //             formData.append('base64_image', base64ImageData);
    //         } else {
    //             console.log('No image data to send');
    //             formData.append('base64_image', '');  // 이미지가 없을 경우 빈 문자열을 보냄
    //         }

    //         formData.append('chat_history', chat_history);
    
    //         const response = await fetch('/get-chatgpt-response/', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/x-www-form-urlencoded',
    //             },
    //             body: formData
    //         });
    
    //         const result = await response.json();
    //         const gpt_message = result.response;
    //         console.log('Received ChatGPT response:', gpt_message);
    //         addMessage(gpt_message, false);
    //     } catch (error) {
    //         console.error('Error fetching ChatGPT response:', error);
    //         addMessage('Error fetching response. Please try again.', false);
    //     } finally {
    //         isWaitingForResponse = false;
    //         updateSendButtonState();
    //     }
    // }
    
    
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

    //------------| Image Upload |------------//

    // Prevent default touch behavior to ensure smooth transitions
    document.body.addEventListener('touchstart', function (e) {
        if (e.target === modalOverlay3) {
            e.preventDefault();
        }
    }, { passive: false });

    // Prevent clicks on modalOverlay2 and modalOverlay3 from triggering the transition again
    modalOverlay2.addEventListener('click', function (event) {
        event.stopPropagation();
    });
    modalOverlay3.addEventListener('click', function (event) {
        event.stopPropagation();
    });
            
    // Initial button state
    updateSendButtonState();
    
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
        // imageInput.accept = "image/*";
        imageInput.click();
    });

    imageInput.addEventListener('change', function(event) {
        console.log('Image selected');
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
    });

    function showImagePreview() {
        imagePreviewContainer.style.display = 'flex';
        imageUploadOverlay.style.display = 'none';
    }

    confirmImageButton.addEventListener('click', function() {
        // console.log('Image uploaded:', imagePreview);
        const imageUrl = imagePreview.src;
        addImageMessage(imageUrl, true);
        imagePreviewContainer.style.display = 'none';
        imageInput.value = '';
        modalOverlayCarousel.style.display = 'flex';
        isCarouselFromImageUpload = true;
    });

    cancelImageButton.addEventListener('click', function() {
        imagePreviewContainer.style.display = 'none';
        imageInput.click();
    });

    function addImageMessage(imageUrl, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
        
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.classList.add('uploaded-image');
        
        messageElement.appendChild(imageElement);
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    //------------| Select Topic |------------//

    carouselButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isCarouselFromImageUpload) {
                selectedTopic = this.dataset.topic;
                modalOverlayCarousel.style.display = 'none';
                console.log('Selected topic:', selectedTopic);
                addMessage(`선택한 주제는 ${selectedTopic}입니다. 어떤 도움이 필요하신가요?`, false);
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