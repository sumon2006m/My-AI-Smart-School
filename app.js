let currentUser = null;
let score = 0;

// ================= INIT =================
window.onload = () => {
  loadSchools();

  const saved = localStorage.getItem("user");
  if (saved) {
    currentUser = JSON.parse(saved);
    updateUI();
    showScreen("dashboard");
  }
};

// ================= LOGIN =================
async function login() {

  const school = document.getElementById("schoolId").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API_USERS);
  const users = await res.json();

  const user = users.find(u =>
    u.school_id == school &&
    u.username == username &&
    u.password == password
  );

  if (user) {
    currentUser = user;

    localStorage.setItem("user", JSON.stringify(user));

    updateUI();

    saveLog("Login");
    showScreen("dashboard");

  } else {
    document.getElementById("msg").innerText = "❌ Login Failed";
  }
}

// ================= UI UPDATE =================
function updateUI() {
  document.getElementById("userName").innerText = currentUser.name;
  document.getElementById("schoolName").innerText = currentUser.school_name;
  document.getElementById("userClass").innerText = currentUser.class;
  document.getElementById("userMobile").innerText = currentUser.mobile;
}

// ================= LOAD SCHOOLS =================
async function loadSchools() {

  const res = await fetch(API_USERS);
  const users = await res.json();

  const schools = [...new Map(users.map(u => [u.school_id, u])).values()];

  let html = "";
  schools.forEach(s => {
    html += `<option value="${s.school_id}">
      ${s.school_name}
    </option>`;
  });

  document.getElementById("schoolId").innerHTML = html;
}

// ================= LOGOUT =================
function logout() {
  saveLog("Logout");
  localStorage.removeItem("user");
  currentUser = null;
  showScreen("loginScreen");
}

// ================= SCREEN CONTROL =================
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s =>
    s.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");
}

function show(id) {
  showScreen(id);
  saveLog("View: " + id);

  if (id === "courses") loadCourses();
  if (id === "quiz") loadQuiz();
  if (id === "leaderboard") loadLeaderboard();
}

// ================= LOG SYSTEM =================
async function saveLog(action) {
  if (!currentUser) return;

  await fetch(API_LOGS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        timestamp: new Date().toLocaleString(),
        username: currentUser.username,
        name: currentUser.name,
        class: currentUser.class,
        school_id: currentUser.school_id,
        school_name: currentUser.school_name,
        mobile: currentUser.mobile,
        action: action
      }]
    })
  });
}

// ================= COURSES =================
async function loadCourses() {

  const res = await fetch(API_COURSES);
  const data = await res.json();

  const cls = document.getElementById("classFilter").value;

  const filtered = data.filter(c =>
    c.school_id == currentUser.school_id &&
    (cls === "" || c.class == cls)
  );

  let html = "";

  filtered.forEach(c => {
    html += `
      <div class="card">
        <b>Class ${c.class} - ${c.subject}</b><br>
        Lesson ${c.lesson}: ${c.topic}
      </div>
    `;
  });

  document.getElementById("courseBox").innerHTML = html;
}

// ================= QUIZ =================
async function loadQuiz() {

  score = 0;

  const res = await fetch(API_QUIZ);
  const data = await res.json();

  const filtered = data.filter(q =>
    !q.class || q.class == currentUser.class
  );

  window.quizData = filtered;

  let html = "";

  filtered.forEach((q, i) => {
    html += `
      <div class="card">
        <b>${q.question}</b><br>
        <button onclick="check(${i},1)">${q.option1}</button>
        <button onclick="check(${i},2)">${q.option2}</button>
        <button onclick="check(${i},3)">${q.option3}</button>
      </div>
    `;
  });

  document.getElementById("quizBox").innerHTML = html;
}

// ================= CHECK ANSWER =================
function check(i, ans) {

  if (window.quizData[i].correct == ans) {
    score++;
    alert("✅ Correct");
    saveLog("Quiz Correct");
  } else {
    alert("❌ Wrong");
    saveLog("Quiz Wrong");
  }
}

// ================= SAVE / UPDATE SCORE =================
async function saveScore() {

  const res = await fetch(API_LEADERBOARD);
  const data = await res.json();

  const existing = data.find(u =>
    u.name == currentUser.name &&
    u.school_id == currentUser.school_id
  );

  if (existing) {

    await fetch(API_LEADERBOARD + "/" + existing.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: score
      })
    });

  } else {

    await fetch(API_LEADERBOARD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{
          name: currentUser.name,
          school_id: currentUser.school_id,
          score: score
        }]
      })
    });
  }

  alert("🏆 Score Updated: " + score);
}

// ================= LEADERBOARD =================
async function loadLeaderboard() {

  const res = await fetch(API_LEADERBOARD);
  const data = await res.json();

  data.sort((a, b) => b.score - a.score);

  let html = "";

  data.forEach(u => {
    html += `<div class="card">${u.name} - ${u.score}</div>`;
  });

  document.getElementById("leadBox").innerHTML = html;
}
