import React, { useState } from 'react';
import { AppBar, Toolbar, Box, Button, Typography, InputBase, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { IconFlask, IconSearch, IconPlus } from '@tabler/icons-react';

const navItems = [
    { id: 'lab', label: 'Lab' },
    { id: 'strains', label: 'Strains' },
    { id: 'tank', label: 'My Tank' },
    { id: 'guide', label: 'Genetics Guide' },
];

const NavbarContainer = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#161925', // Màu nền tối phù hợp với ảnh Figma
    color: '#ffffff',
    boxShadow: 'none',
    borderBottom: '1px solid #2A2E3D',
}));

const SearchWrapper = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: '8px',
    backgroundColor: '#1F2433',
    border: '1px solid #2A2E3D',
    '&:hover': {
        backgroundColor: '#262C3D',
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 1.5),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748B' // Màu xám icon tìm kiếm
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    fontSize: '14px',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(3.5)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '20ch',
            '&:focus': {
                width: '25ch',
            },
        },
        '&::placeholder': {
            color: '#64748B',
            opacity: 1,
        }
    },
}));

const NavLink = styled(Typography)<{ active?: boolean; component?: string }>(({ theme, active }) => ({
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    color: active ? '#FFFFFF' : '#8A94A6',
    padding: theme.spacing(0, 2),
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    transition: 'color 0.2s',
    '&:hover': {
        color: '#FFFFFF',
    },
    ...(active && {
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: '#3B82F6', // Viền xanh active
            borderRadius: '3px 3px 0 0',
        }
    })
}));

const GuppyNavbar = () => {
    const [activeTab, setActiveTab] = useState('lab');

    return (
        <NavbarContainer position="static">
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px', px: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, height: '64px' }}>
                    {/* Logo Brand */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconFlask size={24} color="#3B82F6" />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px', color: '#ffffff', letterSpacing: '0.2px' }}>
                            GuppyGen <span style={{ color: '#8A94A6', fontWeight: 600 }}>Lab</span>
                        </Typography>
                    </Box>

                    {/* Navigation Items in Middle */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, height: '100%', alignItems: 'center' }}>
                        {navItems.map((item) => (
                            <NavLink
                                component="div"
                                key={item.id}
                                active={activeTab === item.id}
                                onClick={() => setActiveTab(item.id)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Search Box */}
                    <SearchWrapper sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <SearchIconWrapper>
                            <IconSearch size={18} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search strains..."
                            inputProps={{ 'aria-label': 'search strains' }}
                        />
                    </SearchWrapper>

                    {/* New Project Button */}
                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<IconPlus size={18} />}
                        sx={{
                            backgroundColor: '#2563EB',
                            color: '#ffffff',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '13px',
                            borderRadius: '6px',
                            padding: '6px 16px',
                            display: { xs: 'none', sm: 'flex' },
                            '&:hover': {
                                backgroundColor: '#1D4ED8'
                            }
                        }}
                    >
                        New Project
                    </Button>

                    {/* Profile User Icon */}
                    <Avatar
                        src="/images/profile/user-1.jpg" // Có thể thay bằng avatar phù hợp
                        sx={{
                            width: 36,
                            height: 36,
                            border: '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: '#3B82F6'
                            }
                        }}
                    />
                </Box>
            </Toolbar>
        </NavbarContainer>
    );
};

export default GuppyNavbar;
