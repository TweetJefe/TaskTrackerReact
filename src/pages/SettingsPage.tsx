import { Box, Heading, Text, VStack, HStack, Switch, NativeSelect, Field, Icon, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuLanguages, LuMoon, LuSun } from "react-icons/lu";
import { useColorMode } from '../components/ui/color-mode';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { colorMode, toggleColorMode } = useColorMode();
    const isDarkMode = colorMode === 'dark';

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Box maxW="600px" mx="auto">
            <Box mb={8}>
                <Heading size="lg" mb={1} color="fg.main">{t('settings.title')}</Heading>
                <Text color="fg.muted">{t('settings.subtitle')}</Text>
            </Box>

            <VStack gap={6} align="stretch">
                {}
                <Box p={6} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
                    <HStack gap={4} mb={6}>
                        <Box p={2} bg="bg.main" borderRadius="lg" borderWidth="1px" borderColor="border.subtle">
                            <Icon as={LuLanguages} color="fg.main" />
                        </Box>
                        <Box>
                            <Text fontWeight="bold" color="fg.main">{t('settings.language')}</Text>
                            <Text fontSize="xs" color="fg.muted">Измените язык интерфейса</Text>
                        </Box>
                    </HStack>

                    <Field.Root>
                        <NativeSelect.Root>
                            <NativeSelect.Field 
                                value={i18n.language} 
                                onChange={(e) => changeLanguage(e.target.value)}
                                bg="bg.input"
                                borderColor="border.strong"
                                color="fg.main"
                            >
                                <option value="en">English</option>
                                <option value="ru">Русский</option>
                                <option value="es">Español</option>
                            </NativeSelect.Field>
                        </NativeSelect.Root>
                    </Field.Root>
                </Box>

                {}
                <Box p={6} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
                    <Flex justify="space-between" align="center">
                        <HStack gap={4}>
                            <Box p={2} bg="bg.main" borderRadius="lg" borderWidth="1px" borderColor="border.subtle">
                                <Icon as={isDarkMode ? LuMoon : LuSun} color="fg.main" />
                            </Box>
                            <Box>
                                <Text fontWeight="bold" color="fg.main">{t('settings.theme')}</Text>
                                <Text fontSize="xs" color="fg.muted">
                                    {isDarkMode ? t('settings.dark_mode') : t('settings.light_mode')}
                                </Text>
                            </Box>
                        </HStack>
                        <Switch.Root 
                            checked={isDarkMode} 
                            onCheckedChange={toggleColorMode}
                            colorPalette="gray"
                            size="lg"
                        >
                            <Switch.HiddenInput />
                            <Switch.Control>
                                <Switch.Thumb bg="fg.main" />
                            </Switch.Control>
                        </Switch.Root>
                    </Flex>
                </Box>
            </VStack>
        </Box>
    );
}
