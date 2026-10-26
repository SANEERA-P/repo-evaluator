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

    return {
        "owner": owner,
        "repo": repo,
        "default_branch": default_branch,
        "total_files": len(files),
        "files_sample": files[:30]
    }