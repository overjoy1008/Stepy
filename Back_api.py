import uuid
import openai
import os
from openai import OpenAI
import json
import base64
from io import BytesIO
import pinecone
from pinecone import Pinecone

# 환경 변수에서 API 키를 가져오기
OPENAI_API_KEY = "sk-proj-HAFw52uWdPtfGO0vs9NCT3BlbkFJ5oV2aHmScKBXuaagZz2J"
PINECONE_API_KEY = "24f0a98a-3a9d-4078-b894-e94e7e13caa0"
# openai.api_key에 API 키를 설정합니다.
openai.api_key = OPENAI_API_KEY

# 언어 모델 초기화
# llm = OpenAI(temperature=0.7)
client = OpenAI(api_key=OPENAI_API_KEY)
api_key = OPENAI_API_KEY
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
        contexts += match["metadata"]["problem"] + match["metadata"]["solution"]
        RAG_value = match["metadata"]["solution"]
    return RAG_value
