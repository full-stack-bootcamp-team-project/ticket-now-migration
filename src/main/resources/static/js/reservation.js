// API Base URL
const API_BASE_URL = "http://43.201.71.58:8080"

// URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const performanceId = urlParams.get("performanceId");

// performanceScheduleId / seatId, seatNumber / performanceScheduledStartDate 담을 객체 생성
let selectedScheduleId = null;
let selectedSeats = [];
let performanceDates = [];

// Wait for DOM to be fully loaded
// 윈도우 시작 시 자동으로 실행
window.addEventListener("DOMContentLoaded", async () => {

    // 인터셉터가 이미 로그인 체크를 했으므로
    // 이 페이지에 접근했다면 세션이 있는 상태
    console.log('예약 페이지 로드 - 로그인 상태 확인됨');

    // Calendar setup
    // html id 값을 담을 변수
    const monthYear = document.getElementById('monthYear');
    const dates = document.getElementById('dates');
    const calendarPrev = document.getElementById('calendarPrev');
    const calendarNext = document.getElementById('calendarNext');

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let selectedDate = null;

    function renderCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0); // date : 0 값이 마지막 달의 마지막 날을 확인함

        // 기본 달은 0 ~ 11 까지임
        monthYear.textContent = `${year}.${month + 1}`;

        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const prevLastDay = new Date(year, month, 0);
        const prevMonthDays = prevLastDay.getDate();

        let html = '';

        for (let i = startDay - 1; i >= 0; i--) {
            const date = prevMonthDays - i;
            html += `<div class="date-area inactive"><p class="date">${date}</p></div>`;
        }

        for (let date = 1; date <= daysInMonth; date++) {
            const day = new Date(year, month, date).getDay();
            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDate = String(date).padStart(2, '0');
            const fullDate = `${year}-${formattedMonth}-${formattedDate}`;
            const hasPerformance = performanceDates.includes(fullDate);

            let classes = 'date-area';

            if (day === 0) classes += ' sunday';
            else if (day === 6) classes += ' saturday';
            if (hasPerformance) classes += ' has-performance';
            if (
                date === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                classes += ' today';
            }
            html += `
              <div class="${classes}" data-date="${fullDate}">
                <p class="date">${date}</p>
              </div>`;
        }

        const totalCells = startDay + daysInMonth;
        const nextDays = 7 - (totalCells % 7);
        if (nextDays < 7) {
            for (let i = 1; i <= nextDays; i++) {
                html += `<div class="date-area inactive"><p class="date">${i}</p></div>`;
            }
        }

        dates.innerHTML = html;
    }

    function resetSeats() {
        selectedSeats = [];

        document.querySelectorAll('.seat-input').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.disabled = false;
            const label = checkbox.parentElement;
            label.classList.remove('reserved');
        });

        updateSelectedSeats();
    }

    dates.addEventListener('click', async (e) => {
        const target = e.target.closest('.date-area');
        if (!target || target.classList.contains('inactive')) return;

        document.querySelectorAll('.dates .date-area').forEach(d => d.classList.remove('selected'));

        target.classList.add('selected');
        selectedDate = target.dataset.date;

        console.log(`선택된 날짜: ${selectedDate}`);

        const choiceDate = document.querySelector('.choice-date');
        choiceDate.style.display = 'block';

        const d = await detailFunction(performanceId);

        const infoTime = document.getElementById("infoTime");
        const infoCaster = document.getElementById("infoCaster");

        let found = false;

        resetSeats();

        for (let i = 0; i < d.schedules.length; i++) {
            const date = d.schedules[i].performanceScheduleStartDate;

            if (date === selectedDate) {
                selectedScheduleId = d.schedules[i].performanceScheduleId;
                found = true;

                await loadSeat();

                infoTime.style.display = "block";
                infoCaster.style.display = "flex";

                infoTime.innerText = `${d.schedules[i].performanceScheduleStartTime}`;
                infoCaster.innerHTML = `<div class="info-caster"><p class="info-caster-list">출연진</p></div>`;

                for(let j = 0; j < d.castMembers.length; j++){
                    infoCaster.innerHTML += `
                <div class="info-caster">${d.castMembers[j].castMemberName}</div>`;
                }

                console.log("selectedDate : ", selectedDate);
                console.log("selectedScheduleId : ", selectedScheduleId);

                break;
            }
        }

        if (!found) {
            alert("해당하는 날짜에 공연이 없습니다.");
            infoTime.style.display = "none";
            infoCaster.style.display = "none";
            selectedScheduleId = null;
        }

        const reservationDate = document.getElementById("reservationDate");
        const reservationTime = document.getElementById("reservationTime");

        const [year, month, day] = selectedDate.split('-');
        reservationDate.innerText = `${year}년 ${month}월 ${day}일`;

        if (found) {
            const schedule = d.schedules.find(s => s.performanceScheduleStartDate === selectedDate);
            reservationTime.innerText = schedule ? schedule.performanceScheduleStartTime : '';
        }
    });

    calendarPrev.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
    });

    calendarNext.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
    });

    renderCalendar(currentYear, currentMonth);

    detailFunction(performanceId).then(detail => {
        const datesWithPerformance = detail.schedules.map(s => s.performanceScheduleStartDate);
        performanceDates = datesWithPerformance;

        datesWithPerformance.forEach(fullDate => {
            const dateEl = document.querySelector(`.date-area[data-date="${fullDate}"] .date`);
            if (dateEl) {
                dateEl.parentElement.classList.add('has-performance');
            }
        });
    });

    async function detailFunction(performanceId) {
        const res = await fetch(API_BASE_URL + `/api/performance/detail?performanceId=${performanceId}`);

        if (!res.ok) {
            throw new Error("공연 정보를 불러오는데 실패했습니다.")
        }

        return await res.json();
    }

    async function seatFunction(performanceScheduleId){
        const seatRes = await fetch(API_BASE_URL + `/api/performance/seat?performanceScheduleId=${performanceScheduleId}`);

        if(!seatRes.ok){
            throw new Error("좌석 정보를 불러오는데 실패했습니다.")
        }

        return await seatRes.json();
    }

    async function loadSeat() {
        if(!selectedScheduleId) return;

        const seatsData = await seatFunction(selectedScheduleId);

        document.querySelectorAll('.seat-input').forEach(checkbox => {
            checkbox.disabled = false;
            checkbox.checked = false;
            const label = checkbox.parentElement;
            label.classList.remove('reserved');
        });

        const reservedSeatsSet = new Set(
            seatsData
                .filter(s => s.reserved)
                .map(s => `${s.seatId}-${s.seatNumber}`)
        );

        console.log('예약된 좌석:', Array.from(reservedSeatsSet));

        document.querySelectorAll('.seat-input').forEach(checkbox => {
            const seatId = checkbox.dataset.seatId;
            if (reservedSeatsSet.has(seatId)) {
                checkbox.disabled = true;
                checkbox.checked = false;
                const label = checkbox.parentElement;
                label.classList.add('reserved');
            }
        });
    }

    async function loadPerformanceDetail() {
        const r = await detailFunction(performanceId);
        console.log("DB 데이터 조회 r : ", r)

        const performanceImage = document.getElementById("performanceImage");
        const performanceTitle = document.getElementById("performanceTitle");
        const performanceDate = document.getElementById("performanceDate");
        const performanceAddress = document.getElementById("performanceAddress");
        const performanceTabImage = document.getElementById("performanceTabImage");

        performanceImage.innerHTML = `<img src=${r.performanceImagePath} />`;
        performanceTitle.innerText = `${r.performanceTitle}`;
        performanceDate.innerText = `${r.schedules[0].performanceScheduleStartDate} ~`;
        performanceAddress.innerText = `${r.performanceAddress}`;

        performanceTabImage.innerHTML = `<img src=${r.performanceImagePath} />`;
    }

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const tabContent = document.querySelectorAll('.tab-content');

    const buttonTexts = {
        0:{prev:"닫기", next:"다음단계"},
        1:{prev:"이전단계", next:"다음단계"},
        2:{prev:"이전단계", next:"예약하기"},
        3:{prev:"닫기", next:"마이페이지 이동"}
    }

    const sections = {
        A: { totalSeats: 20 },
        B: { totalSeats: 20 },
        C: { totalSeats: 20 },
        D: { totalSeats: 20 },
        E: { totalSeats: 20 },
        F: { totalSeats: 20 },
        G: { totalSeats: 20 },
        H: { totalSeats: 20 },
    };

    const sectionCols = {
        A: 5, B: 5, C: 5, D: 5, E: 5, F: 5, G: 5, H: 5
    };

    function createSeats() {
        for (const [section, config] of Object.entries(sections)) {
            const container = document.getElementById(section);
            if (!container) continue;

            const cols = sectionCols[section];
            const rows = Math.ceil(config.totalSeats / cols);

            container.style.display = 'grid';
            container.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
            container.style.gap = '4px';
            container.innerHTML = '';

            for (let row = 1; row <= rows; row++) {
                for (let col = 1; col <= cols; col++) {
                    const seatNum = (row - 1) * cols + col;
                    if (seatNum > config.totalSeats) break;

                    const seatId = `${section}-${seatNum}`;
                    const uniqueId = `seat-${section}-${seatNum}`;

                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = uniqueId;
                    input.className = 'seat-input';
                    input.dataset.seatId = seatId;
                    input.dataset.section = section;
                    input.dataset.number = seatNum;
                    input.setAttribute('data-seat-id', seatId);

                    const label = document.createElement('label');
                    label.className = 'seat';
                    label.htmlFor = uniqueId;

                    label.appendChild(input);
                    container.appendChild(label);
                }
            }
        }
    }

    async function updateSelectedSeats() {
        const display = selectedSeats.length ? selectedSeats.join(', ') : '좌석을 선택해주세요.';
        const selectedSeatsElement = document.getElementById('selectedSeats');
        const reservationSeat = document.getElementById("reservationSeat");
        const reservationSeatLength = document.getElementById("reservationSeatLength");
        const reservationPrice = document.getElementById("reservationPrice");
        const reservationCharge = document.getElementById("reservationCharge");
        const reservationDelivery = document.getElementById("reservationDelivery");
        const reservationTotalPrice = document.getElementById("reservationTotalPrice");
        const finalPrice = document.getElementById("finalPrice");

        const p = await detailFunction(performanceId);

        if (selectedSeatsElement) {
            selectedSeatsElement.textContent = display;
            console.log(selectedSeats);
            reservationSeatLength.innerText = `${selectedSeats.length}`;

            reservationSeat.innerHTML = selectedSeats.map(item => `<p>${item}</p>`).join('');
            reservationPrice.innerText = `${Number(selectedSeats.length * p.performancePrice).toLocaleString() + " 원"}`;
            reservationCharge.innerText = Number(4000).toLocaleString() + " 원";
            reservationDelivery.innerText = "0";
            reservationTotalPrice.innerText = `${Number(selectedSeats.length * p.performancePrice + 4000).toLocaleString() + " 원"}`;
            finalPrice.innerText = `${Number(selectedSeats.length * p.performancePrice + 4000).toLocaleString() + " 원"}`;
        }
    }

    document.addEventListener('change', (e) => {
        if (!e.target.classList.contains('seat-input')) return;

        const checkbox = e.target;
        const seatId = checkbox.dataset.seatId;

        if (checkbox.checked) {
            if (!selectedSeats.includes(seatId)) {
                selectedSeats.push(seatId);
                console.log('좌석 추가:', seatId, '현재 선택:', selectedSeats);
            }
        } else {
            const index = selectedSeats.indexOf(seatId);
            if (index > -1) {
                selectedSeats.splice(index, 1);
                console.log('좌석 제거:', seatId, '현재 선택:', selectedSeats);
            }
        }

        updateSelectedSeats();
    });

    function getActiveTabIndex() {
        return Array.from(tabContent).findIndex(tab => tab.classList.contains('active'));
    }

    function updateButtons(){
        const currentIndex = getActiveTabIndex();

        if(buttonTexts[currentIndex]) {
            prevBtn.textContent = buttonTexts[currentIndex].prev;
            nextBtn.textContent = buttonTexts[currentIndex].next;
        }

        if(currentIndex === 0) {
            prevBtn.style.display = 'none';
            nextBtn.style.width = '100%';
        } else {
            prevBtn.style.display = 'block';
            prevBtn.classList.add('active');
            nextBtn.style.width="";
        }

        const reservationInfo = document.getElementById("reservationInfo");
        const performanceImage = document.getElementById("performanceImage");

        if (currentIndex === 3) {
            reservationInfo.style.width = "500px";
            performanceImage.style.display = "none";
            prevBtn.onclick = () => {
                window.close();
            };

            nextBtn.onclick = () => {
                window.opener.location.href = "/user/myPage";
                window.close();
            };

        } else {
            reservationInfo.style.width = "";
            performanceImage.style.display = "block";
        }
    }

    prevBtn.addEventListener('click', () => {
        const currentIndex = getActiveTabIndex();
        console.log(currentIndex);

        if (currentIndex === 0) {
            if(confirm('예약을 취소하고 나가시겠습니까?')) {
                window.history.back();
            }
            return;
        }
        if(currentIndex <= 0) {
            return;
        }

        tabContent[currentIndex].classList.remove('active');
        tabContent[currentIndex - 1].classList.add('active');
        updateButtons();
    })

    async function processReservation() {
        try {
            for (let seat of selectedSeats) {
                const [seatId, seatNumber] = seat.split('-');

                const params = new URLSearchParams({
                    performanceScheduleId: selectedScheduleId,
                    seatId: seatId,
                    seatNumber: seatNumber
                });

                const response = await fetch(`${API_BASE_URL}/api/reservation/insert?${params}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 302) {
                        alert('로그인 세션이 만료되었습니다.');
                        window.location.href = '/user/login';
                        return false;
                    }
                    throw new Error(`좌석 ${seat} 예약에 실패했습니다.`);
                }
            }

            console.log('모든 좌석 예약 완료');
            return true;
        } catch (error) {
            console.error('예약 처리 중 오류:', error);
            alert('예약 처리 중 오류가 발생했습니다.');
            return false;
        }
    }

    nextBtn.addEventListener('click', async () => {
        const currentIndex = getActiveTabIndex();

        if (currentIndex === 2) {
            if(confirm('예약을 하시겠습니까?')){
                const success = await processReservation();

                if(success) {
                    alert('예약이 완료되었습니다!');
                    await loadSeat();
                    tabContent[currentIndex].classList.remove('active');
                    tabContent[currentIndex + 1].classList.add('active');
                    updateButtons();
                }
            }
            return;
        }

        if(!validateStep(currentIndex)) {
            return;
        }

        if(currentIndex < tabContent.length - 1) {
            tabContent[currentIndex].classList.remove('active');
            tabContent[currentIndex + 1].classList.add('active');
            updateButtons();
        }
    });

    function validateStep(stepIndex) {
        switch (stepIndex) {
            case 0:
                if(!selectedDate) {
                    alert("날짜를 선택해주세요.");
                    return false;
                }
                if(!selectedScheduleId) {
                    alert("공연 일정을 선택해주세요.");
                    return false;
                }
                break;
            case 1:
                if(selectedSeats.length === 0) {
                    alert("좌석을 선택해주세요.")
                    return false;
                }
                break;
            case 2:
                break;
            case 3:
                break;
        }
        return true;
    }

    updateButtons();

    if(document.getElementById('A')){
        createSeats();
    }

    if (document.querySelector(".reservation-info")) {
        loadPerformanceDetail();
    }

    const tabButtons = document.querySelectorAll(".tab-button");
    const resultBtn = document.querySelectorAll(".tab-result");

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            const targetTab = document.getElementById(tabId);

            tabButtons.forEach(tab => tab.classList.remove('active'));
            resultBtn.forEach(tab => tab.classList.remove('active'));

            targetTab.classList.add('active');
            button.classList.add('active');
        })
    })

});