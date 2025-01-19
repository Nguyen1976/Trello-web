import Button from "@mui/material/Button";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

function App() {
  return (
    <div>
      <div>Nguyên đẹp trai</div>
      <AccountBalanceIcon color="primary" />
      <Button variant="text">Text</Button>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
    </div>
  );
}

export default App;
