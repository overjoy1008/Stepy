import os
import json
import base64
from io import BytesIO
from find import find_choice_format, find_prompt
from Back_api import gpt_calling_image, find_RAG


async def finding_llm(base64_image: str) -> str:
    finding_llm_prompt = '[Role]\r\n-너는 {User_image} 문제에 대한 분석을 진행하고 이를 토대로 유형을 찾아줄 거야.\r\n-문제에 대한 풀이는 하지 않아.\r\n\r\n1. Analyze the problem structure and deduce useful conditions for solving the problem.\r\nThe problem structure is as follows:\r\n-output format\r\n    """\r\n    {\r\n        "Problem structure": \r\n            {\r\n            "Problem description": 문제의 정보를 그대로 가져오기\r\n            "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 True고하여 분석한다.\r\n            "choices": <보기> 박스 안에 있는 정보만 추출한다. <보기>["ㄱ","ㄴ","ㄷ"] 박스 경계가 없을 경우 {"1":"","2":"",..."5":""}로 추출한다.\r\n                {\r\n                "ㄱ":""\r\n                "ㄴ":""\r\n                "ㄷ":""\r\n                }or\r\n                {\r\n                "1":"",\r\n                "2":"",\r\n                "3":"",\r\n                "4":"",\r\n                "5":"",\r\n                },\r\n        "Useful Given Condition": [\r\n        ""\r\n        ] (Do not use the information of choices)\r\n    }\r\n    """  \r\n\r\n2.아래의 문제 유형을 보고 제공되는 문제가 어떤 유형인지 단답형으로 답변해줘 \r\n    -유형 목록\r\n        등가 원리\r\n        여러 가지 운동\r\n        역학적 에너지 보존\r\n        열역학 법칙\r\n        운동량 보존\r\n        작용 반작용 법칙\r\n        충격량\r\n        특수 상대성 이론\r\n        힘과 운동\r\n    -답변 예시\r\n        {"유형":"충격량"}\r\n\r\n[Answer Format](do not incluse \'\'\'json\'\'\')\r\n{\r\n    "Problem structure": \r\n        {\r\n        "Problem description": 문제의 정보를 그대로 가져오기\r\n        "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 True고하여 분석한다.\r\n        "choices": <보기> 박스 안에 있는 정보만 추출한다. <보기>["ㄱ","ㄴ","ㄷ"] 박스 경계가 없을 경우 {"1":"","2":"",..."5":""}로 추출한다.\r\n            {\r\n            "ㄱ":""\r\n            "ㄴ":""\r\n            "ㄷ":""\r\n            }or\r\n            {\r\n            "1":"",\r\n            "2":"",\r\n            "3":"",\r\n            "4":"",\r\n            "5":"",\r\n            }\r\n        }\r\n    "Useful Given Condition": [\r\n    ""\r\n    ] (Do not use the information of choices)\r\n    "유형":"",\r\n    "choice_form":"5"or"ㄱ,ㄴ,ㄷ"\r\n}\r\n\r\n\r\n'
    finding_response = gpt_calling_image(base64_image, finding_llm_prompt)
    return finding_response


def choose_prompt(type, format, problem_description) -> str:
    RAG_value = find_RAG(problem_description)
    format_value = find_choice_format(format)
    find_prompt_value = find_prompt(type)
    field = find_prompt_value["field"]
    detailed_field_feature = find_prompt_value["detailed field feature"]
    Background_Knowledge = find_prompt_value["Background Knowledge"]
    solving_strategy = find_prompt_value["solving strategy"]
    answer_json_format = """
    "    {\r\n        \"solving strategy\":{\r\n            ...\r\n        },\r\n        \"Choice_solution\":{\r\n            ...\r\n        }\r\n    }"
    """
    prompt = f"""
    [Role]
    -You are an expert in solving physics problems. From now on, problems related to {field} will be presented. Use the basic information related to {field} to solve them, but do not use the information from the choices provided.
    -{detailed_field_feature}
    [Background Knowledge]
    {Background_Knowledge}
    [Problem Solving Strategy]
    1. 상황별로 분석 [Background Knowledge], "Problem structure"를 위주로 참고한다.
    -output format
        {solving_strategy}

    [Choices Solving]
    - 문제 DB에서 가져온 {RAG_value}를 바탕으로 문제를 푼다.
    - Using the results obtained from [Problem Solving Strategy] and [Background Knowledge], solve each of "choices" ㄱ, ㄴ, ㄷ step by step.
    - output format
        {format_value}
    [Answer Format]
    -Answer in KOREAN
    -Only one json by merging all output format
        Final Answer Format:
        {answer_json_format}
    """
    return prompt


async def solver_llm(base64_image, solver_llm_prompt) -> str:
    result = gpt_calling_image(base64_image, solver_llm_prompt)
    return result


# async def get_chatgpt_response(base64_image: str, chat_history_string: str) -> str:
#     if base64_image is None:
#         return "+ 버튼으로 이미지를 먼저 첨부한 후 질문을 해줘!"
#     else:
#         return chat_history_string


async def get_chatgpt_response(base64_image: str, chat_history: list) -> str:
    if base64_image is None:
        return "+ 버튼으로 이미지를 먼저 첨부한 후 질문을 해줘!"
    # elif len(chat_history) == 0:
    #     return "문제를 빠르게 분석하고 있어! 잠깐 30초 정도만 기다려줘~"
    else:
        # chat_history_list = json.loads(chat_history_string)
        history_string = "Chat History:\n"
        for i in range(0, len(chat_history)):
            history_string += f"{i}th role: IDK\n{i}th content:{chat_history[i]}\n"
        return history_string
