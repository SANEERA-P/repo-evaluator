import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from the .env file
load_dotenv()

def generate_ai_review(repo_url: str, overall_score: int, dimensions: dict, file_summary: str) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"review": "AI review unavailable: OPENAI_API_KEY is not set in environment variables."}

    try:
        # Initialize the modern OpenAI client
        client = OpenAI(api_key=api_key)

        prompt = (
            f"Analyze the following GitHub repository based on its evaluation metrics:\n"
            f"Repository: {repo_url}\n"
            f"Overall Score: {overall_score}/100\n"
            f"Dimensions: {dimensions}\n"
            f"File Summary:\n{file_summary}\n\n"
            f"Provide a concise qualitative review including key strengths, areas for improvement, and a final recommendation."
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert senior code reviewer and software architect."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.7
        )

        review_text = response.choices[0].message.content.strip()
        return {"review": review_text}

    except Exception as e:
        return {"review": f"AI review unavailable: {str(e)}"}