import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter, Routes, Route, useNavigate, Link, useParams } from "react-router-dom";
import BoardView from './BoardView';
import Home from './Home';
import BoardAdd from './BoardAdd';
import NotFound from './Notfound';


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