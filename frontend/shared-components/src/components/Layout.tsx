import React from 'react';
import { cn } from '../utils';

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  collapsed?: boolean;
}

export interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

export interface FooterProps {
  children?: React.ReactNode;
  className?: string;
  copyright?: string;
  links?: Array<{ label: string; href: string; external?: boolean }>;
}

// Main Layout Container
const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Layout.displayName = 'Layout';

// Header Component
const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ title, subtitle, actions, children, className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60',
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            {(title || subtitle) && (
              <div>
                {title && (
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

// Sidebar Component
const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ children, className, collapsed = false, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white transition-transform dark:border-gray-800 dark:bg-gray-950',
          collapsed && '-translate-x-full lg:translate-x-0 lg:w-16',
          !collapsed && 'translate-x-0',
          className
        )}
        {...props}
      >
        <div className="h-full overflow-y-auto p-4">
          {children}
        </div>
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

// Main Content Area
const MainContent = React.forwardRef<HTMLElement, MainContentProps>(
  ({ children, className, padding = 'default', ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8',
    };

    return (
      <main
        ref={ref}
        className={cn(
          'flex-1 min-h-[calc(100vh-4rem)]',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </main>
    );
  }
);

MainContent.displayName = 'MainContent';

// Footer Component
const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ children, className, copyright, links, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          'border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 py-6">
          {children ? (
            children
          ) : (
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              {copyright && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {copyright}
                </p>
              )}
              
              {links && links.length > 0 && (
                <nav className="flex space-x-6">
                  {links.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          )}
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

// App Layout - A complete layout with header, sidebar, main, and footer
export interface AppLayoutProps {
  children: React.ReactNode;
  header?: HeaderProps;
  sidebar?: SidebarProps & { content: React.ReactNode };
  footer?: FooterProps;
  className?: string;
  sidebarCollapsed?: boolean;
  mainContentPadding?: MainContentProps['padding'];
}

const AppLayout = React.forwardRef<HTMLDivElement, AppLayoutProps>(
  ({ 
    children, 
    header, 
    sidebar, 
    footer, 
    className, 
    sidebarCollapsed = false,
    mainContentPadding = 'default',
    ...props 
  }, ref) => {
    return (
      <Layout ref={ref} className={className} {...props}>
        {header && <Header {...header} />}
        
        <div className="flex">
          {sidebar && (
            <Sidebar {...sidebar} collapsed={sidebarCollapsed}>
              {sidebar.content}
            </Sidebar>
          )}
          
          <div className={cn(
            'flex-1 flex flex-col',
            sidebar && !sidebarCollapsed && 'lg:ml-64',
            sidebar && sidebarCollapsed && 'lg:ml-16'
          )}>
            <MainContent padding={mainContentPadding}>
              {children}
            </MainContent>
            
            {footer && <Footer {...footer} />}
          </div>
        </div>
      </Layout>
    );
  }
);

AppLayout.displayName = 'AppLayout';

export { Layout, Header, Sidebar, MainContent, Footer, AppLayout };
