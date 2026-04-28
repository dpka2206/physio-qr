import os
from database import supabase

file_name = "test_qr.png"
img_bytes = b"fakeimage"
print("Attempting to get bucket...")
try:
    print(supabase.storage.get_bucket("qrcodes"))
except Exception as e:
    print("Bucket get failed:", e)

print("Attempting upload...")
try:
    res = supabase.storage.from_("qrcodes").upload("test.txt", b"hello world", {"content-type": "text/plain", "upsert": "true"})
    print("Upload Result:", res)
except Exception as e:
    print("Upload Exception:", e)
