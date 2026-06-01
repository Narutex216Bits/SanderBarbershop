import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function MeusAgendamentos() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    if (user) {
      carregarAgendamentos();
    }
  }, [user]);

  const carregarAgendamentos = async () => {
    const q = query(
      collection(db, 'agendamentos'),
      where('clienteId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    const lista = [];
    querySnapshot.forEach((doc) => {
      lista.push({ id: doc.id, ...doc.data() });
    });
    setAgendamentos(lista);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📋 Meus Agendamentos</h1>
      {agendamentos.length === 0 ? (
        <p>Você ainda não tem agendamentos.</p>
      ) : (
        agendamentos.map((ag) => (
          <div key={ag.id} style={{ border: '1px solid #ddd', margin: '10px', padding: '15px', borderRadius: '8px' }}>
            <h3>✂️ {ag.servicoNome}</h3>
            <p>📅 {ag.data} às {ag.horario}</p>
            <p>💰 R$ {ag.servicoPreco}</p>
            <p>Status: {ag.status === 'pendente' ? '⏳ Pendente' : '✅ Confirmado'}</p>
          </div>
        ))
      )}
    </div>
  );
}