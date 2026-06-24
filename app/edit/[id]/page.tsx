import EditClient from "./EditClient";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = 'id' in params ? params : await params;
    return <EditClient params={resolvedParams} />;
}