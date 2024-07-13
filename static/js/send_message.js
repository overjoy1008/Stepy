import { addMessage } from "/static/js/chatting_screen.js";
import { base64ImageData } from "/static/js/chatting_screen.js";
import { chatInput } from "/static/js/chatting_screen.js";
import { addSequentialMessages } from "/static/js/chatting_screen.js";
import { disableChatInputAndMoreButton } from "/static/js/chatting_screen.js";
import { enableChatInputAndMoreButton } from "/static/js/chatting_screen.js";

import { chat_history } from "/static/js/analyze_problem.js";
import { chat_history_append } from "/static/js/analyze_problem.js";


const sendButtonImage = sendButton.querySelector('img');
const popupMessage = document.getElementById('popupMessage');

let isWaitingForResponse = false;
let isFirstChat = true;
let isImageUploaded = false;

export function setImageUploaded(binary) {
    isImageUploaded = binary;
}


// 백엔드 상태값 전달 예시
const backendStatuses = [
    { type: 'STEP_UPDATE', step: 1 },
    // { type: 'STEP_UPDATE', step: 2 },
    // { type: 'STEP_UPDATE', step: 3 },
    // { type: 'PROCESSING', message: "핵심 개념 찾는 중" },
    // { type: 'PROCESSING', message: "풀이 step 구성 중" },
    // { type: 'PROCESSING', message: "✅설명 준비 완료!" },
];


export function setWaitingForResponse(binary) {
    isWaitingForResponse = binary;
}

export function disableSendButton() {
    sendButton.disabled = true;
    sendButton.style.backgroundColor = '#EBEBEB';
    sendButton.style.pointerEvents = 'none';
    sendButtonImage.src = '../static/img/sending_button_off.png';
}

export function enableSendButton() {
    sendButton.disabled = false;
    sendButton.style.backgroundColor = '#3182F6';
    sendButton.style.pointerEvents = 'auto';
    sendButtonImage.src = '../static/img/sending_button.png';
}

export function updateSendButtonState() {
    if (chatInput.value.trim() === '' || isWaitingForResponse) {
        disableSendButton();
    } else {
        enableSendButton();
    }
}


function showPopupMessage() {
    // console.log('Showing popup message');
    popupMessage.style.display = 'block';
    setTimeout(() => {
        popupMessage.style.display = 'none';
    }, 1500);
}

export function handleSendAction() {
    // console.log('Handle send action called');
    // console.log('isImageUploaded:', isImageUploaded);
    // console.log('isWaitingForResponse:', isWaitingForResponse);
    // console.log('chatInput value:', chatInput.value.trim());

    if (!isImageUploaded) {
        // console.log('Condition met for showing popup');
        showPopupMessage();
    } else if (!isWaitingForResponse && chatInput.value.trim() !== '') {
        // console.log('Condition met for sending message');
        sendMessage();
    } else {
        console.log('No action taken');
    }
}

function addStepLabel(step) {
    const stepLabel = document.createElement('div');
    stepLabel.classList.add('step-label');
    stepLabel.textContent = `${step}/${maxSteps} 단계`;
    chatContainer.appendChild(stepLabel);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function handleBackendStatus(status) {
    if (status.type === 'STEP_UPDATE') {
        addStepLabel(status.step);
    } else if (status.type === 'PROCESSING') {
        addMessage(status.message, false);
    }
}

function simulateBackendProcess() {
    let statusIndex = 0;
    
    function sendNextStatus() {
        if (statusIndex < backendStatuses.length) {
            const status = backendStatuses[statusIndex];
            handleBackendStatus(status);
            statusIndex++;
            setTimeout(sendNextStatus, 2000); // Simulate delay between statuses
        } else {
            const gpt_message = '이민찬이 만든 개멋진 프론트를 보십시오';
            addMessage(gpt_message, false);
            setWaitingForResponse(false); // isWaitingForResponse= false;
            updateSendButtonState();
        }
    }

    sendNextStatus();
}

const messages = [
    "핵심 개념 찾는 중",
    "풀이 step 구성 중",
    "맞춤형 설명 생성 중",
    "✅설명 준비 완료!"
];


import { signalPromise } from "/static/js/analyze_problem.js";

export async function sendMessage() {
    if (isWaitingForResponse || chatInput.value.trim() === '') return;
    const message = chatInput.value.trim();
    console.log('Sending message:', message);
    addMessage(message, true);
    chatInput.value = '';
    setWaitingForResponse(true); // isWaitingForResponse = true;
    updateSendButtonState();

    try {
        const formData = new URLSearchParams();

        if (isImageUploaded && isFirstChat) {
            isFirstChat = false;
            addSequentialMessages(messages, 7000);
            await signalPromise;
            chat_history_append('user|'+ message +'|');
            disableChatInputAndMoreButton();
            console.log("chat_history: ", chat_history);
            console.log('Sending image data');
            formData.append('base64_image', base64ImageData);
            

            formData.append('chat_history', chat_history);

            const response = await fetch('/get-chatgpt-response/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const result = await response.json();
            const gpt_response = result.response;
            
            console.log('Received ChatGPT response:', gpt_response);
            addMessage(gpt_response, false);
            chat_history_append('assistant|'+ gpt_response +'|');
            enableChatInputAndMoreButton();

            // }, 1000);
        } else {
            chat_history_append('user|'+ message +'|');
            console.log("chat_history: ", chat_history);
            console.log('Sending image data');
            formData.append('base64_image', base64ImageData);
            

            formData.append('chat_history', chat_history);

            const response = await fetch('/get-chatgpt-response/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const result = await response.json();
            const gpt_response = result.response;
            
            console.log('Received ChatGPT response:', gpt_response);
            addMessage(gpt_response, false);
            chat_history_append('assistant|'+ gpt_response +'|');
        }
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        addMessage('Error fetching response. Please try again.', false);
    } finally {
        setWaitingForResponse(false); // isWaitingForResponse = false;
        updateSendButtonState();
    }
};