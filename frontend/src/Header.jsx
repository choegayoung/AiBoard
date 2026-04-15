import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Header = ({ isLoading = false }) => {
    const nav = useNavigate();

    return (
        <button
            type="button"
            className="boardadd-logo"
            onClick={() => nav("/")}
            disabled={isLoading}
            style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: isLoading ? 0.6 : 1
            }}
        >
            <span>🧸</span>
            <h1>가영 게시판</h1>
        </button>
    );
};

export default Header;