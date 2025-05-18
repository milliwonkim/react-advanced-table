import React, { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="p-4 md:p-8 h-screen flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </header>
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
};

export default PageLayout;
