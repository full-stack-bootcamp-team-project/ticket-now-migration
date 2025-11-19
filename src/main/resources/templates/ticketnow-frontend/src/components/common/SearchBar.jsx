const SearchBar = () => {
    return (
        <div className="body">
            <div className="search-container category-section">
                <h3 className="container-title" id="searchTitle">
                    <span className="searchTypeSpan"></span> {검색내용} 검색 결과
                </h3>
                <div className="performance-list" id="popularList"></div>
            </div>
        </div>
    );
};

export default SearchBar;