import PortalLayoutWrapper from "../../PortalLayoutWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutWrapper>{children}</PortalLayoutWrapper>;
}
