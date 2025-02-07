import Box from "@mui/material/Box";
import ModeToggle from "~/components/ModeToggle";

function AppBar() {
  return (
    <Box
      sx={{
        backgroundColor: "primary.light",
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
      }}
    >
      <ModeToggle />
    </Box>
  );
}

export default AppBar;
