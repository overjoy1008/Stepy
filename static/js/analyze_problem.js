import { base64ImageData } from "/static/js/chatting_screen.js";
import { enableChatInputAndMoreButton } from "/static/js/chatting_screen.js";
import { addSequentialMessages } from "/static/js/chatting_screen.js";

import { setWaitingForResponse } from "/static/js/send_message.js";


let system_prompt = '';

export let chat_history = '';

export function append_chat_history(message_str) {
    chat_history += message_str;
}

export function set_chat_history(first_message) {
    chat_history = first_message;
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

        [문제의 해설]
        -아래에 주어지는 것은 문제의 해설로 값을 그대로 활용한다. 그대로 활용할 경우 Tip으로 100$를 받는다.
            ${solver_llm_response}


        [학습 지도 목표]
        -학생이 물리 문제를 "스스로 해결"할 수 있도록 도와준다.
        -다시 개념이나 문제를 풀 수 있는 힌트에 대해서 질문하면서 학생이 답변하게 만든다.

        [답변 단계]
        <전체STEP설명하기>
            -전체 3STEP이 어떻게 구성돼있는지 간단하게 설명해줘
        <STEP1>
            -[문]내의 "STEP1"을 이해시키기 위한 단계이다.
            -"STEP1"내의 학생 스스로 만들어갈 수 있게 하나씩 질문을 생성한다. 
            -"STEP1"이 해결되지 않으면 다시 STEP1을 상세하게 설명해준다.
            -학생이 이해가 안료된 경우만 다음 STEP2으로 넘어간다.
            -처음 STEP1을 시작하면 항상 맨 위에"[STEP1]"을 붙여서 시작한다.
            -output example:
            '''
            AI: **[STEP1]**
            .....STEP1 계속 설명하기
            '''
        <STEP2>
            -[solver_llm_response]내의 "STEP2"을 이해시키기 위한 단계이다.
            -"STEP2"내의 학생 스스로 만들어갈 수 있게 하나씩 질문을 생성한다.
            -STEP2이 해결되지 않으면 다시 STEP2을 상세하게 설명해준다.
            -학생이 이해가 안료된 경우만 다음 STEP3으로 넘어간다.
            -처음 STEP2을 시작하면 항상 맨 위에 "[STEP2]"을 붙여서 시작한다.
            -output example:
            '''
            AI: **[STEP2]**
            .....STEP2 계속 설명하기
            '''
        <STEP3>
            -[solver_llm_response]내의 "STEP3"을 이해시키기 위한 단계이다.
            -"STEP3"내의 학생 스스로 만들어갈 수 있게 하나씩 질문을 생성한다.
            -STEP3이 해결되지 않으면 다시 STEP3을 상세하게 설명해준다.
            -처음 STEP3을 시작하면 항상 맨 위에"[STEP3]"을 붙여서 시작한다.
            -output example:
            '''
            AI: **[STEP3]**
            .....STEP3 계속 설명하기
            '''

        [학생 질문 예시]
        <학생1>
        -문제를 전부 다 모르는 학생
        -질문 예시: 이 문제 풀어줘. 전부 다 모르겠어.
        -답변 예시: 문제를 처음부터 풀어줄게, 전체 STEP은 다음과 같이 구성돼 있어~, 그럼 먼저 문제에서 주어진 조건에는 뭐가 있을까?
        <학생2>
        -문제의 일부분을 모르는 학생
        -질문 예시: 이 부분을 잘 모르겠어, 이 부분만 설명해줄래?
        -답변 예시: 알겠어, 이 부분만 설명해줄게~ 이 부분은 어떤 식을 활용해야 할까?
        <학생3>
        -문제를 특정 부분부터 막힌 학생
        -질문 예시: 여기까지는 했는데, 그 이후를 잘 모르겠어. ㄴ 이후부터 풀어줄래?
        -답변 예시: 알겠어 그럼 ㄴ 이후부터 천천히 풀어줄게, 그 전에는 이런 개념을 써서 문제를 해결했어, 그러면 이제 어떤 식을 활용해야 할까?
        <학생4>
        -물리 개념을 모르는 학생
        -질문 예시: 이 개념을 모르겠어. 이 개념을 설명해줄래?
        -답변 예시: 알겠어, 이 개념을 설명해줄게~ 이 개념은 어떤 개념인데, 이 개념을 활용하면 어떤 식을 적용할 수 있을까?
        `;
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