import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import InviteAccept from "../pages/InviteAccept";
import Dashboard from "../pages/Dashboard";
import OrgCreate from "../pages/OrgCreate";
import OrgSettings from "../pages/OrgSettings";
import OrgMembers from "../pages/OrgMembers";
import OrgInvite from "../pages/OrgInvite";
import Account from "../pages/Account";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public — works for both logged-out and logged-in visitors; the
          page itself branches on auth state (see InviteAccept.jsx) */}
      <Route path="/invite/:token" element={<InviteAccept />} />

      {/* Requires login, but no org membership yet — handled inside the page itself */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/org/create" element={<OrgCreate />} />
        <Route path="/org/:slug/settings" element={<OrgSettings />} />
        <Route path="/org/:slug/members" element={<OrgMembers />} />
        <Route path="/org/:slug/invite" element={<OrgInvite />} />
        <Route path="/account" element={<Account />} />
      </Route>

      <Route path="/" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}