from fastapi import APIRouter, Depends, HTTPException, Query
from database import supabase
from models import PatientCreate, PatientUpdate
from auth import get_current_doctor_id
from typing import Optional

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("")
def list_patients(q: Optional[str] = None, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        query = supabase.table("patients").select("*").eq("doctor_id", doctor_id).eq("is_active", True)
        if q:
            query = query.ilike("full_name", f"%{q}%")
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("")
def create_patient(data: PatientCreate, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        patient_data = data.model_dump()
        patient_data["doctor_id"] = doctor_id
        res = supabase.table("patients").insert(patient_data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{patient_id}")
def get_patient(patient_id: str, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        pat_res = supabase.table("patients").select("*").eq("id", patient_id).eq("doctor_id", doctor_id).single().execute()
        presc_res = supabase.table("prescriptions").select("*").eq("patient_id", patient_id).execute()
        
        patient = pat_res.data
        patient["prescriptions"] = presc_res.data
        return patient
    except Exception as e:
        raise HTTPException(status_code=404, detail="Patient not found or unauthorized")

@router.patch("/{patient_id}")
def update_patient(patient_id: str, data: PatientUpdate, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return {"message": "No changes"}
        res = supabase.table("patients").update(update_data).eq("id", patient_id).eq("doctor_id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Update failed")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{patient_id}")
def delete_patient(patient_id: str, doctor_id: str = Depends(get_current_doctor_id)):
    try:
        res = supabase.table("patients").update({"is_active": False}).eq("id", patient_id).eq("doctor_id", doctor_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Delete failed")
        return {"message": "Patient archived successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
