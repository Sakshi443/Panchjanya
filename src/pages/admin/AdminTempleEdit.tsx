import { useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import TempleForm from "@/components/admin/TempleForm";

export default function AdminTempleEdit() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminLayout>
      <TempleForm templeId={id} />
    </AdminLayout>
  );
}
