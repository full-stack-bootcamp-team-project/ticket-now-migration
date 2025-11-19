const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <img className="footer-logo" src="/static/images/footer-logo.png" />
                </div>

                <div className="footer-info">
                    <div className="footer-company">(주)티켓나우</div>

                    <p className="footer-detail">
                        대표: 유기태, 조연희, 박형빈 | 주소: 서울특별시 종로구 관수동 수표로 96 2F 국일관<br/>
                        이메일: ticketnow@ticketnow.com | 고객센터: 1234-5678<br/>
                        사업자등록번호: 101-85-12257 | 통신판매업신고: 2013-서울종로-0471호<br/>
                        호스팅 서비스사업자: (주)티켓나우
                    </p>
                    <p className="footer-copy">Copyright © TICKETNOW Corp. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;