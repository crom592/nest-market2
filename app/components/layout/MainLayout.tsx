import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * The main layout component, which wraps the Header and main content
 * of the application.
 *
 * This component should be used as the root component for all pages.
 *
 * @param children The content of the page.
 * @returns The main layout component.
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-screen-sm mx-auto px-4">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
