export const AUTH_VIA_TELEGRAM_MUTATION = `
  mutation AuthViaTelegram($initData: String!, $telegramId: ID!, $username: String, $languageCode: String) {
    authViaTelegram(initData: $initData, telegramId: $telegramId, username: $username, languageCode: $languageCode) {
      token
      userId
    }
  }
`;

export const GET_ALL_PROJECTS_QUERY = `
  query GetProjects($first: Int, $after: String) {
    getAllProjects(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          name
          description
          status
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_PROJECT_QUERY = `
  query GetProject($id: ID!) {
    getProjectById(id: $id) {
      id
      name
      description
      status
      assignees
      reporterId
      startedAt
      updatedAt
      tasks {
        edges {
          node {
            id
            name
            description
            status
            priority
            projectId
            assigneeId
            reporterId
            createdAt
            updatedAt
            deadLine
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const ASSIGN_USER_MUTATION = `
  mutation AssignUser($taskId: ID!, $assigneeId: ID!) {
    assignUser(taskId: $taskId, assigneeId: $assigneeId) {
      id
      name
      assigneeId
    }
  }
`;

export const ASSIGN_USER_BY_USERNAME_MUTATION = `
  mutation AssignUserByUsername($taskId: ID!, $username: String!) {
    assignUserByUsername(taskId: $taskId, username: $username) {
      id
      name
      assigneeId
    }
  }
`;

export const CREATE_PROJECT_MUTATION = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      reporterId
      assignees
    }
  }
`;

export const CREATE_TASK_MUTATION = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      name
      description
      status
      priority
      projectId
      assigneeId
      createdAt
      updatedAt
      deadLine
    }
  }
`;

export const DELETE_PROJECT_MUTATION = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const UPDATE_PROJECT_MUTATION = `
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      status
      reporterId
      startedAt
      updatedAt
    }
  }
`;

export const UPDATE_TASK_MUTATION = `
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      name
      description
      status
      priority
      projectId
      assigneeId
      createdAt
      updatedAt
      deadLine
    }
  }
`;

export const DELETE_TASK_MUTATION = `
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const CHANGE_TASK_STATUS_MUTATION = `
  mutation ChangeStatus($taskId: ID!, $status: TaskStatus!) {
    changeStatus(taskId: $taskId, status: $status) {
      id
      status
    }
  }
`;

export const ADD_ASSIGNEE_MUTATION = `
  mutation AddAssignee($projectId: ID!, $assigneeId: ID!) {
    addAssignee(projectId: $projectId, assigneeId: $assigneeId) {
      id
      assignees
    }
  }
`;

export const REMOVE_ASSIGNEE_MUTATION = `
  mutation RemoveAssignee($projectId: ID!, $assigneeId: ID!) {
    removeAssignee(projectId: $projectId, assigneeId: $assigneeId) {
      id
      assignees
    }
  }
`;
