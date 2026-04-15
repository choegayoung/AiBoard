import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const NotFound = () => (
  <div className="not-found-container text-center">
    <div className="not-found-content">
      <h1 className="display-1 mongle-404-title">404</h1>
      
      <div className="mongle-message-box">
        <span className="mongle-icon" role="img" aria-label="crying cat">👻</span>
        <p className="lead mongle-text">
          이 페이지는 못 찾겠어요! <br />
          길을 잃어버린 것 같아요...
        </p>
      </div>

      <Link to="/" className="btn btn-mongle-primary">
        홈으로 돌아가기
      </Link>
    </div>
  </div>
);

export default NotFound;