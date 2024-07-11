import { base64ImageData } from "/static/js/chatting_screen.js";
// import { disableChatInputAndMoreButton } from "/static/js/chatting_screen.js";
import { enableChatInputAndMoreButton } from "/static/js/chatting_screen.js";
import { addSequentialMessages } from "/static/js/chatting_screen.js";

import { setWaitingForResponse } from "/static/js/send_message.js";


let system_prompt = '';

// export let test_string = ['1','2','3'];

export let chat_history = '';

export function chat_history_append(message_str) {
    chat_history+= message_str;
}

let resolveSignal;
const signalPromise = new Promise((resolve) => {
    resolveSignal = resolve;
});

export async function finding_llm_response(base64ImageData) {
    try {
        // addSequentialMessages(messages, 1000);
        const formData = new URLSearchParams();
        console.log('Sending image data:', base64ImageData);
        formData.append('base64_image', base64ImageData);

        const response = await fetch('/finding-llm/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        const result = await response.json();
        const finding_response = result.response;
        console.log('ChatGPT - 1. finding_llm:\n', finding_response);
        finding_problem_type(finding_response);
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
    } finally {
        setWaitingForResponse(false);
    }
};

function finding_problem_type(findingResponse) {
    const findingData = JSON.parse(findingResponse);
    const problem_type = findingData["유형"];
    const choice_form = findingData["choice_form"]
    const problem_structure = findingData["Problem structure"]
    const problem_description = problem_structure["Problem description"]
    console.log('ChatGPT - 2. choice_form:\n', choice_form)
    console.log('ChatGPT - 2. Problem structure:\n', problem_structure)
    console.log('ChatGPT - 2. Problem description:\n', problem_description)
    console.log('ChatGPT - 2. problem_type:\n', problem_type);
    choose_prompt(problem_type, choice_form, problem_description);
}

async function choose_prompt(problemType, choice_form, problemdescription) {
    const formData = new URLSearchParams();
    formData.append('problem_type', problemType);
    formData.append('choice_form', choice_form);
    formData.append('porblem_description', problemdescription);
    const response = await fetch('/choose-prompt/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    });

    const result = await response.json();
    const solver_llm_prompt = result.prompt;
    // let solver_llm_prompt_mini = ""
    // for (let i = 0; i < 800; i++) {
    //     solver_llm_prompt_mini += solver_llm_prompt[i]
    // }
    // console.log('ChatGPT - 3. choose_prompt:\n', solver_llm_prompt_mini);
    console.log('ChatGPT - 3. choose_prompt:\n', solver_llm_prompt);
    solver_llm_response(base64ImageData, solver_llm_prompt);
}

async function solver_llm_response(base64ImageData, solver_llm_prompt) {
    try {
        const formData = new URLSearchParams();
        formData.append('base64_image', base64ImageData);
        formData.append('solver_llm_prompt', solver_llm_prompt);

        const response = await fetch('/solver-llm/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        

        const result = await response.json();
        const solver_llm_response = result.response;
        console.log('ChatGPT - 4. solver_llm:\n', solver_llm_response);
        system_prompt = `[Role]
            -너는 물리를 10년 이상 가르친 경험이 있는 친절하고 이해심 많은 물리1 Tutor야.
            -학생들이 물리에 대해 질문을 할 때, 친절하게 답변해주고, 가능한 한 쉽게 이해할 수 있도록 설명해줘.
            -답을 말해주는 것이 아닌 답변으로 유도될 수 있도록 되묻는 답변을 해줘.

            [solver_llm_response]
            ${solver_llm_response}

            [Basic information]
            1. 학생들의 질문에 대해 친절하고 명확하게 답변해.
            2. 복잡한 개념은 쉽게 이해할 수 있도록 풀어서 설명해.
            3. STEP BY STEP으로 설명해줘야 해. 총 STEP은 3STEP이야.
            4. {solver_llm_response}에 근거하여 답변해.
            5. 학생들이 스스로 생각할 수 있게 질문을 생성해.
        
            [질문 생성기]
            -질문을 생성해주는 단계로써 실제로 학생들의 질문을 통해서 그 질문에 대한 적절한 방안을 제시해주기 위해 역질문을 생성한다.
            -[문제 이해하기],[STEP1],[STEP2],[STEP3]는 한번에 답변되는 것이 아닌 순서대로 이루어진다. 각 단계가 해결돼야지 다음 단계로 넘어간다.
            -[문제 이해하기]
                -문제를 이해하게 만드는 단계
                -1. 개념에 대해서 질문한다.
                -2. 조건에 대해서 질문한다.
            -[STEP1]
                -{solver_llm_response}내의 "ㄱ_풀이과정"을 이해시키기 위한 단계이다.
                -"ㄱ_풀이과정"내의 "STEP"들을 토대로 질문을 생성한다.
                -STEP1이 해결되지 않으면 다시 STEP1을 상세하게 설명해준다.
                -학생이 이해가 안료된 경우만 다음 STEP2으로 넘어간다.
            -[STEP2]
                -{solver_llm_response}내의 "ㄴ_풀이과정"을 이해시키기 위한 단계이다.
                -"ㄴ_풀이과정"내의 "STEP"들을 토대로 질문을 생성한다.
                -STEP2이 해결되지 않으면 다시 STEP2을 상세하게 설명해준다.
                -학생이 이해가 안료된 경우만 다음 STEP3으로 넘어간다.
            -[STEP3]
                -{solver_llm_response}내의 "ㄷ_풀이과정"을 이해시키기 위한 단계이다.
                -"ㄷ_풀이과정"내의 "STEP"들을 토대로 질문을 생성한다.
                -STEP3이 해결되지 않으면 다시 STEP3을 상세하게 설명해준다.`;
        chat_history = 'system|'+system_prompt+'|' + chat_history;
        console.log('signal 함수 호출됨');
        resolveSignal();
        
        // addSequentialMessages(messages, 1000);
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
    } finally {
        enableChatInputAndMoreButton();
        setWaitingForResponse(false);
    }
}

export { signalPromise };


// function finding_problem_type(finding_response) {
//     const formData = new URLSearchParams();
//     formData.append('finding_response', finding_response);
//     const response = fetch('/problem-type/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: formData
//     });
//     const result = response.json();
//     const problem_type = result.response;

//     console.log('ChatGPT - 2. problem_type:\n', problem_type);
// };