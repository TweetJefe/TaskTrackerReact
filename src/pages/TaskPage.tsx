import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { 
    Box, Heading, Text, Spinner, Button, Badge, Flex, Stack, 
    Separator, Input, Field, IconButton, HStack, Textarea, NativeSelect, Icon, SimpleGrid
} from '@chakra-ui/react';
import { LuTrash2, LuPencil, LuCheck, LuX, LuArrowLeft, LuShare2, LuUsers, LuCalendar, LuFlag, LuUser } from "react-icons/lu";
import { useTranslation } from 'react-i18next';
import type { GetProjectResponse, UpdateTaskResponse, DeleteTaskResponse, TaskStatus, TaskPriority, Task } from '../types'; 
import { GET_PROJECT_QUERY, UPDATE_TASK_MUTATION, DELETE_TASK_MUTATION, CHANGE_TASK_STATUS_MUTATION, ASSIGN_USER_BY_USERNAME_MUTATION } from '../graphql/queries';
import { graphqlRequest } from '../graphql/client';
import { useAuth } from '../context/AuthContext';

export default function TaskPage() {
    const { t } = useTranslation();
    const { projectId, taskId } = useParams();
    const navigate = useNavigate();
    const { username: currentUsername } = useAuth();
    
    const [task, setTask] = useState<Task | null>(null);
    const [projectAssignees, setProjectAssignees] = useState<string[]>([]);
    const [showAssignees, setShowAssignees] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState<TaskStatus>('TODO');
    const [editPriority, setEditPriority] = useState<TaskPriority>('MIDDLE');
    const [editDeadLine, setEditDeadLine] = useState('');
    
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteFetching, setInviteFetching] = useState(false);
    
    const [updateFetching, setUpdateFetching] = useState(false);
    const [deleteFetching, setDeleteFetching] = useState(false);

    const fetchTaskData = useCallback(async () => {
        setFetching(true);
        setError(null);
        try {
            const result = await graphqlRequest<GetProjectResponse>(GET_PROJECT_QUERY, { id: projectId });
            const project = result.getProjectById;
            const foundTask = project?.tasks?.find(task => task.id === taskId);
            
            if (project?.assignees) {
                setProjectAssignees(project.assignees.filter((u): u is string => !!u));
            }

            if (foundTask) {
                setTask(foundTask);
                setEditName(foundTask.name);
                setEditDescription(foundTask.description || '');
                setEditStatus(foundTask.status);
                setEditPriority(foundTask.priority);
                setEditDeadLine(foundTask.deadLine ? foundTask.deadLine.substring(0, 16) : '');
            } else {
                setError(new Error(t('task.not_found', { defaultValue: 'Task not found' })));
            }
        } catch (err: unknown) {
            setError(err as Error);
        } finally {
            setFetching(false);
        }
    }, [projectId, taskId, t]);

    useEffect(() => {
        fetchTaskData();
    }, [fetchTaskData]);

    const handleUpdateTask = async () => {
        if (!editName.trim()) return;

        setUpdateFetching(true);
        try {
            const data = {
                id: taskId,
                input: {
                    projectId: projectId,
                    name: editName,
                    description: editDescription,
                    status: editStatus,
                    priority: editPriority,
                    deadLine: editDeadLine ? new Date(editDeadLine).toISOString() : null
                }
            };
            await graphqlRequest<UpdateTaskResponse>(UPDATE_TASK_MUTATION, data);

            setIsEditing(false);
            fetchTaskData();
        } catch (err: unknown) {
            console.error("Error updating task:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setUpdateFetching(false);
        }
    }

    const handleChangeStatus = async (newStatus: TaskStatus) => {
        try {
            await graphqlRequest(CHANGE_TASK_STATUS_MUTATION, {
                taskId: taskId,
                status: newStatus
            });
            fetchTaskData();
        } catch (err: unknown) {
            console.error("Error changing status:", err);
            alert("Error: " + (err as Error).message);
        }
    }

    const handleDeleteTask = async () => {
        if (!window.confirm(t('project.confirm_delete', { name: task?.name }))) return;

        setDeleteFetching(true);
        try {
            await graphqlRequest<DeleteTaskResponse>(DELETE_TASK_MUTATION, { id: taskId });
            navigate(`/project/${projectId}`); 
        } catch (err: unknown) {
            console.error("Error deleting task:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setDeleteFetching(false);
        }
    }

    const cancelEditing = () => {
        if (task) {
            setEditName(task.name);
            setEditDescription(task.description || '');
            setEditStatus(task.status);
            setEditPriority(task.priority);
            setEditDeadLine(task.deadLine ? task.deadLine.substring(0, 16) : '');
        }
        setIsEditing(false);
    }

    const handleShare = () => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) return;

        const BOT_USERNAME = "taskenfurerbot"; 
        const APP_SHORT_NAME = "app"; 

        const shareUrl = `https://t.me/${BOT_USERNAME}/${APP_SHORT_NAME}?startapp=join_task_${taskId}`;
        const text = `Help me with task: ${task?.name}`;

        if (tg.shareToDirectChat) {
            tg.shareToDirectChat(shareUrl, text);
        } else {
            const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
            tg.openTelegramLink(fullUrl);
        }
    }

    const handleInviteUser = async (usernameToAssign?: string) => {
        const finalUsername = usernameToAssign || inviteUsername;
        if (!finalUsername.trim()) return;
        
        setInviteFetching(true);
        try {
            const cleanUsername = finalUsername.startsWith('@') ? finalUsername.substring(1) : finalUsername;
            await graphqlRequest(ASSIGN_USER_BY_USERNAME_MUTATION, {
                taskId: taskId,
                username: cleanUsername
            });
            setInviteUsername('');
            fetchTaskData();
        } catch (err: unknown) {
            console.error("Error assigning user:", err);
            alert("Error: " + (err as Error).message);
        } finally {
            setInviteFetching(false);
        }
    }

    if (fetching) return (
        <Flex justify="center" p={10}>
            <Spinner size="xl" color="fg.main" borderWidth="4px" />
        </Flex>
    );

    if (error) return (
        <Box p={5} bg="red.500/10" color="red.400" borderRadius="xl" borderWidth="1px" borderColor="red.500/30">
            {t('auth.error', { message: error.message })}
            <Button mt={4} bg="fg.main" color="bg.main" size="sm" onClick={() => navigate(`/project/${projectId}`)}>
                {t('project.back')}
            </Button>
        </Box>
    );

    if (!task) return (
        <Box p={10} textAlign="center">
            <Text fontSize="lg" mb={4} color="fg.subtle">{t('task.not_assigned')}</Text>
            <Button variant="ghost" color="fg.main" onClick={() => navigate(`/project/${projectId}`)}>
                {t('project.back')}
            </Button>
        </Box>
    );

    return (
        <Box>
            {}
            <Button asChild variant="ghost" color="fg.main" mb={6} px={0} _hover={{ bg: 'transparent', color: 'fg.muted' }}>
                <Link to={`/project/${projectId}`}><LuArrowLeft /> {t('project.back')}</Link>
            </Button>

            <Box p={8} bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
                <Flex justify="space-between" align="start" mb={8}>
                    <Box flex="1">
                        {isEditing ? (
                            <Field.Root required mb={2}>
                                <Input size="xl" fontWeight="bold" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder={t('task.name')} bg="bg.input" borderColor="border.strong" color="fg.main" />
                            </Field.Root>
                        ) : (
                            <Heading size="2xl" letterSpacing="tight" color="fg.main">{task.name}</Heading>
                        )}
                    </Box>
                    <HStack gap={2} ml={4}>
                        {isEditing ? (
                            <>
                                <IconButton aria-label="Save" bg="fg.main" color="bg.main" onClick={handleUpdateTask} loading={updateFetching}>
                                    <LuCheck />
                                </IconButton>
                                <IconButton aria-label="Cancel" variant="ghost" color="fg.main" onClick={cancelEditing}>
                                    <LuX />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <IconButton aria-label="Edit" variant="ghost" color="fg.main" onClick={() => setIsEditing(true)}>
                                    <LuPencil />
                                </IconButton>
                                <IconButton aria-label="Delete" variant="ghost" color="red.500" onClick={handleDeleteTask} loading={deleteFetching}>
                                    <LuTrash2 />
                                </IconButton>
                            </>
                        )}
                    </HStack>
                </Flex>

                <Stack gap={8}>
                    <Box>
                        <Text fontWeight="bold" color="fg.subtle" textTransform="uppercase" fontSize="xs" mb={2} letterSpacing="wider">{t('task.description')}</Text>
                        {isEditing ? (
                            <Field.Root>
                                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder={t('task.description')} rows={6} bg="bg.input" borderColor="border.strong" color="fg.main" />
                            </Field.Root>
                        ) : (
                            <Text fontSize="lg" color="fg.main" lineHeight="tall">{task.description || t('task.no_description')}</Text>
                        )}
                    </Box>
                    
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                        <Box>
                            <HStack gap={2} mb={2}>
                                <Icon as={LuCheck} color="fg.main" />
                                <Text fontWeight="bold" color="fg.subtle" textTransform="uppercase" fontSize="xs" letterSpacing="wider">{t('task.status_label')}</Text>
                            </HStack>
                            {isEditing ? (
                                <NativeSelect.Root>
                                    <NativeSelect.Field value={editStatus} onChange={(e) => setEditStatus(e.target.value as TaskStatus)} bg="bg.input" borderColor="border.strong" color="fg.main">
                                        <option value="TODO">TODO</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="IN_REVIEW">IN REVIEW</option>
                                        <option value="DONE">DONE</option>
                                    </NativeSelect.Field>
                                </NativeSelect.Root>
                            ) : (
                                <NativeSelect.Root width="auto">
                                    <NativeSelect.Field value={task.status} onChange={(e) => handleChangeStatus(e.target.value as TaskStatus)} bg="fg.main/5" color="fg.main" px={4} py={1.5} height="auto" borderRadius="lg" fontSize="xs" fontWeight="bold" border="1px solid" borderColor="border.subtle" cursor="pointer" _hover={{ bg: "fg.main/10" }}>
                                        <option value="TODO">TODO</option>
                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                        <option value="IN_REVIEW">IN REVIEW</option>
                                        <option value="DONE">DONE</option>
                                    </NativeSelect.Field>
                                </NativeSelect.Root>
                            )}
                        </Box>

                        <Box>
                            <HStack gap={2} mb={2}>
                                <Icon as={LuFlag} color="fg.main" />
                                <Text fontWeight="bold" color="fg.subtle" textTransform="uppercase" fontSize="xs" letterSpacing="wider">{t('task.priority')}</Text>
                            </HStack>
                            {isEditing ? (
                                <NativeSelect.Root>
                                    <NativeSelect.Field value={editPriority} onChange={(e) => setEditPriority(e.target.value as TaskPriority)} bg="bg.input" borderColor="border.strong" color="fg.main">
                                        <option value="LOW">{t('task.priority_levels.low')}</option>
                                        <option value="MIDDLE">{t('task.priority_levels.middle')}</option>
                                        <option value="HIGH">{t('task.priority_levels.high')}</option>
                                    </NativeSelect.Field>
                                </NativeSelect.Root>
                            ) : (
                                <NativeSelect.Root width="auto">
                                    <NativeSelect.Field value={task.priority} onChange={async (e) => {
                                            setUpdateFetching(true);
                                            try {
                                                await graphqlRequest(UPDATE_TASK_MUTATION, {
                                                    id: taskId,
                                                    input: { projectId, name: task.name, priority: e.target.value as TaskPriority }
                                                });
                                                fetchTaskData();
                                            } catch (err: unknown) {
                                                alert("Error: " + (err as Error).message);
                                            } finally {
                                                setUpdateFetching(false);
                                            }
                                        }} bg="fg.main/5" color="fg.main" px={4} py={1.5} height="auto" borderRadius="lg" fontSize="xs" fontWeight="bold" border="1px solid" borderColor="border.subtle" cursor="pointer" _hover={{ bg: "fg.main/10" }}>
                                        <option value="LOW">{t('task.priority_levels.low')}</option>
                                        <option value="MIDDLE">{t('task.priority_levels.middle')}</option>
                                        <option value="HIGH">{t('task.priority_levels.high')}</option>
                                    </NativeSelect.Field>
                                </NativeSelect.Root>
                            )}
                        </Box>

                        <Box>
                            <HStack gap={2} mb={2}>
                                <Icon as={LuCalendar} color="fg.main" />
                                <Text fontWeight="bold" color="fg.subtle" textTransform="uppercase" fontSize="xs" letterSpacing="wider">{t('task.deadline')}</Text>
                            </HStack>
                            {isEditing ? (
                                <Input type="datetime-local" value={editDeadLine} onChange={(e) => setEditDeadLine(e.target.value)} bg="bg.input" borderColor="border.strong" color="fg.main" />
                            ) : (
                                <Text color="fg.main">{task.deadLine ? new Date(task.deadLine).toLocaleString() : t('task.not_set')}</Text>
                            )}
                        </Box>
                    </SimpleGrid>

                    <Separator borderColor="border.subtle" />

                    <Box>
                        <HStack gap={2} mb={4}>
                            <Icon as={LuUsers} color="fg.main" />
                            <Text fontWeight="bold" color="fg.subtle" textTransform="uppercase" fontSize="xs" letterSpacing="wider">{t('task.assignee')}</Text>
                        </HStack>
                        
                        <Box mb={6} position="relative">
                            {task.assigneeId ? (
                                <Badge variant="surface" colorPalette="gray" borderRadius="lg" px={4} py={2} fontSize="sm" cursor="pointer" onClick={() => setShowAssignees(!showAssignees)} _hover={{ bg: "fg.main/5" }} color="fg.main">
                                    {task.assigneeId}
                                </Badge>
                            ) : (
                                <Text color="fg.subtle" fontSize="sm" cursor="pointer" onClick={() => setShowAssignees(!showAssignees)} _hover={{ color: "fg.muted" }}>
                                    {t('task.not_assigned')}
                                </Text>
                            )}

                            {showAssignees && projectAssignees.length > 0 && (
                                <Box mt={4} p={4} bg="bg.main" borderRadius="xl" borderWidth="1px" borderColor="border.strong" shadow="dark-lg" zIndex={100} position="relative">
                                    <Text fontSize="xs" fontWeight="bold" color="fg.subtle" mb={3} textTransform="uppercase">
                                        Select assignee:
                                    </Text>
                                    <Flex gap={2} wrap="wrap">
                                        {projectAssignees.map((username, idx) => (
                                            <Badge key={idx} variant={task.assigneeId === username ? "solid" : "outline"} bg={task.assigneeId === username ? "fg.main" : "transparent"} color={task.assigneeId === username ? "bg.main" : "fg.main"} borderRadius="md" px={3} py={1} cursor="pointer" onClick={() => { setInviteUsername(username); setShowAssignees(false); }} _hover={{ transform: "translateY(-2px)", bg: task.assigneeId === username ? "fg.main/80" : "fg.main/10" }}>
                                                @{username}
                                            </Badge>
                                        ))}
                                    </Flex>
                                </Box>
                            )}
                        </Box>

                        <Box p={6} bg="bg.main" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                            <Stack gap={4}>
                                <Text fontSize="sm" color="fg.muted">{t('task.assign_manually')}:</Text>
                                <HStack>
                                    <Input placeholder={t('task.placeholder_username')} value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} bg="bg.input" borderColor="border.strong" borderRadius="lg" color="fg.main" />
                                    <Button bg="fg.main" color="bg.main" _hover={{ opacity: 0.8 }} onClick={() => handleInviteUser()} loading={inviteFetching} borderRadius="lg">
                                        {t('task.assign_btn')}
                                    </Button>
                                </HStack>
                                
                                <Flex justify="space-between" align="center" mt={2}>
                                    {currentUsername && (
                                        <Button size="xs" variant="ghost" color="fg.subtle" _hover={{ color: "fg.main", bg: "fg.main/5" }} onClick={() => handleInviteUser(currentUsername)} gap={2}>
                                            <LuUser size={14} /> {t('task.assign_me')} (@{currentUsername})
                                        </Button>
                                    )}
                                    <Button size="xs" variant="ghost" color="fg.subtle" _hover={{ color: "fg.main", bg: "fg.main/5" }} onClick={handleShare} gap={2}>
                                        <LuShare2 size={14} /> {t('task.share_link')}
                                    </Button>
                                </Flex>
                            </Stack>
                        </Box>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
