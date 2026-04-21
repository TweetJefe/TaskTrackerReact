import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, Flex, Spinner, Text, Box, Button, VStack, Heading } from '@chakra-ui/react';
import { system } from './theme.ts';
import { ColorModeProvider } from './components/ui/color-mode.tsx';
import './index.css'
import './i18n.ts' 
import App from './App.tsx'
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { graphqlRequest } from './graphql/client.ts';
import { AUTH_VIA_TELEGRAM_MUTATION, ASSIGN_USER_MUTATION } from './graphql/queries.ts';
import type { AuthResponse } from './types/index.ts';
import { useTranslation } from 'react-i18next';

const Alert = {
    Root: ({ children, status }: any) => (
        <Box p={3} borderRadius="md" bg={status === 'error' ? 'red.500/10' : 'blue.500/10'} color={status === 'error' ? 'red.400' : 'blue.400'} w="full" fontSize="sm" borderWidth="1px" borderColor={status === 'error' ? 'red.500/30' : 'blue.500/30'}>
            {children}
        </Box>
    ),
    Title: ({ children }: any) => <Text fontWeight="bold">{children}</Text>
};

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setAuthData, isAuthenticated } = useAuth();
  const [authLoading, setAuthLoading] = useState(!isAuthenticated);
  const [authError, setAuthError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleStartParam = async (param: string, userId: string) => {
    console.log("Handling start_param:", param);
    if (param.startsWith('join_task_')) {
      const taskId = param.replace('join_task_', '');
      try {
        await graphqlRequest(ASSIGN_USER_MUTATION, { taskId, assigneeId: userId });
        console.log("Successfully joined task:", taskId);
      } catch (err) {
        console.error("Error joining task via start_param:", err);
      }
    }
  };

  const performMockAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await graphqlRequest<AuthResponse>(AUTH_VIA_TELEGRAM_MUTATION, {
        initData: "mock_init_data",
        telegramId: import.meta.env.VITE_DEV_USER_ID || "1",
        username: import.meta.env.VITE_DEV_USERNAME || "dev_user"
      });
      const data = result.authViaTelegram;
      setAuthData(data.token, data.userId, data.username || import.meta.env.VITE_DEV_USERNAME || "dev_user");
    } catch (err: unknown) {
      setAuthError("Ошибка мок-авторизации: " + (err as Error).message);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) return;

    const performAuth = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        
        if (!tg || !tg.initData) {
          setAuthLoading(false);
          return;
        }

        tg.ready();
        tg.expand();

        const user = tg.initDataUnsafe?.user;
        const startParam = tg.initDataUnsafe?.start_param;
        const variables = {
          initData: tg.initData,
          telegramId: user?.id?.toString() || "0",
          username: user?.username || user?.first_name || "unknown",
          firstName: user?.first_name || "",
          lastName: user?.last_name || "",
          languageCode: user?.language_code || "en"
        };
        
        const result = await graphqlRequest<AuthResponse>(AUTH_VIA_TELEGRAM_MUTATION, variables);
        const data = result.authViaTelegram;
        setAuthData(data.token, data.userId, data.username || variables.username);
        
        if (startParam) {
            await handleStartParam(data.userId, data.userId);
        }
      } catch (err: unknown) {
        setAuthError((err as Error).message || 'Ошибка авторизации');
      } finally {
        setAuthLoading(false);
      }
    };

    performAuth();
  }, [isAuthenticated, setAuthData]);

  if (authLoading) {
    return (
      <Flex justify="center" align="center" h="100vh" direction="column" gap={4} bg="bg.main">
        <Spinner size="xl" color="fg.main" />
        <Text color="fg.muted">{t('auth.loading')}</Text>
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return (
      <Flex justify="center" align="center" h="100vh" p={6} bg="bg.main">
        <VStack gap={6} p={8} bg="bg.card" shadow="2xl" borderRadius="2xl" maxW="400px" textAlign="center" borderWidth="1px" borderColor="border.subtle">
          <Box>
            <Heading size="md" mb={2} color="fg.main">TASKEN FURER</Heading>
            <Text color="fg.muted">{t('auth.tg_only')}</Text>
          </Box>
          
          {authError && (
            <Alert.Root status="error">
              <Alert.Title>{t('auth.error', { message: authError })}</Alert.Title>
            </Alert.Root>
          )}

          <Button bg="fg.main" color="bg.main" _hover={{ opacity: 0.8 }} w="full" onClick={performMockAuth} size="lg" borderRadius="xl">
            {t('auth.dev_mode')}
          </Button>
          
          <Text fontSize="xs" color="fg.subtle">
            Mini App v1.0
          </Text>
        </VStack>
      </Flex>
    );
  }

  return <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <AuthWrapper>
            <App />
          </AuthWrapper>
        </ColorModeProvider>
      </ChakraProvider>
    </AuthProvider>
  </StrictMode>,
)
