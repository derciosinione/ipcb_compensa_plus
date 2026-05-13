import React, { useEffect } from "react";

interface PageTitleProps {
  title: string;
  children: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, children }) => {
  useEffect(() => {
    document.title = `${title} | Compensa+`;
  }, [title]);

  return <>{children}</>;
};
