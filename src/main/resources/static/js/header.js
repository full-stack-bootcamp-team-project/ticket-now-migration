// API 기본 URL 설정
if (typeof API_BASE_URL === 'undefined') {
    var API_BASE_URL = "http://43.201.71.58:8080";
}

// 검색 타입 관리
let currentSearchType = 'total';
let autocompleteTimeout = null;
document.addEventListener('DOMContentLoaded', () => {
    // 로그아웃 이벤트만 등록
    checkLoginStatus();

    // 기존 검색 초기화
    initHeaderSearch();
    createAutocompleteContainer();
    searchTypeChange();
});


// 로그인 상태 확인
async function checkLoginStatus() {
    const headerLoginMenu = document.getElementById('headerLoginMenu');
    if (!headerLoginMenu) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/login/check`, {
            method: 'GET',
            credentials: 'include'
        });

        const isLoggedIn = await response.json();

        if (isLoggedIn === true) {
            headerLoginMenu.innerHTML = `
                <a href="#" id="logoutLink">로그아웃</a>
                <a href="/user/myPage">마이페이지</a>
            `;

            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) logoutLink.addEventListener('click', handleLogout);

        } else {
            headerLoginMenu.innerHTML = `
                <a href="/user/login">로그인</a>
                <a href="/user/signup">회원가입</a>
            `;
        }
    } catch (error) {
        // 에러 발생 시 로그아웃 상태로 처리
        console.error('로그인 상태 확인 오류:', error);
        headerLoginMenu.innerHTML = `
            <a href="/user/login">로그인</a>
            <a href="/user/signup">회원가입</a>
        `;
    }
}

// 로그아웃 처리
async function handleLogout(e) {
    e.preventDefault();

    if (!confirm("로그아웃 하시겠습니까?")) {} else {
       try {
            const response = await fetch(`${API_BASE_URL}/api/user/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                alert('로그아웃되었습니다.');
                window.location.href = "/";
            } else {
                alert('로그아웃에 실패했습니다.');
            }

        } catch (error) {
            console.error('로그아웃 오류:', error);
            alert('서버 오류로 로그아웃에 실패했습니다.');
        }
    }
}

// 헤더 검색 기능 초기화
function initHeaderSearch() {
    const searchInput = document.getElementById('site-search');
    const searchButton = document.querySelector('.search-icon-button');
    const selectButton = document.querySelector('.select-button');

    // 검색 버튼 클릭 이벤트
    if (searchButton) {
        searchButton.addEventListener('click', performHeaderSearch);
    }

    // 검색창 입력 이벤트 (자동완성)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleAutocomplete(e.target.value);
        });

        // 검색창 엔터 이벤트
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performHeaderSearch();
            }
        });

        // 검색창 포커스 아웃 시 자동완성 숨김
        searchInput.addEventListener('blur', () => {
            setTimeout(() => hideAutocomplete(), 200);
        });

        // 검색창 포커스 시 자동완성 다시 표시
        searchInput.addEventListener('focus', (e) => {
            if (e.target.value.trim()) {
                handleAutocomplete(e.target.value);
            }
        });
    }

    // 검색 타입 선택 (추후 드롭다운 구현 시)
    if (selectButton) {
        selectButton.addEventListener('click', () => {
            console.log('현재 검색 타입:', currentSearchType);
        });
    }

    // 외부 클릭 시 자동완성 숨김
    document.addEventListener('click', (e) => {
        const autocompleteContainer = document.querySelector('.search-autocomplete');
        const searchBar = document.querySelector('.search-bar');
        if (autocompleteContainer && searchBar && !searchBar.contains(e.target)) {
            hideAutocomplete();
        }
    });
}

// 자동완성 컨테이너 생성
function createAutocompleteContainer() {
    const searchBar = document.querySelector('.search-bar');
    if (!searchBar || document.querySelector('.search-autocomplete')) {
        return;
    }

    const autocompleteDiv = document.createElement('div');
    autocompleteDiv.className = 'search-autocomplete';
    autocompleteDiv.style.display = 'none';
    searchBar.appendChild(autocompleteDiv);
}

// 자동완성 처리
function handleAutocomplete(keyword) {
    // 이전 타이머 취소
    if (autocompleteTimeout) {
        clearTimeout(autocompleteTimeout);
    }

    // 빈 값이면 숨김
    if (!keyword.trim()) {
        hideAutocomplete();
        return;
    }

    // 300ms 후 자동완성 API 호출 (디바운싱)
    autocompleteTimeout = setTimeout(() => {
        fetchAutocompleteResults(keyword.trim());
    }, 300);
}

// 자동완성 결과 가져오기
async function fetchAutocompleteResults(keyword) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/performance/search/autocomplete?keyword=${encodeURIComponent(keyword)}`
        );

        if (!response.ok) {
            hideAutocomplete();
            return;
        }

        const results = await response.json();
        displayAutocompleteResults(results, keyword);

    } catch (error) {
        console.error('자동완성 조회 오류:', error);
        hideAutocomplete();
    }
}

// 자동완성 결과 표시
function displayAutocompleteResults(results, keyword) {
    const autocompleteContainer = document.querySelector('.search-autocomplete');

    if (!autocompleteContainer) {
        return;
    }

    if (!results || results.length === 0) {
        autocompleteContainer.innerHTML = '<div class="autocomplete-empty">검색 결과가 없습니다</div>';
        autocompleteContainer.style.display = 'block';
        return;
    }

    // 최대 10개만 표시
    const limitedResults = results.slice(0, 10);

    autocompleteContainer.innerHTML = limitedResults.map(performance => {
        // 검색어 하이라이트
        const highlightedTitle = highlightKeyword(performance.performanceTitle, keyword);

        return `
            <div class="autocomplete-item" onclick="selectAutocomplete('${escapeHtml(performance.performanceTitle)}')">
                <img src="${performance.performanceImagePath || '/images/default-performance.jpg'}" 
                     alt="${escapeHtml(performance.performanceTitle)}"
                     onerror="this.src='/images/default-performance.jpg'">
                <div class="autocomplete-info">
                    <div class="autocomplete-title">${highlightedTitle}</div>
                    <div class="autocomplete-category">${escapeHtml(performance.performanceCategory || '')}</div>
                </div>
            </div>
        `;
    }).join('');

    autocompleteContainer.style.display = 'block';
}

// 자동완성 항목 선택
function selectAutocomplete(title) {
    const searchInput = document.getElementById('site-search');
    if (searchInput) {
        searchInput.value = title;
        hideAutocomplete();
        performHeaderSearch();
    }
}

// 자동완성 숨김
function hideAutocomplete() {
    const autocompleteContainer = document.querySelector('.search-autocomplete');
    if (autocompleteContainer) {
        autocompleteContainer.style.display = 'none';
    }
}

// 검색어 하이라이트
function highlightKeyword(text, keyword) {
    if (!keyword) return escapeHtml(text);

    const escapedText = escapeHtml(text);
    const escapedKeyword = escapeHtml(keyword);
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');

    return escapedText.replace(regex, '<strong>$1</strong>');
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 헤더에서 검색 실행
function performHeaderSearch() {
    const searchInput = document.getElementById('site-search');
    const keyword = searchInput.value.trim();

    if (!keyword) {
        alert('검색어를 입력해주세요.');
        searchInput.focus();
        return;
    }

    hideAutocomplete();

    // 검색 페이지로 이동
    window.location.href = `/performance/search?searchType=${currentSearchType}&keyword=${encodeURIComponent(keyword)}`;
}

/**
 * 검색 타입 변경 함수
 * @param {string} type - 검색 타입 (total, keyword, title, cast)
 */
function changeSearchType(type) {
    currentSearchType = type;
    const selectButton = document.querySelector('.select-button');

    const typeNames = {
        'total': '통합검색',
        'category': '카테고리',
        'title': '제목',
        'cast': '출연자'
    };

    if (selectButton) {
        selectButton.textContent = typeNames[type] || '통합검색';
    }

}

function searchTypeChange (){
    // 검색 타입 선택 버튼 이벤트 등록
    document.querySelectorAll('.search-select-list button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.id;
            changeSearchType(type);
            toggleDropdown(false); // 선택 후 닫기
        });
    });

    // select-button 클릭 시 드롭다운 열기/닫기
    const selectButton = document.querySelector('.select-button');
    selectButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
    });

    // 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.search-select-list');
        const selectBox = document.querySelector('.search-select');
        if (dropdown && !selectBox.contains(e.target)) {
            toggleDropdown(false);
        }
    });
}

// 드롭다운 열기/닫기
function toggleDropdown(forceClose = null) {
    const dropdown = document.querySelector('.search-select-list');
    const selectButton = document.querySelector('.select-button');
    if (!dropdown) return;

    if (forceClose === false) {
        dropdown.classList.remove('show');
        selectButton.classList.remove('open-select-button');
        return;
    }

    dropdown.classList.toggle('show');
    selectButton.classList.toggle('open-select-button');
}
