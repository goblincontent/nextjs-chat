# Case Law Research Chatbot Demo
(App Link)[https://chatbox-leap.vercel.app/]

## About

Generative AI often faces challenges such as hallucinations and token limits. This demo showcases the power of RAG (Retrieval-Augmented Generation) to address these issues. RAG mitigates hallucinations by using a retrieval model to find relevant information and leverages embeddings to reduce the input token count. This custom AI chatbot is designed for lawyers to facilitate case law research, making it particularly valuable for handling large case law documents.

## Dataset and Limitations

Since access to paid law databases like WestLaw or LexisNexis is unavailable, we utilized the "Caselaw Access Project" provided by Harvard Library Innovation Lab. We worked with a small subset of 234 cases related to online marketplaces, inspired by the FTC lawsuit against Amazon.

Despite being a subset, this dataset contains approximately 8 million tokens and 6.6 million words, divided into 20,000 case chunks. You can find the SQL used to create the matching document embeddings function in the GitHub repository under `data/case_chunks.sql`. Additionally, optimizing the embeddings query with indexing is a future enhancement.

We have not yet incorporated conversation history into the chatbot, but we plan to enhance its ability to remember relevant documents efficiently.

## How does it work?

Each case law document is divided into chunks of 400 tokens. We employ langchain's `OpenAIEmbeddings()` to generate embeddings for each chunk. When a user asks a question, their query is transformed into vector embeddings using the same embeddings function. We then identify the most similar document chunks based on the user's embeddings and craft an appropriate prompt to generate a response. Vector similarity is known for its efficiency, though please note that the TypeScript async code may still need optimization.

## Technology Stack

- Backend: The backend utilizes Supabase, an open-source Firebase alternative. It leverages the pgvector extension for PostgreSQL, enabling efficient vector similarity searches. Case law documents are stored in a database named "cases," while embeddings are stored in the "case_chunks" database. We use Langchain for prompt generation.

- Frontend: The frontend is built with Next.js, React, TailwindCSS, and Radix UI. The source code was forked from a Vercel template app. Vercel is also used for edge computing, providing a CDN and CI/CD pipeline for seamless deployment.

Feel free to explore the code and the demo app to see the power of RAG in action for legal research!
