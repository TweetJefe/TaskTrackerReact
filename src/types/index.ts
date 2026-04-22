export type ProjectStatus = 'ACTIVE' | 'FINISHED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MIDDLE' | 'HIGH';

export interface User {
    id: string;
    telegramId: string;
    username?: string | null;
    name?: string | null;
    languageCode?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface Task {
    id: string;
    name: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    projectId: string;
    assigneeId?: string | null;
    reporterId?: string | null; 
    createdAt: string;
    updatedAt?: string | null;
    deadLine?: string | null;
}

export interface Project {
    id: string;
    name: string;
    description?: string | null;
    assignees?: (string | null)[];
    reporterId: string;
    status?: ProjectStatus | null;
    startedAt?: string | null;
    updatedAt?: string | null;
    tasks?: TaskConnection | null;
}

export interface PageInfo {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
}

export interface ProjectEdge {
    cursor: string;
    node: Project;
}

export interface ProjectConnection {
    edges: ProjectEdge[];
    pageInfo: PageInfo;
}

export interface TaskEdge {
    cursor: string;
    node: Task;
}

export interface TaskConnection {
    edges: TaskEdge[];
    pageInfo: PageInfo;
}

export interface GetAllProjectsResponse {
    getAllProjects: ProjectConnection;
}

export interface GetProjectResponse {
    getProjectById: Project;
}

export interface CreateProjectInput {
    name: string;
    description?: string;
    reporterId: string;
    assignees?: (string | null)[];
}

export interface UpdateProjectInput {
    name: string;
    description?: string;
    status?: ProjectStatus;
}

export interface CreateTaskInput {
    projectId: string;
    name: string;
    description?: string;
    priority?: TaskPriority;
    reporterId?: string | null; 
    deadLine?: string | null;
}

export interface UpdateTaskInput {
    name?: string;
    description?: string;
    projectId?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    deadLine?: string | null;
}

export interface CreateProjectResponse {
    createProject: Project;
}

export interface CreateTaskResponse {
    createTask: Task;
}

export interface DeleteProjectResponse {
    deleteProject: string;
}

export interface UpdateProjectResponse {
    updateProject: Project;
}

export interface UpdateTaskResponse {
    updateTask: Task;
}

export interface DeleteTaskResponse {
    deleteTask: string;
}

export interface AuthResponse {
    authViaTelegram: {
        token: string;
        userId: string;
        username?: string;
    };
}

export interface UserResponse {
    getUserById: User;
}


declare global {
    interface Window {
        Telegram: {
            WebApp: {
                initData: string;
                ready: () => void;
                expand: () => void;
                close: () => void;
                shareToDirectChat: (url: string, text?: string) => void;
                openTelegramLink: (url: string) => void;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        username?: string;
                        first_name: string;
                        last_name?: string;
                        language_code?: string;
                    };
                    start_param?: string;
                };
            };
        };
    }
}
