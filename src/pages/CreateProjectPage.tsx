import { Box, Heading, Input, Textarea, Button, Field, VStack, Text, Flex } from '@chakra-ui/react';
import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CREATE_PROJECT_MUTATION } from '../graphql/queries';
import { graphqlRequest } from '../graphql/client';
import type { CreateProjectResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { LuChevronLeft, LuPlus } from 'react-icons/lu';

export default function CreateProjectPage() {
    const { t } = useTranslation();
    const { userId } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFetching(true);
        setError(null);

        const variables = {
            input: {
                name,
                description,
                reporterId: userId,
                assignees: []
            }
        };

        try {
            const data = await graphqlRequest<CreateProjectResponse>(CREATE_PROJECT_MUTATION, variables);
            
            if (data?.createProject?.id) {
                navigate(`/project/${data.createProject.id}`);
            }
        } catch (err: unknown) {
            setError(err as Error);
        } finally {
            setFetching(false);
        }
    }

    return (
        <Box maxW="600px" mx="auto">
            <Button asChild variant="ghost" color="fg.main" mb={6} px={0} _hover={{ bg: 'transparent', color: 'fg.muted' }}>
                <Link to="/"><LuChevronLeft /> {t('project.back')}</Link>
            </Button>

            <Box p={8} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
                <Flex align="center" gap={3} mb={8}>
                    <Box boxSize="40px" bg="fg.main/10" color="fg.main" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                        <LuPlus size={24} />
                    </Box>
                    <Box>
                        <Heading size="lg" letterSpacing="tight" color="fg.main">{t('menu.create')}</Heading>
                        <Text color="fg.muted" fontSize="sm">{t('dashboard.subtitle')}</Text>
                    </Box>
                </Flex>

                {error && (
                    <Box p={4} bg="red.500/10" color="red.400" borderRadius="xl" borderWidth="1px" borderColor="red.500/30" mb={6}>
                        {t('auth.error', { message: error.message })}
                    </Box>
                )}

                <form onSubmit={handleSubmit}>
                    <VStack gap={6} align="stretch">
                        <Field.Root required>
                            <Field.Label color="fg.muted">{t('project.placeholder_name')}</Field.Label>
                            <Input
                                placeholder={t('project.placeholder_name')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                bg="bg.input"
                                borderColor="border.strong"
                                borderRadius="xl"
                                size="lg"
                                color="fg.main"
                            />
                        </Field.Root>

                        <Field.Root>
                            <Field.Label color="fg.muted">{t('project.description')}</Field.Label>
                            <Textarea
                                placeholder={t('project.description')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                bg="bg.input"
                                borderColor="border.strong"
                                borderRadius="xl"
                                size="lg"
                                rows={5}
                                color="fg.main"
                            />
                        </Field.Root>

                        <Button 
                            type="submit" 
                            bg="fg.main" 
                            color="bg.main"
                            _hover={{ opacity: 0.8 }}
                            size="lg" 
                            mt={4}
                            loading={fetching}
                            borderRadius="xl"
                        >
                            {t('menu.create')}
                        </Button>

                        <Button variant="ghost" color="fg.subtle" onClick={() => navigate('/')} borderRadius="xl">
                            {t('project.cancel')}
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Box>
    );
}
