# 🎓 KTU AI Tutor

An AI-powered tutoring platform designed for Kerala Technological University (KTU) students. The application allows students to ask academic questions and receive intelligent, context-aware responses using AI.

## 🌐 Live Demo

🔗 https://ktu-ai-tutor.onrender.com/

---

## ✨ Features

- 🤖 AI-powered question answering
- 📚 KTU syllabus-focused assistance
- 💬 Interactive chatbot interface
- ⚡ Fast and responsive web application
- 🌍 Accessible from any device
- 🔒 Secure backend API integration

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python 3.11
- FastAPI
- Uvicorn

### AI
- OpenAI API

### Deployment
- Render

---

## 📂 Project Structure

```
ktu-ai-tutor/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── ...
│
├── render.yaml
├── README.md
└── .gitignore
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ktu-ai-tutor.git
```

### 2. Navigate to the project

```bash
cd ktu-ai-tutor
```

### 3. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
OPENAI_API_KEY=your_openai_api_key
```

---

## ▶️ Running Locally

Start the FastAPI server:

```bash
uvicorn backend.main:app --reload
```

Open your browser:

```
http://127.0.0.1:8000
```

---

## 🚀 Deployment

This project is deployed on **Render**.

Deployment uses:

- Python 3.11
- FastAPI
- Uvicorn
- `render.yaml`

---

## 📸 Screenshots

Add screenshots of:

- Home Page
- Chat Interface
- AI Responses
- Mobile View (Optional)

Example:

```
screenshots/
├── home.png
├── chat.png
└── mobile.png
```

---

## 📖 Usage

1. Open the application.
2. Type your academic question.
3. Submit your query.
4. Receive an AI-generated response.
5. Continue the conversation for further clarification.

---

## 🔮 Future Enhancements

- User authentication
- Semester-wise subject selection
- Previous year question paper support
- Voice input
- Chat history
- PDF notes generation
- Dark mode
- Multi-language support

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push the branch.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Adhil**

GitHub:
https://github.com/YOUR_USERNAME

---

## 🙏 Acknowledgements

- OpenAI
- FastAPI
- Uvicorn
- Render
- Kerala Technological University (KTU)

---

⭐ If you found this project useful, consider giving it a star on GitHub!
