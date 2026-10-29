AI-Powered Repository Analysis App — Project Documentation
1. Project Objectives, Scope, and Key Features
Objective: To build an automated, AI-driven code evaluation platform that inspects GitHub repositories and provides standardized, objective feedback on code organization, structure, and maintainability.

Scope: Focused on delivering an end-to-end web application featuring a modern frontend dashboard, a high-performance backend analysis engine, and secure integration with LLMs and GitHub data sources.

Key Features:

Input Portal: Clean UI for entering any public GitHub repository URL.

5-Dimension Weighted Scoring Engine: Automated breakdown of Project Structure, Folder Organisation, Naming Conventions, Readability, and Maintainability.

AI Qualitative Reviews: Custom prompt-engineered OpenAI integration generating repository-specific architectural insights, strengths, weaknesses, and recommendations.

Client-Ready Reporting: Interactive dashboard cards paired with browser-native PDF export functionality.

2. Proposed Application Workflow & System Architecture
User Initiation: The user pastes a GitHub repository URL into the Next.js frontend interface.

Data Extraction: The FastAPI backend receives the request, parses the repository, and fetches file trees and metadata via the GitHub API.

AI Evaluation & Scoring: The analysis engine processes the codebase structure and feeds structured summaries into the OpenAI API using domain-specific prompt engineering.

Result Rendering: The computed weighted scores, qualitative reviews, and recommendations are returned to the frontend.

Export: The user views the dynamic dashboard or triggers a native print command to export a clean PDF evaluation report.

3. Technology Stack
Frontend: Next.js (React Framework), TypeScript, Tailwind CSS, responsive print media styles.

Backend: Python, FastAPI, Uvicorn (ASGI server).

AI Integration: OpenAI API (GPT models with custom system prompts for technical auditing).

Version Control: Git & GitHub (repo-evaluator).

4. GitHub API Integration & Data Extraction
Securely parses target repository URLs to extract owner and repository names.

Fetches repository directory structures, file paths, and key configuration files to assess structural design and modularity without downloading massive binary assets.

5. Evaluation Methodology & Scoring Criteria
The evaluation system grades repositories across five weighted dimensions (totaling 100%):

Project Structure (25%): Evaluates top-level file organization, separation of concerns (backend/frontend separation, config isolation).

Folder Organisation (20%): Assesses logical grouping, directory nesting depth, and navigation ease.

Naming Conventions (15%): Checks consistency in file naming, directory naming, and code-level identifiers.

Readability (20%): Measures code clarity, commenting standards, and interpretability.

Maintainability (20%): Analyzes modularity, extensibility, and readiness for future debugging and scale.

6. Expected Inputs, Outputs, and Report Format
Input: Valid public GitHub repository URL ([https://github.com/owner/repo](https://github.com/owner/repo)).

Output:

Overall weighted score (0–100).

5-dimension breakdown score cards.

Bulleted lists of strengths and structural weaknesses.

Actionable code improvement recommendations.

Formatted downloadable PDF report.

7. One-Week Implementation Timeline
Day 1: Requirements analysis, architectural design, and repository scaffolding (FastAPI + Next.js setup).

Days 2–3: Backend routing, GitHub repository parsing logic, and initial data extraction tests.

Days 4–5: OpenAI API integration, prompt engineering for qualitative reviews, and dynamic 5-dimension weighted scoring algorithm implementation.

Day 6: Frontend UI development, interactive score cards, and CSS print media styling for PDF exports.

Day 7: End-to-end testing, error handling refinement, bug fixes, and final documentation.

8. Testing, Validation, and Error-Handling
Robust Exception Handling: Gracefully handles invalid URLs, private or non-existent repositories, API rate limits, and empty or unsupported directory trees.

Input Validation: Client-side and server-side validation checks ensuring malformed inputs return clear, user-friendly error messages rather than crashing.

9. Expected Challenges & Solutions
Challenge: Handling large repository token limits when passing code to the LLM.

Solution: Summarizing file trees and targeting key structural files/metadata rather than dumping entire binary or redundant codebases into the prompt window.

Challenge: Ensuring consistent score formatting from AI outputs.

Solution: Combining programmatic mathematical weighting (for the 5 core dimensions) with qualitative LLM feedback to ensure scores remain mathematically sound and consistent.
