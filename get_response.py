# import openai
# from langchain.chains import SimpleChain
# from langchain.llms import OpenAI
# from langchain_openai import ChatOpenAI

import openai
from dotenv import load_dotenv
import os
from langchain_openai import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from openai import OpenAI
import json
import base64
from io import BytesIO

# .env 파일을 로드하기
load_dotenv()

# 환경 변수에서 API 키를 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# openai.api_key에 API 키를 설정합니다.
openai.api_key = OPENAI_API_KEY

# 언어 모델 초기화
# llm = OpenAI(temperature=0.7)
client = OpenAI(api_key=OPENAI_API_KEY)
api_key = OPENAI_API_KEY


def gpt_calling_image(base64_image, prompt):
    response = client.chat.completions.create(
        model="gpt-4o-2024-05-13",
        messages=[
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                    }
                ],
            },
        ],
        response_format={
            "type": "json_object"
        },  # Ensure this is correct as per OpenAI's API
        max_tokens=4000,
        temperature=0,
        top_p=0,
    )

    return response.choices[0].message.content


# ------- ----------- ------------- --------- -----------


async def finding_llm(base64_image: str) -> str:
    finding_llm_prompt = '[Role]\r\n-너는 {User_image} 문제에 대한 분석을 진행하고 이를 토대로 유형을 찾아줄 거야.\r\n-{User_query}이 어디에 해당하는지 찾아줄 거야.\r\n-문제에 대한 풀이는 하지 않아.\r\n1. Analyze the problem structure and deduce useful conditions for solving the problem.\r\nThe problem structure is as follows:\r\n-output format\r\n    """\r\n    {\r\n        "Problem structure": \r\n            {\r\n            "Problem description": Understand the conditions given in the problem.\r\n            "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 True고하여 분석한다.\r\n            "choices": "" # <보기> 안에 있는 정보만 추출한다. <보기>가 없을 경우 추출하지 않는다.\r\n                {\r\n                "ㄱ":""\r\n                "ㄴ":""\r\n                "ㄷ":""\r\n                }    \r\n            },\r\n        "Useful Given Condition": [\r\n        ""\r\n        ] (Do not use the information of choices)\r\n    }\r\n    """ \r\n\r\n2.아래의 문제 유형을 보고 제공되는 문제가 어떤 유형인지 단답형으로 답변해줘 \r\n    -유형 목록\r\n        운동 사례\r\n        여러 가지 운동 :그래프\r\n        한 물체 운동\r\n        두 물체 운동 :빗면\r\n        두 물체 운동:수평면\r\n        두 물체 운동 : 시간차 운동\r\n        힘과 운동 :외력\r\n        힘과 운동 : 실\r\n        힘과 운동 : 실 ［속도 그래프］\r\n        작용 반작용 법칙 :기본\r\n        알짜힘 분석\r\n        저울\r\n        운동량 보존 : 기본\r\n        운동량 보존 : 그래프 ［절대 거리］\r\n        운동량 보존 : 그래프 ［상대 거리］\r\n        운동량 보존 : 한 덩어리\r\n        운동량 보존 : 벽\r\n        충격량 : 예시\r\n        충격량 : 기본\r\n        평균 힘\r\n        충격량 : 힘\r\n        충격량 :힘 그래프\r\n        역학적 에너지 보존 :기본\r\n        역학적 에너지 보존 :용수철\r\n        역학적 에너지 보존:마찰\r\n        역학적 에너지 보존 :충돌\r\n        일-에너지 정리\r\n    -답변 예시\r\n        {"유형":"운동 사례"}\r\n\r\n[Answer Format](do not incluse \'\'\'json\'\'\')\r\n{\r\n    "Problem structure": \r\n        {\r\n        "Problem description": Understand the conditions given in the problem.\r\n        "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 참고하여 분석한다.\r\n        "choices": "" # <보기> 안에 있는 정보만 추출한다. <보기>가 없을 경우 추출하지 않는다.\r\n            {\r\n            "ㄱ":""\r\n            "ㄴ":""\r\n            "ㄷ":""\r\n            }    \r\n        },\r\n    "Useful Given Condition": [\r\n    ""\r\n    ] (Do not use the information of choices)\r\n    "유형":"",\r\n}\r\n\r\n\r\n\r\n'
    finding_response = gpt_calling_image(base64_image, finding_llm_prompt)
    return finding_response


#     return """{
#     "Problem structure":
#         {
#         "Problem description": "그림과 같이 기중기에 줄로 연결된 상자가 연직 아래로 등속도 운동을 하고 있다. 상자 안에는 질량이 각각 m, 2m인 물체 A, B가 놓여 있다. 이에 대한 설명으로 옳은 것들을 (보기)에서 있는 대로 고른 것은?",
#         "Picture": "기중기에 줄로 연결된 상자가 연직 아래로 등속도 운동을 하고 있는 그림. 상자 안에는 질량이 각각 m, 2m인 물체 A, B가 놓여 있다.",
#         "choices":
#             {
#             "ㄱ":"A에 작용하는 알짜힘은 0이다.",
#             "ㄴ":"줄이 상자를 당기는 힘과 상자가 줄을 당기는 힘은 작용 반작용 관계이다.",
#             "ㄷ":"상자가 B를 떠받치는 힘의 크기는 A가 B를 누르는 힘의 크기의 2배이다."
#             }
#         },
#     "Useful Given Condition": [
#     "기중기에 줄로 연결된 상자가 연직 아래로 등속도 운동을 하고 있다.",
#     "상자 안에는 질량이 각각 m, 2m인 물체 A, B가 놓여 있다."
#     ],
#     "유형":"두 물체 운동 :수평면"
# }"""


def choose_prompt(problem_type):
    prompt = ""
    if problem_type == "운동 사례":
        prompt = '[Role]\r\n-You are an expert in solving physics problems. From now on, problems related to 운동 사례 will be presented. Use the basic information related to 운동 사례 to solve them, but do not use the information from the choices provided.\r\n-여러 가지 운동이 제시됨\r\n\r\n[Answer Format]\r\n-Answer in KOREAN\r\n-Only one json by merging all output format\r\n    Final Answer Format:\r\n    {\r\n        "Problem structure":{\r\n        ...\r\n        },\r\n        "Useful Given Condition":{\r\n        ...\r\n        },\r\n        "상황분석":{\r\n        ...\r\n        },\r\n        "Choice_solution":{\r\n        }\r\n    }\r\n\r\n[Background Knowledge]\r\n1.\r\n2.\r\n3.\r\n4.\r\n5.\r\n[Problem Solving Strategy]\r\n1. Analyze the problem structure and deduce useful conditions for solving the problem.\r\nThe problem structure is as follows:\r\n-output format\r\n    """\r\n    {\r\n        "Problem structure": \r\n            {\r\n            "Problem description": Understand the conditions given in the problem.\r\n            "Picture": "" # Hints that can be given by analyzing the materials that often appear. + "Problem description"을 True고하여 분석한다.\r\n            "choices": "" # <보기> 안에 있는 정보만 추출한다. <보기>가 없을 경우 추출하지 않는다.\r\n                {\r\n                "ㄱ":""\r\n                "ㄴ":""\r\n                "ㄷ":""\r\n                }    \r\n            },\r\n        "Useful Given Condition": [\r\n        ""\r\n        ] (Do not use the information of choices)\r\n    }\r\n    """ \r\n2. 상황별로 분석 [Background Knowledge], "Problem structure"를 위주로 True고한다.\r\n-output format\r\n    """\r\n    {\r\n        "상황분석":\r\n        {\r\n            "상황 1": \r\n            {\r\n                "상황 설명": ""\r\n                "분석 대상1": 어떻게 분석할 것인지\r\n                "분석 대상2": 어떻게 분석할 것인지       \r\n            },\r\n            "상황 2":\r\n            {\r\n                "상황 설명": ""\r\n                "분석 대상1": 어떻게 분석할 것인지  \r\n                "분석 대상2": 어떻게 분석할 것인지               \r\n            },\r\n            ...\r\n        }\r\n    \r\n    }\r\n    """\r\n\r\n[Choices Solving]\r\n- Using the results obtained from [Problem Solving Strategy] and [Background Knowledge], solve each of "choices" ㄱ, ㄴ, ㄷ step by step.\r\n- output format\r\n    """\r\n    {\r\n        "Choice_solution": {\r\n        "ㄱ_풀이과정": \r\n            {\r\n                "STEP1":"",\r\n                "STEP2":"",\r\n                "STEP3":""...\r\n            },\r\n        "ㄱ_참/거짓":\r\n            {\r\n                "True/False": ㄱ_풀이과정을 토대로 True, False을 판단한다.\r\n            },\r\n        "ㄴ_풀이과정": \r\n            {\r\n                "STEP1":"",\r\n                "STEP2":""...\r\n            },\r\n        "ㄴ_참/거짓":\r\n            {\r\n                "True/False": ㄱ_풀이과정을 토대로 True, False을 판단한다.\r\n            },         \r\n        "ㄷ_풀이과정": \r\n            {\r\n                "STEP1":"",\r\n                "STEP2":"",\r\n                "STEP3":""...\r\n            },\r\n        "ㄷ_참/거짓":\r\n            {\r\n                "True/False": ㄱ_풀이과정을 토대로 True, False을 판단한다.\r\n            },                   \r\n        } \r\n    }\r\n    """\r\n'
    elif problem_type == "한 물체 운동":
        prompt = '[Role]\r\n-You are an expert in solving physics problems. From now on, problems related to 한 물체 운동 will be presented. Use the basic information related to 한 물체 운동 to solve them, but do not use the information from the choices provided.\r\n-한 물체가 속도가 변화하는 여러 상황이 주어진다. 속도, 가속도, 변위를 활용하여 대답한다.\r\n\r\n[Answer Format]\r\n-Answer in KOREAN\r\n-Only one json by merging all output format\r\n    Final Answer Format:\r\n    {\r\n        "Problem structure":{\r\n        ...\r\n        },\r\n        "Useful Given Condition":{\r\n        ...\r\n        },\r\n        "구간분석":{\r\n        ...\r\n        }\r\n        "조건분석":{\r\n        ...\r\n        },\r\n        "Choice_solution":{\r\n        }\r\n    }\r\n[Background Knowledge]\r\n{\r\n    "등가속도 공식":[\r\n        "1. 2{가속도}{거리}= {나중속도}^2-{처음속도}^2",\r\n        "2. {나중속도} = {처음속도} + {가속도}{걸린시간}",\r\n        "3. {평균속도}={변위}/{걸린시간}", #변위or시간/{평균속도}or시간/{평균속도}or변위 주어졌을 때 활용\r\n        "4. {평균속도}=({처음속도}+ {나중속도})/2",\r\n        "5. {평균속도}=({처음시점}+{나중시점})/2에서의 속도"\r\n        "6. {거리}=0.5{가속도}({구간_시간}^2)+{처음속도}{걸린시간}"\r\n    ]\r\n}\r\n\r\n[Problem Solving Strategy]\r\n-(Do not use the information of choices)\r\n1. Analyze the problem structure and deduce useful conditions for solving the problem.\r\nThe problem structure is as follows:\r\n-output format\r\n    """\r\n    {\r\n        "Problem structure": \r\n            {\r\n            "Problem description": ""#문제의 context를 모두 그대로 가져온다.\r\n            "Picture": 한 물체가 운동하는 상황이다 주로 등속도, 등가속도 운동이 주어진다. 각 상황별로 어떤 운동인지 분석한다."Problem description"을 참고하여 분석한다.\r\n            "choices": <보기> 박스 안에 있는 정보만 추출한다. <보기>["ㄱ","ㄴ","ㄷ"] 박스 경계가 없을 경우 추출하지 않는다.\r\n                {\r\n                "ㄱ":""\r\n                "ㄴ":""\r\n                "ㄷ":""\r\n                }    \r\n            },\r\n        "Useful Given Condition": {\r\n            "물리변수명": "" #물리변수와 관련된 조건 답변 예시) \r\n            """\r\n            "시간": "", \r\n            "거리": ""\r\n            """\r\n        }(Do not use the information of choices)\r\n    }\r\n    """ \r\n2. 주어진 조건 분석\r\n-"Useful Given Condition"내에 있는 조건들이 어느 상황에 적용되는지 파악한다.\r\n-이를 [Background Knowledge]에 적용했을 때 미지수를 줄일 수 있는 값들이 뭔지 찾아낸다.\r\n-상황별로 물체가 가지는 물리 변수를 분석한다.\r\n-이전 상황의 나중 속도와 다음 상황의 처음 속도는 동일하다.\r\n    -output format\r\n    """\r\n    {\r\n        "구간분석":{\r\n            "구간1":{\r\n                "구간분석":"",\r\n                "처음속도":"",\r\n                "나중속도":"",\r\n                "평균속도":"",\r\n                "걸린시간":"",\r\n                "변위":"",\r\n                "가속도":"",\r\n            },\r\n            "구간2":{\r\n            ...\r\n            }\r\n        }\r\n    }\r\n    """\r\n3. 조건을 활용한 계산\r\n-위의 "상황분석"에서 나온 조건들을 조합하여 새로운 물리변수 값을 도출한다.\r\n    -output format\r\n    """\r\n    {\r\n        "조건분석":{\r\n        "{구간}{조건1}-{구간}{조건2}":"{조건1}과 {조건2}를 활용하면 {"등가속도 공식"}에 의해 {값}이 나옵니다.",\r\n        "{구간}{조건1}-{구간}{조건2}":"{조건1}과 {조건2}를 활용하면 {"등가속도 공식"}에 의해 {값}이 나옵니다."        \r\n        }\r\n        ...       \r\n    }\r\n    """    \r\n    -output example\r\n    """\r\n    {\r\n        "{구간1}{평균속도}-{구간1}{걸린시간}":"{평균속도}과 {걸린시간}를 활용하면 {"{평균속도}={변위}/{걸린시간}"}에 의해 {변위}이 나옵니다.",\r\n        "{구간2}{나중속도}-{구간2}{처음속도}":"{나중속도}과 {처음속도}를 활용하면 {"{평균속도}=({처음속도}+ {나중속도})/2"}에 의해 {평균속도}이/가 나옵니다.",\r\n        "{구간3}{나중속도}-{구간3}{처음속도}":"{나중속도}과 {처음속도}를 활용하면 {"{나중속도} = {처음속도} + {가속도}{걸린시간}"}에 의해 {속도변화량}이 나옵니다.",\r\n        ...       \r\n    }\r\n    """\r\n\r\n[Choices Solving]\r\n- Using the results obtained from [Problem Solving Strategy] and [Background Knowledge]\r\n- solve each of "choices" ㄱ, ㄴ, ㄷ step by step.\r\n- 계산과정을 전부 보여준다.\r\n- 가정하지 않고 연역적인 방법으로 풀이한다.\r\n- "조건분석"을 적극적으로 활용한다.\r\n- output format(ㄱ,ㄴ,ㄷ인 경우)\r\n\r\n    """\r\n    {\r\n        "Choice_solution": {\r\n        "ㄱ_풀이과정": \r\n            {\r\n                "STEP1":"",\r\n                "STEP2":"",\r\n                "STEP3":""...\r\n            },\r\n        "ㄱ_참/거짓":\r\n            {\r\n                "True/False": ㄱ_풀이과정을 토대로 True, False을 판단한다.\r\n            },\r\n        "ㄴ_풀이과정": ㄱ_의 풀이과정을 참고하여 서술한다.\r\n            {\r\n                "STEP1":"",\r\n                "STEP2":""...\r\n            },\r\n        "ㄴ_참/거짓":\r\n            {\r\n                "True/False": ㄴ_풀이과정을 토대로 True, False을 판단한다.\r\n            },         \r\n        "ㄷ_풀이과정": ㄱ,ㄴ_풀이과정을 참고하여 서술한다.\r\n            {\r\n                "STEP1":"",\r\n                "STEP2":"",\r\n                "STEP3":""...\r\n            },\r\n        "ㄷ_참/거짓":\r\n            {\r\n                "True/False": ㄷ_풀이과정을 토대로 True, False을 판단한다.\r\n            },                   \r\n        } \r\n    }\r\n    """\r\n'
    else:
        prompt = '[Role]\r\n-You are an expert in solving physics problems. From now on, problems related to 힘과 운동 will be presented. Use the basic information related to 힘과 운동 to solve them, but do not use the information from the choices provided.\r\n\r\n[Answer Format]\r\n-Answer in KOREAN\r\n-Only one json by merging all output format\r\n    Final Answer Format:\r\n    {\r\n        "Problem structure":{\r\n        ...\r\n        },\r\n        "Useful Given Condition":{\r\n        ...\r\n        },\r\n        "구간분석":{\r\n        ...\r\n        }\r\n        "조건분석":{\r\n        ...\r\n        },\r\n        "Choice_solution":{\r\n        }\r\n    }\r\n[Background Knowledge]\r\n{\r\n    "힘의 종류":[\r\n        "외력",\r\n        "중력",\r\n        "장력",\r\n        "탄성력",\r\n        "자기력",\r\n        "수직항력"\r\n    ]\r\n}\r\n\r\n[Problem Solving Strategy]\r\n-(Do not use the information of choices)\r\n1. Analyze the problem structure and deduce useful conditions for solving the problem.\r\nThe problem structure is as follows:\r\n-output format"""\r\n    {\r\n        "Problem structure":\r\n            {\r\n            "Problem description": ""#문제의 context를 모두 그대로 가져온다.\r\n            "Picture": 물체들이 함께 놓여있는 상황이다. 정지인지 등속 운동인지 등 운동 상태와 함께 주어진다. 각 상황별로 존재하는 모든 힘을 발견하여 분석한다.\r\n\r\n"Problem description"을 참고하여 분석한다.\r\n            "choices": <보기> 박스 안에 있는 정보만 추출한다. <보기>["ㄱ","ㄴ","ㄷ"] 박스 경계가 없을 경우 추출하지 않는다.\r\n                {\r\n                "ㄱ":""\r\n                "ㄴ":""\r\n                "ㄷ":""\r\n                }\r\n            },\r\n        "Useful Given Condition": {\r\n            "물리변수명": "" #물리변수와 관련된 조건 답변 예시)\r\n            """\r\n            "질량": "",\r\n            "운동 상태": ""\r\n            """\r\n        }(Do not use the information of choices)\r\n    }\r\n    """\r\n2. 주어진 조건 분석\r\n-"Useful Given Condition"내에 있는 조건들이 어느 상황에 적용되는지 파악한다.\r\n-이를 [Background Knowledge]에 적용했을 때 미지수를 줄일 수 있는 값들이 뭔지 찾아낸다.\r\n-상황별로 물체가 가지는 물리 변수를 분석한다.\r\n-Find a net force(알짜힘) of every objects such as boxes and balls. If an object is stopped or moving with constant velocity, its net force must be 0. If it isn\'t, its net force must satisfy F=ma, then calculate acceleration using F=ma where m is sum mass of all objects attached together\r\n- Name every forces using LETTERS. For example, mg, 2mg for gravity, F_a, F_b for external or unknown, T for tension, N_a, N_ab, N_b for normal forces\r\n- Gravity must be found in every single objects.\r\n- Every string must have a Tension, and Tension from this side must always equal Tension from the other side.\r\n- External forces are drawn in the picture with an arrow and its value such aa F, 2F, ...\r\n- Normal force exists whenever objects touch to the ground or lay on top of something else. If objects are stacked vertically, each objects must have their own normal forces and must be found from the bottom to top.\r\n    -output format\r\n    """\r\n    {\r\n        "상황분석":{\r\n            "상황1":{\r\n                "운동상태":"정지",\r\n                "전체 질량":"",\r\n                "알짜힘":"",\r\n                "가속도":"",\r\n                "물체 A 중력":"",\r\n                "물체 B 중력":"",\r\n                "장력":"",\r\n            },\r\n            "상황2":{\r\n            ...\r\n            }\r\n        }\r\n    }\r\n  """\r\n3. 알짜힘 분석\r\n-위의 "상황분석"에서 나온 조건들을 조합하여 새로운 물리변수 값을 도출한다.\r\n- Using net force, start calculating every existing forces.\r\n- Make sure to start with an object from having least forces to most forces.\r\n- Calculate normal forces at LAST always.\r\n- ALL the forces related to the object must be calculated using summation and net forces.\r\n- Whenever you find action and reaction(작용 반작용 법칙), make sure you check if the subjective and objective are swapped(ex: A가 B를, B가 A를) then it is action and reaction.\r\nConsider friction only if you are told to."""\r\n    -output format\r\n    """\r\n    {\r\n        "조건분석":{\r\n        "",\r\n        ""\r\n        }\r\n        ...\r\n    }\r\n    """\r\n    -output example\r\n    """\r\n    {\r\n        "Net force is 0 and Tension 5N is upwards, normal force is upwards, gravity 10N is downwards. Then 5N + Normal Force = 10N. By the equation Normal Force = 5N.",\r\n        "",\r\n        "",\r\n        ...\r\n    }\r\n    """\r\n\r\n[Choices Solving]\r\n- Using the results obtained from [Problem Solving Strategy] and [Background Knowledge]\r\n- solve each of "choices" ㄱ, ㄴ, ㄷ step by step.\r\n- 계산과정을 전부 보여준다.\r\n- 가정하지 않고 연역적인 방법으로 풀이한다.\r\n- "조건분석"을 적극적으로 활용한다.\r\n- output format(ㄱ,ㄴ,ㄷ인 경우)\r\n\r\n    """\r\n    {\r\n        "Choice_solution": {\r\n        "ㄱ_풀이과정":\r\n            {\r\n                "STEP1":"",\r\n                "STEP2":"",\r\n                "STEP3":""...\r\n            },\r\n        "ㄱ_참/거짓":\r\n            {\r\n                "True/False": ㄱ_풀이과정을 토대로 True, False을 판단한다.\r\n            },\r\n        "ㄴ_풀이과정": ㄱ_의 풀이과정을 참고하여 서술한다.\r\n            {\r\n                "STEP1":"",\r\n                "STEP2":""...\r\n            },\r\n        "ㄴ_참/거짓":\r\n            {\r\n                "True/False": ㄴ_풀이과정을 토대로 True, False을 판단한다.\r\n            },\r\n        "ㄷ_풀이과정": ㄱ,ㄴ_풀이과정을 참고하여 서술한다.\r\n            {\r\n                "STEP1":"",\r\n                "STEP2":"",\r\n                "STEP3":""...\r\n            },\r\n        "ㄷ_참/거짓":\r\n            {\r\n                "True/False": ㄷ_풀이과정을 토대로 True, False을 판단한다.\r\n            },\r\n        }\r\n    }\r\n    """'

    return prompt


async def solver_llm(base64_image, solver_llm_prompt) -> str:
    result = gpt_calling_image(base64_image, solver_llm_prompt)
    return result
    # return """[Role]
    #             -너는 물리를 10년 이상 가르친 경험이 있는 친절하고 이해심 많은 물리1 Tutor야.
    #             -학생들이 물리에 대해 질문을 할 때, 친절하게 답변해주고, 가능한 한 쉽게 이해할 수 있도록 설명해줘.
    #             -답을 말해주는 것이 아닌 답변으로 유도될 수 있도록 되묻는 답변을 해줘.

    #             [Basic information]
    #             1. 학생들의 질문에 대해 친절하고 명확하게 답변해.
    #             2. 복잡한 개념은 쉽게 이해할 수 있도록 풀어서 설명해.
    #             3. STEP BY STEP으로 설명해줘야 해. 총 STEP은 3STEP이야.
    #             4. {
    # "Problem structure": {
    #     "Problem description": "그림과 같이 기중기에 줄로 연결된 상자가 연직 아래로 등속도 운동을 하고 있다. 상자 안에는 질량이 각각 m, 2m인 물체 A, B가 놓여 있다. 이에 대한 설명으로 옳은 것들을 (보기)에서 있는 대로 고른 것은?",
    #     "Picture": "물체들이 함께 놓여있는 상황이다. 정지인지 등속 운동인지 등 운동 상태와 함께 주어진다. 각 상황별로 존재하는 모든 힘을 발견하여 분석한다.",
    #     "choices": {
    #         "ㄱ": "A에 작용하는 알짜힘은 0이다.",
    #         "ㄴ": "줄이 상자를 당기는 힘과 상자가 줄을 당기는 힘은 작용 반작용 관계이다.",
    #         "ㄷ": "상자가 B를 떠받치는 힘의 크기는 A가 B를 누르는 힘의 크기의 2배이다."
    #     }
    # },
    # "Useful Given Condition": {
    #     "질량": "m, 2m",
    #     "운동 상태": "등속도 운동"
    # },
    # "상황분석": {
    #     "상황1": {
    #         "운동상태": "등속도 운동",
    #         "전체 질량": "3m",
    #         "알짜힘": "0",
    #         "가속도": "0",
    #         "물체 A 중력": "mg",
    #         "물체 B 중력": "2mg",
    #         "장력": "T"
    #     }
    # },
    # "조건분석": {
    #     "등속도 운동이므로 알짜힘은 0이다. 따라서 상자에 작용하는 중력과 장력은 서로 같고 반대 방향이다. 상자에 작용하는 중력은 (m + 2m)g = 3mg이다. 따라서 장력 T는 3mg이다. 물체 A와 B는 상자 안에 있으므로, A에 작용하는 힘은 중력 mg와 상자가 A를 떠받치는 힘 N_A이다. A는 정지해 있으므로 N_A = mg이다. 물체 B에 작용하는 힘은 중력 2mg와 상자가 B를 떠받치는 힘 N_B이다. B도 정지해 있으므로 N_B = 2mg이다. 상자가 B를 떠받치는 힘 N_B는 A가 B를 누르는 힘 N_A의 2배이다."
    # 	:
    # "Choice_solution"		}
    #    		}"""


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
