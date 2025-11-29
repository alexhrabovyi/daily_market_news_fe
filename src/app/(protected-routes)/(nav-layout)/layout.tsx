import NavLayout from '@/ui/NavLayout/NavLayout';

interface LayoutProps {
  children?: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <NavLayout>
      {children}
    </NavLayout>
  );
}
