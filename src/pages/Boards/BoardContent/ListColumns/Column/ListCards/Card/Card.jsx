import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Card as MuiCard } from "@mui/material";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";

function Card({ temmporaryHideMedia }) {
  if (temmporaryHideMedia) {
    return (
      <MuiCard
        sx={{
          cursor: "pointer",
          boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
          overflow: "unset",
        }}
      >
        <CardContent
          sx={{
            p: 1.5,
            "&:last-child": { p: 1.5 },
          }}
        >
          <Typography>Nguyên FullStack</Typography>
        </CardContent>
      </MuiCard>
    );
  }
  return (
    <MuiCard
      sx={{
        cursor: "pointer",
        boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
        overflow: "unset",
      }}
    >
      <CardMedia
        sx={{ height: 140 }}
        image="https://res.cloudinary.com/dcnfkcsln/image/upload/v1739459196/Screenshot_2024-12-31_090155_syhdhc.png"
        title="green iguana"
      />
      <CardContent
        sx={{
          p: 1.5,
          "&:last-child": { p: 1.5 },
        }}
      >
        <Typography>Nguyên FullStack</Typography>
      </CardContent>
      <CardActions sx={{ p: "0 4px 8px 4px" }}>
        <Button size="small" startIcon={<GroupIcon />}>
          15
        </Button>
        <Button size="small" startIcon={<CommentIcon />}>
          10
        </Button>
        <Button size="small" startIcon={<AttachmentIcon />}>
          20
        </Button>
      </CardActions>
    </MuiCard>
  );
}

export default Card;
