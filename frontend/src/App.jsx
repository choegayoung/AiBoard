import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter, Routes, Route, useNavigate, Link, useParams } from "react-router-dom";
import BoardView from './BoardView';
import Home from './Home';
import BoardAdd from './BoardAdd';

const NotFound = () => (
  <div className="container text-center mt-5">
    <h1 className="display-1 fw-bold">404</h1>
    <p className="lead">페이지를 찾을 수 없습니다.</p>
    <Link to="/" className="btn btn-outline-primary">홈으로 돌아가기</Link>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/boardadd" element={<BoardAdd />} />
        <Route path="/boardview/:no" element={<BoardView />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;