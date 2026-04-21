import { Box, Flex, Heading, Icon, VStack, Text } from '@chakra-ui/react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { LuCalendar, LuLayoutDashboard, LuPlus, LuSettings } from "react-icons/lu";
import { useTranslation } from 'react-i18next';

interface NavItemProps {
    to: string;
    icon: any;
    label: string;
    isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
    return (
        <Link to={to} style={{ textDecoration: 'none', width: '100%' }}>
            <Flex
                align="center"
                px={4}
                py={3}
                borderRadius="lg"
                cursor="pointer"
                bg={isActive ? 'fg.main/10' : 'transparent'}
                color={isActive ? 'fg.main' : 'fg.muted'}
                _hover={{
                    bg: 'fg.main/20',
                    color: 'fg.main',
                }}
                transition="all 0.2s"
                gap={3}
            >
                <Icon as={icon} fontSize="lg" color="inherit" />
                <Text fontWeight={isActive ? "semibold" : "medium"}>{label}</Text>
            </Flex>
        </Link>
    );
};

export const Layout: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation();

    return (
        <Flex minH="100vh" bg="bg.main" color="fg.main">
            {}
            <Box
                as="nav"
                w={{ base: "full", md: "260px" }}
                pos="fixed"
                h="full"
                bg="bg.sidebar"
                borderRightWidth="1px"
                borderColor="border.subtle"
                display={{ base: "none", md: "block" }}
                px={4}
                py={6}
                zIndex="sticky"
            >
                <VStack align="stretch" gap={8}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <Flex align="center" px={2}>
                            <Heading size="md" letterSpacing="widest" color="fg.main">
                                TASKEN FURER
                            </Heading>
                        </Flex>
                    </Link>

                    <VStack align="stretch" gap={2}>
                        <Text fontSize="xs" fontWeight="bold" color="fg.subtle" px={2} mb={1} textTransform="uppercase">
                            {t('menu.main_menu')}
                        </Text>
                        <NavItem 
                            to="/" 
                            icon={LuLayoutDashboard} 
                            label={t('menu.projects')} 
                            isActive={location.pathname === '/' || location.pathname.startsWith('/project')} 
                        />
                        <NavItem 
                            to="/calendar" 
                            icon={LuCalendar} 
                            label={t('menu.calendar')} 
                            isActive={location.pathname === '/calendar'} 
                        />
                        <NavItem 
                            to="/project/create" 
                            icon={LuPlus} 
                            label={t('menu.create')} 
                            isActive={location.pathname === '/project/create'} 
                        />
                        <NavItem 
                            to="/settings" 
                            icon={LuSettings} 
                            label={t('menu.settings')} 
                            isActive={location.pathname === '/settings'} 
                        />
                    </VStack>
                </VStack>
            </Box>

            {}
            <Box
                display={{ base: "block", md: "none" }}
                pos="fixed"
                bottom={0}
                left={0}
                right={0}
                bg="bg.sidebar"
                borderTopWidth="1px"
                borderColor="border.subtle"
                px={4}
                py={2}
                zIndex="sticky"
            >
                <Flex justify="space-around" align="center">
                    <Link to="/">
                        <VStack gap={0} color={location.pathname === '/' ? 'fg.main' : 'fg.muted'}>
                            <Icon as={LuLayoutDashboard} fontSize="xl" color="inherit" />
                            <Text fontSize="xs">{t('dashboard.title')}</Text>
                        </VStack>
                    </Link>
                    <Link to="/project/create">
                        <VStack gap={0} color={location.pathname === '/project/create' ? 'fg.main' : 'fg.muted'}>
                            <Icon as={LuPlus} fontSize="xl" color="inherit" />
                            <Text fontSize="xs">{t('menu.create')}</Text>
                        </VStack>
                    </Link>
                    <Link to="/calendar">
                        <VStack gap={0} color={location.pathname === '/calendar' ? 'fg.main' : 'fg.muted'}>
                            <Icon as={LuCalendar} fontSize="xl" color="inherit" />
                            <Text fontSize="xs">{t('menu.calendar')}</Text>
                        </VStack>
                    </Link>
                    <Link to="/settings">
                        <VStack gap={0} color={location.pathname === '/settings' ? 'fg.main' : 'fg.muted'}>
                            <Icon as={LuSettings} fontSize="xl" color="inherit" />
                            <Text fontSize="xs">{t('menu.settings')}</Text>
                        </VStack>
                    </Link>
                </Flex>
            </Box>

            {}
            <Box
                flex="1"
                ml={{ base: 0, md: "260px" }}
                mb={{ base: "60px", md: 0 }}
                p={{ base: 4, md: 8 }}
            >
                <Box maxW="1200px" mx="auto">
                    <Outlet />
                </Box>
            </Box>
        </Flex>
    );
};
