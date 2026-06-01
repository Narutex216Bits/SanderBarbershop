import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

export function ListaPacotes() {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPacotes();
  }, []);

  const carregarPacotes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pacotes'));
      const pacotesList = [];
      querySnapshot.forEach((doc) => {
        pacotesList.push({ id: doc.id, ...doc.data() });
      });
      setPacotes(pacotesList);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
    setLoading(false);
  };

  if (loading) return <p>Carregando pacotes...</p>;

  return (
    <div>
      <h2 style={{ marginTop: '40px' }}>📦 Pacotes Especiais</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
        {pacotes.map((pacote) => (
          <div key={pacote.id} style={{ border: '2px solid #ff6b6b', borderRadius: '8px', padding: '15px', background: '#fff5f5' }}>
            <h3>🎁 {pacote.nome}</h3>
            <p>{pacote.descricao}</p>
            <p style={{ textDecoration: 'line-through', color: '#999' }}>
              De: R$ {pacote.precoOriginal?.toFixed(2)}
            </p>
            <p style={{ fontSize: '24px', color: '#4CAF50', fontWeight: 'bold' }}>
              Por: R$ {pacote.precoTotal}
            </p>
            <p style={{ color: '#ff6b6b' }}>Economize R$ {pacote.economia}</p>
            <button style={{ background: '#ff6b6b', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
              Quero esse pacote!
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}