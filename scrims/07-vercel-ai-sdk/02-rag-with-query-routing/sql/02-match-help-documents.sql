create or replace function match_help_documents (
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.3,
  filter jsonb default '{}'
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    help_documents.id,
    help_documents.content,
    help_documents.metadata,
    1 - (help_documents.embedding <=> query_embedding) as similarity
  from
    help_documents
  where
    1 - (help_documents.embedding <=> query_embedding) > match_threshold
  order by
    help_documents.embedding <=> query_embedding
  limit
    match_count
$$;