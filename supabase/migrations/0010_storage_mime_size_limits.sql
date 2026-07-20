-- Refuerza a nivel de Storage (no solo cliente) el tipo MIME y tamaño
-- permitido por bucket. Sin esto, cualquier archivo (ejecutables, HTML/SVG
-- con scripts, tamaño arbitrario) puede subirse suplantando el Content-Type
-- del request.
update storage.buckets
set file_size_limit = 2097152, -- 2MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'avatars';

update storage.buckets
set file_size_limit = 10485760, -- 10MB
    allowed_mime_types = array['application/pdf', 'text/plain']
where id = 'knowledge-docs';
