import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Board from '~/pages/Boards/_id'

const mockDispatch = jest.fn(action => action)

// Cho phép mỗi test ghi đè state board mà useSelector trả về.
let mockBoardState = null
const mockUseSelector = jest.fn(selector =>
  selector({ activeBoard: { currentActiveBoard: mockBoardState } })
)

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: selector => mockUseSelector(selector)
}))

// Capture các handler được _id.jsx truyền xuống BoardContent.
let capturedBoardContentProps = null
jest.mock('~/pages/Boards/BoardContent/BoardContent', () => props => {
  capturedBoardContentProps = props
  return <div data-testid="board-content-mock" />
})

// Loại bỏ các module side-effect.
jest.mock('~/components/Modal/ActiveCard/ActiveCard', () => () => null)
jest.mock('~/components/AppBar/AppBar', () => () => null)
jest.mock('~/pages/Boards/BoardBar/BoardBar', () => () => (
  <div data-testid="board-bar-mock" />
))

const mockUpdateBoardDetailsAPI = jest.fn()
const mockUpdateColumnDetailsAPI = jest.fn()
const mockMoveCardToDifferentColumnAPI = jest.fn()
jest.mock('~/apis', () => ({
  updateBoardDetailsAPI: (...args) => mockUpdateBoardDetailsAPI(...args),
  updateColumnDetailsAPI: (...args) => mockUpdateColumnDetailsAPI(...args),
  moveCardToDifferentColumnAPI: (...args) =>
    mockMoveCardToDifferentColumnAPI(...args)
}))

jest.mock('~/redux/activeBoard/activeBoardSlice', () => {
  const actual = jest.requireActual('~/redux/activeBoard/activeBoardSlice')
  return {
    ...actual,
    fetchBoardDetailsAPI: jest.fn(boardId => ({
      type: 'activeBoard/fetchBoardDetailsAPI/mock',
      payload: boardId
    })),
    updateCurrentActiveBoard: jest.fn(payload => ({
      type: 'activeBoard/updateCurrentActiveBoard',
      payload
    }))
  }
})

const renderBoard = () =>
  render(
    <MemoryRouter initialEntries={['/boards/507f1f77bcf86cd799439011']}>
      <Routes>
        <Route path="/boards/:boardId" element={<Board />} />
      </Routes>
    </MemoryRouter>
  )

const SAMPLE_BOARD = {
  _id: 'b-1',
  title: 'Sample',
  columns: [
    {
      _id: 'col-1',
      cardOrderIds: ['card-1', 'card-2'],
      cards: [
        { _id: 'card-1', title: 'C1' },
        { _id: 'card-2', title: 'C2' }
      ]
    },
    {
      _id: 'col-2',
      cardOrderIds: ['card-3'],
      cards: [{ _id: 'card-3', title: 'C3' }]
    }
  ],
  columnOrderIds: ['col-1', 'col-2']
}

// TC-RTL-BOARD-01 ... TC-RTL-BOARD-05
describe('Board page', () => {
  beforeEach(() => {
    capturedBoardContentProps = null
    mockBoardState = null
    mockDispatch.mockClear()
    mockUpdateBoardDetailsAPI.mockClear()
    mockUpdateColumnDetailsAPI.mockClear()
    mockMoveCardToDifferentColumnAPI.mockClear()
    jest
      .requireMock('~/redux/activeBoard/activeBoardSlice')
      .fetchBoardDetailsAPI.mockClear()
  })

  it('shows loading spinner when board is not loaded', () => {
    renderBoard()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('dispatches fetchBoardDetailsAPI with boardId from URL on mount', () => {
    renderBoard()
    const slice = jest.requireMock('~/redux/activeBoard/activeBoardSlice')
    expect(slice.fetchBoardDetailsAPI).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011'
    )
  })

  it('renders board content + BoardBar when board is loaded', () => {
    mockBoardState = SAMPLE_BOARD
    renderBoard()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByTestId('board-page')).toBeInTheDocument()
    expect(screen.getByTestId('board-bar-mock')).toBeInTheDocument()
    expect(screen.getByTestId('board-content-mock')).toBeInTheDocument()
    expect(typeof capturedBoardContentProps.moveColumns).toBe('function')
    expect(typeof capturedBoardContentProps.moveCardInTheSameColumn).toBe(
      'function'
    )
    expect(typeof capturedBoardContentProps.moveCardToDifferentColumn).toBe(
      'function'
    )
  })

  it('moveColumns updates redux + calls updateBoardDetailsAPI with new order', () => {
    mockBoardState = SAMPLE_BOARD
    renderBoard()

    const reordered = [SAMPLE_BOARD.columns[1], SAMPLE_BOARD.columns[0]]
    capturedBoardContentProps.moveColumns(reordered)

    expect(mockUpdateBoardDetailsAPI).toHaveBeenCalledWith('b-1', {
      columnOrderIds: ['col-2', 'col-1']
    })
  })

  it('moveCardInTheSameColumn updates redux + calls updateColumnDetailsAPI', () => {
    mockBoardState = SAMPLE_BOARD
    renderBoard()

    const newCardOrderIds = ['card-2', 'card-1']
    capturedBoardContentProps.moveCardInTheSameColumn(
      [
        { _id: 'card-2', title: 'C2' },
        { _id: 'card-1', title: 'C1' }
      ],
      newCardOrderIds,
      'col-1'
    )

    expect(mockUpdateColumnDetailsAPI).toHaveBeenCalledWith('col-1', {
      cardOrderIds: newCardOrderIds
    })
  })

  it('moveCardToDifferentColumn forwards normal card order to API', () => {
    mockBoardState = SAMPLE_BOARD
    renderBoard()

    const dndOrderedColumns = [
      { _id: 'col-1', cardOrderIds: ['card-1'] },
      { _id: 'col-2', cardOrderIds: ['card-2', 'card-3'] }
    ]
    capturedBoardContentProps.moveCardToDifferentColumn(
      'card-2',
      'col-1',
      'col-2',
      dndOrderedColumns
    )

    expect(mockMoveCardToDifferentColumnAPI).toHaveBeenCalledWith({
      currentCardId: 'card-2',
      prevColumnId: 'col-1',
      prevCardOrderIds: ['card-1'],
      nextColumnId: 'col-2',
      nextCardOrderIds: ['card-2', 'card-3']
    })
  })

  it('moveCardToDifferentColumn resets prevCardOrderIds when only placeholder remains', () => {
    mockBoardState = SAMPLE_BOARD
    renderBoard()

    const dndOrderedColumns = [
      { _id: 'col-1', cardOrderIds: ['placeholder-card-col-1'] },
      { _id: 'col-2', cardOrderIds: ['card-1', 'card-3'] }
    ]
    capturedBoardContentProps.moveCardToDifferentColumn(
      'card-1',
      'col-1',
      'col-2',
      dndOrderedColumns
    )

    expect(mockMoveCardToDifferentColumnAPI).toHaveBeenCalledWith(
      expect.objectContaining({ prevCardOrderIds: [] })
    )
  })

  it('moveCardInTheSameColumn ignores cards update when columnId is not found', () => {
    mockBoardState = SAMPLE_BOARD
    renderBoard()

    capturedBoardContentProps.moveCardInTheSameColumn(
      [{ _id: 'card-1' }],
      ['card-1'],
      'col-does-not-exist'
    )

    // API vẫn được gọi với cardOrderIds mới — nhánh else của `if (columnToUpdate)`
    expect(mockUpdateColumnDetailsAPI).toHaveBeenCalledWith(
      'col-does-not-exist',
      { cardOrderIds: ['card-1'] }
    )
  })

  it('moveCardToDifferentColumn covers optional-chaining when prev column is missing', () => {
    mockBoardState = SAMPLE_BOARD
    renderBoard()

    // dndOrderedColumns không chứa col-1 → find() trả về undefined → ?. short-circuit
    const dndOrderedColumns = [
      { _id: 'col-3', cardOrderIds: ['placeholder-card-col-3'] }
    ]

    expect(() =>
      capturedBoardContentProps.moveCardToDifferentColumn(
        'card-x',
        'col-1',
        'col-2',
        dndOrderedColumns
      )
    ).toThrow()
  })
})
