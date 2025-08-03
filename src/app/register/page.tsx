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
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import {
  ArrowBack,
} from '@mui/icons-material'
import { useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {

  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      alert('กรุณายอมรับเงื่อนไขการใช้งาน')
      return
    }
    console.log('Register attempt:', { username, email, password, acceptTerms })
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username,email, password }),
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
              สมัครสมาชิก
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#64748b' }}
            >
              สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน
            </Typography>
          </Box>

          {/* Register Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 3 }}
              required
              helperText="ชื่อผู้ใช้จะใช้ในการแสดงผลและไม่สามารถเปลี่ยนแปลงได้"
            />

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
              helperText="รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร"
            />

            {/* Show Password */}
            <Box sx={{ mb: 3 }}>
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
            </Box>

            {/* Terms and Conditions */}
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    size="small"
                    required
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    ฉันยอมรับ{' '}
                    <Link
                      component={NextLink}
                      href="/terms"
                      sx={{
                        color: '#60a5fa',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      เงื่อนไขการใช้งาน
                    </Link>
                    {' '}และ{' '}
                    <Link
                      component={NextLink}
                      href="/privacy"
                      sx={{
                        color: '#60a5fa',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      นโยบายความเป็นส่วนตัว
                    </Link>
                  </Typography>
                }
              />
            </Box>

            {/* Register Button */}
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
              สมัครสมาชิก
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                มีบัญชีอยู่แล้ว?{' '}
                <Link
                  component={NextLink}
                  href="/login"
                  sx={{
                    color: '#60a5fa',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  เข้าสู่ระบบ
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}