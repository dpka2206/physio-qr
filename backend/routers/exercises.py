from fastapi import APIRouter, Depends, HTTPException, Query
from database import supabase
from models import ExerciseCreate, YouTubeFetchRequest
from auth import get_current_doctor_id
from typing import Optional
import httpx

router = APIRouter(prefix="/exercises", tags=["exercises"])

@router.get("")
def list_exercises(body_part: Optional[str] = None, q: Optional[str] = None, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        query = supabase.table("exercises").select("*").or_(f"created_by.is.null,created_by.eq.{doctor_id}")
        if body_part:
            query = query.eq("body_part", body_part)
        if q:
            query = query.ilike("name", f"%{q}%")
        
        # To avoid massive payload if unrestricted, add limit if necessary. 
        # supabase queries default to 1000 items.
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("")
def create_exercise(data: ExerciseCreate, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        ex_data = data.model_dump()
        ex_data["created_by"] = doctor_id
        res = supabase.table("exercises").insert(ex_data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/fetch-yt")
async def fetch_youtube_data(data: YouTubeFetchRequest):
    url = f"https://www.youtube.com/oembed?url={data.url}&format=json"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                 raise HTTPException(status_code=400, detail="Invalid YouTube URL")
            yt_data = resp.json()
            return {
                "title": yt_data.get("title", ""),
                "thumbnail_url": yt_data.get("thumbnail_url", "")
            }
        except httpx.RequestError as exc:
            raise HTTPException(status_code=400, detail=f"Request to YouTube failed: {exc}")
