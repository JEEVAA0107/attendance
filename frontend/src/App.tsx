import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MockDashboard from "./pages/MockDashboard";
import HoDWorkspace from "./pages/hod/HoDWorkspace";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentWorkspace from "./pages/student/StudentWorkspace";
import HoDLogin from "./pages/hod/HoDLogin";
import HoDLoginNew from "./pages/hod/HoDLoginNew";
import FacultyLogin from "./pages/faculty/FacultyLogin";
import StudentLogin from "./pages/StudentLogin";
import Students from "./pages/hod/Students";
import Subjects from "./pages/Subjects";
import Timetable from "./pages/Timetable";
import ManageStudents from "./pages/hod/ManageStudents";
import Faculty from "./pages/faculty/Faculty";
import Attendance from "./pages/Attendance";
import Analytics from "./pages/hod/Analytics";
import StudentAnalytics from "./pages/hod/StudentAnalytics";
import DataExport from "./pages/DataExport";
import Settings from "./pages/Settings";
import FacultyDirectory from "./pages/faculty/FacultyDirectory";
import StudentDirectory from "./pages/hod/StudentDirectory";
import Events from "./pages/hod/Events";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";

const App = () => (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login/hod" element={<HoDLoginNew />} />
              <Route path="/login/hod/old" element={<HoDLogin />} />
              <Route path="/login/faculty" element={<FacultyLogin />} />
              <Route path="/login/student" element={<StudentLogin />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MockDashboard />
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
                    <StudentWorkspace />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student-workspace"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentWorkspace />
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
                path="/events"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <Layout>
                      <Events />
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
  );

export default App;
