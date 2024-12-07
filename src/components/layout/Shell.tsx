import { ErrorBoundary } from "react-error-boundary";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { ErrorFallback } from "./ErrorFallback";
import { Dashboard } from "@/pages/Dashboard";
import { Journal } from "@/pages/Journal";
import { Balance } from "@/pages/Balance";
import { Income } from "@/pages/Income";
import { TransactionDetail } from "@/pages/transactions/TransactionDetail";
import { Payroll } from "@/pages/Payroll";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { Login } from "@/pages/auth/Login";
import { Academy } from "@/pages/Academy";
import { Marketplace } from "@/pages/Marketplace";
import { Account } from "@/pages/Account";
import { NewTransaction } from "@/pages/transactions/NewTransaction";
import { JurataAI } from "@/pages/JurataAI";
import { ChatDetail } from "@/pages/chat/ChatDetail";
import { Upload } from "@/pages/Upload";
import { ContractAnalysis } from "@/pages/legal/ContractAnalysis";
import { ContractTemplates } from "@/pages/legal/ContractTemplates";
import { ContractManagement } from "@/pages/legal/ContractManagement";
import { Taxes } from "@/pages/Taxes";
import { Tasks } from "@/pages/Tasks";
import { NewTask } from "@/pages/tasks/NewTask";
import { EditTask } from "@/pages/tasks/EditTask";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from 'jotai';
import { userAtom } from '@/lib/auth';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.3,
};

export function Shell() {
  const location = useLocation();
  const user = useAtomValue(userAtom);

  // Only render app shell if user is authenticated and not on login page
  const isApp = user && location.pathname !== '/login';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          isApp ? (
            <motion.div 
              className="min-h-screen bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Navbar />
              <div className="flex h-screen pt-14">
                <Sidebar />
                <main className="flex-1 overflow-hidden">
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <div className="h-full overflow-y-auto">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={location.pathname}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={pageVariants}
                          transition={pageTransition}
                          className="p-6"
                        >
                          <Routes location={location}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/request" element={<JurataAI />} />
                            <Route path="/request/:id" element={<ChatDetail />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/upload" element={<Upload />} />
                            <Route path="/legal/analysis" element={<ContractAnalysis />} />
                            <Route path="/legal/templates" element={<ContractTemplates />} />
                            <Route path="/legal/contracts" element={<ContractManagement />} />
                            <Route path="/journal" element={<Journal />} />
                            <Route path="/journal/:id" element={<TransactionDetail />} />
                            <Route path="/journal/new" element={<NewTransaction />} />
                            <Route path="/balance" element={<Balance />} />
                            <Route path="/income" element={<Income />} />
                            <Route path="/payroll" element={<Payroll />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/taxes" element={<Taxes />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/tasks/new" element={<NewTask />} />
                            <Route path="/tasks/:id" element={<EditTask />} />
                            <Route path="/academy" element={<Academy />} />
                            <Route path="/marketplace" element={<Marketplace />} />
                            <Route path="/account" element={<Account />} />
                          </Routes>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </ErrorBoundary>
                </main>
              </div>
            </motion.div>
          ) : null
        }
      />
    </Routes>
  );
}