"use client"
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Paper,
  Container
} from '@mui/material';
import { Person, Assessment } from '@mui/icons-material';

interface InvestorData {
  username: string;
  email: string;
  year: string;
  totalIncome: string;
  salaryFromEmployment: string;
  salaryFromBusiness: string;
  otherIncome: string;
  businessIncome: string;
  lifeInsurance: string;
  healthInsurance: string;
  savingsAccountBalance: string;
  rmfFunds: string;
}

const InvestmentProfileUI: React.FC = () => {
  const [data, setData] = React.useState<InvestorData>({
    username: 'somchai_investor',
    email: 'somchai@example.com',
    year: '2024',
    totalIncome: '500000',
    salaryFromEmployment: '60000',
    salaryFromBusiness: '60000',
    otherIncome: '30000',
    businessIncome: '30000',
    lifeInsurance: '100000',
    healthInsurance: '25000',
    savingsAccountBalance: '50000',
    rmfFunds: '50000'
  });

  const handleInputChange = (field: keyof InvestorData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setData({ ...data, [field]: event.target.value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Profile Section */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mr: 3,
              bgcolor: '#e0e0e0'
            }}
          >
            <Person sx={{ fontSize: 40, color: '#9e9e9e' }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              somchai_investor
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              somchai@example.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ผู้ใช้ขั้นต้น • โปรไฟล์
            </Typography>
          </Box>
          <Button
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              color: 'text.secondary',
              borderColor: '#e0e0e0'
            }}
          >
            แก้ไขโปรไฟล์
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - User Info */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight="600">
                  ข้อมูลผู้ใช้
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ชื่อผู้ใช้
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={data.username}
                  onChange={handleInputChange('username')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1
                    }
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  อีเมล
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={data.email}
                  onChange={handleInputChange('email')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Investment Data */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight="600">
                  ข้อมูลการลงทุน
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* Row 1 */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ปีภาษี
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.year}
                    onChange={handleInputChange('year')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    รายได้รวม (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.totalIncome}
                    onChange={handleInputChange('totalIncome')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>

                {/* Row 2 */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ค่าจ้างพนักงานปกติ (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.salaryFromEmployment}
                    onChange={handleInputChange('salaryFromEmployment')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ค่าจ้างพนักงานธุรกิจ (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.salaryFromBusiness}
                    onChange={handleInputChange('salaryFromBusiness')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>

                {/* Row 3 */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ค่าจ้างพนักงานอื่นๆ (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.otherIncome}
                    onChange={handleInputChange('otherIncome')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ค่าจ้างพนักงานจากอาชีพอิสระ (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.businessIncome}
                    onChange={handleInputChange('businessIncome')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>

                {/* Row 4 */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ประกันชีวิต (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.lifeInsurance}
                    onChange={handleInputChange('lifeInsurance')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ประกันสุขภาพ (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.healthInsurance}
                    onChange={handleInputChange('healthInsurance')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>

                {/* Row 5 */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    กองทุนสำรองเลี้ยงชีพ (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.savingsAccountBalance}
                    onChange={handleInputChange('savingsAccountBalance')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    กองทุน RMF (บาท)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={data.rmfFunds}
                    onChange={handleInputChange('rmfFunds')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InvestmentProfileUI;