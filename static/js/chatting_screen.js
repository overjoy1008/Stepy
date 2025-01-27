import { disableSendButton } from "/static/js/send_message.js";
import { updateSendButtonState } from "/static/js/send_message.js";
import { handleSendAction } from "/static/js/send_message.js";
import { setImageUploaded } from "/static/js/send_message.js";
import { setFirstChat } from "/static/js/send_message.js";
import { showStep } from "/static/js/send_message.js";

import { finding_llm_response } from "/static/js/analyze_problem.js";
import { set_chat_history } from "/static/js/analyze_problem.js";



export const chatInput = document.getElementById('chat-input');
export let lastMessageSender = null;
export let base64ImageData = '';

const moreButton = document.querySelector('.more-button');


export function setlastMessageSender(sender) {
    lastMessageSender = sender;
}



//---------------------------| Chatting Status |---------------------------//
    
export function disableChatInputAndMoreButton() {
    chatInput.disabled = true;
    moreButton.style.pointerEvents = 'none';
}

export function enableChatInputAndMoreButton() {
    chatInput.disabled = false;
    moreButton.style.pointerEvents = 'auto';
}





//---------------------------| Simulation |---------------------------//

export function createMessageElement(isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'ai-message');

    if (!isUser) {
        const aiMessageContainer = document.createElement('div');
        aiMessageContainer.classList.add('ai-message-container');

        const profilePicture = document.createElement('img');
        profilePicture.classList.add('ai-profile-picture');
        profilePicture.src = '../static/img/ai-profile.png';
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





//---------------------------| Markdown Parsing |---------------------------//
function parseMarkdown(markdown) {
    // Bold (**text** or __text__)
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // markdown = markdown.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic (*text* or _text_)
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // markdown = markdown.replace(/_(.*?)_/g, '<em>$1</em>');

    // Headers (## Header)
    markdown = markdown.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    markdown = markdown.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    markdown = markdown.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    markdown = markdown.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    markdown = markdown.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    markdown = markdown.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquote
    markdown = markdown.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Ordered list
    markdown = markdown.replace(/^\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>');
    markdown = markdown.replace(/<\/li><\/ol>\n<ol><li>/g, '</li><li>');

    // Unordered list
    markdown = markdown.replace(/\*\s+(.*$)/gim, '<ul><li>$1</li></ul>');
    markdown = markdown.replace(/\-\s+(.*$)/gim, '<ul><li>$1</li></ul>');
    markdown = markdown.replace(/<\/li><\/ul>\n<ul><li>/g, '</li><li>');


    // Paragraph
    markdown = markdown.replace(/\n$/gim, '<br />');
    markdown = markdown.replace(/^(?!<h|<blockquote|<li|<ul|<ol)(.*$)/gim, '<p>$1</p>');

    return markdown.trim();
}

let currentStep = 1;

//---------------------------| Add Message |---------------------------//
export function addMessage(message, isUser) {
    console.log('original message: ', message);
    const result = parseMarkdown(message);
    console.log('markdown message: ', result);
    const messageElement = createMessageElement(isUser);
    if (isUser) {
        messageElement.textContent = message;
    } else {
        if(currentStep == 0){
            currentStep = 1;
            const messageContent = messageElement.querySelector('.ai-message-content')
            messageContent.innerHTML = result // textContent 대신 innerHTML로 변경하여 HTML 태그를 해석하도록 함.
            MathJax.typesetPromise([messageContent]) // MathJax를 사용하여 수식을 렌더링합니다.
        }
        else if (currentStep == 1) {
            if (result.replace(/\s+/g, '').toLowerCase().includes('step2')){
                currentStep = 2;
                showStep(2)
            }
            else {
                showStep(1)
            }
            const messageContent = messageElement.querySelector('.ai-message-content')
            messageContent.innerHTML = result // textContent 대신 innerHTML로 변경하여 HTML 태그를 해석하도록 함.
            MathJax.typesetPromise([messageContent]) // MathJax를 사용하여 수식을 렌더링합니다.

        }else if (currentStep == 2) {
            if (result.replace(/\s+/g, '').toLowerCase().includes('step3')){
                currentStep = 3;
                showStep(3)
            }
            else{
                showStep(2)
            }
            const messageContent = messageElement.querySelector('.ai-message-content')
            messageContent.innerHTML = result // textContent 대신 innerHTML로 변경하여 HTML 태그를 해석하도록 함.
            MathJax.typesetPromise([messageContent]) // MathJax를 사용하여 수식을 렌더링합니다.

        } else {
            if (result.replace(/\s+/g, '').toLowerCase().includes('step3')){
                currentStep = 3;
                showStep(3)
            }
            else{
                showStep(3)
            }
            const messageContent = messageElement.querySelector('.ai-message-content')
            messageContent.innerHTML = result // textContent 대신 innerHTML로 변경하여 HTML 태그를 해석하도록 함.
            MathJax.typesetPromise([messageContent]) // MathJax를 사용하여 수식을 렌더링합니다.
        }
        // 여기부터 Markdown + LaTeX 적용 코드 (Assistant 답변에만 적용)
        
    }
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    lastMessageSender = isUser ? 'user' : 'ai';
}






//---------------------------| Loading Component |---------------------------//
let resolveSequentialSignal;
const sequentialSignalPromise = new Promise((resolve) => {
    resolveSequentialSignal = resolve;
});

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
            
            // Check if this is the last message
            if (index === messages.length - 1) {
                resolveSequentialSignal();  // Resolve the promise
            }
        }, index * interval);
    });

    lastMessageSender = 'ai';
}

export { sequentialSignalPromise };















/////////////////---------------/////////////////---------------| MAIN 함수 |---------------/////////////////---------------/////////////////

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





    //---------------------------| Tutorial Overlay |---------------------------//
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





    //---------------------------| Send Button |---------------------------//
    
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





    //---------------------------| Image Upload |---------------------------//
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

    // imageInput.addEventListener('change', function(event) {
    //     event.stopPropagation();
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = function(e) {
    //             imagePreview.src = e.target.result;
    //             base64ImageData = e.target.result.split(',')[1]; // base64 데이터 저장
    //             set_chat_history([]);
    //             currentStep = 1;
    //             setFirstChat(true);
    //             console.log('Image base64 data uploaded');
    //             showImagePreview();
    //         };
    //         reader.readAsDataURL(file);
    //     }
    //     event.target.value = '';
    // });

    imageInput.addEventListener('change', function(event) {
        event.stopPropagation();
        const file = event.target.files[0];
        if (file) {
            // 원본 이미지 파일 크기 출력 (바이트 단위)
            console.log(`Original image size: ${file.size} bytes`);

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Canvas를 사용하여 이미지 최적화
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // 원하는 크기로 리사이즈 (예: 최대 너비 800px)
                    const maxWidth = 800;
                    const scaleSize = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scaleSize;

                    // Canvas에 이미지를 그리기
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // 최적화된 이미지 데이터를 얻기 (JPEG 포맷, 품질 0.85)
                    const optimizedImageData = canvas.toDataURL('image/jpeg', 0.85);

                    // 최적화된 이미지 파일 크기 계산
                    const optimizedImageSize = Math.round((optimizedImageData.length * (3/4)) - 2); // base64 크기 계산

                    // 이미지 미리보기 및 base64 데이터 저장
                    imagePreview.src = optimizedImageData;
                    base64ImageData = optimizedImageData.split(',')[1]; // base64 데이터 저장
                    set_chat_history([]);
                    currentStep = 0;
                    setFirstChat(true);
                    console.log('Image base64 data uploaded and optimized');
                    showImagePreview();

                    // 최적화된 이미지 파일 크기 출력 (바이트 단위)
                    console.log(`Optimized image size: ${optimizedImageSize} bytes`);
                };
                img.src = e.target.result;
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





    //----------------------| Carousel Buttons |----------------------//

    carouselButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isCarouselFromImageUpload) {
                selectedTopic = this.dataset.topic;
                modalOverlayCarousel.style.display = 'none';
                console.log('Selected topic:', selectedTopic);
                addMessage(`${selectedTopic}`, true);
                isCarouselFromImageUpload = false; // Reset the flag
                addMessage(`${selectedTopic} 문제를 골랐구나! 질문이 뭐니?`, false);

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