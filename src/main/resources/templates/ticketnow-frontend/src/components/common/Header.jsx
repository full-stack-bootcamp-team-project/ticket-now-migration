const Header = () => {
    return (
        <header className="element-header">
            <div className="menu-top">
                <nav className="menu-top-nav" id="headerLoginMenu">
                    <a href="/user/login">로그인</a>
                    <a href="/user/myPage">마이페이지</a>
                </nav>
            </div>
            <div className="menu-bar">
                <div className="menu-left">
                    <a href="/" className="logo"><img className="logo-icon" src="/static/images/logo.png" alt="logo"/></a>
                    <nav className="nav-bar">
                        <a href="/">전체</a>
                        <a href="/?category=콘서트">콘서트</a>
                        <a href="/?category=뮤지컬">뮤지컬</a>
                        <a href="/?category=연극">연극</a>
                        <a href="/?category=클래식">클래식</a>
                    </nav>
                </div>
                <div className="search-bar">
                    <div className="search-select">
                        <button type="button" className="select-button">통합검색</button>
                        <ul className="search-select-list">
                            <li>
                                <button type="button" id="total">
                                    통합검색
                                </button>
                            </li>
                            <li>
                                <button type="button" id="category">
                                    카테고리
                                </button>
                            </li>
                            <li>
                                <button type="button" id="title">
                                    제목
                                </button>
                            </li>
                            <li>
                                <button type="button" id="cast">
                                    출연자
                                </button>
                            </li>
                        </ul>
                    </div>
                    <input type="search" id="site-search" className="search-input"></input>
                    <button type="button" className="search-icon-button">
                        <img className="search-icon" src="/static/images/search-icon.png"/>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;