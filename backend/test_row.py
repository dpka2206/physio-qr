import os
from database import supabase
import sys

p_id = "3c8a2d43-5061-4a6a-b04e-9132f7fdde2b"
res = supabase.table("prescriptions").select("*").eq("id", p_id).execute()
if res.data:
    row = res.data[0]
    print("qr_url:", row.get("qr_url"))
    print("public_url:", row.get("public_url"))
else:
    print("Row not found.")
