from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import supabase

security = HTTPBearer()

def get_current_doctor_id(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    token = credentials.credentials
    try:
        user_res = supabase.auth.get_user(token)
        user = user_res.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token or user not found")
        return user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
