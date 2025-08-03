'use client'

import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material'
import { useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        router.push('/')  // redirect Home page
      } else {
        console.error('Login failed')
      }
    } catch (error) {
      console.error('An error occurred during login:', error)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <IconButton
              component={NextLink}
              href="/"
              sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16,
                color: '#64748b' 
              }}
            >
              <ArrowBack />
            </IconButton>
            
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#1e293b',
                mb: 1,
              }}
            >
              SITD
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#334155',
                mb: 1,
              }}
            >
              เข้าสู่ระบบ
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#64748b' }}
            >
              ยินดีต้อนรับกลับมา กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              fullWidth
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            {/* Show Password & Forgot Password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    size="small"
                  />
                }
                label="แสดงรหัสผ่าน"
                sx={{ color: '#64748b' }}
              />
              <Link
                component={NextLink}
                href="/forgot-password"
                sx={{
                  color: '#60a5fa',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                ลืมรหัสผ่าน?
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                backgroundColor: '#60a5fa',
                fontSize: '1rem',
                fontWeight: 600,
                mb: 3,
                '&:hover': {
                  backgroundColor: '#3b82f6',
                },
              }}
            >
              เข้าสู่ระบบ
            </Button>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                ยังไม่มีบัญชี?{' '}
                <Link
                  component={NextLink}
                  href="/register"
                  sx={{
                    color: '#60a5fa',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  สมัครสมาชิก
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}