from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import shutil
import os

app = FastAPI()

# ✅ CORS (Allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later you can restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Database Connection (Railway ENV)
db = mysql.connector.connect(
    host=os.getenv("MYSQLHOST"),
    user=os.getenv("MYSQLUSER"),
    password=os.getenv("MYSQLPASSWORD"),
    database=os.getenv("MYSQLDATABASE"),
    port=int(os.getenv("MYSQLPORT"))
)

cursor = db.cursor(dictionary=True)

# ✅ Create temp folder
UPLOAD_DIR = "/tmp"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# =========================
# 🚀 GET ALL VIDEOS
# =========================
@app.get("/videos")
def get_videos():
    cursor.execute("SELECT * FROM videos")
    data = cursor.fetchall()
    return data


# =========================
# 🚀 UPLOAD VIDEO + THUMBNAIL
# =========================
@app.post("/upload")
async def upload_video(
    title: str = Form(...),
    subject: str = Form(...),
    file: UploadFile = File(...),
    thumbnail: UploadFile = File(...)
):
    video_path = f"{UPLOAD_DIR}/{file.filename}"
    thumb_path = f"{UPLOAD_DIR}/{thumbnail.filename}"

    # Save video
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save thumbnail
    with open(thumb_path, "wb") as buffer:
        shutil.copyfileobj(thumbnail.file, buffer)

    # Save in DB
    cursor.execute(
        "INSERT INTO videos (title, subject, filepath, thumbnail) VALUES (%s, %s, %s, %s)",
        (title, subject, video_path, thumb_path)
    )
    db.commit()

    return {"message": "Uploaded successfully"}


# =========================
# 🚀 DELETE VIDEO
# =========================
@app.delete("/delete/{video_id}")
def delete_video(video_id: int):
    cursor.execute("DELETE FROM videos WHERE id = %s", (video_id,))
    db.commit()
    return {"message": "Deleted successfully"}


# =========================
# 🚀 ROOT (TEST)
# =========================
@app.get("/")
def home():
    return {"message": "Backend Running 🚀"}