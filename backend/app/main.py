from fastapi import FastAPI
from db import init_db
from fastapi.middleware.cors import CORSMiddleware
from routes import templates, tags, structure, folder, ai

app = FastAPI(title="Boil-it Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(templates.router, prefix="/api/templates")
app.include_router(tags.router, prefix="/api/tags")
app.include_router(structure.router, prefix="/api/structure")
app.include_router(folder.router, prefix="/api/folder")
app.include_router(ai.router, prefix="/api/ai")

