from fastapi import FastAPI, File, UploadFile, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import shutil
import os
from get_response import finding_llm, choose_prompt, solver_llm, get_chatgpt_response

app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

# Directory to save uploaded images
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/chattingscreen.html", response_class=HTMLResponse)
async def read_chattingscreen(request: Request):
    return templates.TemplateResponse("chattingscreen.html", {"request": request})


@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    return {"info": f"file '{file.filename}' saved at '{file_location}'"}


@app.post("/finding-llm/")
async def finding_llm_endpoint(request: Request, base64_image: str = Form(None)):
    response = await finding_llm(base64_image)
    return JSONResponse({"response": response})


@app.post("/choose-prompt/")
async def choose_prompt_endpoint(problem_type: str = Form(...)):
    prompt = choose_prompt(problem_type)
    return JSONResponse({"prompt": prompt})


@app.post("/solver-llm/")
async def solver_llm_endpoint(
    request: Request, base64_image: str = Form(None), solver_llm_prompt: str = Form(...)
):
    response = await solver_llm(base64_image, solver_llm_prompt)
    return JSONResponse({"response": response})


@app.post("/get-chatgpt-response/")
async def get_chatgpt_response_endpoint(
    request: Request,
    base64_image: str = Form(None),
    chat_history: list = Form(...),
):
    response = await get_chatgpt_response(base64_image, chat_history)
    return JSONResponse({"response": response})
