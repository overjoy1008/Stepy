# choice 형태 선택하는 함수
choice_format_1 = '    {\r\n        "Choice_solution": {\r\n        "STEP1": "ㄱ_풀이과정"\r\n        "ㄱ_참/거짓": "True/False"  True, False을 판단한다.\r\n        "STEP2": "ㄱ_의 풀이과정을 참고하여 ㄴ 풀이과정을 서술한다."\r\n        "ㄴ_참/거짓": "True/False"  True, False을 판단한다.\r\n        "STEP3": "ㄱ,ㄴ_풀이과정을 참고하여 ㄷ 풀이과정을 서술한다."\r\n        "ㄷ_참/거짓": "True/False"  True, False을 판단한다.\r\n        }\r\n    }'
choice_format_2 = '    {\r\n        "Choice_solution": {\r\n        "STEP1":"",\r\n        "STEP2":"",\r\n        "STEP3":""\r\n        }\r\n    }'
prompt_list = {
    "등가 원리": {
        "field": "등가 원리",
        "detailed field feature": "E=mc^2이라는 식에 대해서 다루며 핵융합, 핵분열 과정, 중성자수, 양성자수, 질량수와 같은 개념을 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "여러 가지 운동": {
        "field": "여러 가지 운동",
        "detailed field feature": "한개 또는 두개의 물체가 속도가 변화하는 여러 상황이 주어진다. 속도, 가속도, 변위를 활용하여 대답한다. 빗면일 경우 두 물체의 가속도는 동일하다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "역학적 에너지 보존": {
        "field": "역학적 에너지 보존",
        "detailed field feature": "탄성 퍼텐셜 에너지, 중력 퍼텐셜 에너지, 운동 에너지에 대해서 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "열역학 법칙": {
        "field": "열역학 법칙",
        "detailed field feature": "열역학 제 1법칙, 제2법칙, PV=nRT를 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "운동량 보존": {
        "field": "운동량 보존",
        "detailed field feature": "여러가지 상황에서 운동량에 대해서 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "작용 반작용 법칙": {
        "field": "작용 반작용 법칙",
        "detailed field feature": "움직이지 않는 물체 사이에서의 상호작용을 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "충격량": {
        "field": "충격량",
        "detailed field feature": "F-t 그래프가 주어지면서 충격력, 충격량, 운동량의 변화량 같은 정보를 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "특수 상대성 이론": {
        "field": "특수 상대성 이론",
        "detailed field feature": "특수 상대성 이론과 관련된, 한 점 동시성, 길이수축, 시간팽창과 같은 개념을 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "힘과 운동": {
        "field": "힘과 운동",
        "detailed field feature": "물체에 힘이 가해졌을 때 F=ma에 의해 가속도가 생기는 상황을 다방면으로 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "전기력": {
        "field": "전기력",
        "detailed field feature": "쿨롱의 법칙을 사용하여 물질 사이의 관계에 대해서 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "수소 원자 모형": {
        "field": "수소 원자 모형",
        "detailed field feature": "수소 원자 모형에서 각 주양자수에 따라서 에너지가 어떻게 변화하는지를 파악한다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "전기 전도성": {
        "field": "전기 전도성",
        "detailed field feature": "물질의 전기전도성에 대해서 다룬다. 도체, 반도체, 절연체가 주어진다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "반도체": {
        "field": "반도체",
        "detailed field feature": "P형 N형 반도체에 대해서 다루며 P-N접합 다이오드의 정류 작용을 활용한다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "자기장": {
        "field": "자기장",
        "detailed field feature": "도선이 만드는 자기장에 대한 문제가 주어진다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "자성체": {
        "field": "자성체",
        "detailed field feature": "강자성체, 반자성체, 상자성체 특징들을 활용하는 문제가 주어진다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "전자기 유도": {
        "field": "전자기 유도",
        "detailed field feature": "자기장 변화에 의해 생기는 전류와 관련된 문제가 주어진다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "파동의 진행과 굴절": {
        "field": "파동의 진행과 굴절",
        "detailed field feature": "파동이 매질이 달라지면서 굴절하는 현상에 대한 문제가 주어진다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "전반사": {
        "field": "전반사",
        "detailed field feature": "전반사가 되기 위한 임계각과 파동의 진행과 굴절을 결합시킨 문제가 주어진다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "전자기파": {
        "field": "전자기파",
        "detailed field feature": "다양한 전자기파가 주어지며 예시를 분석한다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "파동의 간섭": {
        "field": "파동의 간섭",
        "detailed field feature": "보강, 상쇄 간섭이 언제 일어나는지 분석한다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "빛의 이중성": {
        "field": "빛의 이중성",
        "detailed field feature": "빛의 이중성에 대한 내용으로 이중 슬릿 실험, 광전 효과에 대해서 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
    "물질의 이중성": {
        "field": "물질의 이중성",
        "detailed field feature": "물질의 이중성에 관련한 단원으로 드브로이의 물질파에 대해서 다룬다.",
        "Background Knowledge": "",
        "solving strategy": "",
    },
}


def find_choice_format(format):
    if format == "5":
        return choice_format_2
    elif format == "ㄱ,ㄴ,ㄷ":
        return choice_format_1
    else:
        return "error: can't find choice_format"


# prompt 선택하는 함수
def find_prompt(type):
    for key, value in prompt_list.items():
        if key == type:
            return value
        else:
            continue
