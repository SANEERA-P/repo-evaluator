import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from the .env file
load_dotenv()

def generate_ai_review(repo_url: str, overall_score: int, dimensions: dict, file_summary: str) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"review": "AI review unavailable: OPENAI_API_KEY is not set in environment variables."}

    prompt = f"""
    You are an expert software architect. Analyze the following GitHub repository metrics:
    - Repository: {repo_url}
    - Overall Maintainability Score: {overall_score}/100
    - Dimensional Scores: {dimensions}
    - File Tree Summary: {file_summary[:1000]}...

    Provide a concise code quality review containing:
    1. Key Strengths (bullet points)
    2. Areas for Improvement (bullet points)
    3. Final Recommendation (1-2 sentences)
    
    Keep it professional, constructive, and developer-friendly.
    """

    try:
        # Initialize the modern OpenAI client
        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=400
        )
        
        ai_feedback = response.choices[0].message.content.strip()
        return {"status": "success", "review": ai_feedback}
        
    except Exception as e:
        return {"status": "error", "review": f"AI review unavailable: {str(e)}"}