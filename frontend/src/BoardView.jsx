import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/network.js';
import './App.css' 
import Header from './Header.jsx';

const BoardView = () => {
    const nav = useNavigate();
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [name, setName] = useState("")
    const [boardData, setBoardData] = useState({ content: "" })
    const [isLoading, setIsLoading] = useState(false);
    const { no } = useParams()

    const handleInaccessible = () => {
        alert("존재하지 않거나 삭제된 게시글입니다.");
        nav("/", { replace: true });
    };
    const fetchData = async () => {
        try {
            const res = await api.get(`/getview/${no}`);
            if (res.data.status === "success" && res.data.data) {
                const rawData = res.data.data;
                const data = Array.isArray(rawData) ? rawData[0] : rawData;

                if (data && data.title) {
                    setName(data.name);
                    setTitle(data.title);
                    setContent(data.content);
                } else {
                    handleInaccessible();
                }
            } else {
                handleInaccessible();
            }
        } catch (err) {
            console.error("데이터 로딩 실패:", err);
            handleInaccessible();
        }
    };

    useEffect(() => {
        fetchData();
    }, [no]);


    const submitEvent = async (e) => {
        e.preventDefault();
        if (!boardData.content.trim()) return alert("요청 내용을 입력하세요.");
        setIsLoading(true);
        try {
            const res = await api.post(`/boardExecute/${no}`, { content: boardData.content });

            if (res.data.status === "success") {
                setBoardData({ content: "" });
                alert(res.data.output);
                if (res.data.output && res.data.output.includes("삭제")) {
                    nav("/", { replace: true })
                } else {
                    await fetchData();
                }
            } else {
                alert(res.data.message || "처리에 실패했습니다.");
            }
        } catch (error) {
            console.error("에러 발생:", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return ( 
        <div className="boardview-container">
            <header className="boardadd-header">
                <Header isLoading={isLoading}/>
            </header>
            <div className="boardview-post-card">
                <h1 className="boardview-title">
                    🎀 게시글 보기 🎀
                </h1>
                <form onSubmit={submitEvent}>
                    <div className="boardview-form-group">
                        <div>
                            <label htmlFor="name" className="boardview-label">작성자 ✒️</label>
                            <input type="text" className="boardview-input" id="name" value={name} name="name" disabled={true} />
                        </div>
                        <div>
                            <label htmlFor="title" className="boardview-label">제목 📝</label>
                            <input type="text" className="boardview-input" id="title" value={title} name="title" disabled={true} />
                        </div>
                        <div>
                            <label htmlFor="content" className="boardview-label">내용 🌱</label>
                            <textarea className="boardview-input boardview-textarea" id="content" name="content" value={content}disabled={true}></textarea>
                        </div>
                        <div className="boardview-prompt-container">
                            <label htmlFor="prompt" className="boardview-label">💡 AI에게 요청하기 (Prompt)</label>
                            <textarea className="boardview-input boardview-prompt-textarea" id="prompt" placeholder="AI에게 요청할 내용을 입력하세요!" name="content" value={boardData.content} onChange={e => setBoardData({ ...boardData, content: e.target.value })} disabled={isLoading}></textarea>
                        </div>
                    </div>
                    <div className="boardview-button-group">
                        <button type="submit" className="boardview-btn-submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="bounce-icon">💦</span> 열심히 처리중...
                                </>
                            ) : (
                                "요청하기 🚀"
                            )}
                        </button>
                        <button type="button"
                        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                         onClick={() => nav('/')} className="boardview-btn-cancel" disabled={isLoading}>
                            돌아가기 🏠
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};


export default BoardView