import openai
from openai import OpenAI
from io import BytesIO
import pinecone
from pinecone import Pinecone

# API KEY를 환경변수로 관리하기 위한 설정 파일
import os
from dotenv import load_dotenv

# API KEY 정보로드
load_dotenv()

# Get API keys from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# 언어 모델 초기화
# llm = OpenAI(temperature=0.7)
client = OpenAI(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index("problem")


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


def gpt_with_context(chat_history_list):
    response = client.chat.completions.create(
        model="gpt-4o-2024-05-13",
        messages=chat_history_list,
        max_tokens=4000,
        temperature=0,
        top_p=0,
    )
    return response.choices[0].message.content


def find_RAG(problem_description):
    response = client.embeddings.create(
        input=problem_description, model="text-embedding-3-small"
    )
    query_embeddings = response.data[0].embedding
    retrieved_chunks = index.query(
        namespace="holymoly",
        vector=query_embeddings,
        top_k=1,
        include_values=False,
        include_metadata=True,
    )
    contexts = ""
    for idx, match in enumerate(retrieved_chunks.matches):
        RAG_value = {"solution": match["metadata"]["solution"], "score": match["score"]}
    return RAG_value
