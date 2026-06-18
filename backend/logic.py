"""
KTU AI Tutor - Logic Module
============================
All AI logic preserved from original ai_tutor.py.
LangGraph, Groq (LLaMA 3.1), and BeautifulSoup intact.
Gradio removed — this module is now backend-only.
"""

import os
import requests
from bs4 import BeautifulSoup
from typing import TypedDict
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

# ==============================
# STEP 1: SCRAPE KTU NOTES
# ==============================

_ktu_notes_cache = None


def scrape_ktu_notes():
    global _ktu_notes_cache
    if _ktu_notes_cache is not None:
        return _ktu_notes_cache
    try:
        url = "https://www.ktunotes.in/ktu-2024-scheme-notes/"
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        notes = []
        for link in soup.find_all("a"):
            title = link.text.strip()
            href = link.get("href")
            if href and ("module" in title.lower() or "note" in title.lower()):
                notes.append({"title": title, "link": href})
        _ktu_notes_cache = notes
        print(f"Collected {len(notes)} KTU notes")
        return notes
    except Exception as e:
        print(f"Warning: Could not scrape KTU notes: {e}")
        _ktu_notes_cache = []
        return []


# ==============================
# STEP 2: SETUP LLM (lazy init)
# ==============================

_llm = None
_tutor_app = None


def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0
        )
    return _llm


# ==============================
# STEP 3: DEFINE AGENTS
# ==============================

class TutorState(TypedDict):
    question: str
    plan: str
    route: str
    answer: str


def planner_agent(state):
    q = state["question"]
    prompt = f"""
Create a short plan to answer this student's question.

Question: {q}

Plan should describe what steps should be taken.
"""
    plan = get_llm().invoke(prompt).content
    return {"plan": plan}


def router_agent(state):
    q = state["question"].lower()
    prompt = f"""
Decide which agent should answer the question.

Options:
notes
tutor
practice
planner
quiz

Question: {q}

Return only one word.
"""
    decision = get_llm().invoke(prompt).content.lower()

    if "note" in decision:
        route = "notes"
    elif "practice" in decision:
        route = "practice"
    elif "plan" in decision or "study" in decision:
        route = "planner"
    elif "quiz" in decision or "question" in decision:
        route = "quiz"
    else:
        route = "tutor"

    return {"route": route}


def notes_agent(state):
    ktu_notes = scrape_ktu_notes()
    context = ""
    for note in ktu_notes[:10]:
        context += f"{note['title']} : {note['link']}\n"

    prompt = f"""
Student Question:
"{state['question']}"

Use the notes list below to recommend study resources.

Notes:
{context}
"""
    answer = get_llm().invoke(prompt).content
    return {"answer": answer}


def tutor_agent(state):
    prompt = f"""
Explain this concept clearly for a KTU CSE student.

Question:
{state['question']}

Give a simple explanation with examples.
"""
    answer = get_llm().invoke(prompt).content
    return {"answer": answer}


def practice_agent(state):
    prompt = f"""
Generate 5 practice questions for this topic:

{state['question']}
"""
    answer = get_llm().invoke(prompt).content
    return {"answer": answer}


def study_planner_agent(state):
    prompt = f"""
Create a 7 day study plan for this topic for a KTU CSE student.

Topic:
{state['question']}

Include daily goals.
"""
    answer = get_llm().invoke(prompt).content
    return {"answer": answer}


def quiz_agent(state):
    prompt = f"""
Generate a small quiz for this topic.

Topic:
{state['question']}

Create:
• 5 MCQ questions
• 4 options each
• give correct answers
"""
    answer = get_llm().invoke(prompt).content
    return {"answer": answer}


# ==============================
# STEP 4: BUILD LANGGRAPH (lazy)
# ==============================

def get_tutor_app():
    global _tutor_app
    if _tutor_app is None:
        graph = StateGraph(TutorState)

        graph.add_node("planner", planner_agent)
        graph.add_node("router", router_agent)
        graph.add_node("notes", notes_agent)
        graph.add_node("tutor", tutor_agent)
        graph.add_node("practice", practice_agent)
        graph.add_node("study_planner", study_planner_agent)
        graph.add_node("quiz", quiz_agent)

        graph.set_entry_point("planner")
        graph.add_edge("planner", "router")

        graph.add_conditional_edges(
            "router",
            lambda state: state["route"],
            {
                "notes": "notes",
                "tutor": "tutor",
                "practice": "practice",
                "planner": "study_planner",
                "quiz": "quiz"
            }
        )

        graph.add_edge("notes", END)
        graph.add_edge("tutor", END)
        graph.add_edge("practice", END)
        graph.add_edge("study_planner", END)
        graph.add_edge("quiz", END)

        _tutor_app = graph.compile()
    return _tutor_app


# ==============================
# STEP 5: PUBLIC API FUNCTION
# ==============================

AGENT_LABELS = {
    "notes": "Notes Finder",
    "tutor": "AI Tutor",
    "practice": "Practice Generator",
    "planner": "Study Planner",
    "quiz": "Quiz Generator",
}


def ask_tutor(question: str) -> dict:
    """
    Run the LangGraph tutor pipeline for a given question.
    Returns dict with 'answer' and 'agent_used'.
    """
    result = get_tutor_app().invoke({"question": question})
    route = result.get("route", "tutor")
    return {
        "answer": result["answer"],
        "agent_used": AGENT_LABELS.get(route, "AI Tutor"),
    }
