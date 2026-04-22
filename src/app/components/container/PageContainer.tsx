type Props = {
  description?: string;
  children: JSX.Element | JSX.Element[];
  title?: string;
};

const PageContainer = ({ children }: Props) => <>{children}</>;

export default PageContainer;
