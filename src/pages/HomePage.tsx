import { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Spinner, SimpleGrid, Button, Flex, Badge, IconButton, Icon, VStack, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { LuTrash2, LuBriefcase, LuCheck, LuClock, LuArchive } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import type { GetAllProjectsResponse, ProjectEdge, DeleteProjectResponse } from '../types';
import { GET_ALL_PROJECTS_QUERY, DELETE_PROJECT_MUTATION } from '../graphql/queries';
import { graphqlRequest } from '../graphql/client';

const StatCard = ({ label, value, icon }: { label: string, value: number, icon: any }) => (
    <Box p={5} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
        <Flex justify="space-between" align="center">
            <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>{label}</Text>
                <Heading size="xl" color="fg.main">{value}</Heading>
            </Box>
            <Box p={3} bg="fg.main/10" borderRadius="xl">
                <Icon as={icon} color="fg.main" fontSize="2xl" />
            </Box>
        </Flex>
    </Box>
);

export default function HomePage() {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<ProjectEdge[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'FINISHED'>('ACTIVE');

    const fetchProjects = useCallback(async (after: string | null = null) => {
        if (!after) setFetching(true);

        try {
            const result = await graphqlRequest<GetAllProjectsResponse>(GET_ALL_PROJECTS_QUERY, { 
                first: 50,
                after 
            });
            
            if (after) {
                setProjects(prev => [...prev, ...result.getAllProjects.edges]);
            } else {
                setProjects(result.getAllProjects.edges);
            }
        } catch (err: unknown) {
            setError(err as Error);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleDeleteProject = async (id: string, name: string) => {
        if (!window.confirm(t('project.confirm_delete', { name }))) return;

        setDeletingId(id);
        try {
            await graphqlRequest<DeleteProjectResponse>(DELETE_PROJECT_MUTATION, { id });
            setProjects(prev => prev.filter(p => p.node.id !== id));
        } catch (err: unknown) {
            console.error("Error deleting project:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setDeletingId(null);
        }
    }

    const filteredProjects = projects.filter(({ node }) => {
        const status = node.status || 'ACTIVE';
        return status === activeTab;
    });

    const activeCount = projects.filter(p => (p.node.status || 'ACTIVE') === 'ACTIVE').length;
    const finishedCount = projects.filter(p => p.node.status === 'FINISHED').length;

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={8}>
                <Box>
                    <Heading size="lg" mb={1} color="fg.main">{t('dashboard.title')}</Heading>
                    <Text color="fg.muted">{t('dashboard.subtitle')}</Text>
                </Box>
                <Button asChild bg="fg.main" color="bg.main" _hover={{ opacity: 0.8 }} size="md" borderRadius="xl">
                    <Link to="/project/create">+ {t('menu.create')}</Link>
                </Button>
            </Flex>

            {}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={10}>
                <StatCard label={t('dashboard.stats.total')} value={projects.length} icon={LuBriefcase} />
                <StatCard label={t('dashboard.stats.active')} value={activeCount} icon={LuClock} />
                <StatCard label={t('dashboard.stats.finished')} value={finishedCount} icon={LuCheck} />
            </SimpleGrid>

            {}
            <HStack gap={4} mb={6} borderBottomWidth="1px" borderColor="border.subtle" pb={4}>
                <Button 
                    variant="ghost" 
                    color={activeTab === 'ACTIVE' ? "fg.main" : "fg.subtle"}
                    borderBottom={activeTab === 'ACTIVE' ? "2px solid" : "none"}
                    borderColor={activeTab === 'ACTIVE' ? "fg.main" : "transparent"}
                    borderRadius="none"
                    px={4}
                    onClick={() => setActiveTab('ACTIVE')}
                    _hover={{ bg: "fg.main/5" }}
                    gap={2}
                >
                    <LuClock /> {t('dashboard.tabs.active')}
                    <Badge variant="subtle" colorPalette="gray" ml={1}>{activeCount}</Badge>
                </Button>
                <Button 
                    variant="ghost" 
                    color={activeTab === 'FINISHED' ? "fg.main" : "fg.subtle"}
                    borderBottom={activeTab === 'FINISHED' ? "2px solid" : "none"}
                    borderColor={activeTab === 'FINISHED' ? "fg.main" : "transparent"}
                    borderRadius="none"
                    px={4}
                    onClick={() => setActiveTab('FINISHED')}
                    _hover={{ bg: "fg.main/5" }}
                    gap={2}
                >
                    <LuArchive /> {t('dashboard.tabs.finished')}
                    <Badge variant="subtle" colorPalette="gray" ml={1}>{finishedCount}</Badge>
                </Button>
            </HStack>

            {fetching && projects.length === 0 && (
                <Flex justify="center" mt={10}>
                    <Spinner size="xl" color="fg.main" borderWidth="4px" />
                </Flex>
            )}

            {error && (
                <Box p={4} bg="red.500/10" color="red.400" borderRadius="xl" borderWidth="1px" borderColor="red.500/30">
                    {t('auth.error', { message: error.message })}
                </Box>
            )}

            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} gap={6}>
                {filteredProjects.map(({ node: project }) => (
                    <Box
                        key={project.id}
                        p={6}
                        bg="bg.card"
                        borderWidth="1px"
                        borderColor="border.subtle"
                        borderRadius="2xl"
                        _hover={{ borderColor: 'border.strong', transform: 'translateY(-4px)' }}
                        transition="all 0.3s"
                        position="relative"
                    >
                        <Flex justify="space-between" align="start" mb={4}>
                            <VStack align="start" gap={1} maxW="70%">
                                <Heading size="md" truncate title={project.name} color="fg.main">
                                    {project.name}
                                </Heading>
                                <Badge variant="surface" colorPalette={project.status === 'FINISHED' ? 'blue' : 'gray'} borderRadius="md" px={2}>
                                    {project.status === 'FINISHED' ? t('project.status.finished') : t('project.status.active')}
                                </Badge>
                            </VStack>
                            <IconButton
                                aria-label="Delete project"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteProject(project.id, project.name);
                                }}
                                loading={deletingId === project.id}
                                color="red.500"
                            >
                                <LuTrash2 />
                            </IconButton>
                        </Flex>

                        <Text color="fg.muted" mb={6} lineClamp={2} fontSize="sm" minH="40px">
                            {project.description || t('project.no_description')}
                        </Text>

                        <Button asChild w="full" variant="outline" color="fg.main" borderColor="border.strong" _hover={{ bg: "fg.main/5" }} borderRadius="xl">
                            <Link to={`/project/${project.id}`}>
                                {t('menu.projects').slice(0, -1) === 'Проект' ? 'Открыть проект' : 'Open project'}
                            </Link>
                        </Button>
                    </Box>
                ))}
            </SimpleGrid>

            {filteredProjects.length === 0 && !fetching && (
                <Flex justify="center" align="center" h="200px" bg="bg.card" borderRadius="2xl" borderWidth="1px" borderStyle="dashed" borderColor="border.strong">
                    <VStack gap={2}>
                        <Text color="fg.subtle">
                            {activeTab === 'ACTIVE' ? t('dashboard.empty_active') : t('dashboard.empty_finished')}
                        </Text>
                        {activeTab === 'ACTIVE' && (
                            <Button asChild variant="outline" size="sm" color="fg.main" borderColor="border.strong">
                                <Link to="/project/create">{t('dashboard.create_first')}</Link>
                            </Button>
                        )}
                    </VStack>
                </Flex>
            )}
        </Box>
    );
}
