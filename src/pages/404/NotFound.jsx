// TrungQuanDev: https://youtube.com/@trungquandev
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import HomeIcon from '@mui/icons-material/Home'
import AstronautSvg from '~/assets/404/AstronautSvg'
import PlanetSvg from '~/assets/404/PlanetSvg'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#25344C',
        color: 'white'
      }}
    >
      <Box
        sx={{
          '@keyframes stars': {
            '0%': { backgroundPosition: '-100% 100%' },
            '100%': { backgroundPosition: '0 0 ' }
          },
          animation: 'stars 12s linear infinite alternate',
          width: '100%',
          height: '100%',
          backgroundImage: 'url("src/assets/404/particles.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          // boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '100px', fontWeight: 800 }}>
          404
        </Typography>
        <Typography
          sx={{
            fontSize: '18px !important',
            lineHeight: '25px',
            fontWeight: 400,
            maxWidth: '350px',
            textAlign: 'center'
          }}
        >
          LOST IN&nbsp;
          <Typography
            variant="span"
            sx={{
              position: 'relative',
              '&:after': {
                position: 'absolute',
                content: '""',
                borderBottom: '3px solid #fdba26',
                left: 0,
                top: '43%',
                width: '100%'
              }
            }}
          >
            &nbsp;SPACE&nbsp;
          </Typography>
          &nbsp;
          <Typography variant="span" sx={{ color: '#fdba26', fontWeight: 500 }}>
            TrungQuanDev
          </Typography>
          ?<br />
          Hmm, looks like that page doesn&apos;t exist.
        </Typography>
        <Box sx={{ width: '390px', height: '390px', position: 'relative' }}>
          <AstronautSvg
            inheritViewBox
            sx={{
              width: '50px',
              height: '50px',
              position: 'absolute',
              top: '20px',
              right: '25px',
              '@keyframes spinAround': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' }
              },
              animation: 'spinAround 5s linear 0s infinite'
            }}
          />
          {/* Đoạn này nếu chỉ cần hiện file SVG mà không cần custom css bằng SX prop thì không cần dùng SvgIcon mà cứ gọi trực tiếp luôn cũng được */}
          <PlanetSvg inheritViewBox />
        </Box>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              borderColor: 'white',
              '&:hover': { color: '#fdba26', borderColor: '#fdba26' }
            }}
          >
            Go Home
          </Button>
        </Link>
      </Box>
    </Box>
  )
}

export default NotFound
