import json
import re
import os
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

# --- CORS for embedding ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to restrict origins if needed
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load all dataset files from datasets/ folder ---
DATASET_DIR = "datasets"
if not os.path.exists(DATASET_DIR):
    raise RuntimeError(f"Dataset directory '{DATASET_DIR}' not found. Please create it and add your .json files.")

dataset_files = [
    os.path.join(DATASET_DIR, fname)
    for fname in os.listdir(DATASET_DIR)
    if fname.endswith(".json")
]

questions = []
answers = []
intents = []
tags_list = []
audience_list = []

# For each question, add its answer, intent, tags, audience to parallel lists
for file_path in dataset_files:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for item in data:
        answer = item.get("answer", "")
        intent = item.get("intent", "unknown")
        tags = item.get("tags", [])
        audience = item.get("audience", [])
        for q in item.get("questions", []):
            questions.append(q)
            answers.append(answer)
            intents.append(intent)
            tags_list.append(tags)
            audience_list.append(audience)

if not questions:
    raise RuntimeError("No questions loaded. Please check your dataset files in the 'datasets/' folder.")

# --- Sentence Embedding Model ---
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
question_embeddings = model.encode(questions, convert_to_tensor=True)

session_histories = {}

GREETING_MESSAGE = (
    "Hello! I am Charlie. I am the official chatbot of The Open University of Sri Lanka. How may I assist you?"
)
FALLBACK_MESSAGE = (
    "Sorry! I don't have any idea about what you have asked. Can you rephrase and ask again, or contact the HelpDesk?"
)
GREETING_KEYWORDS = [
    "hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings"
]

def is_greeting(text):
    text = text.strip().lower()
    for kw in GREETING_KEYWORDS:
        # Use word boundaries for single words, or exact match for phrases
        if ' ' in kw:
            if kw == text:
                return True
        else:
            if re.search(r'\b' + re.escape(kw) + r'\b', text):
                return True
    return False

def build_context_message(user_id, user_msg, max_turns=3):
    """
    Concatenate up to the last `max_turns` user messages from the session history,
    then append the current user message.
    """
    history = session_histories.get(user_id, [])
    context = []
    for turn in history[-max_turns:]:
        context.append(f"User: {turn['user']}")
    context.append(f"User: {user_msg}")
    return " ".join(context)

@app.post("/chat")
async def chat(request: Request):
    req_json = await request.json()
    user_id = req_json.get("session_id")
    user_msg = req_json.get("message", "")
    consider_history = req_json.get("consider_history", True)

    print("Received message:", user_msg, "from session:", user_id)
    print("Current history:", session_histories.get(user_id, []))

    # Smart greeting handling
    if is_greeting(user_msg):
        bot_reply = GREETING_MESSAGE
        intent = "greeting"
        tags = []
        audience = []
    else:
        # Build context-aware message only if consider_history is True
        if consider_history:
            context_message = build_context_message(user_id, user_msg)
        else:
            context_message = user_msg
        user_embedding = model.encode([context_message], convert_to_tensor=True)
        cosine_scores = util.pytorch_cos_sim(user_embedding, question_embeddings)[0]
        best_score = float(cosine_scores.max().item())
        idx = int(cosine_scores.argmax().item())

        # Use a threshold for "no match"
        if best_score < 0.60:
            bot_reply = FALLBACK_MESSAGE
            intent = "fallback"
            tags = []
            audience = []
        else:
            bot_reply = answers[idx]
            intent = intents[idx]
            tags = tags_list[idx] if idx < len(tags_list) else []
            audience = audience_list[idx] if idx < len(audience_list) else []

    # Memorize conversation
    if user_id not in session_histories:
        session_histories[user_id] = []
    session_histories[user_id].append({"user": user_msg, "bot": bot_reply})

    return JSONResponse({
        "answer": bot_reply,
        "intent": intent,
        "tags": tags,
        "audience": audience,
        "history": session_histories[user_id]
    })

# --- Embeddable Chat Widget Endpoint ---
@app.get("/widget")
async def widget_page():
    widget_path = os.path.join("static", "widget.html")
    with open(widget_path, "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.get("/embed-chat.js")
async def serve_embed_js():
    # Serve the embeddable JS file (update the path if your static dir is elsewhere)
    js_path = os.path.join("static", "embed-chat.js")
    return FileResponse(js_path, media_type="application/javascript")

# --- Serve static files ---
app.mount("/", StaticFiles(directory="static", html=True), name="static")