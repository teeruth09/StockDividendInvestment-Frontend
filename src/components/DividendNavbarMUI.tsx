'use client'

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, MouseEvent } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

export default function DividendNavbarMUI() {
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const { user, logout, isAuthenticated: isLoggedIn } = useAuth()

  const navigation = [
    { name: 'หน้าแรก', href: '/' },
    { name: 'หุ้น', href: '/stock'},
    { name: 'ภาพรวมพอร์ต', href: '/portfolio' },
    { name: 'จำลองการซื้อ/ขาย', href: '/simulation' },
    { name: 'ปฏิทินหลักทรัพย์', href: '/calendar' },
    { name: 'เกี่ยวกับภาษี', href: '/about' },
  ]

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleProfileClick = () => {
    router.push('/profile')
    handleMenuClose()
  }

  const handleLogin = () => router.push('/login')
  const handleRegister = () => router.push('/register')

  // Drawer content (Mobile)
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: '#60a5fa' }}>
        SITD
      </Typography>
      <List>
        {navigation.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              sx={{
                color: pathname === item.href ? '#60a5fa' : 'inherit',
                backgroundColor:
                  pathname === item.href ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
              }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}

        {!isLoggedIn ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogin}>
                <ListItemText primary="เข้าสู่ระบบ" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleRegister}>
                <ListItemText primary="สมัครสมาชิก" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={handleProfileClick}>
                <ListItemText primary="โปรไฟล์" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={logout}>
                <ListItemText primary="ออกจากระบบ" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#334155',
          boxShadow:
            '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              mr: 4,
              color: '#60a5fa',
              textDecoration: 'none',
              fontWeight: 'bold',
              '&:hover': { color: '#93c5fd' },
            }}
          >
            SITD
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: pathname === item.href ? '#60a5fa' : '#d1d5db',
                    mx: 1,
                    px: 2,
                    py: 1,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    borderBottom:
                      pathname === item.href ? '2px solid #60a5fa' : 'none',
                    borderRadius: pathname === item.href ? 0 : 1,
                    '&:hover': {
                      color: '#ffffff',
                      backgroundColor: '#475569',
                      borderRadius: 1,
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}

          {/* Auth Section */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isLoggedIn ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    onClick={handleLogin}
                    sx={{
                      color: '#d1d5db',
                      borderColor: '#60a5fa',
                      '&:hover': { backgroundColor: '#475569', borderColor: '#93c5fd' },
                    }}
                    variant="outlined"
                    size="small"
                  >
                    เข้าสู่ระบบ
                  </Button>
                  <Button
                    onClick={handleRegister}
                    sx={{
                      backgroundColor: '#60a5fa',
                      color: 'white',
                      '&:hover': { backgroundColor: '#3b82f6' },
                    }}
                    variant="contained"
                    size="small"
                  >
                    สมัครสมาชิก
                  </Button>
                </Box>
              ) : (
                <Box>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    sx={{
                      color: '#d1d5db',
                      backgroundColor: '#475569',
                      '&:hover': { backgroundColor: '#64748b' },
                    }}
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem disabled>
                      <Typography variant="subtitle2">{user?.username}</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleProfileClick}>โปรไฟล์</MenuItem>
                    <MenuItem onClick={logout}>ออกจากระบบ</MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            backgroundColor: '#1e293b',
            color: 'white',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}
