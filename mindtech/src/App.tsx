import { useState, useEffect } from "react";

type Video = {
  id: number;
  title: string;
  subject: string;
  url?: string;
  youtubeId?: string;
  thumbnail?: string;
};

function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const [adminPass, setAdminPass] = useState("");
  const ADMIN_PASSWORD = "MindTech2026";

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // 🎬 DEMO VIDEOS
  const demoVideos: Video[] = [
    { id: 201, title: "Newton's Laws", subject: "Physics", youtubeId: "PLQ0_vZF25o" },
    { id: 202, title: "Thermodynamics", subject: "Chemistry", youtubeId: "NzB2YwNndZw" },
    { id: 203, title: "Sets", subject: "Mathematics", youtubeId: "F_7WUK7htRg" },
    { id: 204, title: "Cell", subject: "Biology", youtubeId: "1n9zM10WhZY" },
  ];

  const fetchVideos = async () => {
    const res = await fetch("http://127.0.0.1:8000/videos");
    const data = await res.json();
    setVideos([...demoVideos, ...data]);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 📤 UPLOAD
  const uploadVideo = async () => {
    if (!file || !thumbnail || title === "") {
      alert("Enter title + video + thumbnail");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("file", file);
    formData.append("thumbnail", thumbnail);

    await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    alert("Uploaded");
    fetchVideos();
  };

  const deleteVideo = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/delete/${id}`, {
      method: "DELETE",
    });
    fetchVideos();
  };

  // 🎬 PLAYER
  if (selectedVideo) {
    return (
      <div style={{ background: "black", height: "100vh" }}>
        <button onClick={() => setSelectedVideo(null)}>⬅ Back</button>

        {selectedVideo.youtubeId && (
          <iframe
            width="100%"
            height="90%"
            src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
            allowFullScreen
          />
        )}

        {selectedVideo.url && (
          <video width="100%" height="90%" controls autoPlay>
            <source src={selectedVideo.url} />
          </video>
        )}
      </div>
    );
  }

  // ROLE SELECT
  if (!role) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>MINDTECH</h1>

        <button onClick={() => setRole("student")}>
          Student
        </button>

        <br /><br />  {/* 👈 spacing added */}

        <button onClick={() => setRole("admin")}>
          Admin
        </button>
      </div>
    );
  }

  // ADMIN LOGIN
  if (role === "admin" && adminPass !== ADMIN_PASSWORD) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Admin Login</h2>
        <input
          type="password"
          value={adminPass}
          onChange={(e) => setAdminPass(e.target.value)}
        />
        <button>Login</button>
      </div>
    );
  }

  // 🎓 STUDENT
  if (role === "student") {
    const subjects = ["Physics", "Chemistry", "Mathematics", "Biology"];

    const filteredVideos = videos.filter(
      (v) => v.subject === selectedSubject
    );

    return (
      <div style={{ padding: "20px", background: "#0f0f0f", color: "white" }}>
        <h1>📚 Learn Smart with MINDTECH</h1>

        {selectedSubject && (
          <button onClick={() => setSelectedSubject(null)}>⬅ Back</button>
        )}

        {!selectedSubject && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px" }}>
            {subjects.map((sub) => (
              <div
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                style={{
                  background: "#1e1e1e",
                  padding: "30px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                {sub}
              </div>
            ))}
          </div>
        )}

        {selectedSubject && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
            {filteredVideos.map((v) => (
              <div key={v.id} onClick={() => setSelectedVideo(v)} style={{ cursor: "pointer" }}>
                <img
                  src={
                    v.thumbnail
                      ? v.thumbnail
                      : v.youtubeId
                      ? `https://img.youtube.com/vi/${v.youtubeId}/0.jpg`
                      : "https://via.placeholder.com/300x150"
                  }
                  style={{ width: "100%" }}
                />
                <h4>{v.title}</h4>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 🛠 ADMIN
  if (role === "admin") {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Admin Panel</h2>

        <p><b>Enter Video Title</b></p>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <p><b>Select Subject</b></p>
        <select onChange={(e) => setSubject(e.target.value)}>
          <option>Physics</option>
          <option>Chemistry</option>
          <option>Mathematics</option>
          <option>Biology</option>
        </select>

        <p><b>Upload Video File</b></p>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <p><b>Upload Thumbnail Image</b></p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
        />

        <br /><br />

        <button onClick={uploadVideo}>Upload</button>

        <h3 style={{ marginTop: "30px" }}>Uploaded Videos</h3>

        {videos
          .filter((v) => !v.youtubeId)
          .map((v) => (
            <div key={v.id}>
              {v.title}
              <button onClick={() => deleteVideo(v.id)}>Delete</button>
            </div>
          ))}
      </div>
    );
  }

  return null;
}

export default App;