'use client'

import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import {
  ArrowBack,
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
    const router = useRouter()
    const { login, isLoading, error, clearError, isAuthenticated } = useAuth()
    
    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Redirect ถ้า login แล้ว
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return // ป้องกัน double submit
        
        setIsSubmitting(true)
        clearError() // clear error เก่า
        
        console.log('Login attempt:', { username, password })
        
        try {
            await login({ username, password });
            // จะ redirect อัตโนมัติผ่าน useEffect
        } catch (err) {
            // Error จะถูก handle ใน AuthContext แล้ว
            console.error('Login failed:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    // แสดง loading ถ้ากำลังเช็ค auth status
    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        )
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
                <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
                    <IconButton
                        component={NextLink}
                        href="/"
                        sx={{ 
                            position: 'absolute', 
                            top: -16, 
                            left: -16,
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
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 3 }}
                        required
                        disabled={isSubmitting}
                    />

                    <TextField
                        fullWidth
                        label="รหัสผ่าน"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                        disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                    disabled={isSubmitting || !username || !password}
                    sx={{
                        py: 1.5,
                        backgroundColor: '#60a5fa',
                        fontSize: '1rem',
                        fontWeight: 600,
                        mb: 3,
                        '&:hover': {
                        backgroundColor: '#3b82f6',
                        },
                        '&:disabled': {
                        backgroundColor: '#e2e8f0',
                        },
                    }}
                    >
                    {isSubmitting ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            กำลังเข้าสู่ระบบ...
                        </>
                    ) : (
                        'เข้าสู่ระบบ'
                    )}
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
            
            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={4000}
                onClose={clearError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                <Alert severity="error" onClose={clearError} sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    )
}