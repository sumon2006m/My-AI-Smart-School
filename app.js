let currentUser=null;

async function login(){

  const school=document.getElementById("schoolId").value;
  const username=document.getElementById("username").value;
  const password=document.getElementById("password").value;

  const res=await fetch(API_USERS);
  const users=await res.json();

  const user=users.find(u=>
    u.school_id==school &&
    u.username==username &&
    u.password==password
  );

  if(user){
    currentUser=user;
    document.getElementById("userName").innerText=user.name;
    showScreen("dashboard");
  }else{
    document.getElementById("msg").innerText="❌ Login Failed";
  }
}

function logout(){
  currentUser=null;
  showScreen("loginScreen");
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function show(id){
  showScreen(id);
}
