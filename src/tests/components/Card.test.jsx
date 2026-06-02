import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Card from '~/pages/Boards/BoardContent/ListColumns/Column/ListCards/Card/Card'
import activeCardReducer from '~/redux/activeCard/activeCardSlice'

const dndKitMockState = { isDragging: false }

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: dndKitMockState.isDragging
  })
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux')
  return {
    ...actual,
    useDispatch: () => mockDispatch
  }
})

const renderCard = card => {
  const store = configureStore({ reducer: { activeCard: activeCardReducer } })
  return render(
    <Provider store={store}>
      <Card card={card} />
    </Provider>
  )
}

// TC-RTL-CARD-01 ... TC-RTL-CARD-05
describe('Card component', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('renders card title for a basic card', () => {
    renderCard({ _id: 'c1', title: 'Test card title', listId: 'l1' })
    expect(screen.getByTestId('card-item')).toBeInTheDocument()
    expect(screen.getByText('Test card title')).toBeInTheDocument()
  })

  it('does not render CardActions when card has no members/comments/attachments', () => {
    renderCard({ _id: 'c1', title: 'Plain', listId: 'l1' })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders cover image and 3 action buttons when fields are present', () => {
    renderCard({
      _id: 'c2',
      title: 'Rich card',
      listId: 'l1',
      cover: 'https://img.example/cover.jpg',
      memberIds: ['u1', 'u2'],
      comments: [{ id: 1 }],
      attachments: [{ id: 1 }, { id: 2 }, { id: 3 }]
    })
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(screen.getByText('2')).toBeInTheDocument() // memberIds.length
    expect(screen.getByText('1')).toBeInTheDocument() // comments.length
    expect(screen.getByText('3')).toBeInTheDocument() // attachments.length
  })

  it('dispatches updateCurrentActiveCard + showModalActiveCard on click', () => {
    renderCard({ _id: 'c3', title: 'Click me', listId: 'l1' })
    fireEvent.click(screen.getByTestId('card-item'))
    expect(mockDispatch).toHaveBeenCalledTimes(2)
    const types = mockDispatch.mock.calls.map(c => c[0]?.type)
    expect(types).toEqual(
      expect.arrayContaining([
        'activeCard/updateCurrentActiveCard',
        'activeCard/showModalActiveCard'
      ])
    )
  })

  it('hides itself when card is FE_PlaceholderCard', () => {
    renderCard({
      _id: 'placeholder',
      title: '',
      listId: 'l1',
      FE_PlaceholderCard: true
    })
    const item = screen.getByTestId('card-item')
    expect(item).toHaveStyle({ display: 'none' })
  })

  it('renders dragging styles (opacity + border) when isDragging is true', () => {
    dndKitMockState.isDragging = true
    try {
      renderCard({ _id: 'c-drag', title: 'Drag me', listId: 'l1' })
      const item = screen.getByTestId('card-item')
      expect(item).toHaveStyle({ opacity: '0.5' })
      expect(item).toHaveStyle({ border: '1px solid #74b9ff' })
    } finally {
      dndKitMockState.isDragging = false
    }
  })
})
