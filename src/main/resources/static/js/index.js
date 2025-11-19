// 현재 선택된 카테고리 (전체가 기본값)
let currentCategory = 'all';

// 돔이 생성된 후 작업
document.addEventListener("DOMContentLoaded", () => {
    // URL에서 카테고리 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    if (categoryParam) {
        currentCategory = categoryParam;
    }

    // 헤더 메뉴 활성화 상태 업데이트
    updateHeaderMenuState();

    // 공연 데이터 로드
    fetchPerformanceData()
        .then(() => {
            console.log("공연 데이터 로드 완료");
        })
        .catch((err) => {
            console.error("공연 데이터를 불러오는 중 오류 발생:", err);
        });
});

// 헤더 메뉴 활성화 상태 업데이트
function updateHeaderMenuState() {
    const navLinks = document.querySelectorAll('.nav-bar a');

    navLinks.forEach(link => {
        link.classList.remove('select');

        const linkHref = link.getAttribute('href');

        // 전체 메뉴
        if ((linkHref === '/' || linkHref === '/?category=all') && currentCategory === 'all') {
            link.classList.add('select');
        }
        // 카테고리 메뉴
        else if (linkHref.includes('category=')) {
            const linkCategory = linkHref.split('category=')[1];
            if (linkCategory === currentCategory) {
                link.classList.add('select');
            }
        }
    });
}

// 카테고리별 공연 데이터 로드
async function fetchPerformanceData() {
    const mainContainer = document.querySelector('.main-container');

    try {
        let performances;

        // 전체 또는 특정 카테고리 조회
        if (currentCategory === 'all') {
            const res = await fetch(`/api/performance/all`);
            if (!res.ok) throw new Error(`서버 응답 오류 : ${res.status}`);
            performances = await res.json();
        } else {
            const res = await fetch(`/api/performance/category?category=${encodeURIComponent(currentCategory)}`);
            if (!res.ok) throw new Error(`서버 응답 오류 : ${res.status}`);
            performances = await res.json();
        }

        console.log("공연 데이터 확인 :", performances);

        // 메인 배너용 (최신순 상위 10개)
        const bannerPerformances = [...performances]
            .sort((a, b) => new Date(b.performanceDate) - new Date(a.performanceDate))
            .slice(0, 10);

        renderMainBanner(bannerPerformances);
        initMainBanner();

        // 카테고리별 섹션 렌더링
        if (currentCategory === 'all') {
            renderAllCategorySections(performances);
        } else {
            renderSingleCategorySection(performances, currentCategory);
        }

    } catch (err) {
        console.error("공연 데이터를 불러오는 중 오류 data-none-section 발생:", err);

        const mainContainer = document.querySelector('.category-section');
        mainContainer.className = 'category-section data-none-section';
        mainContainer.innerHTML += '<p class="data-none">공연 데이터를 불러올 수 없습니다.</p>';
    }
}

// 전체 카테고리 섹션 렌더링 (인기 전체, 최신 전체, 인기 콘서트, 인기 뮤지컬, 인기 연극, 인기 클래식)
function renderAllCategorySections(performances) {
    const mainContainer = document.querySelector('.main-container');
    const categories = ['콘서트', '뮤지컬', '연극', '클래식'];

    // 기존 카테고리 섹션 제거
    const existingSections = mainContainer.querySelectorAll('.category-section');
    existingSections.forEach(section => section.remove());

    // 1. 인기 전체 섹션 (모든 카테고리 통합, 랭킹순)
    const allPopularPerformances = [...performances]
        .sort((a, b) => a.performanceRanking - b.performanceRanking)
        .slice(0, 10);

    if (allPopularPerformances.length > 0) {
        const popularAllSection = document.createElement('div');
        popularAllSection.className = 'category-section';
        popularAllSection.innerHTML = `
            <h3 class="container-title">인기 전체</h3>
            <div class="performance-list" id="popularAllList"></div>
        `;
        mainContainer.appendChild(popularAllSection);

        const popularAllList = document.getElementById('popularAllList');
        renderPerformanceList(popularAllList, allPopularPerformances, '등록된 공연이 없습니다.');
    }

    // 2. 최신 전체 섹션 (모든 카테고리 통합, 날짜순)
    const allRecentPerformances = [...performances]
        .sort((a, b) => new Date(b.performanceDate) - new Date(a.performanceDate))
        .slice(0, 10);

    if (allRecentPerformances.length > 0) {
        const recentAllSection = document.createElement('div');
        recentAllSection.className = 'category-section';
        recentAllSection.innerHTML = `
            <h3 class="container-title">최신 전체</h3>
            <div class="performance-list" id="recentAllList"></div>
        `;
        mainContainer.appendChild(recentAllSection);

        const recentAllList = document.getElementById('recentAllList');
        renderPerformanceList(recentAllList, allRecentPerformances, '등록된 공연이 없습니다.');
    }

    // 3. 각 카테고리별 인기 섹션
    categories.forEach(category => {
        // 해당 카테고리 공연만 필터링
        const categoryPerformances = performances.filter(p => p.performanceCategory === category);

        if (categoryPerformances.length === 0) return;

        // 인기순 정렬 (performanceRanking 오름차순)
        const popularPerformances = [...categoryPerformances]
            .sort((a, b) => a.performanceRanking - b.performanceRanking)
            .slice(0, 10);

        // 섹션 생성
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `
            <h3 class="container-title">인기 ${category}</h3>
            <div class="performance-list" id="popular${category}List"></div>
        `;

        mainContainer.appendChild(section);

        // 공연 리스트 렌더링
        const listContainer = document.getElementById(`popular${category}List`);
        renderPerformanceList(listContainer, popularPerformances, `등록된 ${category} 공연이 없습니다.`);
    });
}

// 단일 카테고리 섹션 렌더링 (인기 {카테고리}, 최신 {카테고리})
function renderSingleCategorySection(performances, category) {
    const mainContainer = document.querySelector('.main-container');

    // 기존 카테고리 섹션 제거
    const existingSections = mainContainer.querySelectorAll('.category-section');
    existingSections.forEach(section => section.remove());

    if (performances.length === 0) {
        const emptySection = document.createElement('div');
        emptySection.className = 'category-section data-none-section';
        emptySection.innerHTML = `<p class="data-none">등록된 ${category} 공연이 없습니다.</p>`;
        mainContainer.appendChild(emptySection);
        return;
    }

    // 인기 {카테고리} 섹션
    const popularPerformances = [...performances]
        .sort((a, b) => a.performanceRanking - b.performanceRanking)
        .slice(0, 10);

    const popularSection = document.createElement('div');
    popularSection.className = 'category-section';
    popularSection.innerHTML = `
        <h3 class="container-title">인기 ${category}</h3>
        <div class="performance-list" id="popularList"></div>
    `;
    mainContainer.appendChild(popularSection);

    const popularList = document.getElementById('popularList');
    renderPerformanceList(popularList, popularPerformances, `등록된 ${category} 공연이 없습니다.`);

    // 최신 {카테고리} 섹션
    const recentPerformances = [...performances]
        .sort((a, b) => new Date(b.performanceDate) - new Date(a.performanceDate))
        .slice(0, 10);

    const recentSection = document.createElement('div');
    recentSection.className = 'category-section';
    recentSection.innerHTML = `
        <h3 class="container-title">최신 ${category}</h3>
        <div class="performance-list" id="recentList"></div>
    `;
    mainContainer.appendChild(recentSection);

    const recentList = document.getElementById('recentList');
    renderPerformanceList(recentList, recentPerformances, `등록된 ${category} 공연이 없습니다.`);
}

// 메인 배너 무한 캐러셀 초기화 함수
function initMainBanner() {
    const bannerContainer = document.querySelector(".main-banner");
    const originalItems = Array.from(document.querySelectorAll(".main-banner-item"));

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (originalItems.length === 0) return;

    const originalTotal = originalItems.length;

    // 뒤쪽에 3세트 복제
    for (let i = 0; i < 3; i++) {
        originalItems.forEach(item => {
            const cloneBack = item.cloneNode(true);
            bannerContainer.appendChild(cloneBack);
        });
    }

    // 앞쪽에 3세트 복제
    for (let i = 0; i < 3; i++) {
        originalItems.slice().reverse().forEach(item => {
            const cloneFront = item.cloneNode(true);
            bannerContainer.insertBefore(cloneFront, bannerContainer.firstChild);
        });
    }

    let allItems = Array.from(document.querySelectorAll(".main-banner-item"));
    let currentIndex = originalTotal * 3;
    let isTransitioning = false;

    moveToPosition(false);

    let slideInterval = setInterval(() => nextSlide(), 3000);

    prevBtn.addEventListener("click", () => {
        if (isTransitioning) return;
        clearInterval(slideInterval);
        prevSlide();
        slideInterval = setInterval(nextSlide, 3000);
    });

    nextBtn.addEventListener("click", () => {
        if (isTransitioning) return;
        clearInterval(slideInterval);
        nextSlide();
        slideInterval = setInterval(nextSlide, 3000);
    });

    function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        moveToPosition(true);
    }

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        moveToPosition(true);
    }

    function moveToPosition(animated) {
        const itemWidth = allItems[0].offsetWidth + 24;
        const centerOffset = window.innerWidth / 2 - allItems[0].offsetWidth / 2;
        const targetPosition = -currentIndex * itemWidth + centerOffset;

        updateStyles();

        if (animated) {
            bannerContainer.style.transition = "transform 0.6s ease-in-out";
            bannerContainer.style.transform = `translateX(${targetPosition}px)`;

            const transitionEnd = () => {
                bannerContainer.removeEventListener('transitionend', transitionEnd);

                if (currentIndex >= originalTotal * 6) {
                    currentIndex = currentIndex - originalTotal * 3;
                    bannerContainer.style.transition = "none";
                    const newPosition = -currentIndex * itemWidth + centerOffset;
                    bannerContainer.style.transform = `translateX(${newPosition}px)`;
                    updateStyles();
                    void bannerContainer.offsetHeight;
                }
                else if (currentIndex < originalTotal) {
                    currentIndex = currentIndex + originalTotal * 3;
                    bannerContainer.style.transition = "none";
                    const newPosition = -currentIndex * itemWidth + centerOffset;
                    bannerContainer.style.transform = `translateX(${newPosition}px)`;
                    updateStyles();
                    void bannerContainer.offsetHeight;
                }

                isTransitioning = false;
            };

            bannerContainer.addEventListener('transitionend', transitionEnd, { once: true });

            setTimeout(() => {
                if (isTransitioning) {
                    bannerContainer.removeEventListener('transitionend', transitionEnd);
                    transitionEnd();
                }
            }, 700);
        } else {
            bannerContainer.style.transition = "none";
            bannerContainer.style.transform = `translateX(${targetPosition}px)`;
            isTransitioning = false;
        }
    }

    function updateStyles() {
        allItems.forEach((item, idx) => {
            item.classList.remove("center-banner-item", "slide-banner-item");

            const distance = Math.abs(idx - currentIndex);
            const cycleDistance = Math.min(distance, allItems.length - distance);

            if (idx === currentIndex) {
                item.classList.add("center-banner-item");
            } else if (cycleDistance === 1) {
                item.classList.add("slide-banner-item");
            }
        });
    }
}

// 메인 배너 렌더링
function renderMainBanner(performances) {
    const bannerContainer = document.querySelector(".main-banner");
    bannerContainer.innerHTML = "";

    if (!performances || performances.length === 0) {
        const mainBanner = document.querySelector('.main-banner-wrap');
        mainBanner?.remove();
        bannerContainer.innerHTML = "<p>등록된 공연이 없습니다.</p>";
        return;
    }

    performances.forEach(performance => {
        const bannerHTML = `
            <div class="main-banner-item" onclick="gotoPerformanceDetail('${performance.performanceId}')">
                <img src="${performance.performanceImagePath}" 
                     alt="${performance.performanceTitle}" 
                     class="main-banner-image" />
                <p class="main-banner-item-title">${performance.performanceTitle}</p>
            </div>
        `;
        bannerContainer.innerHTML += bannerHTML;
    });
}

// 공연 리스트 렌더링
function renderPerformanceList(container, dataList, emptyMessage) {
    container.innerHTML = "";

    if (!dataList || dataList.length === 0) {
        container.innerText = emptyMessage;
        return;
    }

    dataList.forEach(performance => {
        const itemHTML = `
            <div class="performance-item" onclick="gotoPerformanceDetail('${performance.performanceId}')">
                <div class="performance-image">
                    <img src="${performance.performanceImagePath}" 
                         alt="${performance.performanceCategory}" 
                         class="performance_image" />
                </div>
                <div class="performance-info">
                    <h4 class="performance-title">${performance.performanceTitle}</h4>
                </div>
            </div> 
        `;
        container.innerHTML += itemHTML;
    });
}

// 공연 상세 페이지로 이동
function gotoPerformanceDetail(performanceId){
    window.location.href = `/performance/detail?performanceId=${performanceId}`;
}
