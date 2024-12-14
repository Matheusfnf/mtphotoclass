-- Habilitar RLS para as tabelas
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela folders
CREATE POLICY "Usuários podem ver suas próprias pastas"
ON folders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias pastas"
ON folders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias pastas"
ON folders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias pastas"
ON folders FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para a tabela photos
CREATE POLICY "Usuários podem ver suas próprias fotos"
ON photos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias fotos"
ON photos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias fotos"
ON photos FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias fotos"
ON photos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para o bucket de fotos no storage
CREATE POLICY "Usuários podem ver suas próprias fotos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem fazer upload de suas próprias fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem atualizar suas próprias fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar suas próprias fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
