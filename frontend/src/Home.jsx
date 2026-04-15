import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../utils/network.js';
import './App.css'

const Home = () => {
    const nav = useNavigate();
    const [list, setList] = useState([])
    useEffect(() => {
        api.get(`/getlist`).then(res => {
            if (res.data.status === "success") {
                setList([...res.data.data]);
            }
        }).catch(err => {
            console.error("데이터 로딩 실패:", err);
        });
    }, []);
    return (
        <div className="home-container">
            <header className="home-header">
                <Link to="/" className="home-header-logo">
                    <span>🐾</span>
                    <h1>가영 게시판</h1>
                </Link>
            </header>

            {/* 메인 내용 */}
            <main>
                <div className="home-controls">
                    <button onClick={() => nav("/boardadd")} className="home-write-btn">
                        ✏️ 글쓰기
                    </button>
                </div>

                <div className="home-grid">
                    {list.length > 0 ? (
                        list.map((v, i) => {
                            return (
                                <div key={i} onClick={() => nav(`/boardview/${v.no}`)} 
                                    className="home-card" style={{ animationDelay: `${i * 0.1}s`, animationName: 'fadeInUp', animationDuration: '0.5s', animationTimingFunction: 'ease', animationFillMode: 'backwards' }}>
                                    <div className="home-card-header">
                                        <span className="home-card-badge">
                                            No. {list.length - i}
                                        </span>
                                    </div>
                                    <h3 className="home-card-title">
                                        {v.title}
                                    </h3>
                                    <div className="home-card-footer">
                                        <div className="home-card-author">
                                            <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${v.name || 'user'}&backgroundColor=ffdfba`} alt={v.name} className="home-card-avatar" />
                                            <span>{v.name || '글쓴이'}</span>
                                        </div>
                                        <span>{v.regDate ? v.regDate.split("T")[0] : "-"}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="home-empty">
                            <h2 className="home-empty-title">아직 이야기가 없어요!</h2>
                            <p className="home-empty-text">첫 번째 이야기의 주인공이 되어보세요 ✏️</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;