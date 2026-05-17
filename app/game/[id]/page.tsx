import GameClient from "./GameClient";

export default async function GamePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    // W Next.js 13+, params mogą być Promise lub bezpośrednio obiektem
    const resolvedParams = 'id' in params ? params : await params;
    return <GameClient params={resolvedParams} />;
}