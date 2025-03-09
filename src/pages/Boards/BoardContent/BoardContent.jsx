import { useEffect, useState, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";

import {
  DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  // rectIntersection,
  getFirstCollision,
  // closestCenter,
} from "@dnd-kit/core";
import { MouseSensor, TouchSensor } from "~/customLibraries/DndKitSensors";
import { arrayMove } from "@dnd-kit/sortable";
import { cloneDeep, isEmpty } from "lodash";

import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";
import { generatePlaceholderCard } from "~/utils/formatters";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

//https://docs.dndkit.com/api-documentation/sensors Handle sensor

function BoardContent({
  board,
  createNewColumn,
  createNewCard,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn,
}) {
  // const pointerSensor = useSensor(PointerSensor, {
  //   // Require the mouse to move by 10 pixels before activating
  //   activationConstraint: {
  //     distance: 5,
  //   },
  // });
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      delay: 250,
      tolerance: 500,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  //Chúng ta đang muốn là map 1 mảng hiện tại sao cho nó được sắp xếp giống với mảng truyền vào bằng cahcs map qua 1 tham số ví dụ sắp xếp theo '_id
  const [orderedColumns, setOrderedColumns] = useState([]);

  //Cùng 1 thời điểm chỉ có 1 phần tử đang được kéo (column, card)
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);

  //final collision point (handle collison detection algorithm)
  const lastOverId = useRef(null);

  useEffect(() => {
    setOrderedColumns(board?.columns);
  }, [board]);

  //Tìm column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    );
  };
  //Func chung xử lý việc cập nhật state trong việc di chuyển giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns((prevColumns) => {
      //Tìm vị trí (index) của overCard trong column đích (nơi card sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      );

      //Logic tính toán cho cardIndex mới tức là tính toán nơi để card được thả xuống
      //Logic này lấy chuẩn ra từ code của thư viện
      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1;

      const nextColumns = cloneDeep(prevColumns);
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      //Column cũ
      if (nextActiveColumn) {
        //Xóa card ở cái column active
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );

        //Thêm placeholder card nếu column rỗng
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
        }

        //Cập nhật lại mảng cardOrderIds
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }

      //Column mới
      if (nextOverColumn) {
        //Kiểm tra xem cái card đang kéo tồn tại ở overColumn chưa, nếu có thì xóa nó đi
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );

        //phải cập nhật lại chuẩn dữ liệu columnId trong card
        const rebuld_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id,
        };

        //Thêm cái card đang kéo vào column, vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuld_activeDraggingCardData
        );

        //Xóa placeholder card nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        );

        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }

      //Vì đây là hàm dùng chung cả lúc over và end mà chúng ta chỉ cần call api lúc end để tối ưu được performence
      if (triggerFrom === "handleDragEnd") {
        //calling api
        moveCardToDifferentColumn(
          activeDraggingCardData._id,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        );
      }

      return nextColumns;
    });
  };

  //When the drag starts
  const handleDragStart = (event) => {
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active?.data?.current);
    setActiveDragItemId(event?.active?.data?.current?._id);

    //If Card is being dragging then setOldColumnWhenDraggingCard
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
    }
  };

  //Trigger during the process of dragging an element
  const handleDragOver = (event) => {
    //do nothing if drag column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

    const { active, over } = event;

    if (!over || !active) return; //No over over means dragged out

    //activeDraggingCard is being dragged (active)
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;
    const { id: overCardId } = over;

    //Find the column by cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    if (!activeColumn || !overColumn) return;

    //logic handling to drag to another column but if you drag into itself it does nothing
    //Còn việc kéo xong xuôi vào 1 column khác thì handleDragEnd xử lý
    if (activeColumn._id !== overColumn._id) {
      //setOrderedColumns
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        "handleDragOver"
      );
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //activeDraggingCard is being dragged (active)
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;
      const { id: overCardId } = over;

      //Find the column by cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);

      if (!activeColumn || !overColumn) return;
      //oldColumnWhenDraggingCard is be set when handleDragStart
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        //Drag and drop card action between two columns
        //setOrderedColumns
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          "handleDragEnd"
        );
      } else {
        // Drag and drop card action in a column

        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        );

        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        );

        //use ArrayMove to update card's location
        const dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );

        const dndOrderedCardIds = dndOrderedCards.map((card) => card._id);
        //Vẫn gọi update state để tránh delay hoặc Flickering giao diện lúc kéo thả khi cần phải chờ call API
        setOrderedColumns((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns);

          //Find Column is being dropped
          const targetColumn = nextColumns.find(
            (c) => c._id === overColumn._id
          );

          //Update new two values is card and cardOrderIds in targetColumn
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCardIds;
          return nextColumns;
        });

        //Calling api update card's location
        //Đây là props được truyền từ BoardContent để call APi update card's location
        moveCardInTheSameColumn(
          dndOrderedCards,
          dndOrderedCardIds,
          oldColumnWhenDraggingCard._id
        );
      }
    }

    //Handle drag and drop column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        //Get old position from active
        const oldIndex = orderedColumns.findIndex((c) => c._id === active.id);
        //The position will be dropped column down.
        const newIndex = orderedColumns.findIndex((c) => c._id === over.id);

        //Use arrayMove to create new arr after swapping the positions of 2 columns in the array
        const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex);
        setOrderedColumns(dndOrderedColumns);

        // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
        //dndOrderedColumns mảng lưu trạng thái sau khi kéo thả column
        //call api to update column order with dndOrderedColumns
        //....
        moveColumns(dndOrderedColumns);
      }
    }

    //The data after drag and drop will be reset
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnWhenDraggingCard(null);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN)
        //If dragging column use "closestCenter"
        return closestCorners({ ...args });

      //Finding intersections and collisions with the pointer
      const pointerIntersection = pointerWithin(args);

      //If pointerIntersection is null, return;, avoid flickering error
      if (!pointerIntersection?.length) return;

      //The collision detection algorithm returns an array of collisions
      // const intersections = !!pointerIntersection?.length
      //   ? pointerIntersection
      //   : rectIntersection(args);

      //Finding first overId in "pointerIntersection"
      let overId = getFirstCollision(pointerIntersection, "id");

      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );
        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                checkColumn?.cardOrderIds?.includes(container.id)
            ),
          })[0]?.id;
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }
      //If overId is null, return [] - avoid crashing the website
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType]
  );

  return (
    <DndContext
      sensors={sensors}
      //The collision detection algorithm uses "closestCorners" instead of "closetCenter"
      //https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
      //Update: If just using closestCorners, there will be a bug flickering + data deviation(sai lệch)
      // collisionDetection={closestCorners}

      //Self-customization advanced "collision detection algorithm"
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight,
          p: "10px 0",
        }}
      >
        <ListColumns
          columns={orderedColumns}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
        />
        {/* Overlay giữ chỗ cho card và column */}
        <DragOverlay dropAnimation={dropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
}

export default BoardContent;
