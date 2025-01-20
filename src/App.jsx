import Button from "@mui/material/Button";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Typography from "@mui/material/Typography";

function App() {
  return (
    <div>
      <div>Nguyên đẹp trai</div>
      <Typography variant="body2" color="text.secondary">Khà khà</Typography>
      <AccountBalanceIcon color="primary" />
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
    </div>
  );
}

export default App;
