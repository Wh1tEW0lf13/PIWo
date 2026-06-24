import GameClient from "./GameClient";

export default async function GamePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = 'id' in params ? params : await params;
    return <GameClient params={resolvedParams} />;
}