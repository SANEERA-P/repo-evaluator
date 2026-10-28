from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import init_db, SessionLocal, EvaluationRecord

app = FastAPI()

@app.on_event("startup")
def startup_event():
    init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Repository Evaluation API is running"}

# 1. Analysis Endpoint with Database Saving Logic
@app.post("/analyze")
def analyze_repository(repo_url: str):
    # (Your existing extraction and AI evaluation code produces these values)
    owner = "example-owner"
    repo = "example-repo"
    overall_score = 85.5
    dimensions = {"Project Structure": 90, "Readability": 80}
    ai_review_text = "The repository is well-organized with clean modular layout."

    # SAVE TO DATABASE
    db = SessionLocal()
    try:
        db_record = EvaluationRecord(
            owner=owner,
            repo=repo,
            overall_score=overall_score,
            dimensions=dimensions,
            ai_review=ai_review_text
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
    finally:
        db.close()

    return {
        "status": "success",
        "saved_id": db_record.id,
        "overall_score": overall_score,
        "dimensions": dimensions,
        "ai_review": ai_review_text
    }

# 2. History Endpoint to Retrieve Past Evaluations
@app.get("/evaluations")
def get_evaluation_history(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Retrieve historical repository evaluation records."""
    records = db.query(EvaluationRecord).order_by(EvaluationRecord.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "total": len(records),
        "evaluations": [
            {
                "id": record.id,
                "owner": record.owner,
                "repo": record.repo,
                "overall_score": record.overall_score,
                "dimensions": record.dimensions,
                "ai_review": record.ai_review,
                "created_at": record.created_at.isoformat()
            }
            for record in records
        ]
    }