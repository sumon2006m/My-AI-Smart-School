let currentUser = null;
let score = 0;

// ================= LOGIN =================
async function login(){

  const school = document.getElementById("schoolId").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API_USERS);
  const users = await res.json();

  const user = users.find(u =>
    u.school_id === school &&
    u.username === username &&
    u.password === password
  );

  if(user){
    currentUser = user;
    localStorage.setItem("user", JSON.stringify(user));
    document.getElementById("userName").innerText = user.name;

    saveLog("Login");
    showScreen("dashboard");

  }else{
    document.getElementById("msg").innerText = "❌ Login Failed";
  }
}

// ================= AUTO LOGIN =================
window.onload = ()=>{
  const saved = localStorage.getItem("user");
  if(saved){
    currentUser = JSON.parse(saved);
    document.getElementById("userName").innerText = currentUser.name;
    showScreen("dashboard");
  }
}

// ================= LOGOUT =================
function logout(){
  saveLog("Logout");
  localStorage.removeItem("user");
  currentUser = null;
  showScreen("loginScreen");
}

// ================= SCREEN =================
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function show(id){
  showScreen(id);
  saveLog("View: " + id);

  if(id==="courses") loadCourses();
  if(id==="quiz") loadQuiz();
  if(id==="leaderboard") loadLeaderboard();
}

// ================= LOG SYSTEM =================
async function saveLog(action){
  if(!currentUser) return;

  await fetch(API_LOGS,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      data:[{
        timestamp:new Date().toLocaleString(),
        username:currentUser.username,
        school_id:currentUser.school_id,
        action:action
      }]
    })
  });
}

// ================= COURSES =================
async function loadCourses(){

  const res = await fetch(API_COURSES);
  const data = await res.json();

  const cls = document.getElementById("classFilter").value;

  const filtered = data.filter(c =>
    c.school === currentUser.school_id &&
    (cls==="" || c.class===cls)
  );

  let html = "";
  filtered.forEach(c=>{
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
async function loadQuiz(){

  score = 0;

  const res = await fetch(API_QUIZ);
  const data = await res.json();

  let html = "";

  data.forEach((q,i)=>{
    html += `
      <div class="card">
        <b>${q.question}</b><br>
        <button onclick="check(${i},1)"> ${q.option1}</button>
        <button onclick="check(${i},2)"> ${q.option2}</button>
        <button onclick="check(${i},3)"> ${q.option3}</button>
      </div>
    `;
  });

  document.getElementById("quizBox").innerHTML = html;
  window.quizData = data;
}

function check(i,ans){

  if(window.quizData[i].correct == ans){
    score++;
    alert("✅ Correct");
    saveLog("Quiz Correct");
  }else{
    alert("❌ Wrong");
    saveLog("Quiz Wrong");
  }
}

// ================= LEADERBOARD =================
async function loadLeaderboard(){

  const res = await fetch(API_LEADERBOARD);
  const data = await res.json();

  let html = "";
  data.sort((a,b)=>b.score-a.score);

  data.forEach(u=>{
    html += `<div class="card">${u.name} - ${u.score}</div>`;
  });

  document.getElementById("leadBox").innerHTML = html;
}
