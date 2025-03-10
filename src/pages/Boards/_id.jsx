//Board list
import { useEffect } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
// import { mockData } from "~/apis/mock-data";
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'

import { useParams } from 'react-router-dom'

function Board() {
  const dispatch = useDispatch()
  // const [board, setBoard] = useState(null);
  const board = useSelector(selectCurrentActiveBoard)

  const { boardId } = useParams()

  useEffect(() => {
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])

  //Call API xử lý khi kéo thả column xong
  //Hàm này k cần async await vì khi mà chúng ta cần hứng một kết quả thì mới cần async await
  const moveColumns = dndOrderedColumns => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    //Trường hợp này k phải dùng cloneDeep vì chúng ta gán lại nó bằng một mảng mới chứ không mở rộng kiểu push
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds

    dispatch(updateCurrentActiveBoard(newBoard))

    //Call API update board
    updateBoardDetailsAPI(newBoard._id, {
      columnOrderIds: dndOrderedColumnsIds
    })
  }

  /**Khi di chuyển card tron cùng 1 column:
   * Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
   */
  const moveCardInTheSameColumn = (
    dndOrderedCards,
    dndOrderedCardIds,
    columnId
  ) => {
    const newBoard = cloneDeep(board)

    const columnToUpdate = newBoard.columns.find(
      column => column._id === columnId
    )
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    dispatch(updateCurrentActiveBoard(newBoard))

    updateColumnDetailsAPI(columnId, {
      cardOrderIds: dndOrderedCardIds
    })
  }

  /*
  Khi di chuyển card sang column khác:
  B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa _id của Card ra khỏi mảng) (fillter)
  B2: Cập nhật mảng cardOrderIds của Column tiếp theo
  B3: Cập nhật lại trường columnId của card
  => Làm 1 API support riêng

  */
  const moveCardToDifferentColumn = (
    currentCardId,
    prevColumnId,
    nextColumnId,
    dndOrderedColumns
  ) => {
    const dndOrderedColumnIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnIds
    dispatch(updateCurrentActiveBoard(newBoard))

    //calling api
    let prevCardOrderIds =
      dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds || []

    //Khi column(prevCardOrderIds) còn mỗi card cuối cùng và kéo nó đi thì sẽ dẫn đến hiện tượng nó đẩy cả card giả(placeholder-card) lên BE dẫn đến lỗi
    //Lên sẽ fix nếu tồn tại card giả thì sẽ gán nó về mảng rỗng
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []
    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)
        ?.cardOrderIds
    })
  }

  if (!board) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          width: '100vw',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        //3 TH di move sẽ dữ nguyên
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board

//Lưu ý nhỏ về bug sắp xếp card khi tích hợp API (video 71: Hoàn thiện kéo thả card với API)
/**
 * Khi chúng ta lấy data từ component _id về thì là mảng cards chưa được sắp xếp theo cardOrderIds vì nó chỉ được sắp xếp khi mà nó chạy đến component column lên gây ra lỗi khi kéo thả card lần đầu vị trí nó bị nhảy loạn lên và những lần sau vì nó đã được sort rồi lên sẽ ổn định
 * Giải pháp: Sẽ sort ngay khi mà nhận được dữ liệu từ api trong component _id
 */
