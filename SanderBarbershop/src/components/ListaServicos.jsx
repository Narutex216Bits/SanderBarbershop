import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import '../styles/components/ListaServicos.css';

export function ListaServicos({ isAdmin = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'servicos'));
      const servicosList = [];
      querySnapshot.forEach((doc) => {
        servicosList.push({ id: doc.id, ...doc.data() });
      });
      setServicos(servicosList);
    } catch (error) {
      console.error('Erro ao carregar:', error);
      toast.error('Erro ao carregar serviços');
    }
    setLoading(false);
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja deletar o serviço "${nome}"?`)) {
      try {
        await deleteDoc(doc(db, 'servicos', id));
        toast.success(`Serviço "${nome}" deletado com sucesso!`);
        carregarServicos();
      } catch (error) {
        console.error('Erro ao deletar:', error);
        toast.error('Erro ao deletar serviço');
      }
    }
  };

  if (loading) return <p className="loading">Carregando serviços...</p>;

  if (servicos.length === 0) {
    return <p className="loading">Nenhum serviço cadastrado ainda.</p>;
  }

  return (
    <div className="servicos-grid">
      {servicos.map((servico) => (
        <div key={servico.id} className="servico-card">
          <h3 className="servico-nome">{servico.nome}</h3>
          <p className="servico-descricao">{servico.descricao}</p>
          <p className="servico-preco">R$ {servico.preco}</p>
          
          {isAdmin ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="servico-btn-editar"
                onClick={() => toast.info('Funcionalidade em breve!')}
              >
                ✏️ Editar
              </button>
              <button 
                className="servico-btn-deletar"
                onClick={() => handleDelete(servico.id, servico.nome)}
              >
                🗑️ Deletar
              </button>
            </div>
          ) : (
            <button 
              className="servico-btn"
              onClick={() => navigate(`/agendar/${servico.id}`)}
            >
              Agendar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}