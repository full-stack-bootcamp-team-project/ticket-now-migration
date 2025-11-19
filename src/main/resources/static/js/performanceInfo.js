const urlParams = new URLSearchParams(window.location.search);

const performanceId = urlParams.get("performanceId");


// 자동 시작
window.addEventListener("DOMContentLoaded", () => {
    if(document.querySelector(".performance-info")){
        loadPerformanceDetail();
    }
});

// performanceId 을 기준으로 JSON 형태로 변환 로직
async function detailFunction(performanceId) {

    const res = await fetch(API_BASE_URL + `/api/performance/detail?performanceId=${performanceId}`);

    if(!res.ok){
        throw new Error("공연 정보를 불러오는데 실패했습니다.")
    }

    return await res.json();
}


// 1. 페이지 로드 시 공연 상세 정보 가져오기
async function loadPerformanceDetail() {

    if (!performanceId) {
        alert("잘못된 공연 정보입니다.")
        window.location.href = "/performance/all";
    }

    const p = await detailFunction(performanceId);

    console.log("DB 데이터 조회 : ", p)

    // performance 테이블에 저장되어 있는 정보
    const image = document.getElementById("performanceBodyImage");
    const headerTitle = document.getElementById("performanceHeaderTitle");
    const performanceHeaderCategory = document.getElementById("performanceHeaderCategory");
    const performanceCategory = document.getElementById("performanceCategory");
    const performanceTitle = document.getElementById("performanceTitle");
    const performanceAddress = document.getElementById("performanceAddress");
    const performancePrice = document.getElementById("performancePrice");
    const performanceInfo = document.getElementById("performanceInfo");
    const performanceCheckInfoTitle = document.getElementById("performanceCheckInfoTitle");
    const performanceCheckInfoTitleContent = document.getElementById("performanceCheckInfoTitleContent");

    // performanceSchedule 테이블에 저장되어 있는 정보
    const performanceScheduleStartDate = document.getElementById("performanceScheduleStartDate");
    const performanceScheduleStartTime = document.getElementById("performanceScheduleStartTime");

    // performanceSchedule 테이블에 저장되어 있는 정보
    const performanceCheckInfoCastingMember = document.getElementById("performanceCheckInfoCastingMember");

    // kakao map 정보
    const performanceCheckInfoMapDetail = document.getElementById("performanceCheckInfoMapDetail");

    // performance 테이블에 저장되어 있는 정보
    headerTitle.innerText = p.performanceTitle;
    image.innerHTML = `
    <img src="${p.performanceImagePath}" class="load-image" />
    `;
    performanceHeaderCategory.innerHTML = `
    <p class="performance-header-ranking"> ${p.performanceCategory} > ${p.performanceCategory} 주간 순위 ${p.performanceRanking}위</p>
    `;
    performanceCategory.innerText = `${p.performanceCategory}`;
    performanceTitle.innerText = `${p.performanceTitle}`;
    performanceAddress.innerText = `${p.performanceAddress}`;
    performancePrice.innerText = `${Number(p.performancePrice).toLocaleString()}원`;
    performanceInfo.innerText = `${p.performanceInfo}`;
    performanceCheckInfoTitle.innerText = `${p.performanceTitle}`;
    performanceCheckInfoTitleContent.innerText = `${p.performanceInfo}`;


    // performanceSchedule 테이블에 저장되어 있는 정보
    if(p.schedules.length === 0) {
        performanceScheduleStartDate.innerText = "등록된 정보가 없습니다";
        performanceScheduleStartTime.innerText = "등록된 정보가 없습니다";
    } else {
        performanceScheduleStartDate.innerText = `${p.schedules[0].performanceScheduleStartDate}`;
        performanceScheduleStartTime.innerText = `${p.schedules[0].performanceScheduleStartTime}`;
    }

    // castMembers 테이블에 저장되어 있는 정보
    if(p.castMembers.length !== 0) {
        performanceCheckInfoCastingMember.innerHTML = '';

        for (let i = 0; i < p.castMembers.length ; i++) {


            performanceCheckInfoCastingMember.innerHTML += `
            <div >
            <img src="${p.castMembers[i].castMemberImagePath}"/>
            <p class="load-casting-member">${p.castMembers[i].castMemberName}</p>
            </div>
            `;
        }
    } else {
        // performanceSchedule 테이블에 정보가 없을 경우
        performanceCheckInfoCastingMember.innerHTML = `<p>등록된 정보가 없습니다.</p>`;
    }

    // 공연 위치
    performanceCheckInfoMapDetail.innerText = `장소 : ${p.performanceAddress}`;
    // console.log("위치 : ", p.performanceAddress);

    loadKakaoMap(p.performanceAddress);

    const reservationBtn = document.getElementById("reservationBtn");

    // 예매하기 버튼 클릭했을 때
    reservationBtn.addEventListener("click", () =>{
        if(p.schedules.length === 0){
            alert("해당 공연은 예약할 수 없습니다.");
        } else {
            goToReservation(p.performanceId)
        }
    })
}

function loadKakaoMap(performanceAddress) {
    // 카카오 지도 생성 및 위치 찾기
    const mapContainer = document.getElementById('map'), // 지도를 표시할 div

        mapOption = {
            center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };

    console.log("performanceAddress : ", performanceAddress);

    // 지도 생성
    const map = new kakao.maps.Map(mapContainer, mapOption);

    // 주소-좌표 변환 객체 생성
    const geocoder = new kakao.maps.services.Geocoder();

    // 주소로 좌표 검색
    geocoder.addressSearch(performanceAddress , function(result, status) {

        // 정상적으로 검색이 완료됐으면
        if (status === kakao.maps.services.Status.OK) {

            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 결과값으로 받은 위치를 마커로 표시합니다
            const marker = new kakao.maps.Marker({
                map: map,
                position: coords
            });

            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
            map.setCenter(coords);
        }
    });
}


// 상세 정보 보기 숨기기
const detailInfo = document.getElementById("detailInfo");

// 버튼 클릭 시 상세 정보 보이도록 설정
detailInfo.addEventListener('click', async () => {

    const r = await detailFunction(performanceId);

    setTimeout(() => {
        loadKakaoMap(r.performanceAddress);

    },50)
    const performanceCheckInfo = document.querySelector('.performance-check-info');

    performanceCheckInfo.style.display = "block";
    detailInfo.style.display = "none";

    // 지도가 깨질 경우, map.relayout() 호출
    // setTimeout(() => {
    //     map.relayout(); // 지도가 div 크기를 다시 계산
    //     map.setCenter(coords); // 중심 좌표 재설정
    // }, 50); // 100ms 정도 지연을 주면 안전
})


// // 2. 출연자 정보 가져오기
// function loadCastInfo() {
//     fetch(`/performance/cast/${performanceId}`);
//
// }

// 3. 예매 페이지로 이동
function goToReservation(performanceId) {

    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const options = `
        width=${width},
        height=${height},
        left=${left},
        top=${top},
    `;


    window.open(
        `${API_BASE_URL}/reservation?performanceId=${performanceId}`,
        "_blank",
        options
    );
}
