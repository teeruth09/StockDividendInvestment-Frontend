"use client"
import React, { useEffect, useState } from 'react';
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
import { User, UserTaxInfo } from '@/types/user';
import { getUserApi, getUserTaxInfoApi, updateUserTaxInfoApi } from '@/lib/api/user';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '@/components/AppSnackbar';
import { NumericFormat } from 'react-number-format';
import { NumberFormatValues } from 'react-number-format';

const InvestmentProfileUI: React.FC = () => {
  const { user, token } = useAuth();
  const [userData, setUserData] = useState<User>({
    user_id: '',
    username: 'mock',
    email: 'mock@gmail.com',
  });
  const [data, setData] = useState<UserTaxInfo>({
    tax_year: 2025,
    annual_income: 0,
    tax_bracket: 0,
    personal_deduction: 0,
    spouse_deduction: 0,
    child_deduction: 0,
    parent_deduction: 0,
    life_insurance_deduction: 0,
    health_insurance_deduction: 0,
    provident_fund_deduction: 0,
    retirement_mutual_fund: 0,
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [backupData, setBackupData] = useState<UserTaxInfo | null>(null);

  function normalizeTaxInfo(apiData: Partial<UserTaxInfo>): UserTaxInfo {
    return {
      tax_year: apiData.tax_year ?? 2025,
      annual_income: apiData.annual_income ?? 0,
      tax_bracket: apiData.tax_bracket ?? 0,
      personal_deduction: apiData.personal_deduction ?? 0,
      spouse_deduction: apiData.spouse_deduction ?? 0,
      child_deduction: apiData.child_deduction ?? 0,
      parent_deduction: apiData.parent_deduction ?? 0,
      life_insurance_deduction: apiData.life_insurance_deduction ?? 0,
      health_insurance_deduction: apiData.health_insurance_deduction ?? 0,
      provident_fund_deduction: apiData.provident_fund_deduction ?? 0,
      retirement_mutual_fund: apiData.retirement_mutual_fund ?? 0,
    };
  }
  const numberFields: (keyof UserTaxInfo)[] = [
    'annual_income',
    'tax_bracket',
    'personal_deduction',
    'spouse_deduction',
    'child_deduction',
    'parent_deduction',
    'life_insurance_deduction',
    'health_insurance_deduction',
    'provident_fund_deduction',
    'retirement_mutual_fund',
  ];

  useEffect(() => {
    if (!user || !token) return;
    const fetchData = async () => {
      try {
        const profile = await getUserApi(token,user.username);
        setUserData(profile);

        const taxInfo = await getUserTaxInfoApi(token, 2025); // taxYear ปัจจุบัน
        if (taxInfo) {
          setData(normalizeTaxInfo(taxInfo));
        } 

      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, [user, token]);

  const handleInputChange = (field: keyof UserTaxInfo) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!data) return;
    //const value = numberFields.includes(field) ? Number(event.target.value) : event.target.value;
    let value: string | number = event.target.value;

    if (numberFields.includes(field)) {
      value = value === '' ? '' : Number(value); // ถ้าว่าง ให้เก็บเป็น '' เพื่อให้ 0 หายไปเวลาเริ่มพิมพ์
    }

    setData({ ...data, [field]: value });
  };  
  const handleNumericChange =
    (field: keyof UserTaxInfo) =>
    (values: NumberFormatValues) => {
      setData((prev) => ({
        ...prev,
        [field]: values.value === '' ? '' : Number(values.value),
    }));
  };


  const handleEdit = () => {
    if (!data) return;
    setBackupData(data); // สำรองข้อมูลก่อนแก้ไข
    setIsEditing(true);
  };
  const handleCancel = () => {
    if (!backupData) return;
    setData(backupData); // คืนค่าข้อมูลเดิม
    setIsEditing(false);
  };

  const { showAlert } = useAlert();

  const handleSave = async () => {
    if (!data || !token) return;
    try {
      console.log("data",data)
      const updated = await updateUserTaxInfoApi(token, data);
      setData(updated);
      setIsEditing(false);
      showAlert('บันทึกข้อมูลภาษีสำเร็จ!', 'success');
    } catch (err) {
      console.error('Failed to save tax info', err);
      showAlert('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  if (!userData || !data) {
    return <div>Loading profile...</div>;
  }

  

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
              {userData.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {userData.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ผู้ใช้ขั้นต้น • โปรไฟล์
            </Typography>
          </Box>
          {!isEditing ?(
            <Button
              variant="outlined"
              onClick={handleEdit}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                color: 'text.secondary',
                borderColor: '#e0e0e0'
              }}
            >
              แก้ไขโปรไฟล์
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                บันทึก
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                ยกเลิก
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - User Info */}
        {/* <Grid item xs={12} md={5}>
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
        </Grid> */}

        {/* Right Column - Investment Data */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight="600">
                  ข้อมูลภาษีส่วนบุคคล
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
                    type="number"
                    value={data.tax_year}
                    onChange={handleInputChange('tax_year')}
                    disabled={!isEditing}
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
                    รายได้รวมต่อปี (บาท)
                  </Typography>
                  <NumericFormat
                    value={data.annual_income}
                    thousandSeparator
                    onValueChange={handleNumericChange('annual_income')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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
                    ลดหย่อนภาษีส่วนตัว (บาท)
                  </Typography>
                  <NumericFormat
                    value={data.personal_deduction}
                    thousandSeparator
                    onValueChange={handleNumericChange('personal_deduction')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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
                    ลดหย่อนภาษีคู่สมรส (บาท)
                  </Typography>
                   <NumericFormat
                    value={data.spouse_deduction}
                    thousandSeparator
                    onValueChange={handleNumericChange('spouse_deduction')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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
                    ลดหย่อนภาษีบุตร (บาท)
                  </Typography>
                  <NumericFormat
                    value={data.child_deduction}
                    thousandSeparator
                    onValueChange={handleNumericChange('child_deduction')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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
                    ลดหย่อนภาษีบิดามารดา (บาท)
                  </Typography>
                  <NumericFormat
                    value={data.parent_deduction}
                    thousandSeparator
                    onValueChange={handleNumericChange('parent_deduction')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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
                  <NumericFormat
                    value={data.life_insurance_deduction}
                    thousandSeparator
                    onValueChange={handleNumericChange('life_insurance_deduction')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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
                  <NumericFormat
                    value={data.health_insurance_deduction}
                    thousandSeparator
                    onValueChange={handleNumericChange('health_insurance_deduction')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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
                  <NumericFormat
                    value={data.provident_fund_deduction}
                    thousandSeparator
                    onValueChange={handleNumericChange('provident_fund_deduction')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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
                  <NumericFormat
                    value={data.retirement_mutual_fund}
                    thousandSeparator
                    onValueChange={handleNumericChange('retirement_mutual_fund')}
                    customInput={TextField} // ใช้ MUI TextField ได้
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
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