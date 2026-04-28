import os
from config import settings
from database import supabase
import qrcode
import io

def test_generate_qr_and_upload(prescription_id: str):
    print("Start generation")
    public_url = f"http://localhost:3000/rx/{prescription_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(public_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    print("Got bytes length:", len(img_bytes))
    
    file_name = f"test_{prescription_id}.png"
    try:
        res = supabase.storage.from_("qrcodes").upload(file_name, img_bytes, {"content-type": "image/png", "upsert": "true"})
        print("Upload success", res)
    except Exception as e:
        print("Upload failed", e)
            
    qr_url = supabase.storage.from_("qrcodes").get_public_url(file_name)
    return qr_url

print("Result URL:", test_generate_qr_and_upload('test_id'))
