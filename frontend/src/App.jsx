import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OrgProvider } from "./context/OrgContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrgProvider>
          <div className="min-h-screen">
            <AppRoutes />
          </div>
        </OrgProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}