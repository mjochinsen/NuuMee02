import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import HomePage from './pages/HomePage';
import CreateVideoPage from './pages/CreateVideoPage';
import PricePage from './pages/PricePage';
import DocumentationPage from './pages/DocumentationPage';
import TestimonialsPage from './pages/TestimonialsPage';
import JobsPage from './pages/JobsPage';
import BillingPage from './pages/BillingPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import APIKeysPage from './pages/APIKeysPage';
import SupportPage from './pages/SupportPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ComparisonPage from './pages/ComparisonPage';
import StatusPage from './pages/StatusPage';
import ChangelogPage from './pages/ChangelogPage';
import ReferralPage from './pages/ReferralPage';
import AffiliatePage from './pages/AffiliatePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';
import SitemapPage from './pages/SitemapPage';
import SubscriptionModalsTestPage from './pages/SubscriptionModalsTestPage';
import ExamplesPage from './pages/ExamplesPage';
import ComponentsDEVPage from './pages/ComponentsDEVPage';
import ComponentStatesPage from './pages/ComponentStatesPage';
import CareersPage from './pages/CareersPage';
import GoodbyePage from './pages/GoodbyePage';

export default function App() {
  return (
    <Router>
      <div className="dark min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateVideoPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/price" element={<PricePage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />
          <Route path="/api-keys" element={<APIKeysPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="/affiliate" element={<AffiliatePage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
          <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
          <Route path="/dev" element={<SitemapPage />} />
          <Route path="/components-dev" element={<ComponentsDEVPage />} />
          <Route path="/component-states" element={<ComponentStatesPage />} />
          <Route path="/subscription-modals" element={<SubscriptionModalsTestPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/goodbye" element={<GoodbyePage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}
