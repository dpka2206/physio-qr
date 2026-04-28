from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    city: Optional[str] = None
    license_no: Optional[str] = None
    specialisation: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DoctorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    city: Optional[str] = None
    license_no: Optional[str] = None
    specialisation: Optional[str] = None

class PatientCreate(BaseModel):
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None

class ExerciseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    body_part: Optional[str] = None
    category: Optional[str] = None
    default_yt_url: Optional[str] = None
    yt_thumbnail: Optional[str] = None
    yt_title: Optional[str] = None

class PrescriptionExerciseCreate(BaseModel):
    exercise_id: str
    order_index: int
    sets: Optional[int] = None
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    yt_url: Optional[str] = None
    doctor_note: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: str
    title: str
    notes: Optional[str] = None
    valid_until: Optional[date] = None
    exercises: List[PrescriptionExerciseCreate]

class PrescriptionUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    exercises: Optional[List[PrescriptionExerciseCreate]] = None

class YouTubeFetchRequest(BaseModel):
    url: str
