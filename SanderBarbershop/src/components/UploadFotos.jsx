import { useState } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export function UploadFotos({ servicoId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      const fileName = `${servicoId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('fotos-servicos')
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Erro ao enviar ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('fotos-servicos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('fotos_servico')
        .insert({
          servico_id: servicoId,
          url: urlData.publicUrl
        });

      if (dbError) {
        toast.error('Erro ao salvar foto');
      } else {
        toast.success(`${file.name} enviado!`);
      }
    }

    setUploading(false);
    onUploadComplete?.();
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Enviando fotos...</p>}
    </div>
  );
}