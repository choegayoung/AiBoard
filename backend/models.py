from pydantic import BaseModel, Field

class BoardItem(BaseModel):
    content: str

class SaveBoard(BaseModel):
    name: str = Field(description="작성자 이름")
    title: str = Field(description="생성된 제목")
    content: str = Field(description="생성된 내용")

class ExecuteBoard(BaseModel):
    no: int = Field(description="요청할 게시글 번호")
    name: str = Field(description="작성자 이름")
    title: str = Field(description="요청할 게시글 제목")
    content: str = Field(description="요청할 게시글 내용")
    mode: str = Field(description="작업 모드: 'update' 또는 'delete'")