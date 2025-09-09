# OUSL Chatbot - FastAPI

Charlie is the official chatbot of The Open University of Sri Lanka, built using FastAPI (Python) and Sentence Transformers for semantic Q&A. It supports multiple Q&A datasets and serves an interactive web widget frontend.

---

## Features

- **Semantic Q&A Search** using [Sentence Transformers](https://www.sbert.net/)
- **Multi-file Q&A dataset loading** (`datasets/` folder)
- **Session-based chat history**
- **Modern, responsive chat widget UI**
- **URL and YouTube preview in chat bubbles**
- **Easy extensibility for more datasets, tags, and audience targeting**

---

## Folder Structure

```
your_project/
│
├── chatbot_server.py           # FastAPI backend server
├── static/                     # Frontend files (HTML/CSS/JS)
│   ├── index.html
│   ├── chat.js
│   └── styles.css
└── datasets/                   # All Q&A datasets (JSON files)
    ├── qa_dataset.json
    ├── another_dataset.json
    └── more_file.json
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/your_project.git
cd your_project
```

### 2. Prepare Python Environment

It's recommended to use a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install fastapi uvicorn sentence-transformers
```

> **Note:** The first run of `sentence-transformers` may download model weights.

### 4. Add/Prepare Dataset Files

- Place all your Q&A dataset files (in the new extended format) inside the `datasets/` folder.
- Each file should be valid JSON, following this structure:

```json
[
  {
    "intent": "about_ousl",
    "tags": ["ousl", "srilanka", ...],
    "audience": ["public", "staff", "students"],
    "questions": [ ... ],
    "answer": "..."
  },
  ...
]
```

### 5. Run the FastAPI Server

```bash
uvicorn chatbot_server:app --reload
```

- By default, the server will be accessible at: [http://localhost:8000](http://localhost:8000)

### 6. Access the Chatbot Web UI

- Open your browser and go to: [http://localhost:8000](http://localhost:8000)
- You should see the Charlie chatbot widget.
- Try asking questions about OUSL!

---

## Adding New Q&A Datasets

1. Create a new JSON file in the `datasets/` folder.
2. Use the same format as above, including `intent`, `tags`, `audience`, `questions`, and `answer`.
3. Restart the FastAPI server to reload new datasets.

---

## Customizing the Chat UI

- Edit files in `static/` for HTML (`index.html`), JS (`chat.js`), and CSS (`styles.css`).
- The widget auto-loads and shows in the bottom-right of the page.

---

## Troubleshooting

- **Model Download Issues:** If Sentence Transformers fails, check your internet connection and Python version.
- **Dataset Issues:** Ensure all JSON files in `datasets/` are valid and use UTF-8 encoding.
- **Port Conflicts:** Change the port in the `uvicorn` command if needed (e.g. `--port 8080`).

---

## License

This project is for educational purposes at The Open University of Sri Lanka.

---

## Credits

- [FastAPI](https://fastapi.tiangolo.com/)
- [Sentence Transformers](https://www.sbert.net/)
- [FontAwesome](https://fontawesome.com/) (for icons)