from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import save, findAll, findOne
from langgraph.prebuilt import create_react_agent
from langchain_ollama import ChatOllama
from langchain.tools import tool
import logging
from settings import settings
from models import BoardItem, SaveBoard, ExecuteBoard

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



app = FastAPI(title="Gayoung")

origins = ["http://localhost:5173","http://127.0.0.1:5173", "http://aiedu.tplinkdns.com:6090"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@tool(args_schema=SaveBoard)
def save_board(name: str, title: str, content: str) -> bool:
    """
    정보를 받아 데이터베이스의 board 테이블에 저장하는 도구입니다.
    반드시 다음 형태를 가져야 합니다:
    {
      "name": "작성자 이름",
      "title": "게시글 제목",
      "content": "게시글 내용"
    }
    """

    try:
        sql = "INSERT INTO board (name, title, content) VALUES (?, ?, ?)"
        params = (name, title, content)
        result = save(sql, params)
        return result
    except Exception as e:
        logger.error(f"정보 저장 중 오류 발생: {e}")
        return False

@tool(args_schema=ExecuteBoard)
def update_board(no: int, name: str = "", title: str = "", content: str = "", mode: str = "update") -> bool:
    """
    게시글을 수정하거나 삭제합니다.
    
    [데이터 무결성 규칙 - 필독]
    1. 사용자가 직접 작성자를 '누구로 바꿔달라'고 지시한 항목이 아니면, 해당 인자값은 무조건 빈 문자열("")로 보냅니다.
    2. 절대 작성자 이름을 추측하거나 임의로 '관리자', '에이전트', '사용자' 등으로 채우지 마세요.
    3. 사용자가 "내용을 '트럼펫의 역사'로 수정해줘"라고만 했다면:
    name="", title="", content="트럼펫의 역사..." 로 호출해야 합니다. (name을 채우면 오답입니다.)
    4. 어떤 경우에도 '[유지]' 등의 설명 텍스트를 데이터 필드에 넣지 마세요.
    """
    try:
        if mode == "delete":
            sql = "UPDATE board SET delYn = 1 WHERE no = ?"
            return save(sql, (no,))
        current_data_sql = f"SELECT name, title, content FROM board WHERE no = {no}"
        current_data = findOne(current_data_sql)
        
        if not current_data:
            logger.error(f"{no}번 게시글을 찾을 수 없습니다.")
            return False
        
        final_name = name if name.strip() else current_data['name']
        final_title = title if title.strip() else current_data['title']
        final_content = content if content.strip() else current_data['content']

        sql = "UPDATE board SET name = ?, title = ?, content = ? WHERE no = ?"
        params = (final_name, final_title, final_content, no)
        
        logger.info(f"{no}번 게시글 수정 시도 (항목 선별 업데이트)")
        return save(sql, params)

    except Exception as e:
        logger.error(f"게시판 작업 중 오류 발생: {e}")
        return False

@app.post("/boardadd")
async def add_board(item: BoardItem):
    try:
      llm = ChatOllama(
        model= settings.model, 
        base_url= settings.base_url, 
      )
      tools = [save_board, update_board]
      system_message = (
            "당신은 게시글 관리 전문가입니다. 사용자의 짧은 요청만으로도 풍부한 게시글을 작성할 수 있습니다. "
            "1. 사용자가 키워드만 주더라도(예: '사과파이'), 그에 어울리는 매력적인 제목과 상세한 내용을 **직접 창작해서** 생성하세요. "
            "2. 절대 사용자에게 추가 정보를 요구하거나 되묻지 마세요. 부족한 정보는 당신의 지식으로 채웁니다. "
            "3. 반드시 save_board 도구를 사용하여 정보를 저장해야 합니다. "
            "4. 사용자가 요청한 내용 외의 내용을 임의로 저장하지 마세요."
            "5. 사용자의 요청 중 이름이 없다고 판단이 되면 작성자 이름은 'USER'로 저장하세요."
        )
      agent_executor = create_react_agent(llm, tools, prompt=system_message)
      result = await agent_executor.ainvoke({"messages": [("user", f"다음 요청을 이용해 작성자 이름, 제목과 내용을 생성하고 저장해 주세요: {item.content}")]
      })
      final_message = result["messages"][-1].content
      print(f"Agent Response: {final_message}")
      return {"status": "success", "output": final_message}
    except Exception as e:
      logger.error(f"초기화 중 오류 발생: {e}")
      return None
    
@app.get("/getlist")
def get_board_list():
    try:
        sql = "select * from Board.board where `delYn` = 0 order by no desc;"
        result = findAll(sql)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"게시글 목록 조회 중 오류 발생: {e}")
        return {"status": "error", "message": "게시글 목록 조회에 실패했습니다."}
    
@app.get("/getview/{no}")
def get_board_view(no: int):
    try:
        sql = f"select * from Board.board where no = {no} and `delYn` = 0;"
        result = findOne(sql)
        if result:
            return {"status": "success", "data": result}
        else:
            return {"status": "error", "message": "게시글을 찾을 수 없습니다."}
    except Exception as e:
        logger.error(f"게시글 조회 중 오류 발생: {e}")
        return {"status": "error", "message": "게시글 조회에 실패했습니다."}
    
@app.post("/boardExecute/{no}")
async def edit_board(item: BoardItem, no: int):
    try:
        llm = ChatOllama(
        model= settings.model, 
        base_url= settings.base_url, 
      )
        
        # 바뀐 도구 이름을 리스트에 넣어줍니다.
        tools = [save_board, update_board] 
        
        system_message = (
            "당신은 게시글 관리 전문가입니다. 사용자의 짧은 요청만으로도 풍부한 게시글을 작성할 수 있습니다. "
            "1. 사용자가 키워드만 주더라도(예: '사과파이'), 그에 어울리는 매력적인 제목과 상세한 내용을 **직접 창작해서** 생성하세요. "
            "2. 절대 사용자에게 추가 정보를 요구하거나 되묻지 마세요. 부족한 정보는 당신의 지식으로 채웁니다. "
            f"3. 현재 작업 중인 게시글 번호는 {no}입니다. "
            "4. 수정/삭제 여부를 판단하여 반드시 update_board 호출하세요. "
            "작성이 완료되면 수정된 내용을 요약해서 사용자에게 알려주세요."
        )
        
        agent_executor = create_react_agent(llm, tools, prompt=system_message)
        
        # 실행...
        result = await agent_executor.ainvoke({
            "messages": [("user", f"게시글 {no}번을 다음 요청에 맞춰 수정해 주세요: {item.content}")]
        })
        
        final_message = result["messages"][-1].content
        print(f"Agent Response: {final_message}")
        return {"status": "success", "output": final_message}
    except Exception as e:
        logger.error(f"초기화 중 오류 발생: {e}")
        return {"status": "error", "detail": str(e)}
    