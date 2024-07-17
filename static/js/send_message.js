import { addMessage } from "/static/js/chatting_screen.js";
import { base64ImageData } from "/static/js/chatting_screen.js";
import { chatInput } from "/static/js/chatting_screen.js";
import { addSequentialMessages } from "/static/js/chatting_screen.js";
import { disableChatInputAndMoreButton } from "/static/js/chatting_screen.js";
import { enableChatInputAndMoreButton } from "/static/js/chatting_screen.js";
import { createMessageElement } from "/static/js/chatting_screen.js";
import { setlastMessageSender } from "/static/js/chatting_screen.js";

import { chat_history } from "/static/js/analyze_problem.js";
import { append_chat_history } from "/static/js/analyze_problem.js";


const sendButtonImage = sendButton.querySelector('img');
const popupMessage = document.getElementById('popupMessage');

let isImageUploaded = false;
let isWaitingForResponse = false;
let isFirstChat = true;

export function setImageUploaded(binary) {
    isImageUploaded = binary;
}

export function setFirstChat(binary) {
    isFirstChat = binary;
}

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

/////////// STEP 버튼 구현 ///////////
export function showStep(stepIndex) {

    // const status = stepStatuses[statusIndex];
    setlastMessageSender('user')
    const stepElement = createMessageElement(false);
    stepElement.classList.remove('ai-message-container');
    stepElement.classList.add('step-label');
    stepElement.textContent = `${stepIndex}/3 단계`;
    chatContainer.appendChild(stepElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    // lastMessageSender = isUser ? 'user' : 'ai';
}

const messages = [
    "핵심 개념 찾는 중",
    "풀이 step 구성 중",
    "맞춤형 설명 생성 중",
    "✅설명 준비 완료!"
];


import { signalPromise } from "/static/js/analyze_problem.js";
import { sequentialSignalPromise } from "/static/js/chatting_screen.js";

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
            append_chat_history('user|'+ message + "\n문제를 끝까지 풀지 말고, 천천히 step 1을 알려줘. 나에게 역으로 질문을 해줘." +'|');
            disableChatInputAndMoreButton();
            console.log("chat_history: ", chat_history);
            formData.append('base64_image', base64ImageData);
            formData.append('chat_history', chat_history);

            await signalPromise;
            
            // await Promise.all([signalPromise, sequentialSignalPromise]);  // Wait for both signals
            ///////----------------위 코드는 복구 금지----------------////////

            const response = await fetch('/get-chatgpt-response/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const result = await response.json();
            const gpt_response = result.response;

            await sequentialSignalPromise;  // Wait for the second signal

            addMessage(gpt_response, false);

            append_chat_history('assistant|'+ gpt_response +'|');
            console.log("chat_history:\n", chat_history);
            enableChatInputAndMoreButton();

        } else {
            append_chat_history('user|'+ message +'|');
            console.log("chat_history: ", chat_history);
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
            append_chat_history('assistant|'+ gpt_response +'|');
            console.log("chat_history: ", chat_history);
        }
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        addMessage('Error fetching response. Please try again.', false);
    } finally {
        setWaitingForResponse(false); // isWaitingForResponse = false;
        updateSendButtonState();
    }
};