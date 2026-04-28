from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from models import PrescriptionCreate, PrescriptionUpdate
from auth import get_current_doctor_id
from config import settings
from typing import Optional
import httpx
import qrcode
import io

router = APIRouter(prefix="", tags=["prescriptions"])

async def fetch_yt_oembed(url: str):
    try:
        api_url = f"https://www.youtube.com/oembed?url={url}&format=json"
        async with httpx.AsyncClient() as client:
            resp = await client.get(api_url)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("title", ""), data.get("thumbnail_url", "")
    except:
        pass
    return "", ""

def generate_qr_and_upload(prescription_id: str) -> str:
    public_url = f"{settings.FRONTEND_URL}/rx/{prescription_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(public_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    file_name = f"{prescription_id}.png"
    try:
        supabase.storage.from_("qrcodes").upload(file_name, img_bytes, {"content-type": "image/png", "upsert": "true"})
    except Exception as e:
        print("Upload failed via insertion", e)
        try:
            supabase.storage.from_("qrcodes").update(file_name, img_bytes, {"content-type": "image/png"})
        except Exception as ex:
            print("Upload failed via update", ex)
            
    qr_url = supabase.storage.from_("qrcodes").get_public_url(file_name)
    return qr_url, public_url

@router.get("/prescriptions")
def list_prescriptions(patient_id: Optional[str] = None, status: Optional[str] = None, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        query = supabase.table("prescriptions").select("*").eq("doctor_id", doctor_id)
        if patient_id:
            query = query.eq("patient_id", patient_id)
        if status:
            query = query.eq("status", status)
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/prescriptions")
def create_prescription(data: PrescriptionCreate, doctor_id: str = Depends(get_current_doctor_id)):
    presc_data = {
        "doctor_id": doctor_id,
        "patient_id": data.patient_id,
        "title": data.title,
        "notes": data.notes,
        "status": "active"
    }
    if data.valid_until:
        presc_data["valid_until"] = str(data.valid_until)
        
    try:
        res_p = supabase.table("prescriptions").insert(presc_data).execute()
        new_p = res_p.data[0]
        p_id = new_p["id"]
        
        qr_url, public_url = generate_qr_and_upload(p_id)
        supabase.table("prescriptions").update({"qr_url": qr_url, "public_url": public_url}).eq("id", p_id).execute()
        new_p["qr_url"] = qr_url
        new_p["public_url"] = public_url
        
        ex_inserts = []
        for ex in data.exercises:
            ex_insert = {
                "prescription_id": p_id,
                "exercise_id": ex.exercise_id,
                "order_index": ex.order_index,
                "sets": ex.sets,
                "reps": ex.reps,
                "duration_seconds": ex.duration_seconds,
                "yt_url": ex.yt_url,
                "doctor_note": ex.doctor_note
            }
            ex_inserts.append(ex_insert)
            
        if ex_inserts:
            supabase.table("prescription_exercises").insert(ex_inserts).execute()
            
        full_res = supabase.table("prescription_exercises").select("*, exercises(*)").eq("prescription_id", p_id).execute()
        new_p["exercises"] = full_res.data
        return new_p
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/prescriptions/{id}")
def get_prescription(id: str, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        p_res = supabase.table("prescriptions").select("*").eq("id", id).eq("doctor_id", doctor_id).single().execute()
        ex_res = supabase.table("prescription_exercises").select("*, exercises(*)").eq("prescription_id", id).order("order_index").execute()
        p = p_res.data
        p["exercises"] = ex_res.data
        return p
    except:
        raise HTTPException(status_code=404, detail="Prescription not found")

@router.patch("/prescriptions/{id}")
def update_prescription(id: str, data: PrescriptionUpdate, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        update_data = data.model_dump(exclude_unset=True)
        exercises = update_data.pop("exercises", None)
        
        if update_data:
            res = supabase.table("prescriptions").update(update_data).eq("id", id).eq("doctor_id", doctor_id).execute()
            if not res.data:
                raise HTTPException(status_code=404, detail="Prescription not found")
            
        if exercises is not None:
             supabase.table("prescription_exercises").delete().eq("prescription_id", id).execute()
             ex_inserts = []
             for ex in exercises:
                 ex_insert = ex.copy()
                 ex_insert["prescription_id"] = id
                 ex_inserts.append(ex_insert)
             if ex_inserts:
                 supabase.table("prescription_exercises").insert(ex_inserts).execute()
                 
        return {"message": "Updated successfully"}
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))

@router.delete("/prescriptions/{id}")
def delete_prescription(id: str, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        res = supabase.table("prescriptions").update({"status": "archived"}).eq("id", id).eq("doctor_id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Delete failed")
        return {"message": "Prescription archived"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/prescriptions/{id}/qr")
def regenerate_qr(id: str, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        p_res = supabase.table("prescriptions").select("id").eq("id", id).eq("doctor_id", doctor_id).single().execute()
        qr_url, public_url = generate_qr_and_upload(id)
        supabase.table("prescriptions").update({"qr_url": qr_url, "public_url": public_url}).eq("id", id).execute()
        return {"qr_url": qr_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/rx/{id}")
def get_public_rx(id: str):
    try:
        p_res = supabase.table("prescriptions").select("*, doctors(full_name, clinic_name, logo_url), patients(full_name)").eq("id", id).single().execute()
        ex_res = supabase.table("prescription_exercises").select("*, exercises(*)").eq("prescription_id", id).order("order_index").execute()
        p = p_res.data
        p["exercises"] = ex_res.data
        return p
    except Exception as e:
        raise HTTPException(status_code=404, detail="Prescription not found")
