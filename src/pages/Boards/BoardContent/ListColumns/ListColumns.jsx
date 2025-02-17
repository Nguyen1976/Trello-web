import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import NoteAddIcon from "@mui/icons-material/NoteAdd";

import Column from "./Column/Column";

function ListColumns({ columns }) {
  /**
   * Thằng SortableContext yêu cầu items là dạng mạng kiểu dữ liệu nguyên thủy
   * chứ không phải là mảng các object hay dữ liệu khác nếu không phải kiểu dữ liệu nguyên thủy thì nó không có animation
   */

  return (
    <SortableContext
      items={columns?.map((c) => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          bgcolor: "inherit",
          width: "100%",
          height: "100%",
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar-track": { m: 2 },
        }}
      >
        {columns?.map((column) => (
          <Column key={column._id} column={column} />
        ))}

        <Box
          sx={{
            minWidth: "200px",
            maxWidth: "200px",
            mx: 2,
            borderRadius: "6px",
            height: "fit-content",
            bgcolor: "#ffffff3d",
          }}
        >
          <Button
            startIcon={<NoteAddIcon />}
            sx={{
              color: "white",
              width: "100%",
              justifyContent: "flex-start",
              pl: 2.5,
              py: 1,
            }}
          >
            Add new Column
          </Button>
        </Box>
      </Box>
    </SortableContext>
  );
}

export default ListColumns;
