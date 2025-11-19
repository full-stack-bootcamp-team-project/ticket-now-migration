// ---------------------- 전역 상수 & 변수 ----------------------//
const ITEMS_PER_PAGE = 4;

const GRADE_MAP = {
    bronze: "동",
    silver: "은",
    gold: "금"
};
const GRADE_THRESHOLD = {
    bronze: 100000,
    silver: 500000,
    gold: 1000000
};

let userData = null;
let reservationData = [];
let validationFlags = {
    emailChecked: false,
    phoneChecked: false,
    originalEmail: "",
    originalPhone: ""
};

// ---------------------- 초기 데이터 로드 ----------------------//
(function init() {
    Promise.all([fetchUserData(), fetchReservationData()])
        .then(([user, reservations]) => {
            userData = user;
            reservationData = reservations;
            renderUserInfo(userData);
            setupPagination(reservationData, ITEMS_PER_PAGE);
            renderGradeInfo(userData);
        })
        .catch(err => {
            showError("데이터를 불러오는데 실패했습니다.", err);
        });
})();

// ---------------------- 유효성 규칙 ----------------------//
const validationRules = {
    email: (v) => {
        if (!v) return "이메일을 입력해주세요.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "이메일 형식이 올바르지 않습니다.";
        return true;
    },
    pw: (v) => {
        if (!v) return "비밀번호를 입력해주세요.";
        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/.test(v)) {
            return "비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.";
        }
        return true;
    },
    pwCheck: (v, pw) => {
        if (!v) return "비밀번호 확인을 입력해주세요.";
        if (v !== pw) return "비밀번호가 일치하지 않습니다.";
        return true;
    },
    name: (v) => {
        if (!v) return "이름을 입력해주세요.";
        if (!/^[가-힣a-zA-Z]{2,10}$/.test(v)) return "이름은 2~10자, 한글 또는 영문만 가능합니다.";
        return true;
    },
    nickname: (v) => {
        if (!v) return "닉네임을 입력해주세요.";
        if (!/^[가-힣a-zA-Z]{2,10}$/.test(v)) return "닉네임은 2~10자, 한글 또는 영문만 가능합니다.";
        return true;
    },
    phone: (v) => {
        if (!v) return "전화번호를 입력해주세요.";
        const parts = v.split("-");
        if (parts.length !== 3) return "휴대폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)";

        const [t1, t2, t3] = parts;
        if (!/^\d+$/.test(t1) || !/^\d+$/.test(t2) || !/^\d+$/.test(t3)) {
            return "숫자만 입력 가능합니다.";
        }
        if (t1.length !== 3 || (t2.length !== 3 && t2.length !== 4) || t3.length !== 4) {
            return "휴대폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)";
        }
        return true;
    }
};

// ---------------------- 유효성 함수 ----------------------//
function validateField(key, value, extra) {
    const rule = validationRules[key];
    if (!rule) return true;
    return key === "pwCheck" ? rule(value, extra) : rule(value);
}

function validateForm(data) {
    const errors = {};
    let isValid = true;

    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        const value = data[key];
        const extra = key === "pwCheck" ? data.pw : "";
        const result = validateField(key, value, extra);

        if (result !== true) {
            isValid = false;
            errors[key] = result;
        }
    }

    return {isValid: isValid, errors: errors};
}

// ---------------------- 탭 전환 ----------------------//
document.querySelectorAll(".tab-button").forEach(function (button) {
    button.addEventListener("click", function () {
        document.querySelectorAll(".tab-button, .tab-content").forEach(function (el) {
            el.classList.remove("active");
        });
        button.classList.add("active");
        document.getElementById(button.dataset.tab).classList.add("active");
    });
});

// ---------------------- 이벤트 위임 ----------------------//
document.addEventListener("click", function (e) {
    const target = e.target;
    const id = target.id;
    const classList = target.classList;

    const handlers = {
        updateUserInfo: function () {
            renderUserInfoForm(userData);
        },
        updatePassword: function () {
            renderUserPasswordForm(userData);
        },
        cancelUpdate: function () {
            resetValidationFlags();
            renderUserInfo(userData);
        },
        saveUserInfo: handleSaveUserInfo,
        checkCurrentPassword: handleConfirmPassword,
        updatePasswordBtn: handleUpdatePassword,
        checkEmail: handleCheckEmail,
        checkPhone: handleCheckPhone
    };

    if (handlers[id]) {
        handlers[id]();
        return;
    }

    if (classList.contains("delete-button")) {
        handleDeleteReservation(target);
    }
});

document.addEventListener("input", function (e) {
    const target = e.target;

    if (target.id === "inputUserEmail") {
        if (target.value !== validationFlags.originalEmail) {
            validationFlags.emailChecked = false;
        }
    }

    if (target.id === "inputUserPhone") {
        if (target.value !== validationFlags.originalPhone) {
            validationFlags.phoneChecked = false;
        }
    }
});

// ---------------------- 렌더링 함수 ----------------------//
function renderUserInfo(user) {
    document.getElementById("userInfo").innerHTML = `
        <div class="user-info-area">
            <div class="user-info">
                <div>이름: ${escapeHtml(user.userName)}</div>
                <div>이메일: ${escapeHtml(user.userEmail)}</div>
                <div>닉네임: ${escapeHtml(user.userNickname)}</div>
                <div>주소: ${escapeHtml(user.userAddress)}</div>
                <div>전화번호: ${escapeHtml(user.userPhone)}</div>
                <div>성별: ${user.userGender === "M" ? "남성" : "여성"} </div>
                <div>등급: ${GRADE_MAP[user.grade]}등급 회원</div>
            </div>
        </div>
        <div class="button-area">
            <button class="update-button" id="updateUserInfo">개인정보 수정</button>
            <button class="update-button" id="updatePassword">비밀번호 변경</button>
        </div>`;
}

function renderUserInfoForm(user) {
    validationFlags.originalEmail = user.userEmail;
    validationFlags.originalPhone = user.userPhone;
    validationFlags.emailChecked = true;
    validationFlags.phoneChecked = true;

    document.getElementById("userInfo").innerHTML = `
        <div class="user-info-area">
            <div class="user-info">
                <div>이름: <input id="inputUserName" value="${escapeHtml(user.userName)}" /></div>
                <div>이메일: <input id="inputUserEmail" type="email" value="${escapeHtml(user.userEmail)}" />
                    <button id="checkEmail">중복 확인</button></div>
                <div>닉네임: <input id="inputUserNickname" value="${escapeHtml(user.userNickname)}" /></div>
                <div>주소: <input id="inputUserAddress" value="${escapeHtml(user.userAddress)}" /></div>
                <div>전화번호: 
                    <input id="inputUserPhone" value="${escapeHtml(user.userPhone)}" />
                    <button id="checkPhone">중복 확인</button>
                </div>
                <div>
                    성별:
                    <label><input type="radio" name="userGender" value="M" ${user.userGender === "M" ? "checked" : ""}>남성</label>
                    <label><input type="radio" name="userGender" value="F" ${user.userGender !== "M" ? "checked" : ""}>여성</label>
                </div>
            </div>
        </div>
        <div class="button-area">
            <button class="update-button" id="saveUserInfo">저장</button>
            <button class="update-button" id="cancelUpdate">취소</button>
        </div>`;
}

function renderUserPasswordForm(user) {
    document.getElementById("userInfo").innerHTML = `
        <div class="user-info-area">
            <div class="user-info">
            <div>
                현재 비밀번호
                <input id="inputCurrentPassword" type="password" />
                <button id="checkCurrentPassword">비밀번호 확인</button>
            </div>
               <div id="passwordMessage" class="message"></div>
            <div>
                새 비밀번호
                <input id="inputNewPassword" type="password" disabled />
            </div>
            </div>
        </div>            
        <div class="button-area">
            <button class="update-button" id="updatePasswordBtn" disabled>비밀번호 변경</button>
            <button class="update-button" id="cancelUpdate">취소</button>
        </div>
     
    `;
}

function setupPagination(items, itemsPerPage) {
    const area = document.querySelector(".reservation-info-area");
    const pagination = document.getElementById("reservationPagination");

    if (!items || items.length === 0) {
        area.innerHTML = `<p>예매 내역이 없습니다.</p>`;
        pagination.innerHTML = "";
        return;
    }

    const totalPages = Math.ceil(items.length / itemsPerPage);

    function renderPage(page) {
        const start = (page - 1) * itemsPerPage;
        const currentItems = items.slice(start, start + itemsPerPage);
        area.innerHTML = currentItems.map(renderReservation).join("");

        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === page ? "active" : "";
            buttons.push(`<button class="${isActive}" data-page="${i}">${i}</button>`);
        }
        pagination.innerHTML = buttons.join("");

        pagination.querySelectorAll("button").forEach(function (btn) {
            btn.addEventListener("click", function () {
                renderPage(parseInt(btn.dataset.page, 10));
            });
        });
    }

    renderPage(1);
}

function renderReservation(r) {
    return `
        <div class="reservation-info" 
             data-schedule="${r.performanceScheduleId}" 
             data-seat-id="${r.seatId}" 
             data-seat-number="${r.seatNumber}">
            <img src="${escapeHtml(r.performanceImagePath)}" alt="${escapeHtml(r.performanceTitle)}" class="performance-img" />
            <div class="performance-info">
                <div>${escapeHtml(r.performanceTitle)}</div>
                <div>좌석: ${escapeHtml(r.seatId)}열 ${escapeHtml(r.seatNumber)}번</div>
                <div>공연 일시: ${escapeHtml(r.performanceScheduleStartDate)} ${escapeHtml(r.performanceScheduleStartTime)}</div>
                <div>예약 일시: ${escapeHtml(r.reservationDate)}</div>
            </div>
            <div class="button-area">
                <button class="delete-button">예매 취소</button>
            </div>
        </div>`;
}

function renderGradeInfo(user) {
    const grade = user.grade;
    const gradeName = GRADE_MAP[grade];
    const totalCount = user.userTotalCount;


    let nextGradeDiff = 0;
    let minAmount = 0;
    let maxAmount = 0;

    if (grade === "bronze") {
        minAmount = 0;
        maxAmount = GRADE_THRESHOLD.silver;
        nextGradeDiff = maxAmount - totalCount;
    } else if (grade === "silver") {
        minAmount = GRADE_THRESHOLD.silver;
        maxAmount = GRADE_THRESHOLD.gold;
        nextGradeDiff = maxAmount - totalCount;
    } else if (grade === "gold") {
        minAmount = GRADE_THRESHOLD.gold;
        maxAmount = Infinity;
        nextGradeDiff = 0;
    }

    if (nextGradeDiff < 0) nextGradeDiff = 0;
    document.querySelector(".grade-info-area").innerHTML = `
    <div class="grade-info">
        <img src="../images/${grade}.png" alt="${grade} 등급">
        <div class="text-area">
            <div>${user.userName}님의 등급은 ${gradeName}입니다.</div>
            <div>현재 총 ${totalCount}원을 소모하셨습니다.</div>
            <div>현재 혜택: 없음</div>
            ${nextGradeDiff > 0 ? `<div>다음 등급까지 총 ${nextGradeDiff}원이 필요합니다.</div>
                   <div class="grade-graph">
                       <div class="progress" style="width: ${Math.min(100, Math.round((totalCount - minAmount) / (maxAmount - minAmount) * 100))}%;"></div>
                   </div>`
        : `<div>최고 등급입니다.</div>`}
            <div class="grade-range">
                <div>${minAmount.toLocaleString()}원</div> 
                <div>${maxAmount !== Infinity ? maxAmount.toLocaleString() : "∞"}원</div>
            </div>
        </div>
    </div>
    `;
}

// ---------------------- 이벤트 핸들러 ----------------------//
function handleSaveUserInfo() {
    const formData = {
        userName: valueOf("inputUserName"),
        userEmail: valueOf("inputUserEmail"),
        userGender: getSelectedRadio("userGender"),
        userNickname: valueOf("inputUserNickname"),
        userAddress: valueOf("inputUserAddress"),
        userPhone: valueOf("inputUserPhone")
    };

    const changedFields = {};
    const validationData = {};

    if (formData.userName !== userData.userName) {
        changedFields.userName = formData.userName;
        validationData.name = formData.userName;
    }

    if (formData.userEmail !== userData.userEmail) {
        changedFields.userEmail = formData.userEmail;
        validationData.email = formData.userEmail;

        if (!validationFlags.emailChecked) {
            showError("변경된 이메일의 중복 확인을 해주세요.");
            return;
        }
    }

    if (formData.userGender !== userData.userGender) {
        changedFields.userGender = formData.userGender;
        validationData.gender = formData.userGender;
    }

    if (formData.userNickname !== userData.userNickname) {
        changedFields.userNickname = formData.userNickname;
        validationData.nickname = formData.userNickname;
    }

    if (formData.userAddress !== userData.userAddress) {
        changedFields.userAddress = formData.userAddress;
    }

    if (formData.userPhone !== userData.userPhone) {
        changedFields.userPhone = formData.userPhone;
        validationData.phone = formData.userPhone;

        if (!validationFlags.phoneChecked) {
            showError("변경된 전화번호의 중복 확인을 해주세요.");
            return;
        }
    }

    if (Object.keys(changedFields).length === 0) {
        showError("변경된 정보가 없습니다.");
        return;
    }

    const validation = validateForm(validationData);
    if (!validation.isValid) {
        showError(Object.values(validation.errors)[0]);
        return;
    }

    updateUserInfo(formData)
        .then(function () {
            userData = Object.assign({}, userData, formData);
            renderUserInfo(userData);
            showSuccess("회원 정보가 수정되었습니다.");
            resetValidationFlags();
        })
        .catch(function (err) {
            console.error("회원 정보 수정 오류:", err);
            showError("회원 정보 수정에 실패했습니다.");
        });
}

function handleCheckEmail() {
    const email = valueOf("inputUserEmail");
    const validation = validateField("email", email);

    if (validation !== true) {
        showError(validation);
        return;
    }

    checkEmailDuplicate(email)
        .then(function (isDuplicate) {
            if (isDuplicate) {
                showError("이미 사용 중인 이메일입니다.");
                validationFlags.emailChecked = false;
            } else {
                showSuccess("사용 가능한 이메일입니다.");
                validationFlags.emailChecked = true;
                validationFlags.originalEmail = email;
            }
        })
        .catch(function (err) {
            console.error("이메일 확인 오류:", err);
            showError("이메일 확인에 실패했습니다.");
        });
}

function handleCheckPhone() {
    const phone = valueOf("inputUserPhone");
    const validation = validateField("phone", phone);

    if (validation !== true) {
        showError(validation);
        return;
    }

    checkPhoneDuplicate(phone)
        .then(function (isDuplicate) {
            if (isDuplicate) {
                showError("이미 사용 중인 전화번호입니다.");
                validationFlags.phoneChecked = false;
            } else {
                showSuccess("사용 가능한 전화번호입니다.");
                validationFlags.phoneChecked = true;
                validationFlags.originalPhone = phone;
            }
        })
        .catch(function (err) {
            console.error("전화번호 확인 오류:", err);
            showError("전화번호 확인에 실패했습니다.");
        });
}

function handleConfirmPassword() {
    const currentPassword = valueOf("inputCurrentPassword");
    if (!currentPassword) return showError("현재 비밀번호를 입력해주세요.");

    confirmPassword(currentPassword)
        .then(function (isValid) {
            const msgEl = document.getElementById("passwordMessage");
            const newPasswordInput = document.getElementById("inputNewPassword");
            const updateBtn = document.getElementById("updatePasswordBtn");

            if (isValid) {
                msgEl.textContent = "현재 비밀번호 확인 완료. 새 비밀번호를 입력하세요.";
                msgEl.style.color = "green";
                newPasswordInput.disabled = false;
                updateBtn.disabled = false;
            } else {
                msgEl.textContent = "현재 비밀번호가 올바르지 않습니다.";
                msgEl.style.color = "red";
                newPasswordInput.disabled = true;
                updateBtn.disabled = true;
            }
        })
        .catch(function (err) {
            console.error(err);
            showError("비밀번호 확인 중 오류가 발생했습니다.");
        });
}

function handleUpdatePassword() {
    const currentPassword = valueOf("inputCurrentPassword");
    const newPassword = valueOf("inputNewPassword");

    if (!newPassword) return showError("새 비밀번호를 입력해주세요.");

    const validation = validateField("pw", newPassword);
    if (validation !== true) return showError(validation);

    updatePassword(currentPassword, newPassword)
        .then(function () {
            showSuccess("비밀번호가 변경되었습니다.");
            renderUserInfo(userData); // 변경 후 사용자 정보 다시 렌더
        })
        .catch(function (err) {
            console.error(err);
            showError("비밀번호 변경에 실패했습니다.");
        });
}

function handleDeleteReservation(target) {
    const reservationEl = target.closest(".reservation-info");
    if (!reservationEl) return;

    if (!confirm("정말로 예매를 취소하시겠습니까?")) return;

    const scheduleId = reservationEl.dataset.schedule;
    const seatId = reservationEl.dataset.seatId;
    const seatNumber = reservationEl.dataset.seatNumber;

    deleteReservation(scheduleId, seatId, seatNumber)
        .then(function () {
            reservationData = reservationData.filter(function (item) {
                return !(
                    item.performanceScheduleId === scheduleId &&
                    item.seatId === seatId &&
                    item.seatNumber === seatNumber
                );
            });
            setupPagination(reservationData, ITEMS_PER_PAGE);
            showSuccess("예매가 취소되었습니다.");
        })
        .catch(function (err) {
            console.error("예매 취소 오류:", err);
            showError("예매 취소에 실패했습니다.");
        });
}

// ---------------------- API 함수 ----------------------//
function fetchUserData() {
    return fetch(`${API_BASE_URL}/api/user/myPage`, {
        credentials: "include"
    })
        .then(handleResponse)
        .then(function (data) {
            return data;
        });
}

function fetchReservationData() {
    return fetch(`${API_BASE_URL}/api/reservation/get`, {
        credentials: "include"
    })
        .then(handleResponse)
        .then(function (data) {
            return data;
        });
}

function updateUserInfo(user) {
    return fetch(`${API_BASE_URL}/api/user/myPage/updateInfo`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
        .then(handleResponse);
}

function checkEmailDuplicate(email) {
    return fetch(`${API_BASE_URL}/api/user/checkEmail?userEmail=${encodeURIComponent(email)}`, {
        method: "POST",
        credentials: "include"
    })
        .then(handleResponse);
}

function checkPhoneDuplicate(phone) {
    return fetch(`${API_BASE_URL}/api/user/checkPhone?userPhone=${encodeURIComponent(phone)}`, {
        method: "POST",
        credentials: "include"
    })
        .then(handleResponse);
}

function confirmPassword(currentPassword) {
    return fetch(`${API_BASE_URL}/api/user/myPage/confirmPassword?currentPassword=${encodeURIComponent(currentPassword)}`, {
        method: "POST",
        credentials: "include"
    })
        .then(handleResponse);
}

function updatePassword(currentPassword, newPassword) {
    return fetch(`${API_BASE_URL}/api/user/myPage/updatePassword?currentPassword=${encodeURIComponent(currentPassword)}&&newPassword=${encodeURIComponent(newPassword)}`, {
        method: "PATCH",
        credentials: "include",
    })
        .then(handleResponse);
}

function deleteReservation(scheduleId, seatId, seatNumber) {
    const params = new URLSearchParams({
        performanceScheduleId: scheduleId,
        seatId: seatId,
        seatNumber: seatNumber
    });

    return fetch(`${API_BASE_URL}/api/reservation/delete?${params}`, {
        method: "DELETE",
        credentials: "include"
    })
        .then(handleResponse);
}

// ---------------------- 유틸리티 함수 ----------------------//
function handleResponse(response) {
    if (!response.ok) {
        return response.text().then(function (text) {
            throw new Error(`HTTP ${response.status}: ${text}`);
        });
    }

    return response.text().then(function (text) {
        if (!text || text.trim() === "") {
            return null;
        }
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    });
}

function valueOf(id) {
    const el = document.getElementById(id);
    return el && el.value ? el.value.trim() : "";
}

function getSelectedRadio(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : "";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

function resetValidationFlags() {
    validationFlags.emailChecked = false;
    validationFlags.phoneChecked = false;
    validationFlags.originalEmail = "";
    validationFlags.originalPhone = "";
}