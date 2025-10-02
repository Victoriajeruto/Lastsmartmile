import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <Layout />;
}
