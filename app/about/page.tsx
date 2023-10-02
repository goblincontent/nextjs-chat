
export default function About() {
    return (
        <div className="mx-auto max-w-2xl px-4">
            <div className="rounded-lg border bg-background p-8">
                <h1 className="mb-2 text-lg font-semibold">
                    This Demo is an example to showcase the power of RAG (Retrieval-Augmented Generation)
                    though the use of a custom AI Chatbot designed for lawyers to do case research.
                    It uses a supabase postgres database backend to store embeddings for chunks of case law text.
                    Each chunk consists of roughly 400 tokens.
                </h1>
            </div>
        </div>
    )
}