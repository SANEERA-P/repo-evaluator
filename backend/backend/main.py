import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from ai_service import generate_ai_review

# Load environment variables (OPENAI_API_KEY) from .env
load_dotenv()

app = FastAPI(
    title="RP2 Repository Evaluation Agent",
    description="Analyzes GitHub repositories using static metrics and OpenAI qualitative code reviews.",
    version="1.0.0"
)

# Request model for Swagger UI / API body
class RepoAnalysisRequest(BaseModel):
    repo_url: str

@app.get("/")
def root():
    return {"message": "RP2 Evaluation Agent API is running!"}

@app.post("/api/analyze-repo")
def analyze_repository(request: RepoAnalysisRequest):
    if not request.repo_url:
        raise HTTPException(status_code=400, detail="Repository URL is required.")

    # Simulated/calculated static analysis scores from Days 1-3
    overall_score = 85
    dimensional_scores = {
        "Maintainability": 88,
        "Documentation": 80,
        "Test Coverage": 82,
        "Code Complexity": 90
    }
    file_tree_text = "src/\n  main.py\n  utils.py\n  models/\n  tests/\n  README.md"

    # Day 4: Generate AI Review using ai_service.py
    ai_result = generate_ai_review(
        repo_url=request.repo_url,
        overall_score=overall_score,
        dimensions=dimensional_scores,
        file_summary=file_tree_text
    )

    return {
        "repo_url": request.repo_url,
        "overall_score": overall_score,
        "dimensions": dimensional_scores,
        "ai_review_status": ai_result["status"],
        "ai_review": ai_result["review"]
    }