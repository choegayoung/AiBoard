import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../utils/network.js';
import './App.css';
import Header from './Header.jsx';

const BoardAdd = () => {
    const nav = useNavigate();
    const [boardData, setBoardData] = useState({ content: "" })
    const [isLoading, setIsLoading] = useState(false);

    const submitEvent = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post("/boardadd", { content: boardData.content });
            alert("게시글이 등록되었습니다.");
            nav("/");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        };
    };

    return (
        <div className="boardadd-container">
            <header className="boardadd-header">
                <Header isLoading={isLoading}/>
            </header>

            <div className="boardadd-card">
                <h1 className="boardadd-title">📝 새로운 이야기 쓰기 ✨</h1>
                <form onSubmit={submitEvent}>
                    <div className="boardadd-form-group">
                        <label htmlFor="content" className="boardadd-label">무엇을 도와드릴까요? (Prompt) 💡</label>
                        <textarea
                            className="boardadd-textarea"
                            id="content"
                            name="content"
                            placeholder="Prompt를 입력하세요! ex) '내 이름은 가영이 라고해. 당근파이를 만드는 방법을 써줘.'"
                            disabled={isLoading}
                            onChange={(e) => setBoardData({ ...boardData, content: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="boardadd-actions">
                        <button type="submit" className="boardadd-btn-submit"
                            disabled={isLoading || !boardData.content.trim()}>
                            {isLoading ? (
                                <>
                                    <span className="bounce-icon">💦</span> 처리중이에요...
                                </>
                            ) : (
                                "마법 부리기 🚀"
                            )}
                        </button>
                        <button className="boardadd-btn-cancel"
                        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                         disabled={isLoading} 
                         onClick={() => nav("/")}>
                            돌아가기 🏠
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BoardAdd;