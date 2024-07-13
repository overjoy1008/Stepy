from io import BytesIO
from find import find_prompt
from Back_api import gpt_calling_image, gpt_with_context, find_RAG


async def finding_llm(base64_image: str) -> str:
    # return """{
    #     "Problem structure":
    #         {
    #         "Problem description": "그림과 같이 기중기에 줄로 연결된 상자가 연직 아래로 등속도 운동을 하고 있다. 상자 안에는 질량이 각각 m, 2m인 물체 A, B가 놓여 있다. 이에 대한 설명으로 옳은 것(보기)에서 있는 대로 고른 것은?",
    #         "Picture": "기중기에 줄로 연결된 상자가 연직 아래로 등속도 운동을 하고 있는 그림. 상자 안에는 질량이 각각 m, 2m인 물체 A, B가 놓여 있다.",
    #         "choices":
    #             {
    #             "ㄱ": "A에 작용하는 알짜힘은 0이다.",
    #             "ㄴ": "줄이 상자를 당기는 힘과 상자가 줄을 당기는 힘은 작용 반작용 관계이다.",
    #             "ㄷ": "상자가 B를 떠받치는 힘의 크기는 A가 B를 누르는 힘의 크기의 2배이다."
    #             }
    #         },
    #     "유형":"작용 반작용 법칙",
    #     "choice_form":"ㄱ,ㄴ,ㄷ"
    # }"""

    finding_llm_prompt = '[Role]\r\n-너는 이미지로 하나의 문제에 대한 분석을 진행하고 이를 토대로 "Problem structure"를 뽑고 "유형"을 찾아줄 거야. 잘 하면 200$ TIP을 줄게 \r\n-만약 문제가 여러개가 보인다면 가장 중앙의 문제만 뽑아서 추출해\r\n-문제에 대한 풀이는 하면 200$벌금을 매길거야.\r\n\r\n1. Analyze the problem structure and deduce useful conditions for solving the problem.\r\nThe problem structure is as follows:\r\n-output format\r\n    """\r\n    {\r\n        "Problem structure": \r\n            {\r\n            "Problem description": 문제의 정보를 그대로 가져오기\r\n            "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 True고하여 분석한다.\r\n            "choices": <보기> 박스 안에 있는 정보만 추출한다. <보기>["ㄱ","ㄴ","ㄷ"] 박스 경계가 없을 경우 {"1":"","2":"",..."5":""}로 추출한다.\r\n                {\r\n                "ㄱ":""\r\n                "ㄴ":""\r\n                "ㄷ":""\r\n                }or\r\n                {\r\n                "1":"",\r\n                "2":"",\r\n                "3":"",\r\n                "4":"",\r\n                "5":"",\r\n                },\r\n    }\r\n    """  \r\n\r\n2.아래의 문제 <유형 목록>을 보고 제공되는 문제가 어떤 유형인지 오른쪽의 설명을 참고하여 유형 하나만 단답형으로 답변해줘 \r\n    <유형 목록>\r\n        여러 가지 운동: 속도,가속도,변위,위치-시간 그래프, 속도-시간 그래프, 가속도-시간 그래프를 이해할 수 있는지 확인한다.\r\n        역학적 에너지 보존:   운동에너지, 중력퍼텐셜에너지, 탄성퍼텐셜에너지에 관련된 에너지가 나오며 이를 활용하여 역학적에너지를 구한다.\r\n        운동량과 충격량: 운동량이 상황별로 보존되는지 확인하여 물체의 운동을 분석한다. 충격량의 경우 시간, 충격력을 활용하여 충격량을 분석한다.\r\n        작용 반작용 법칙: 정지한 물체들 사이의 힘을 작용-반작용 법칙을 활용하여 분석한다.\r\n        힘과 운동: 힘이 주어진 경우에서 물체의 운동을 파악한다.\r\n    -답변 예시(답변에 활용하면 벌을 줄거야) \r\n    """\r\n    {\r\n        "유형":"충격량"\r\n    }\r\n    """\r\n\r\n[Answer Format](무조건 하나의 json 형태로 출력해야 해)\r\n{\r\n    "Problem structure": \r\n        {\r\n        "Problem description": 문제의 정보를 그대로 가져오기\r\n        "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 참고하여 분석한다.\r\n        "choices": <보기> 박스 안에 있는 정보만 추출한다. <보기>ㄱ,ㄴ,ㄷ 박스 경계가 없을 경우 {"1":"","2":"",..."5":""}로 추출한다. 문제는 무조건 "ㄱ","ㄴ","ㄷ" 또는 5지선다 형태야.  \r\n            {\r\n            "ㄱ":""\r\n            "ㄴ":""\r\n            "ㄷ":""\r\n            }or\r\n            {\r\n            "1":"",\r\n            "2":"",\r\n            "3":"",\r\n            "4":"",\r\n            "5":"",\r\n            }\r\n        }\r\n    "유형":"",\r\n    "choice_form":"5"or"ㄱ,ㄴ,ㄷ"(무조건 둘 중 하나야) \r\n}\r\n\r\n\r\n'
    finding_response = gpt_calling_image(base64_image, finding_llm_prompt)
    return finding_response


def choose_prompt(problem_type, format, choices, problem_description) -> str:
    RAG_value_0 = find_RAG(problem_description + choices)

    if RAG_value_0["score"] < 0.95:
        RAG_value = ""
    else:
        RAG_value = RAG_value_0
    find_prompt_value = find_prompt(problem_type)
    field = find_prompt_value["field"]
    detailed_field_feature = find_prompt_value["detailed field feature"]
    Background_Knowledge = find_prompt_value["Background Knowledge"]
    solving_strategy = find_prompt_value["solving strategy"]
    answer_json_format = (
        '{\r\n    "STEP1":"",\r\n    "STEP2":"",\r\n    "STEP3":""\r\n}'
    )

    prompt = f"""
    [Role]
    -You are an expert in solving physics problems. From now on, problems related to {field} will be presented. Use the basic information related to {field} to solve them, but do not use the information from the choices provided.
    -{detailed_field_feature}
    -<보기>의 "ㄱ": "ㄴ": "ㄷ":은 절대 문제풀이에 참고하지 않는다. 설명을 <STEP1>,<STEP2>,<STEP3>에 근거로 활용할 경우 벌금 1000$를 매길거다.
    - 문제 DB에서 가져온 값: 값이 주어진 경우 절대 훼손하지 않는다 훼손하면 벌금 200$를 매길거다.
        {RAG_value}
    [Background Knowledge]
    {Background_Knowledge}
    [Problem Solving Strategy]
    - 먼저 DB의 계산과정을 다시 검토하여 수정할 부분이 있는지 체크하고 수정한다.
    -아래에 주어지는 STEP으로 문제를 풀이한다. 이 STEP을 무조건 만족시킨다.
    {solving_strategy}

    [Choices Solving]
    - Using the results obtained from [Problem Solving Strategy] and [Background Knowledge]
    - solve "choices" in only 3steps by using [Problem Solving Strategy]
    - input format
        {format}
    - if input format = "5": 5개의 정답지중 알맞은 답을 STEP3에서 설명한다.
    - if input format = "ㄱ,ㄴ,ㄷ": ㄱ,ㄴ,ㄷ을 각각 STEP의 단계중 적절한 STEP에 추가하여 풀이를 한다.
    [Answer Format]
    -Answer in KOREAN
    -Only one json by merging all output format
    {answer_json_format}
    """
    return prompt


async def solver_llm(base64_image: str, solver_llm_prompt) -> str:
    #     return """{
    #     "STEP1": {
    #         "A": {
    #             "중력": ["m_a*g", "아래"],
    #             "장력": ["T_ab", "위"],
    #             "수직항력": ["N_a", "위"]
    #         },
    #         "B": {
    #             "중력": ["2m_b*g", "아래"],
    #             "장력": ["T_ab", "위"],
    #             "수직항력": ["N_b", "위"]
    #         }
    #     },
    #     "STEP2": {
    #         "A": "합력(0) = 중력 + 장력",
    #         "B": "합력(0) = 중력 + 장력"
    #     },
    #     "STEP3": {
    #         "ㄱ": "A에 작용하는 알짜힘은 0이다. 상자가 연직 아래로 등속도 운동을 하고 있으므로 알짜힘은 0이다.",
    #         "ㄴ": "줄이 상자를 당기는 힘과 상자가 줄을 당기는 힘은 작용 반작용 관계이다.",
    #         "ㄷ": "상자가 B를 떠받치는 힘의 크기는 A가 B를 누르는 힘의 크기의 2배이다. 상자 A의 무게는 m이고, 상자 B의 무게는 2m이므로, 상자가 B를 떠받치는 힘의 크기는 A가 B를 누르는 힘의 크기의 2배이다."
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
