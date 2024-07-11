from io import BytesIO
from find import find_choice_format, find_prompt
from Back_api import gpt_calling_image, gpt_with_context, find_RAG


async def finding_llm(base64_image: str) -> str:
    # return """{
    #     "Problem structure":
    #         {
    #         "Problem description": "그림과 같이 기중기에 줄로 연결된 상자가 연직 아래로 등속도 운동을 하고 있다. 상자 안에는 질량이 각각 m, 2m인 물체 A, B가 놓여 있다. 이에 대한 설명으로 옳은 것만을 (보기)에서 있는 대로 고른 것은?",
    #         "Picture": "상자에 m, 2m 질량의 물체가 놓여 있고, 기중기에 줄로 연결되어 연직 아래로 등속도 운동을 하고 있는 그림",
    #         "choices":
    #             {
    #             "ㄱ":"A에 작용하는 알짜힘은 0이다.",
    #             "ㄴ":"줄이 상자를 당기는 힘과 상자가 줄을 당기는 힘은 작용 반작용 관계이다.",
    #             "ㄷ":"상자가 B를 떠받치는 힘의 크기는 A가 B를 누르는 힘의 크기의 2배이다."
    #             }
    #         }
    #     ,
    #     "Useful Given Condition": [
    #     "기중기에 줄로 연결된 상자가 연직 아래로 등속도 운동을 하고 있다.",
    #     "상자 안에는 질량이 각각 m, 2m인 물체 A, B가 놓여 있다."
    #     ],
    #     "유형":"힘과 운동",
    #     "choice_form":"ㄱ,ㄴ,ㄷ"
    # }"""

    finding_llm_prompt = '[Role]\r\n-너는 {User_image} 문제에 대한 분석을 진행하고 이를 토대로 유형을 찾아줄 거야.\r\n-문제에 대한 풀이는 하지 않아.\r\n\r\n1. Analyze the problem structure and deduce useful conditions for solving the problem.\r\nThe problem structure is as follows:\r\n-output format\r\n    """\r\n    {\r\n        "Problem structure": \r\n            {\r\n            "Problem description": 문제의 정보를 그대로 가져오기\r\n            "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 True고하여 분석한다.\r\n            "choices": <보기> 박스 안에 있는 정보만 추출한다. <보기>["ㄱ","ㄴ","ㄷ"] 박스 경계가 없을 경우 {"1":"","2":"",..."5":""}로 추출한다.\r\n                {\r\n                "ㄱ":""\r\n                "ㄴ":""\r\n                "ㄷ":""\r\n                }or\r\n                {\r\n                "1":"",\r\n                "2":"",\r\n                "3":"",\r\n                "4":"",\r\n                "5":"",\r\n                },\r\n        "Useful Given Condition": [\r\n        ""\r\n        ] (Do not use the information of choices)\r\n    }\r\n    """  \r\n\r\n2.아래의 문제 유형을 보고 제공되는 문제가 어떤 유형인지 단답형으로 답변해줘 \r\n    -유형 목록\r\n        등가 원리\r\n        여러 가지 운동\r\n        역학적 에너지 보존\r\n        열역학 법칙\r\n        운동량 보존\r\n        작용 반작용 법칙\r\n        충격량\r\n        특수 상대성 이론\r\n        힘과 운동\r\n    -답변 예시\r\n        {"유형":"충격량"}\r\n\r\n[Answer Format](do not incluse \'\'\'json\'\'\')\r\n{\r\n    "Problem structure": \r\n        {\r\n        "Problem description": 문제의 정보를 그대로 가져오기\r\n        "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 True고하여 분석한다.\r\n        "choices": <보기> 박스 안에 있는 정보만 추출한다. <보기>["ㄱ","ㄴ","ㄷ"] 박스 경계가 없을 경우 {"1":"","2":"",..."5":""}로 추출한다.\r\n            {\r\n            "ㄱ":""\r\n            "ㄴ":""\r\n            "ㄷ":""\r\n            }or\r\n            {\r\n            "1":"",\r\n            "2":"",\r\n            "3":"",\r\n            "4":"",\r\n            "5":"",\r\n            }\r\n        }\r\n    "Useful Given Condition": [\r\n    ""\r\n    ] (Do not use the information of choices)\r\n    "유형":"",\r\n    "choice_form":"5"or"ㄱ,ㄴ,ㄷ"\r\n}\r\n\r\n\r\n'
    finding_response = gpt_calling_image(base64_image, finding_llm_prompt)
    return finding_response


def choose_prompt(problem_type, format, problem_description) -> str:
    RAG_value = find_RAG(problem_description)
    format_value = find_choice_format(format)
    find_prompt_value = find_prompt(problem_type)
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


async def solver_llm(base64_image: str, solver_llm_prompt) -> str:
    # return """{
    #     "solving strategy": {
    #         "상자가 연직 아래로 등속도 운동을 하고 있으므로 상자, A, B에 작용하는 알짜힘은 0이다.": "상자가 등속도 운동을 하고 있으므로 상자에 작용하는 힘의 합력은 0이다. 즉, 상자에 작용하는 중력과 줄이 상자를 당기는 힘이 같다는 것을 의미한다.",
    #         "줄이 상자를 당기는 힘의 반작용은 상자가 줄을 당기는 힘이다.": "뉴턴의 제3법칙에 따르면, 힘과 반작용 힘은 크기가 같고 방향이 반대인 쌍으로 존재한다. 따라서 줄이 상자를 당기는 힘의 반작용은 상자가 줄을 당기는 힘이다.",
    #         "상자가 B를 떠받치는 힘의 크기는 3mg이고, A가 B를 누르는 힘의 크기는 mg이므로, 상자가 B를 떠받치는 힘의 크기는 A가 B를 누르는 힘의 크기의 3배이다.": "상자 안에 있는 질량 m인 물체 A와 2m인 물체 B가 각각 상자 바닥과 접촉하고 있다. A가 B를 누르는 힘은 A의 무게인 mg이고, 상자가 B를 떠받치는 힘은 A와 B의 무게를 합한 3mg이다."
    #     },
    #     "Choice_solution": {
    #         "STEP1": "상자가 연직 아래로 등속도 운동을 하고 있으므로 상자, A, B에 작용하는 알짜힘은 0이다. 따라서 ㄱ은 참이다.",
    #         "ㄱ_참/거짓": "True",
    #         "STEP2": "줄이 상자를 당기는 힘의 반작용은 상자가 줄을 당기는 힘이다. 따라서 ㄴ은 참이다.",
    #         "ㄴ_참/거짓": "True",
    #         "STEP3": "상자가 B를 떠받치는 힘의 크기는 3mg이고, A가 B를 누르는 힘의 크기는 mg이므로, 상자가 B를 떠받치는 힘의 크기는 A가 B를 누르는 힘의 크기의 3배이다. 따라서 ㄷ은 거짓이다.",
    #         "ㄷ_참/거짓": "False"
    #     }
    # }"""
    result = gpt_calling_image(base64_image, solver_llm_prompt)
    return result


async def get_chatgpt_response(base64_image, chat_history: str) -> str:
    parsed_history = chat_history.split("|")[:-1]
    chat_history_list = []
    chat_history_list.append({"role": parsed_history[0], "content": parsed_history[1]})
    chat_history_list.append(
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                }
            ],
        }
    )
    for i in range(2, len(parsed_history), 2):
        chat_history_list.append(
            {"role": parsed_history[i], "content": parsed_history[i + 1]}
        )

    gpt_response = gpt_with_context(chat_history_list)

    return gpt_response
