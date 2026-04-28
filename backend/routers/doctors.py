from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from database import supabase
from models import DoctorProfileUpdate
from auth import get_current_doctor_id
import uuid

router = APIRouter(prefix="/doctors", tags=["doctors"])

@router.get("/profile")
def get_profile(doctor_id: str = Depends(get_current_doctor_id)):
    try:
        res = supabase.table("doctors").select("*").eq("id", doctor_id).single().execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

@router.patch("/profile")
def update_profile(data: DoctorProfileUpdate, doctor_id: str = Depends(get_current_doctor_id)):
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return {"message": "No changes requested"}
    try:
        res = supabase.table("doctors").update(update_data).eq("id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Update failed")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logo")
async def upload_logo(file: UploadFile = File(...), doctor_id: str = Depends(get_current_doctor_id)):
    try:
        file_ext = file.filename.split(".")[-1]
        file_name = f"{doctor_id}_{uuid.uuid4()}.{file_ext}"
        
        file_content = await file.read()
        res = supabase.storage.from_("logos").upload(
            file_name,
            file_content,
            {"content-type": file.content_type}
        )
        
        # Get public URL
        url_res = supabase.storage.from_("logos").get_public_url(file_name)
        
        # Update doctor table
        update_res = supabase.table("doctors").update({"logo_url": url_res}).eq("id", doctor_id).execute()
        
        return {"logo_url": url_res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
