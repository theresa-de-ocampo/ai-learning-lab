# RAG with the OpenAI SDK

This demonstrates the core retrieval-augmented generation flow across a multi-file corpus: ingest local text files, split them into chunks, create hosted OpenAI embeddings, store the embedded chunks in Supabase, retrieve semantically similar chunks for a query, and send the retrieved context to a hosted OpenAI generation model.

## How It Works

```mermaid
flowchart TD
    Embed[OpenAI Embeddings API<br/>text-embedding-3-small]
    Store[Supabase documents table<br/>content, metadata, embedding]

    subgraph Seed[npm run seed]
        Docs[Local docs/*.txt files] --> Split[Local text splitting]
        Split --> DocChunks[Document chunks]
        DocEmbeddings[Document embeddings] --> Store
    end

    subgraph Answer[npm start]
        Question[Hardcoded question]
        QueryEmbedding --> Match[Supabase RPC<br/>match_documents]
        Store --> Match
        Match --> Context[Retrieved context chunks]
        Context --> Prompt[Grounded RAG prompt]
        Question --> Prompt
        Prompt --> Generate[OpenAI Responses API<br/>gpt-5-nano]
        Generate --> Output[Terminal output]
    end

    DocChunks --> Embed
    Embed --> DocEmbeddings
    Question --> Embed
    Embed --> QueryEmbedding
```

## Running Locally

1. Create an OpenAI API key from the [OpenAI API Platform](https://platform.openai.com/). Make sure the account has credits available.
2. Create a [Supabase project](https://supabase.com/), and execute the following queries:
   1. [Create Table](sql/01-set-up.sql)
   2. [match_documents Function](sql/02-match-documents.sql)
3. Create a `.env` file with:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_API_KEY=your_supabase_api_key
   ```
4. Install dependencies: `npm install`
5. Seed the vector store: `npm run seed`
6. Run the sample query: `npm start`
