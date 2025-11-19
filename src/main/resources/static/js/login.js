// 이메일 비밀번호 미작성시 로그인 제한
const loginEmail = document.querySelector("#loginForm input[name='userEmail']")
const loginForm = document.getElementById("loginForm");
const loginPw= document.querySelector("#loginForm input[name='userPw']");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");

if (window.innerWidth <= 1300) {
    // header/footer 숨기기
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";

    const loginContainer = document.querySelector('.login-container.content-area');

    loginContainer.style.height = "100svh";
    loginContainer.style.padding = "0";
}

document.querySelectorAll(".password-view-button").forEach((btn) => {
    btn.addEventListener("click", () => {
        const input = btn.previousElementSibling;
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        btn.classList.toggle("password-off", !isHidden);
    });
});
if(loginForm){
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (loginEmail.value.trim().length === 0){
            alert("이메일을 입력해주세요");
            loginEmail.focus();
            return;
        }

        if (loginPw.value.trim().length === 0){
            alert("비밀번호를 입력해주세요");
            loginPw.focus();
            return;
        }

        try {
            const res = await fetch("/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `userEmail=${encodeURIComponent(loginEmail.value)}&userPw=${encodeURIComponent(loginPw.value)}`
            });

            const data = await res.json();

            if (data.status === "200") {
                alert("로그인 성공!");
                window.location.href = data.prevPage; // 서버에서 전달한 이전 페이지로 이동
            } else if (data.status === "401") {
                alert("로그인 정보가 일치하지 않습니다.");
            } else {
                alert("서버 오류로 로그인 실패");
            }

        } catch (error) {
            console.error("로그인 오류:", error);
            alert("서버 오류로 로그인에 실패했습니다.");
        }
    });
}

signupButton.addEventListener("click", () => {
    window.open("/user/signup","_self")
})


