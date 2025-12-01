import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import HoDWorkspace from "./pages/HoDWorkspace";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import HoDLogin from "./pages/HoDLogin";
import FacultyLogin from "./pages/FacultyLogin";
import StudentLogin from "./pages/StudentLogin";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Timetable from "./pages/Timetable";
import ManageStudents from "./pages/ManageStudents";
import Faculty from "./pages/Faculty";
import Attendance from "./pages/Attendance";
import Analytics from "./pages/Analytics";
import StudentAnalytics from "./pages/StudentAnalytics";
import DataExport from "./pages/DataExport";
import Settings from "./pages/Settings";
import FacultyDirectory from "./pages/FacultyDirectory";
import Student
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login/hod" element={<HoDLogin />} />
              <Route path="/login/faculty" element={<FacultyLogin />} />
              <Route path="/login/student" element={<StudentLogin />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Home />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hod-workspace"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <HoDWorkspace />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hod-workspace/manage-students"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <Students />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <Layout>
                      <FacultyDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students"
                element={
                  <ProtectedRoute allowedRoles={['hod', 'faculty']}>
                    <Layout>
                      <Students />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manage-students"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <Layout>
                      <ManageStudents />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/subjects"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Subjects />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/timetable"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Timetable />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Faculty />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Attendance />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student-analytics/:studentId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <StudentAnalytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/export"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DataExport />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty-directory"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <FacultyDirectory />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student-directory"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <StudentDirectory />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
