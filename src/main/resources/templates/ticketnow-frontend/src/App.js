import './styles/styles.css';
import {Route, Routes} from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import MainPage from "./pages/MainPage";

function App() {
  return (
      <div className="App">
          <Header/>
            <Routes>
            <Route path="/" element={<MainPage/>}/>
            {/*
                id 값 형태를 path 형태로 가져오는게 맞는지
                아래 방식 : http://localhost:3000/board/12
                적용해야할 방식 : http://43.201.71.58:8080/performance/detail?performanceId=P001
                */}
            {/*<Route path="/board/:id" element={<BoardDetail />} />*/}
            </Routes>
          <Footer/>
      </div>
      );
}

export default App;
