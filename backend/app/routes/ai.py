from fastapi import APIRouter, HTTPException
from models import AIRequest, AIResponse, Node
import httpx
import json

router = APIRouter()

SYSTEM_PROMPT = """
You are a project scaffolding generator. Your task is to generate a folder structure based on a user's prompt.
You MUST return ONLY a valid JSON object with the following structure:
{
  "name": "project-name",
  "nodes": [
    {
      "id": "node-1",
      "name": "src",
      "type": "folder",
      "parentId": null
    },
    {
      "id": "node-2",
      "name": "main.py",
      "type": "file",
      "parentId": "node-1"
    }
  ]
}
Rules:
1. 'type' must be either 'folder' or 'file'.
2. 'parentId' must be the 'id' of a folder node or null for root level nodes.
3. Every node MUST have a unique 'id'.
4. Do NOT include any explanations or markdown formatting outside the JSON block.
"""

@router.post("/generate", response_model=AIResponse)
async def generate_structure(req: AIRequest):
    if req.provider == "openai":
        if not req.openai_key:
            raise HTTPException(status_code=400, detail="OpenAI API key is required")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {req.openai_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": req.model or "gpt-3.5-turbo",
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": req.prompt}
                        ],
                        "temperature": 0.7
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return parse_ai_response(content)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")

    elif req.provider == "ollama":
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{req.ollama_url}/api/generate",
                    json={
                        "model": req.model,
                        "prompt": f"{SYSTEM_PROMPT}\n\nUser Prompt: {req.prompt}\n\nJSON Output:",
                        "stream": False,
                        "options": {
                            "temperature": 0.7
                        }
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                data = response.json()
                content = data["response"]
                return parse_ai_response(content)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")
    
    else:
        raise HTTPException(status_code=400, detail="Invalid provider")

def parse_ai_response(content: str):
    # Try to find JSON block if AI included markdown
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        data = json.loads(content)
        return {
            "name": data.get("name", "generated-project"),
            "nodes": [Node(**n) for n in data.get("nodes", [])]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}\nResponse was: {content}")
