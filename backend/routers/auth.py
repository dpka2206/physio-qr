from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from models import UserRegister, UserLogin
from auth import get_current_doctor_id

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: UserRegister):
    try:
        res = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        # Insert into doctors table
        # We assume RLS is set up, but we use server-side service key so it bypasses RLS
        # Or if doctors insert RLS policy is (auth.uid() = id), service key can insert anyway.
        supabase.table("doctors").insert({
            "id": res.user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "clinic_name": user.clinic_name,
            "clinic_address": user.clinic_address,
            "city": user.city,
            "license_no": user.license_no,
            "specialisation": user.specialisation
        }).execute()
        response_data = {"message": "User registered successfully", "user_id": res.user.id}
        if res.session and res.session.access_token:
            response_data["access_token"] = res.session.access_token
        return response_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user: UserLogin):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        return {
            "access_token": res.session.access_token,
            "user": res.user
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
def logout():
    # True token invalidation requires Supabase server signout using tracking or client-side wipe
    # For now, we return success so the client can drop the token locally.
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_me(doctor_id: str = Depends(get_current_doctor_id)):
    try:
        res = supabase.table("doctors").select("*").eq("id", doctor_id).single().execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
