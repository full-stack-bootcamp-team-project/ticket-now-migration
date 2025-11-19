/**
 * 로그인 내 팝업 관련 DOM 요소
 */
const findIdBtn = document.getElementById("findId");
const findPwBtn = document.getElementById("findPassword");
const backdrop = document.getElementById("backdrop");
const findIdModal = document.getElementById("findIdModal");
const findPwModal = document.getElementById("findPwModal");
const cancelButton = document.querySelectorAll(".cancel-button");
const submitIdButton = document.getElementById("submitIdButton");
const submitPwButton = document.getElementById("submitPwButton");

/**
 * 비밀번호 찾기 단계 관리 변수
 * findPwStep: 현재 단계 (1: 사용자 확인, 2: 비밀번호 변경)
 * foundUserId: 확인된 사용자 ID (이메일)
 */
let findPwStep = 1;
let foundUserId = null;

/**
 * 모달 열기 함수
 * @param {string} type - 모달 타입 ("id": 아이디 찾기, "pw": 비밀번호 찾기)
 */
function openModal(type) {
    backdrop.classList.remove("hidden");

    if (type === "id") {
        findIdModal.classList.remove("hidden");
    } else if (type === "pw") {
        /** 비밀번호 모달 초기화 */
        resetPasswordModal();
        findPwModal.classList.remove("hidden");
    }
}

findIdBtn.addEventListener("click", () => openModal("id"));
findPwBtn.addEventListener("click", () => openModal("pw"));

/**
 * 모달 닫기 함수
 * 모든 모달을 숨기고 비밀번호 모달 초기화
 */
function closeModal() {
    backdrop.classList.add("hidden");
    document.querySelectorAll(".modal").forEach(modalChange => modalChange.classList.add("hidden"));

    /** 비밀번호 모달 초기화 */
    resetPasswordModal();
}

// 닫기 버튼 클릭
cancelButton.forEach(btn => {
    btn.addEventListener("click", closeModal);
});

/**
 * 비밀번호 모달 초기화 함수
 * 단계를 1로 리셋하고 모든 입력값 초기화
 */
function resetPasswordModal() {
    findPwStep = 1;
    foundUserId = null;

    /** Step1 표시, Step2 숨김 */
    const step1 = document.getElementById("findPwStep1");
    const step2 = document.getElementById("findPwStep2");

    if (step1) {
        step1.style.display = "block";
        step1.querySelectorAll("input").forEach(input => input.value = "");
    }
    if (step2) {
        step2.style.display = "none";
        step2.querySelectorAll("input").forEach(input => input.value = "");
    }

    /** 버튼 텍스트 초기화 */
    if (submitPwButton) {
        submitPwButton.textContent = "비밀번호 찾기";
    }
}

/**
 * 아이디 찾기 버튼 클릭 이벤트
 * 이름과 주민등록번호로 사용자 이메일 조회
 */
submitIdButton.addEventListener("click", async () => {
    const checkName = document.getElementById("checkName").value.trim();
    const checkSSN1 = document.getElementById("checkSSN1").value.trim();
    const checkSSN2 = document.getElementById("checkSSN2").value.trim();

    const idResultBox = document.getElementById("idResultBox");

    if (!checkName || !checkSSN1 || !checkSSN2) {
        alert("모든 항목을 입력해주세요.");
        return;
    }

    let ssn = `${checkSSN1}-${checkSSN2}`;

    try {
        const res = await fetch("/api/user/login/findId", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `userName=${encodeURIComponent(checkName)}&userSSN=${encodeURIComponent(ssn)}`
        });

        const data = await res.text();

        idResultBox.classList.add("id-result");
        if (res.ok && data) {
            /** 성공 시 -> 이메일 표시 */
            idResultBox.innerHTML = `
                <p class="id-result-text">
                    <span>${checkName}</span> 님의 아이디는<br>
                    <span class="result-text-point">${data}</span> 입니다.
                </p>
            `;
            submitIdButton.remove();
        } else {
            /** 실패 시 */
            idResultBox.innerHTML = `
                <p class="id-result-text error">
                    아이디가 존재하지 않습니다.
                </p>
            `;
        }
    } catch (err) {
        console.error("아이디 찾기 오류:", err);
        idResultBox.innerHTML = `
            <p class="id-result-text error">
                서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
        `;
    }
});

/**
 * 비밀번호 찾기/변경 버튼 클릭 이벤트
 * 현재 단계(findPwStep)에 따라 다른 동작 수행
 */
submitPwButton.addEventListener("click", async () => {
    if (findPwStep === 1) {
        /** Step 1: 이메일과 전화번호 확인 */
        await handlePasswordFindStep1();
    } else if (findPwStep === 2) {
        /** Step 2: 비밀번호 변경 */
        await handlePasswordChangeStep2();
    }
});

/**
 * Step 1: 비밀번호 찾기 (이메일, 전화번호 확인)
 * 사용자가 입력한 이메일과 전화번호로 계정 존재 여부 확인
 * 확인 성공 시 Step 2로 이동
 */
async function handlePasswordFindStep1() {
    const checkEmail = document.getElementById("checkEmail").value.trim();
    const tel1 = document.getElementById("tel1").value.trim();
    const tel2 = document.getElementById("tel2").value.trim();
    const tel3 = document.getElementById("tel3").value.trim();

    /** 유효성 검사 */
    if (!checkEmail) {
        alert("이메일을 입력해주세요.");
        document.getElementById("checkEmail").focus();
        return;
    }

    if (!tel1 || !tel2 || !tel3) {
        alert("전화번호를 모두 입력해주세요.");
        return;
    }

    /** 이메일 형식 검사 */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(checkEmail)) {
        alert("올바른 이메일 형식을 입력해주세요.");
        document.getElementById("checkEmail").focus();
        return;
    }

    const userPhone = `${tel1}-${tel2}-${tel3}`;

    try {
        const res = await fetch("/api/user/login/findPassword", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `userEmail=${encodeURIComponent(checkEmail)}&userPhone=${encodeURIComponent(userPhone)}`
        });


        const isUserExists = await res.text();


        if (res.ok && isUserExists) {
            /** 사용자 확인 성공 -> Step 2로 이동 */
            foundUserId = isUserExists;
            moveToPasswordChangeStep();
        } else {
            alert("입력하신 정보와 일치하는 계정이 없습니다.\n다시 확인해주세요.");
        }
    } catch (err) {
        console.error("비밀번호 찾기 오류:", err);
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
}

/**
 * Step 2로 이동 (비밀번호 변경 화면 표시)
 * Step 1을 숨기고 Step 2를 표시
 */
function moveToPasswordChangeStep() {
    const step1 = document.getElementById("findPwStep1");
    const step2 = document.getElementById("findPwStep2");

    /** Step 1 숨기기 */
    if (step1) {
        step1.style.display = "none";
    }

    /** Step 2 표시 */
    if (step2) {
        step2.style.display = "block";
    }

    /** 버튼 텍스트 변경 */
    submitPwButton.textContent = "비밀번호 변경";
    findPwStep = 2;
}

/**
 * Step 2: 비밀번호 변경
 * 새 비밀번호와 확인 비밀번호를 입력받아 변경 처리
 */
async function handlePasswordChangeStep2() {
    const checkPw = document.getElementById("checkPw").value.trim();
    const checkUserPw = document.getElementById("checkUserPw").value.trim();

    /** 유효성 검사 */
    if (!checkPw || !checkUserPw) {
        alert("모든 항목을 입력해주세요.");
        return;
    }

    /** 비밀번호 일치 확인 */
    if (checkPw !== checkUserPw) {
        alert("비밀번호가 일치하지 않습니다.");
        document.getElementById("checkUserPw").focus();
        return;
    }

    /** 비밀번호 길이 검사 (최소 6자) */
    if (checkPw.length < 6) {
        alert("비밀번호는 최소 6자 이상이어야 합니다.");
        document.getElementById("checkPw").focus();
        return;
    }

    try {
        /**
         * 비밀번호 변경 API 호출
         */
        const updateRes = await fetch("/api/user/login/updatePassword", {
            method: "PATCH",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `userId=${encodeURIComponent(foundUserId)}&newPassword=${encodeURIComponent(checkPw)}`
        });

        if (updateRes.ok) {
            alert("비밀번호가 성공적으로 변경되었습니다.\n새로운 비밀번호로 로그인해주세요.");
            closeModal();
        } else {
            alert("비밀번호 변경에 실패했습니다.\n다시 시도해주세요.");
        }
    } catch (err) {
        console.error("비밀번호 변경 오류:", err);
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
}
