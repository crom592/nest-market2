import Header from './Header';

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
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
