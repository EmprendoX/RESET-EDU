import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdminRoute } from '@/components/admin/RequireAdminRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ClassroomPage } from '@/pages/student/ClassroomPage';
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage';
import { BusinessProfilePage } from '@/pages/student/BusinessProfilePage';
import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { CourseCatalogPage } from '@/pages/public/CourseCatalogPage';
import { CourseDetailPage } from '@/pages/public/CourseDetailPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminCourseListPage } from '@/pages/admin/AdminCourseListPage';
import { AdminCourseNewPage } from '@/pages/admin/AdminCourseNewPage';
import { AdminCourseEditPage } from '@/pages/admin/AdminCourseEditPage';
import { CourseBuilderPage } from '@/pages/admin/CourseBuilderPage';
import { LessonEditorPage } from '@/pages/admin/LessonEditorPage';
import { AdminMediaPage } from '@/pages/admin/AdminMediaPage';
import { AdminMatriculasPage } from '@/pages/admin/AdminMatriculasPage';
import { AdminReportsPlaceholderPage } from '@/pages/admin/AdminReportsPlaceholderPage';
import { AdminLogsPlaceholderPage } from '@/pages/admin/AdminLogsPlaceholderPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cursos" element={<CourseCatalogPage />} />
      <Route path="/cursos/:slug" element={<CourseDetailPage />} />
      <Route path="/dashboard" element={<StudentDashboardPage />} />
      <Route path="/mi-negocio" element={<BusinessProfilePage />} />
      <Route
        path="/aprender/:courseSlug"
        element={<ClassroomPage />}
      />
      <Route
        path="/aprender/:courseSlug/:lessonId"
        element={<ClassroomPage />}
      />

      <Route
        path="/admin"
        element={
          <RequireAdminRoute>
            <AdminLayout />
          </RequireAdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="cursos" element={<AdminCourseListPage />} />
        <Route path="cursos/nuevo" element={<AdminCourseNewPage />} />
        <Route path="cursos/:courseId" element={<AdminCourseEditPage />} />
        <Route
          path="cursos/:courseId/builder"
          element={<CourseBuilderPage />}
        />
        <Route
          path="cursos/:courseId/lecciones/:lessonId"
          element={<LessonEditorPage />}
        />
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="matriculas" element={<AdminMatriculasPage />} />
        <Route
          path="usuarios"
          element={<Navigate to="/admin/matriculas" replace />}
        />
        <Route path="reportes" element={<AdminReportsPlaceholderPage />} />
        <Route path="logs" element={<AdminLogsPlaceholderPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
