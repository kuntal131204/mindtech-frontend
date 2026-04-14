from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import shutil
import os

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ DB CONNECTION
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="mindtech"
)

cursor = db.cursor()

# 📁 CREATE FOLDER
if not os.path.exists("videos"):
    os.makedirs("videos")

# 📤 UPLOAD WITH THUMBNAIL
@app.post("/upload")
async def upload_video(
    title: str = Form(...),
    subject: str = Form(...),
    file: UploadFile = File(...),
    thumbnail: UploadFile = File(...)
):
    video_path = f"videos/{file.filename}"
    thumb_path = f"videos/{thumbnail.filename}"

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with open(thumb_path, "wb") as buffer:
        shutil.copyfileobj(thumbnail.file, buffer)

    query = "INSERT INTO videos (title, subject, filepath, thumbnail) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (title, subject, video_path, thumb_path))
    db.commit()

    return {"message": "Uploaded"}

# 📥 GET VIDEOS
@app.get("/videos")
def get_videos():
    cursor.execute("SELECT * FROM videos")
    data = cursor.fetchall()

    result = []
    for row in data:
        result.append({
            "id": row[0],
            "title": row[1],
            "subject": row[2],
            "url": f"http://localhost:8000/{row[3]}",
            "thumbnail": f"http://localhost:8000/{row[4]}" if row[4] else None
        })

    return result

# 🗑 DELETE VIDEO
@app.delete("/delete/{video_id}")
def delete_video(video_id: int):
    cursor.execute("SELECT filepath, thumbnail FROM videos WHERE id=%s", (video_id,))
    result = cursor.fetchone()

    if result:
        video_path, thumb_path = result

        if os.path.exists(video_path):
            os.remove(video_path)

        if os.path.exists(thumb_path):
            os.remove(thumb_path)

        cursor.execute("DELETE FROM videos WHERE id=%s", (video_id,))
        db.commit()

    return {"message": "Deleted"}

# 🎥 SERVE FILES
app.mount("/videos", StaticFiles(directory="videos"), name="videos")