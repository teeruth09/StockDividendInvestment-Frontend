"use client"
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Avatar
} from '@mui/material';
import { Person, Assessment } from '@mui/icons-material';
import { User, UserTaxInfo } from '@/types/user';
import { getUserApi, getUserTaxInfoApi, updateUserTaxInfoApi } from '@/lib/api/user';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '@/components/AppSnackbar';
import { NumericFormat, NumberFormatValues } from 'react-number-format';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const InvestmentProfileUI: React.FC = () => {
  const { user, token } = useAuth();
  const { showAlert } = useAlert();

  const [userData, setUserData] = useState<User>({
    user_id: '',
    username: 'mock',
    email: 'mock@gmail.com',
  });
  const startYear = 2025;
  const endYear = 2030; // หรือจะใช้ dynamic: new Date().getFullYear() + 5

  const taxYears = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // เปลี่ยนจาก data -> allYearsData
  const [allYearsData, setAllYearsData] = useState<{ [year: number]: UserTaxInfo }>({
    2025: {
      taxYear: 2025,
      salary: 0, 
      bonus: 0, 
      otherIncome: 0,
      personalDeduction: 60000, 
      spouseDeduction: 0, 
      childDeduction: 0, 
      parentDeduction: 0, 
      disabledDeduction: 0,
      socialSecurity: 0, 
      lifeInsurance: 0, 
      healthInsurance: 0, 
      parentHealthInsurance: 0,
      pvdDeduction: 0, 
      ssfInvestment: 0, 
      rmfInvestment: 0, 
      thaiesgInvestment: 0,
      homeLoanInterest: 0, 
      donationGeneral: 0, 
      donationEducation: 0,
    },
  });

  const [currentYear, setCurrentYear] = useState(2025);
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState<UserTaxInfo | null>(null);


  const fieldLabels: Record<string, string> = {
    salary: 'เงินเดือน/ค่าจ้าง',
    bonus: 'โบนัส',
    otherIncome: 'รายได้อื่นๆ (ม.40(2))',
    personalDeduction: 'ลดหย่อนส่วนตัว',
    spouseDeduction: 'ลดหย่อนคู่สมรส',
    childDeduction: 'ลดหย่อนบุตร',
    parentDeduction: 'ลดหย่อนบิดามารดา',
    disabledDeduction: 'ลดหย่อนผู้พิการ/ทุพพลภาพ',
    socialSecurity: 'ประกันสังคม',
    lifeInsurance: 'เบี้ยประกันชีวิต',
    healthInsurance: 'เบี้ยประกันสุขภาพ',
    parentHealthInsurance: 'เบี้ยประกันสุขภาพพ่อแม่',
    pvdDeduction: 'กองทุนสำรองเลี้ยงชีพ (PVD)',
    ssfInvestment: 'กองทุน SSF',
    rmfInvestment: 'กองทุน RMF',
    thaiesgInvestment: 'กองทุน Thai ESG',
    homeLoanInterest: 'ดอกเบี้ยกู้ซื้อบ้าน',
    donationGeneral: 'เงินบริจาคทั่วไป',
    donationEducation: 'เงินบริจาคการศึกษา/กีฬา (2 เท่า)',
  };

  function normalizeTaxInfo(apiData: Partial<UserTaxInfo>): UserTaxInfo {
    return {
      taxYear: apiData.taxYear ?? currentYear,
      salary: apiData.salary ?? 0,
      bonus: apiData.bonus ?? 0,
      otherIncome: apiData.otherIncome ?? 0,
      personalDeduction: apiData.personalDeduction ?? 60000,
      spouseDeduction: apiData.spouseDeduction ?? 0,
      childDeduction: apiData.childDeduction ?? 0,
      parentDeduction: apiData.parentDeduction ?? 0,
      disabledDeduction: apiData.disabledDeduction ?? 0,
      socialSecurity: apiData.socialSecurity ?? 0,
      lifeInsurance: apiData.lifeInsurance ?? 0,
      healthInsurance: apiData.healthInsurance ?? 0,
      parentHealthInsurance: apiData.parentHealthInsurance ?? 0,
      pvdDeduction: apiData.pvdDeduction ?? 0,
      ssfInvestment: apiData.ssfInvestment ?? 0,
      rmfInvestment: apiData.rmfInvestment ?? 0,
      thaiesgInvestment: apiData.thaiesgInvestment ?? 0,
      homeLoanInterest: apiData.homeLoanInterest ?? 0,
      donationGeneral: apiData.donationGeneral ?? 0,
      donationEducation: apiData.donationEducation ?? 0,
    };
  }

  useEffect(() => {
    if (!user || !token) return;
    const fetchData = async () => {
      try {
        const profile = await getUserApi(token, user.username);
        setUserData(profile);

        const taxInfo = await getUserTaxInfoApi(token, currentYear);
        if (taxInfo) {
          setAllYearsData((prev) => ({
            ...prev,
            [currentYear]: normalizeTaxInfo(taxInfo),
          }));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, currentYear]);

  const data = allYearsData[currentYear];


  const handleNumericChange = (field: keyof UserTaxInfo) => (values: NumberFormatValues) => {
    setAllYearsData((prev) => ({
      ...prev,
      [currentYear]: {
        ...prev[currentYear],
        [field]: values.value === '' ? '' : Number(values.value),
      },
    }));
  };

  const handleEdit = () => {
    if (!data) return;
    setBackupData(data);
    setIsEditing(true);
  };
  const handleCancel = () => {
    if (!backupData) return;
    setAllYearsData((prev) => ({
      ...prev,
      [currentYear]: backupData,
    }));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!data || !token) return;
    try {
      const updated = await updateUserTaxInfoApi(token, data);
      setAllYearsData((prev) => ({ ...prev, [currentYear]: updated }));
      setIsEditing(false);
      showAlert('บันทึกข้อมูลภาษีสำเร็จ!', 'success');
    } catch (err) {
      console.error('Failed to save tax info', err);
      showAlert('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleAddYear = () => {
    const newYear = Math.max(...Object.keys(allYearsData).map(Number)) + 1;
    setAllYearsData((prev) => ({
      ...prev,
      [newYear]: {
        taxYear: newYear,
        salary: 0, 
        bonus: 0, 
        otherIncome: 0,
        personalDeduction: 60000, 
        spouseDeduction: 0, 
        childDeduction: 0, 
        parentDeduction: 0, 
        disabledDeduction: 0,
        socialSecurity: 0, 
        lifeInsurance: 0, 
        healthInsurance: 0, 
        parentHealthInsurance: 0,
        pvdDeduction: 0, 
        ssfInvestment: 0, 
        rmfInvestment: 0, 
        thaiesgInvestment: 0,
        homeLoanInterest: 0, 
        donationGeneral: 0, 
        donationEducation: 0,
      },
    }));
    setCurrentYear(newYear);
  };

  if (!userData || !data) return <div>Loading profile...</div>;

  // สร้าง Helper สำหรับแบ่งกลุ่ม Grid เพื่อความสวยงาม
  const renderFieldGroup = (title: string, fields: (keyof UserTaxInfo)[]) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom sx={{ borderBottom: '1px solid #e0e0e0', pb: 0.5, mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid size={{ xs: 12, sm: 6 }} key={field as string}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {fieldLabels[field as string]} (บาท)
            </Typography>
            <NumericFormat
              value={data[field]}
              thousandSeparator
              onValueChange={handleNumericChange(field)}
              customInput={TextField}
              fullWidth
              variant="outlined"
              disabled={!isEditing}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isEditing ? '#fff' : '#f5f5f5', borderRadius: 1 } }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <ProtectedRoute>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: '#e0e0e0' }}>
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
            {!isEditing ? (
              <Button variant="outlined" onClick={handleEdit} sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: '#e0e0e0' }}>
                แก้ไขโปรไฟล์
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" color="primary" onClick={handleSave} sx={{ borderRadius: 2, textTransform: 'none' }}>
                  บันทึก
                </Button>
                <Button variant="outlined" color="inherit" onClick={handleCancel} sx={{ borderRadius: 2, textTransform: 'none' }}>
                  ยกเลิก
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Main Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs:12 }}>
            <Card sx={{ borderRadius: 2 }} >
              <CardContent sx={{ p: 3 }}>
                {/* Header with Year Select */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Assessment sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6" fontWeight="600">
                      ข้อมูลภาษีส่วนบุคคล
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      select
                      label="ปีภาษี"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(Number(e.target.value))}
                      size="small"
                    >
                      {taxYears.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                    </TextField>
                    <Button variant="outlined" size="small" onClick={handleAddYear}>
                      เพิ่มปีใหม่
                    </Button>
                  </Box>
                </Box>

                {/* แบ่งกลุ่มข้อมูลตาม Model ใหม่ */}
                {renderFieldGroup("รายได้ (Income)", 
                  ['salary', 'bonus', 'otherIncome'])}
                
                {renderFieldGroup("1. ค่าลดหย่อนส่วนตัวและครอบครัว", 
                  ['personalDeduction', 'spouseDeduction', 'childDeduction', 'parentDeduction', 'disabledDeduction'])}
                
                {renderFieldGroup("2. กลุ่มประกันและการออม", 
                  ['socialSecurity', 'lifeInsurance', 'healthInsurance', 'parentHealthInsurance', 'pvdDeduction', 'ssfInvestment', 'rmfInvestment', 'thaiesgInvestment'])}
                
                {renderFieldGroup("3. กลุ่มอสังหาริมทรัพย์และอื่นๆ", 
                  ['homeLoanInterest', 'donationGeneral', 'donationEducation'])}
                  
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default InvestmentProfileUI;