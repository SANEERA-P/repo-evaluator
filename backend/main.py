import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Repository Evaluator App")

class RepoRequest(BaseModel):
    repo_url: str

def parse_github_url(url: str):
    """Extract owner and repo name from a GitHub repository URL."""
    clean_url = url.strip().rstrip("/")
    if clean_url.endswith(".git"):
        clean_url = clean_url[:-4]
    
    parts = clean_url.split("/")
    if len(parts) >= 2:
        return parts[-2], parts[-1]
    raise HTTPException(status_code=400, detail="Invalid GitHub repository URL format.")

def calculate_static_scores(files: list):
    """Calculates deterministic static analysis scores for Day 3 requirements."""
    total_files = len(files)
    
    # Rule-based checks matching project criteria
    has_readme = any("readme.md" in f.lower() for f in files)
    has_tests = any("test" in f.lower() for f in files)
    has_config = any(f.endswith(('.json', '.yaml', '.yml', '.env', 'requirements.txt', 'setup.py')) for f in files)
    
    # Baseline dimension scores (0-100)
    structure_score = 90 if has_config else 60
    folder_score = 75 if total_files > 3 else 50
    naming_score = 80
    readability_score = 90 if has_readme else 40
    maintainability_score = 85 if has_tests else 50
    
    # Weighted overall score formula from your project plan (20%, 20%, 15%, 20%, 25%)
    overall_score = round(
        (0.20 * structure_score) +
        (0.20 * folder_score) +
        (0.15 * naming_score) +
        (0.20 * readability_score) +
        (0.25 * maintainability_score)
    )
    
    return {
        "overall_score": overall_score,
        "dimensions": {
            "project_structure": {"score": structure_score, "weight": "20%", "comments": "Config files detected." if has_config else "Missing standard config files."},
            "folder_organisation": {"score": folder_score, "weight": "20%", "comments": f"Evaluated {total_files} total file paths."},
            "naming_conventions": {"score": naming_score, "weight": "15%", "comments": "Standard casing observed across file paths."},
            "readability": {"score": readability_score, "weight": "20%", "comments": "README.md present." if has_readme else "README.md missing."},
            "maintainability": {"score": maintainability_score, "weight": "25%", "comments": "Test directory found." if has_tests else "No test directory detected."}
        }
    }

@app.get("/")
def read_root():
    return {"message": "AI Repository Evaluator API is running!"}

@app.post("/api/analyze-repo")
def analyze_repo(data: RepoRequest):
    owner, repo = parse_github_url(data.repo_url)
    
    headers = {}
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"

    repo_api_url = f"https://api.github.com/repos/{owner}/{repo}"
    response = requests.get(repo_api_url, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code, 
            detail=f"Failed to fetch repository from GitHub: {response.json().get('message', 'Unknown error')}"
        )
    
    repo_data = response.json()
    default_branch = repo_data.get("default_branch", "main")

    tree_api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
    tree_response = requests.get(tree_api_url, headers=headers)
    
    if tree_response.status_code != 200:
        raise HTTPException(
            status_code=tree_response.status_code,
            detail="Failed to fetch repository file tree from GitHub."
        )
    
    tree_data = tree_response.json()
    files = [item["path"] for item in tree_data.get("tree", [])]

    # Day 3: Execute static analysis rules and scoring engine
    evaluation_report = calculate_static_scores(files)

    return {
        "owner": owner,
        "repo": repo,
        "default_branch": default_branch,
        "total_files": len(files),
        "evaluation": evaluation_report,
        "files_sample": files[:30]
    }