import Box from "@mui/material/Box";
import AppsIcon from "@mui/icons-material/Apps";
import TrelloIcon from "~/assets/TrelloIcon";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Badge from "@mui/material/Badge";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import ModeToggle from "~/components/ModeToggle";
import Workspaces from "./Menus/Workspaces";
import Recent from "./Menus/Recent";
import Starered from "./Menus/Starered";
import Templates from "./Menus/Templates";
import Profiles from "./Menus/Profiles";

function AppBar() {
  return (
    <Box
      px={2}
      sx={{
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <AppsIcon sx={{ color: "primary.main" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrelloIcon sx={{ color: "primary.main" }} inheritViewBox />
          <Typography
            variant="span"
            sx={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "primary.main",
            }}
          >
            Trello
          </Typography>
        </Box>
        <Workspaces />
        <Recent />
        <Starered />
        <Templates />
        <Button variant="outlined">Create</Button>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          id="outlined-search"
          label="Search..."
          type="search"
          size="small"
        />
        <ModeToggle />
        <Tooltip title="Notyfication">
          <Badge variant="dot" color="secondary" sx={{ cursor: "pointer" }}>
            <NotificationsNoneIcon color="primary" />
          </Badge>
        </Tooltip>
        <Tooltip title="Help">
          <HelpOutlineOutlinedIcon
            sx={{ cursor: "pointer", color: "primary.main" }}
          />
        </Tooltip>
        <Profiles />
      </Box>
    </Box>
  );
}

export default AppBar;
