import type { ReactNode } from 'react';
import TabBar from './TabBar';
import AppLogo from './AppLogo';

interface Props {
  children: ReactNode;
  title?: string;
  headerRight?: ReactNode;
  noPadding?: boolean;
}

export default function PageLayout({ children, title, headerRight, noPadding }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {title && (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 pt-safe">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AppLogo size={30} />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
            {headerRight && <div>{headerRight}</div>}
          </div>
        </header>
      )}
      <main className={`flex-1 max-w-lg mx-auto w-full pb-tab-safe ${noPadding ? '' : 'px-4 py-4'}`}>
        {children}
      </main>
      <TabBar />
    </div>
  );
}
