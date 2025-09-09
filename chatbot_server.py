import json
import re
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

# --- Load all dataset files ---
DATASET_DIR = "datasets"
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

for file_path in dataset_files:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for item in data:
        intents.append(item.get("intent", "unknown"))
        answers.append(item.get("answer", ""))
        tags_list.append(item.get("tags", []))
        audience_list.append(item.get("audience", []))
        # For each question in this item, add to the lists
        for q in item.get("questions", []):
            questions.append(q)

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

app.mount("/", StaticFiles(directory="static", html=True), name="static")