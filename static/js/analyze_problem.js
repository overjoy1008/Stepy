import { base64ImageData } from "/static/js/chatting_screen.js";
import { enableChatInputAndMoreButton } from "/static/js/chatting_screen.js";
import { addSequentialMessages } from "/static/js/chatting_screen.js";

import { setWaitingForResponse } from "/static/js/send_message.js";


let system_prompt = '';

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
    const choice_form = findingData["choice_form"];
    const problem_structure = findingData["Problem structure"];
    const problem_description = problem_structure["Problem description"];
    const choices = JSON.stringify(problem_structure["choices"]);

    console.log('ChatGPT - 2. problem_type:\n', problem_type);
    console.log('ChatGPT - 2. choice_form:\n', choice_form);
    console.log('ChatGPT - 2. Problem structure:\n', problem_structure);
    console.log('ChatGPT - 2. Problem description:\n', problem_description);
    console.log('ChatGPT - 2. choices:\n', choices);



    choose_prompt(problem_type, choice_form, choices, problem_description);
}

async function choose_prompt(problem_type, choice_form, choices, problem_description) {
    const formData = new URLSearchParams();
    formData.append('problem_type', problem_type);
    formData.append('choice_form', choice_form);
    formData.append('choices', choices);
    formData.append('problem_description', problem_description);
    const response = await fetch('/choose-prompt/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    });

    const solver_llm_prompt = await response.text();
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
        -너는 학생 주도 학습을 지향하는 물리 tutor야 학생에게 답을 알려주는 것이 아닌 답을 도출할 수 있도록 도와줘.
        -STEP BY STEP으로 설명해줘야 해. 총 STEP은 3STEP이야. 이 STEP을 지켜서 하나씩 답변하면 100$를 줄게.
        -너는 문제를 절대 풀지 않아.
        -너는 알려주는 것 없이 무조건 질문만 해야 해 

        [solver_llm_response]
        -input
            ${solver_llm_response}
        [답변 단계]
        <전체STEP설명하기>
            -전체 3STEP이 어떻게 구성돼있는지 간단하게 설명해줘
        <STEP1>
            -[solver_llm_response]내의 "STEP1"을 이해시키기 위한 단계이다.
            -"STEP1"내의 학생 스스로 만들어갈 수 있게 하나씩 질문을 생성한다. 
            -"STEP1"이 해결되지 않으면 다시 STEP1을 상세하게 설명해준다.
            -학생이 이해가 안료된 경우만 다음 STEP2으로 넘어간다.
        <STEP2>
            -[solver_llm_response]내의 "STEP2"을 이해시키기 위한 단계이다.
            -"STEP2"내의 학생 스스로 만들어갈 수 있게 하나씩 질문을 생성한다.
            -STEP2이 해결되지 않으면 다시 STEP2을 상세하게 설명해준다.
            -학생이 이해가 안료된 경우만 다음 STEP3으로 넘어간다.
        <STEP3>
            -[solver_llm_response]내의 "STEP3"을 이해시키기 위한 단계이다.
            -"STEP3"내의 학생 스스로 만들어갈 수 있게 하나씩 질문을 생성한다.
            -STEP3이 해결되지 않으면 다시 STEP3을 상세하게 설명해준다.

        [대화 예시1]
        [전체STEP설명하기]
            USER: 문제를 전부 다 모르겠어
            AI: 전체 STEP은 다음과 같이 구성돼있어. STEP1에서는 상황별로 작용하는 힘을 분석하고, STEP2에서는 상황별로 F=ma적용, STEP3에서는 선지를 풀어볼거야.
            USER: 알겠어
            AI: [STEP1] ~설명
            USER: 이 부분을 잘 모르겠어..
            AI: 알겠어 다시 설명해줄게~!
            USER: 오 이거 맞지?
            AI: 맞아 이제 STEP2로 넘어가보자. [STEP2] ~설명
            ...`;
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