import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ListaServicos } from '../components/ListaServicos';
import toast from 'react-hot-toast';
import '../styles/Admin.css';

export function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [servico, setServico] = useState({
    nome: '',
    descricao: '',
    preco: ''
  });

  // Verificar se é admin
  const isAdmin = user?.email === "narutex216bits@gmail.com";

  // Redirecionar se não for admin
  useEffect(() => {
    if (user && !isAdmin) {
      toast.error('Acesso negado! Você não é administrador.');
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  if (!user) {
    return (
      <div className="restricted-area">
        <h2>🔒 Área Restrita</h2>
        <p>Faça login para acessar o painel administrativo.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="restricted-area">
        <h2>⛔ Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta área.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Voltar para Home
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'servicos'), {
        nome: servico.nome,
        descricao: servico.descricao,
        preco: parseFloat(servico.preco),
        createdAt: new Date(),
        ativo: true
      });
      
      toast.success('Serviço cadastrado com sucesso!');
      setServico({ nome: '', descricao: '', preco: '' });
    } catch (error) {
      toast.error('Erro ao cadastrar serviço');
      console.error(error);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">✂️ Painel do Barbeiro</h1>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>Cadastrar Novo Serviço</h3>
        
        <div className="form-group">
          <label>Nome do corte:</label>
          <input
            type="text"
            value={servico.nome}
            onChange={(e) => setServico({...servico, nome: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição:</label>
          <textarea
            value={servico.descricao}
            onChange={(e) => setServico({...servico, descricao: e.target.value})}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Preço (R$):</label>
          <input
            type="number"
            step="0.01"
            value={servico.preco}
            onChange={(e) => setServico({...servico, preco: e.target.value})}
            required
          />
        </div>

        <button type="submit" className="btn btn-success">
          Cadastrar Serviço
        </button>
      </form>

      <hr style={{ margin: '40px 0' }} />

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📋 Serviços Cadastrados</h2>
      <ListaServicos isAdmin={true} />
    </div>
  );
}