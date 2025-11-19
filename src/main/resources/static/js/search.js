// URL에서 검색 파라미터 가져오기
const urlParams = new URLSearchParams(window.location.search);
const searchType = urlParams.get('searchType') || 'total';
const keyword = urlParams.get('keyword') || '';

// 페이지 로드 시 검색 실행
document.addEventListener('DOMContentLoaded', () => {
    if (keyword) {
        performSearch(searchType, keyword);
    } else {
        displayNoResults('검색어를 입력해주세요.');
    }
});

// 검색 수행 함수
async function performSearch(type, keyword) {
    try {
        // 로딩 표시
        showLoading();

        // 검색 타이틀 업데이트
        updateSearchTitle(type, keyword);

        // API 엔드포인트 결정
        let apiUrl = '';
        switch(type) {
            case 'total':
                apiUrl = `${API_BASE_URL}/api/performance/search/total?searchType=${type}&keyword=${encodeURIComponent(keyword)}`;
                break;
            case 'keyword':
            case 'category':
                apiUrl = `${API_BASE_URL}/api/performance/search/keyword?searchType=${type}&keyword=${encodeURIComponent(keyword)}`;
                break;
            case 'title':
                apiUrl = `${API_BASE_URL}/api/performance/search/title?searchType=${type}&keyword=${encodeURIComponent(keyword)}`;
                break;
            case 'cast':
                apiUrl = `${API_BASE_URL}/api/performance/search/cast?searchType=${type}&keyword=${encodeURIComponent(keyword)}`;
                break;
            default:
                apiUrl = `${API_BASE_URL}/api/performance/search/total?searchType=total&keyword=${encodeURIComponent(keyword)}`;
        }

        // API 호출
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('검색 중 오류가 발생했습니다.');
        }

        const performances = await response.json();

        // 결과 표시
        displaySearchResults(performances, keyword);

    } catch (error) {
        console.error('Search error:', error);
        displayError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 검색 결과 표시
function displaySearchResults(performances, keyword) {
    const listContainer = document.getElementById('popularList');

    if (!performances || performances.length === 0) {
        displayNoResults('검색 결과가 없습니다.');
        return;
    }

    listContainer.innerHTML = performances.map(performance => {

        const highlightedTitle = highlightKeyword(performance.performanceTitle, keyword);

        return `
        <div class="performance-item" onclick="goToDetail('${performance.performanceId}')">
            <div class="performance-image">
                <img src="${performance.performanceImagePath || '/images/default-performance.jpg'}" 
                     alt="${performance.performanceTitle}"
                     onerror="this.src='/images/default-performance.jpg'">
            </div>
            <div class="performance-info">
                ${performance.performanceRanking ? `<span class="ranking">랭킹 ${performance.performanceRanking}위</span>` : ''}
                <h4 class="performance-title">${highlightedTitle}</h4>
            </div>
        </div>
    `
    }).join('');
}

// 검색 결과 없음 표시
function displayNoResults(message) {
    const listContainer = document.getElementById('popularList');
    listContainer.innerHTML = `
        <div class="no-results">
            <p>${message}</p>
        </div>
    `;
}

// 에러 표시
function displayError(message) {
    const listContainer = document.getElementById('popularList');
    listContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// 로딩 표시
function showLoading() {
    const listContainer = document.getElementById('popularList');
    listContainer.innerHTML = `
        <div class="loading">
            <p>검색 중...</p>
        </div>
    `;
}

// 검색 타이틀 업데이트
function updateSearchTitle(type,keyword) {
    const titleElement = document.getElementById('searchTitle');

    const typeNames = {
        total: '통합 검색 결과',
        keyword: '키워드 검색 결과',
        category: '카테고리 검색 결과',
        title: '제목 검색 결과',
        cast: '출연자 검색 결과'
    };

    if (titleElement) {
        titleElement.innerHTML = `'${keyword}' ${typeNames[type]}`;
    }
}

// 공연 상세 페이지로 이동
function goToDetail(performanceId) {
    window.location.href = `/performance/detail?performanceId=${performanceId}`;
}