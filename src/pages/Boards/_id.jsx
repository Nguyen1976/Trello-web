//Board list
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
// import { mockData } from "~/apis/mock-data";
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
} from "~/apis";

function Board() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const boardId = "67c868e67a889567f62a968d";
    //call-api
    fetchBoardDetailsAPI(boardId).then((board) => {
      setBoard(board);
    });
  }, []);

  //Func có nhiệm vụ gọi API tại column và làm lại dữ liệu state board
  /**
   * createNewColumn được truyền lên listColumn qua các props
   * Sau này sẽ xử lý việc call api xong sẽ restart lại trang web bằng redux
   */
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id,
    });
  };

  const createNewCard = async (newCardData) => {
    const createdColumn = await createNewCardAPI({
      ...newCardData,
      boardId: board._id,
    });

    //cập nhật state board
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} createNewColumn={createNewColumn} createNewCard={createNewCard} />
    </Container>
  );
}

export default Board;
