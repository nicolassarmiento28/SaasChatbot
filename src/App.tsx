import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';
import { SessionProvider } from './features/auth/useSession';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { AuthLayout } from './features/auth/AuthLayout';

// Code-split todo lo que no es la landing: la landing no debe cargar el
// bundle del dashboard/auth (criterio de aceptación de 01-landing.md).
const LoginForm = lazy(() => import('./features/auth/LoginForm').then((m) => ({ default: m.LoginForm })));
const SignupForm = lazy(() => import('./features/auth/SignupForm').then((m) => ({ default: m.SignupForm })));
const ForgotPasswordForm = lazy(() =>
  import('./features/auth/ForgotPasswordForm').then((m) => ({ default: m.ForgotPasswordForm })),
);
const AuthCallback = lazy(() => import('./features/auth/AuthCallback').then((m) => ({ default: m.AuthCallback })));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const DashboardLayout = lazy(() =>
  import('./features/dashboard/DashboardLayout').then((m) => ({ default: m.DashboardLayout })),
);
const OnboardingPage = lazy(() => import('./features/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const BotsPage = lazy(() => import('./features/bots/BotsPage').then((m) => ({ default: m.BotsPage })));
const BotKnowledgePage = lazy(() =>
  import('./features/bots/BotKnowledgePage').then((m) => ({ default: m.BotKnowledgePage })),
);
const ConversationsPage = lazy(() =>
  import('./features/dashboard/ConversationsPage').then((m) => ({ default: m.ConversationsPage })),
);
const UsagePage = lazy(() => import('./features/dashboard/UsagePage').then((m) => ({ default: m.UsagePage })));
const DemoPage = lazy(() => import('./features/landing/DemoPage').then((m) => ({ default: m.DemoPage })));

export function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <LoginForm />
                </AuthLayout>
              }
            />
            <Route
              path="/registro"
              element={
                <AuthLayout>
                  <SignupForm />
                </AuthLayout>
              }
            />
            <Route
              path="/recuperar-password"
              element={
                <AuthLayout>
                  <ForgotPasswordForm />
                </AuthLayout>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/demo/:botId" element={<DemoPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/bots" element={<BotsPage />} />
              <Route path="/dashboard/bots/:id/knowledge" element={<BotKnowledgePage />} />
              <Route path="/dashboard/conversaciones" element={<ConversationsPage />} />
              <Route path="/dashboard/uso" element={<UsagePage />} />
            </Route>
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SessionProvider>
  );
}
