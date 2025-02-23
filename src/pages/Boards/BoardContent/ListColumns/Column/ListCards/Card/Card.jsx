import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Card as MuiCard } from "@mui/material";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Card({ card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card._id, data: { ...card } });

  const dndKitCardStyles = {
    useSelect: "none", //Khi kéo trên mobile bị select các phần tử gây cảm giác khó chịu
    //Nếu sử dụng CSS.Transform như docx sẽ lỗi stretch
    //https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #74b9ff' : undefined,
  };

  const shouldShowCardActions = () => {
    return (
      !!card?.memberIds.length ||
      !!card?.comments.length ||
      !!card?.attachments.length
    );
  };
  return (
    <MuiCard
      ref={setNodeRef}
      style={dndKitCardStyles}
      {...attributes}
      {...listeners}
      sx={{
        cursor: "pointer",
        boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
        overflow: "unset",
      }}
    >
      {card?.cover && (
        <CardMedia
          sx={{ height: 140 }}
          image={card.cover}
          title="green iguana"
        />
      )}
      <CardContent
        sx={{
          p: 1.5,
          "&:last-child": { p: 1.5 },
        }}
      >
        <Typography>{card?.title}</Typography>
      </CardContent>
      {shouldShowCardActions() && (
        <CardActions sx={{ p: "0 4px 8px 4px" }}>
          {!!card?.memberIds.length && (
            <Button size="small" startIcon={<GroupIcon />}>
              {card?.memberIds.length}
            </Button>
          )}
          {!!card?.comments.length && (
            <Button size="small" startIcon={<CommentIcon />}>
              {card?.comments.length}
            </Button>
          )}
          {!!card?.attachments.length && (
            <Button size="small" startIcon={<AttachmentIcon />}>
              {card?.attachments.length}
            </Button>
          )}
        </CardActions>
      )}
    </MuiCard>
  );
}

export default Card;
