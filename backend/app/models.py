from pydantic import BaseModel
from typing import List, Optional

class Node(BaseModel):
    id: str
    name: str
    type: str
    parentId: Optional[str] = None

class CreateStructureRequest(BaseModel):
    outputPath: str
    nodes: List[Node]

class TemplateIn(BaseModel):
    name: str
    tags: List[str]
    structure: List[Node]

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    tags: Optional[List[str]] = None

class TagCreate(BaseModel):
    tag: str

class PathRequest(BaseModel):
    path: str

class AIRequest(BaseModel):
    prompt: str
    provider: str  # "openai" or "ollama"
    model: str
    openai_key: Optional[str] = None
    ollama_url: Optional[str] = "http://localhost:11434"

class AIResponse(BaseModel):
    nodes: List[Node]
    name: str