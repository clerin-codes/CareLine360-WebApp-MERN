import { ThemeProvider } from "./context/ThemeContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <ThemeProvider>
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;