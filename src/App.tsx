import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import TaskPage from './pages/TaskPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import { Layout } from './components/Layout';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/create" element={<CreateProjectPage />} />
          <Route path="/project/:id" element={<ProjectDetailsPage />} />
          <Route path="/project/:projectId/task/:taskId" element={<TaskPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
