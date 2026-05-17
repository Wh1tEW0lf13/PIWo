import EditClient from "./EditClient";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    // W Next.js 13+, params mogą być Promise
    const resolvedParams = 'id' in params ? params : await params;
    return <EditClient params={resolvedParams} />;
}