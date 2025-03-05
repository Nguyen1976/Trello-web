//Board list
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { mockData } from "~/apis/mock-data";
import { fetchBoardDetailsAPI } from "~/apis";

function Board() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const boardId = "67c82e3f22680dd14650764f";
    //call-api
    fetchBoardDetailsAPI(boardId).then((board) => {
      setBoard(board);
      console.log(board);
    });
  }, []);

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} />
    </Container>
  );
}

export default Board;
