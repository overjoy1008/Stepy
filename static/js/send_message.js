import { addMessage } from "/static/js/chatting_screen.js";
import { base64ImageData } from "/static/js/chatting_screen.js";
import { chatInput } from "/static/js/chatting_screen.js";

import { chat_history } from "/static/js/analyze_problem.js";
import { isWaitingForResponse } from "/static/js/analyze_problem.js";
import { binary_converter } from "/static/js/analyze_problem.js";
import { chat_history_append } from "/static/js/analyze_problem.js";

let test_string = [
    {'role': 'system', 'content': '~~~'},
    {'role': 'user', 'content': '~~~'},
    {'role': 'assistant', 'content': '~~~'}
];

const sendButtonImage = sendButton.querySelector('img');

export function updateSendButtonState() {
    if (chatInput.value.trim() === '' || isWaitingForResponse) {
        disableSendButton();
    } else {
        enableSendButton();
    }
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

export async function sendMessage() {
    if (isWaitingForResponse || chatInput.value.trim() === '') return;
    const message = chatInput.value.trim();
    console.log('Sending message:', message);
    addMessage(message, true);
    chatInput.value = '';
    binary_converter(); // isWaitingForResponse = true;
    updateSendButtonState();

    try {
        const formData = new URLSearchParams();

        if (!base64ImageData) {
            console.log('No image data to send');
            console.log("chat_history.length: ", chat_history.length);
            addMessage("+ 버튼으로 이미지를 먼저 첨부한 후 질문을 해줘!", false);
            return;
        }
        else {
            if (chat_history.length === 0) {
                console.log("chat_history.length: ", chat_history.length);
                addMessage("문제를 빠르게 분석하고 있어! 잠시만 30초 정도만 기다려줘~!", false);
                return;
            } else {
                chat_history_append('user|'+ message +'|');
                console.log("chat_history: ", chat_history);
                // console.log("chat_history.length: ", chat_history.length);
            }
            console.log('Sending image data');
            formData.append('base64_image', base64ImageData);
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
        const gpt_response = result.response;
        
        console.log('Received ChatGPT response:', gpt_response);
        addMessage(gpt_response, false);
        chat_history_append('assistant|'+ gpt_response +'|');
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        addMessage('Error fetching response. Please try again.', false);
    } finally {
        binary_converter(); // isWaitingForResponse = false;
        updateSendButtonState();
    }
};

// import OpenAI from "openai";

// let OPENAI_API_KEY = ""

// async function get_chatgpt_response(chat_history) {
//     const openai = new OpenAI({
//         apiKey: OPENAI_API_KEY,
//     });
            
//     const response = await openai.chat.completions.create({
//         model: "gpt-4o-2024-05-13",
//         messages: chat_history,
//         temperature: 0,
//         max_tokens: 4000,
//         top_p: 0,
//         // frequency_penalty: 0,
//         // presence_penalty: 0,
//     });

//     console.log("TUTOR RESPONSE: ", response.data.choices[0].message.content);

//     return response.data.choices[0].message.content;
    
// }