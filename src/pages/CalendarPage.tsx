import { useState, useEffect, useCallback } from 'react';
import { 
    Box, Heading, Text, Spinner, Flex, Grid, GridItem, 
    IconButton, HStack, Badge, Stack, Button
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { graphqlRequest } from '../graphql/client';
import type { GetAllProjectsResponse, Task } from '../types';

const GET_CALENDAR_DATA_QUERY = `
  query GetCalendarData {
    getAllProjects {
      edges {
        node {
          id
          name
          tasks {
            id
            name
            status
            priority
            deadLine
          }
        }
      }
    }
  }
`;

interface TaskWithProject extends Task {
    projectId: string;
    projectName: string;
}

export default function CalendarPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<TaskWithProject[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    
    const getDayNames = () => {
        const baseDate = new Date(2024, 0, 1); 
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);
            return new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(date);
        });
    };

    const dayNames = getDayNames();

    const fetchCalendarData = useCallback(async () => {
        setFetching(true);
        setError(null);
        try {
            const result = await graphqlRequest<GetAllProjectsResponse>(GET_CALENDAR_DATA_QUERY);
            const allTasks: TaskWithProject[] = [];
            
            if (result && result.getAllProjects && result.getAllProjects.edges) {
                result.getAllProjects.edges.forEach(edge => {
                    const project = edge.node;
                    if (project.tasks) {
                        project.tasks.forEach(task => {
                            if (task.deadLine) {
                                allTasks.push({
                                    ...task,
                                    projectId: project.id,
                                    projectName: project.name
                                });
                            }
                        });
                    }
                });
            }
            
            setTasks(allTasks);
        } catch (err: unknown) {
            console.error("Error fetching calendar data:", err);
            setError(err as Error);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const calendarDays = [];
    for (let i = startingDay - 1; i >= 0; i--) {
        calendarDays.push({ day: prevMonthDays - i, month: month - 1, year: year, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, month: month, year: year, isCurrentMonth: true });
    }
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({ day: i, month: month + 1, year: year, isCurrentMonth: false });
    }

    if (fetching && tasks.length === 0) return (
        <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" color="fg.main" />
        </Flex>
    );

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={8} direction={{ base: "column", sm: "row" }} gap={4}>
                <Box>
                    <Heading size="lg" mb={1} color="fg.main">{t('calendar.title')}</Heading>
                    <Text color="fg.muted">{t('calendar.subtitle')}</Text>
                </Box>
                <HStack gap={4} bg="bg.card" p={1} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                    <IconButton 
                        aria-label="Previous month" 
                        onClick={() => changeMonth(-1)}
                        variant="ghost"
                        color="fg.main"
                    >
                        <LuChevronLeft />
                    </IconButton>
                    <Text fontWeight="bold" minW="140px" textAlign="center" fontSize="sm" color="fg.main" textTransform="capitalize">
                        {currentDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}
                    </Text>
                    <IconButton 
                        aria-label="Next month" 
                        onClick={() => changeMonth(1)}
                        variant="ghost"
                        color="fg.main"
                    >
                        <LuChevronRight />
                    </IconButton>
                </HStack>
            </Flex>

            {error && (
                <Box p={4} bg="red.500/10" color="red.400" borderRadius="xl" mb={6} borderWidth="1px" borderColor="red.500/30">
                    <Text fontSize="sm">{error.message}</Text>
                    <Button mt={2} size="xs" variant="outline" color="fg.main" onClick={fetchCalendarData} borderColor="border.strong">
                        Repeat
                    </Button>
                </Box>
            )}

            <Box bg="bg.card" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" overflow="hidden">
                <Grid templateColumns="repeat(7, 1fr)" gap={0}>
                    {dayNames.map(name => (
                        <GridItem key={name} p={3} textAlign="center" bg="bg.sidebar" borderBottomWidth="1px" borderColor="border.subtle">
                            <Text fontSize="xs" fontWeight="bold" color="fg.subtle" textTransform="uppercase">
                                {name}
                            </Text>
                        </GridItem>
                    ))}

                    {calendarDays.map((dateObj, idx) => {
                        const dayTasks = tasks.filter(t => {
                            const d = new Date(t.deadLine!);
                            const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            const cellDate = new Date(dateObj.year, dateObj.month, dateObj.day);
                            return taskDate.getTime() === cellDate.getTime();
                        });

                        const isToday = new Date().toDateString() === new Date(dateObj.year, dateObj.month, dateObj.day).toDateString();

                        return (
                            <GridItem 
                                key={idx} 
                                minH="120px" 
                                p={2} 
                                borderRightWidth={(idx + 1) % 7 === 0 ? 0 : "1px"} 
                                borderBottomWidth={idx >= 35 ? 0 : "1px"}
                                borderColor="border.subtle"
                                bg={dateObj.isCurrentMonth ? (isToday ? "fg.main/5" : "transparent") : "fg.main/2"}
                                position="relative"
                                _hover={{ bg: "fg.main/10" }}
                                transition="background 0.2s"
                            >
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Text 
                                        fontWeight={isToday ? "bold" : "medium"} 
                                        fontSize="sm"
                                        color={dateObj.isCurrentMonth ? (isToday ? "fg.main" : "fg.main") : "fg.subtle"}
                                        bg={isToday ? "fg.main/20" : "transparent"}
                                        w="24px" h="24px" display="flex" alignItems="center" justifyContent="center" borderRadius="full"
                                    >
                                        {dateObj.day}
                                    </Text>
                                    {dayTasks.length > 0 && (
                                        <Badge variant="surface" colorPalette="gray" size="xs" borderRadius="full" fontSize="9px" color="fg.main">
                                            {dayTasks.length}
                                        </Badge>
                                    )}
                                </Flex>
                                
                                <Stack gap={1}>
                                    {dayTasks.map(task => (
                                        <Box 
                                            key={task.id} px={2} py={1} fontSize="10px" 
                                            bg={task.status === 'DONE' ? 'fg.main/10' : 'fg.main/5'} 
                                            color="fg.main" borderRadius="md" cursor="pointer"
                                            onClick={() => navigate(`/project/${task.projectId}/task/${task.id}`)}
                                            borderLeftWidth="2px" borderLeftColor={task.status === 'DONE' ? 'fg.main' : 'fg.subtle'}
                                        >
                                            <Text truncate fontWeight="medium">{task.name}</Text>
                                        </Box>
                                    ))}
                                </Stack>
                            </GridItem>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}
