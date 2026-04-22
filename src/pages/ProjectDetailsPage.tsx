import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { 
    Box, Heading, Text, Spinner, Button, Badge, Flex, Stack, 
    Input, Field, IconButton, HStack, Textarea, NativeSelect, Progress, SimpleGrid, VStack
} from '@chakra-ui/react';
import { LuPlus, LuTrash2, LuPencil, LuCheck, LuX, LuChevronLeft, LuCalendar, LuPlay } from "react-icons/lu";
import { useTranslation } from 'react-i18next';
import type { GetProjectResponse, CreateTaskResponse, DeleteProjectResponse, UpdateProjectResponse, TaskPriority } from '../types'; 
import { GET_PROJECT_QUERY, CREATE_TASK_MUTATION, DELETE_PROJECT_MUTATION, UPDATE_PROJECT_MUTATION } from '../graphql/queries';
import { graphqlRequest } from '../graphql/client';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetailsPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuth();
    
    const [data, setData] = useState<GetProjectResponse | null>(null);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState<TaskPriority>('MIDDLE');
    const [taskDeadLine, setTaskDeadLine] = useState('');
    const [createTaskFetching, setCreateTaskFetching] = useState(false);

    const [deleteFetching, setDeleteFetching] = useState(false);
    const [updateFetching, setUpdateFetching] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const fetchProject = useCallback(async () => {
        setFetching(true);
        setError(null);
        try {
            const result = await graphqlRequest<GetProjectResponse>(GET_PROJECT_QUERY, { id });
            setData(result);
            if (result.getProjectById) {
                setEditName(result.getProjectById.name);
                setEditDescription(result.getProjectById.description || '');
            }
        } catch (err: unknown) {
            setError(err as Error);
        } finally {
            setFetching(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskName.trim()) return;

        if (!userId) {
            alert(t('auth.error', { message: 'Unauthorized' }));
            return;
        }

        setCreateTaskFetching(true);
        const input = {
            projectId: id,
            name: taskName,
            description: taskDescription,
            priority: taskPriority,
            reporterId: userId,
            deadLine: taskDeadLine ? new Date(taskDeadLine).toISOString() : null
        };

        try {
            await graphqlRequest<CreateTaskResponse>(CREATE_TASK_MUTATION, { input });
            setTaskName('');
            setTaskDescription('');
            setTaskPriority('MIDDLE');
            setTaskDeadLine('');
            setIsAddingTask(false);
            fetchProject();
        } catch (err: unknown) {
            console.error("Error adding task:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setCreateTaskFetching(false);
        }
    }

    const handleDeleteProject = async () => {
        const project = data?.getProjectById;
        if (!project) return;
        if (!window.confirm(t('project.confirm_delete', { name: project.name }))) return;

        setDeleteFetching(true);
        try {
            await graphqlRequest<DeleteProjectResponse>(DELETE_PROJECT_MUTATION, { id });
            navigate('/');
        } catch (err: unknown) {
            console.error("Error deleting project:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setDeleteFetching(false);
        }
    }

    const handleUpdateProject = async () => {
        if (!editName.trim()) return;

        setUpdateFetching(true);
        try {
            await graphqlRequest<UpdateProjectResponse>(UPDATE_PROJECT_MUTATION, {
                id,
                input: {
                    name: editName,
                    description: editDescription
                }
            });
            setIsEditing(false);
            fetchProject();
        } catch (err: unknown) {
            console.error("Error updating project:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setUpdateFetching(false);
        }
    }

    const handleCloseProject = async () => {
        const project = data?.getProjectById;
        if (!project) return;
        if (!window.confirm(t('project.confirm_finish'))) return;

        setUpdateFetching(true);
        try {
            await graphqlRequest<UpdateProjectResponse>(UPDATE_PROJECT_MUTATION, {
                id,
                input: {
                    name: project.name,
                    description: project.description || '',
                    status: 'FINISHED'
                }
            });
            fetchProject();
        } catch (err: unknown) {
            console.error("Error closing project:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setUpdateFetching(false);
        }
    }

    const handleResumeProject = async () => {
        const project = data?.getProjectById;
        if (!project) return;
        if (!window.confirm(t('project.confirm_resume'))) return;

        setUpdateFetching(true);
        try {
            await graphqlRequest<UpdateProjectResponse>(UPDATE_PROJECT_MUTATION, {
                id,
                input: {
                    name: project.name,
                    description: project.description || '',
                    status: 'ACTIVE'
                }
            });
            fetchProject();
        } catch (err: unknown) {
            console.error("Error resuming project:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setUpdateFetching(false);
        }
    }

    const cancelEditing = () => {
        if (data?.getProjectById) {
            setEditName(data.getProjectById.name);
            setEditDescription(data.getProjectById.description || '');
        }
        setIsEditing(false);
    }

    if (fetching) return (
        <Flex justify="center" p={10}>
            <Spinner size="xl" color="fg.main" borderWidth="4px" />
        </Flex>
    );

    if (error) return (
        <Box p={5} bg="red.500/10" color="red.400" borderRadius="xl" borderWidth="1px" borderColor="red.500/30">
            {t('auth.error', { message: error.message })}
        </Box>
    );

    const project = data?.getProjectById;
    if (!project) return (
        <Box p={10} textAlign="center">
            <Text fontSize="lg" mb={4} color="fg.subtle">Project not found</Text>
            <Button asChild bg="fg.main" color="bg.main" borderRadius="xl">
                <Link to="/">{t('project.back')}</Link>
            </Button>
        </Box>
    );

    const tasks = project.tasks?.edges.map(edge => edge.node) || [];
    const doneTasks = tasks.filter(t => t.status === 'DONE').length || 0;
    const totalTasks = tasks.length || 0;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const isFinished = project.status === 'FINISHED';

    return (
        <Box>
            {}
            <Button asChild variant="ghost" color="fg.main" mb={6} px={0} _hover={{ bg: 'transparent', color: 'fg.muted' }}>
                <Link to="/"><LuChevronLeft /> {t('project.back')}</Link>
            </Button>

            <Flex direction={{ base: "column", lg: "row" }} gap={8} align="start">
                {}
                <Box flex="1" w="full">
                    <Box p={8} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" mb={8}>
                        <Flex justify="space-between" align="start" mb={6}>
                            <Box flex="1">
                                {isEditing ? (
                                    <Field.Root required mb={2}>
                                        <Input 
                                            size="xl"
                                            fontWeight="bold"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder={t('project.placeholder_name')}
                                            bg="bg.input"
                                            borderColor="border.strong"
                                            color="fg.main"
                                        />
                                    </Field.Root>
                                ) : (
                                    <Heading size="2xl" mb={2} letterSpacing="tight" color="fg.main">{project.name}</Heading>
                                )}
                                <Badge variant="surface" colorPalette={isFinished ? 'blue' : 'gray'} px={3} py={1} borderRadius="lg">
                                    {isFinished ? t('project.status.finished') : t('project.status.active')}
                                </Badge>
                            </Box>
                            <HStack gap={2} ml={4}>
                                {isEditing ? (
                                    <>
                                        <IconButton aria-label="Save" bg="fg.main" color="bg.main" variant="solid" onClick={handleUpdateProject} loading={updateFetching}>
                                            <LuCheck />
                                        </IconButton>
                                        <IconButton aria-label="Cancel" variant="ghost" color="fg.main" onClick={cancelEditing}>
                                            <LuX />
                                        </IconButton>
                                    </>
                                ) : (
                                    <>
                                        {isFinished ? (
                                            <Button size="xs" variant="solid" bg="fg.main" color="bg.main" _hover={{ opacity: 0.8 }} onClick={handleResumeProject} loading={updateFetching} borderRadius="lg" gap={2}>
                                                <LuPlay size={12} /> {t('project.resume_btn')}
                                            </Button>
                                        ) : (
                                            <Button size="xs" variant="outline" color="fg.main" borderColor="border.strong" onClick={handleCloseProject} loading={updateFetching} borderRadius="lg">
                                                {t('project.finish_btn')}
                                            </Button>
                                        )}
                                        <IconButton aria-label="Edit" variant="ghost" color="fg.main" onClick={() => setIsEditing(true)} disabled={isFinished} opacity={isFinished ? 0.3 : 1}>
                                            <LuPencil />
                                        </IconButton>
                                        <IconButton aria-label="Delete" variant="ghost" color="red.500" onClick={handleDeleteProject} loading={deleteFetching}>
                                            <LuTrash2 />
                                        </IconButton>
                                    </>
                                )}
                            </HStack>
                        </Flex>

                        <Stack gap={6}>
                            <Box>
                                <Text fontWeight="bold" color="fg.subtle" textTransform="uppercase" fontSize="xs" mb={2} letterSpacing="wider">{t('project.description')}</Text>
                                {isEditing ? (
                                    <Field.Root>
                                        <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder={t('project.description')} rows={4} bg="bg.input" borderColor="border.strong" color="fg.main" />
                                    </Field.Root>
                                ) : (
                                    <Text fontSize="md" color="fg.main" lineHeight="tall">{project.description || t('project.no_description')}</Text>
                                )}
                            </Box>

                            {project.assignees && project.assignees.length > 0 && (
                                <Box>
                                    <Text fontWeight="bold" color="fg.subtle" textTransform="uppercase" fontSize="xs" mb={2} letterSpacing="wider">{t('project.assignees')}</Text>
                                    <HStack gap={2} wrap="wrap">
                                        {project.assignees.map((assignee, idx) => (
                                            <Badge key={idx} variant="outline" colorPalette="gray" borderRadius="md" color="fg.muted">
                                                {assignee}
                                            </Badge>
                                        ))}
                                    </HStack>
                                </Box>
                            )}
                        </Stack>
                    </Box>

                    {}
                    <Box p={6} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
                        <Flex justify="space-between" align="center" mb={4}>
                            <Box>
                                <Text fontWeight="bold" color="fg.subtle" textTransform="uppercase" fontSize="xs" mb={1} letterSpacing="wider">{t('project.progress')}</Text>
                                <Heading size="md" color="fg.main">{progress}%</Heading>
                            </Box>
                            <Box textAlign="right">
                                <Text fontSize="sm" color="fg.muted">{t('project.completed_tasks', { count: doneTasks, total: totalTasks })}</Text>
                            </Box>
                        </Flex>
                        <Progress.Root value={progress} size="lg" borderRadius="full">
                            <Progress.Track bg="fg.main/10" h="12px" borderRadius="full">
                                <Progress.Range bg="fg.main" borderRadius="full" />
                            </Progress.Track>
                        </Progress.Root>
                    </Box>
                </Box>

                {}
                <Box flex="1.2" w="full">
                    <Flex justify="space-between" align="center" mb={6}>
                        <Heading size="lg" color="fg.main">{t('project.tasks')}</Heading>
                        {!isFinished && (
                            <Button size="md" bg="fg.main" color="bg.main" _hover={{ opacity: 0.8 }} borderRadius="xl" onClick={() => setIsAddingTask(!isAddingTask)}>
                                {isAddingTask ? <LuX /> : <LuPlus />} {isAddingTask ? t('project.cancel') : t('project.new_task')}
                            </Button>
                        )}
                    </Flex>

                    {isAddingTask && (
                        <Box p={6} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.strong" mb={8}>
                            <form onSubmit={handleAddTask}>
                                <Stack gap={5}>
                                    <Field.Root required>
                                        <Field.Label color="fg.muted">{t('task.name')}</Field.Label>
                                        <Input placeholder={t('task.name')} value={taskName} onChange={(e) => setTaskName(e.target.value)} bg="bg.input" borderColor="border.strong" borderRadius="xl" color="fg.main" />
                                    </Field.Root>
                                    
                                    <Field.Root>
                                        <Field.Label color="fg.muted">{t('task.description')}</Field.Label>
                                        <Textarea placeholder={t('task.description')} value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} bg="bg.input" borderColor="border.strong" borderRadius="xl" rows={3} color="fg.main" />
                                    </Field.Root>
                                    
                                    <SimpleGrid columns={2} gap={4}>
                                        <Field.Root>
                                            <Field.Label color="fg.muted">{t('task.priority')}</Field.Label>
                                            <NativeSelect.Root>
                                                <NativeSelect.Field value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)} bg="bg.input" borderColor="border.strong" borderRadius="xl" color="fg.main">
                                                    <option value="LOW">{t('task.priority_levels.low')}</option>
                                                    <option value="MIDDLE">{t('task.priority_levels.middle')}</option>
                                                    <option value="HIGH">{t('task.priority_levels.high')}</option>
                                                </NativeSelect.Field>
                                            </NativeSelect.Root>
                                        </Field.Root>

                                        <Field.Root>
                                            <Field.Label color="fg.muted">{t('task.deadline')}</Field.Label>
                                            <Input type="datetime-local" value={taskDeadLine} onChange={(e) => setTaskDeadLine(e.target.value)} bg="bg.input" borderColor="border.strong" borderRadius="xl" color="fg.main" />
                                        </Field.Root>
                                    </SimpleGrid>
                                    
                                    <Button type="submit" bg="fg.main" color="bg.main" _hover={{ opacity: 0.8 }} size="lg" w="full" borderRadius="xl" loading={createTaskFetching} mt={2}>
                                        {t('project.new_task')}
                                    </Button>
                                </Stack>
                            </form>
                        </Box>
                    )}

                    <VStack gap={4} align="stretch">
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <Box key={task.id} p={5} bg="bg.card" borderWidth="1px" borderColor="border.subtle" borderRadius="2xl" _hover={{ borderColor: "border.strong", transform: "translateX(4px)" }} transition="all 0.2s" cursor="pointer" onClick={() => navigate(`/project/${id}/task/${task.id}`)}>
                                    <Flex justify="space-between" align="center">
                                        <Box flex="1">
                                            <Heading size="sm" mb={1} color="fg.main">{task.name}</Heading>
                                            {task.description && <Text fontSize="xs" color="fg.muted" lineClamp={1}>{task.description}</Text>}
                                            {task.deadLine && (
                                                <HStack gap={1} mt={2} color="fg.subtle">
                                                    <LuCalendar size={12} />
                                                    <Text fontSize="2xs">{new Date(task.deadLine).toLocaleDateString()}</Text>
                                                </HStack>
                                            )}
                                        </Box>
                                        <HStack gap={3}>
                                            <Box bg="fg.main/5" color="fg.main" px={3} py={1} borderRadius="lg" fontSize="xs" fontWeight="bold" border="1px solid" borderColor="border.subtle">
                                                {t(`task.priority_levels.${task.priority.toLowerCase()}`)}
                                            </Box>
                                            <Box bg={task.status === 'DONE' ? 'fg.main/20' : 'fg.main/5'} color="fg.main" px={3} py={1} borderRadius="lg" fontSize="xs" fontWeight="bold" border="1px solid" borderColor={task.status === 'DONE' ? 'border.strong' : 'border.subtle'}>
                                                {task.status || 'TODO'}
                                            </Box>
                                        </HStack>
                                    </Flex>
                                </Box>
                            ))
                        ) : (
                            <Flex justify="center" align="center" h="150px" bg="bg.card" borderRadius="2xl" borderWidth="1px" borderStyle="dashed" borderColor="border.strong">
                                <Text color="fg.subtle" fontStyle="italic">{t('project.tasks')} not found</Text>
                            </Flex>
                        )}
                    </VStack>
                </Box>
            </Flex>
        </Box>
    );
}
