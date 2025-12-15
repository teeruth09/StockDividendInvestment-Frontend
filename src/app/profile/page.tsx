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
    },
  });

  const [currentYear, setCurrentYear] = useState(2025);
  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState<UserTaxInfo | null>(null);

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

  const fieldLabels: Record<string, string> = {
    annual_income: 'รายได้รวมต่อปี',
    personal_deduction: 'ลดหย่อนภาษีส่วนตัว',
    spouse_deduction: 'ลดหย่อนภาษีคู่สมรส',
    child_deduction: 'ลดหย่อนภาษีบุตร',
    parent_deduction: 'ลดหย่อนภาษีบิดามารดา',
    life_insurance_deduction: 'ประกันชีวิต',
    health_insurance_deduction: 'ประกันสุขภาพ',
    provident_fund_deduction: 'กองทุนสำรองเลี้ยงชีพ',
    retirement_mutual_fund: 'กองทุน RMF',
  };

  function normalizeTaxInfo(apiData: Partial<UserTaxInfo>): UserTaxInfo {
    return {
      tax_year: apiData.tax_year ?? currentYear,
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
  }, [user, token, currentYear]);

  const data = allYearsData[currentYear];

  const handleInputChange = (field: keyof UserTaxInfo) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!data) return;
    let value: string | number = event.target.value;
    if (numberFields.includes(field)) {
      value = value === '' ? '' : Number(value);
    }
    setAllYearsData((prev) => ({
      ...prev,
      [currentYear]: { ...prev[currentYear], [field]: value },
    }));
  };

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
        tax_year: newYear,
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
      },
    }));
    setCurrentYear(newYear);
  };

  if (!userData || !data) return <div>Loading profile...</div>;

  return (
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
        <Grid size={{xs:6, md:7}}>
          <Card sx={{ borderRadius: 2 }}>
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

              {/* Tax Info Grid */}
              <Grid container spacing={2}>
                {/* Year */}
                <Grid size={{xs:6}}>
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
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#f5f5f5', borderRadius: 1 } }}
                  />
                </Grid>

                {/* รายการ */}
                {['annual_income','personal_deduction', 'spouse_deduction', 'child_deduction', 'parent_deduction',
                  'life_insurance_deduction', 'health_insurance_deduction', 'provident_fund_deduction',
                  'retirement_mutual_fund'].map((field) => (
                  <Grid size={{xs:6}} key={field}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {fieldLabels[field]} (บาท)
                    </Typography>
                    <NumericFormat
                      value={data[field as keyof UserTaxInfo]}
                      thousandSeparator
                      onValueChange={handleNumericChange(field as keyof UserTaxInfo)}
                      customInput={TextField}
                      fullWidth
                      variant="outlined"
                      disabled={!isEditing}
                      sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#f5f5f5', borderRadius: 1 } }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InvestmentProfileUI;