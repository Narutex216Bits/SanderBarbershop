import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import '../styles/AdminPacotes.css';

export function AdminPacotes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState([]);
  const [pacote, setPacote] = useState({
    nome: '',
    descricao: '',
    servicos: [],
    precoTotal: '',
    economia: ''
  });

  // Verificar se é admin
  const isAdmin = user?.email === "narutex216bits@gmail.com";

  useEffect(() => {
    // Redirecionar se não for admin
    if (user && !isAdmin) {
      toast.error('Acesso negado! Você não é administrador.');
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      carregarServicos();
    }
  }, [isAdmin]);

  const carregarServicos = async () => {
    const querySnapshot = await getDocs(collection(db, 'servicos'));
    const servicosList = [];
    querySnapshot.forEach((doc) => {
      servicosList.push({ id: doc.id, ...doc.data() });
    });
    setServicos(servicosList);
  };

  const handleServicoChange = (servicoId, servicoPreco) => {
    let novosServicos = [...pacote.servicos];
    
    if (novosServicos.includes(servicoId)) {
      novosServicos = novosServicos.filter(id => id !== servicoId);
    } else {
      novosServicos.push(servicoId);
    }
    
    // Calcular preço total
    let total = 0;
    novosServicos.forEach(id => {
      const servico = servicos.find(s => s.id === id);
      if (servico) total += servico.preco;
    });
    
    // Calcular economia (ex: 15% de desconto)
    const economiaValor = total * 0.15;
    const precoComDesconto = total - economiaValor;
    
    setPacote({
      ...pacote,
      servicos: novosServicos,
      precoTotal: precoComDesconto.toFixed(2),
      economia: economiaValor.toFixed(2)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pacote.servicos.length < 2) {
      toast.error('Pacote precisa ter pelo menos 2 serviços');
      return;
    }
    
    try {
      await addDoc(collection(db, 'pacotes'), {
        nome: pacote.nome,
        descricao: pacote.descricao,
        servicos: pacote.servicos,
        precoTotal: parseFloat(pacote.precoTotal),
        precoOriginal: pacote.servicos.reduce((total, id) => {
          const servico = servicos.find(s => s.id === id);
          return total + (servico?.preco || 0);
        }, 0),
        economia: parseFloat(pacote.economia),
        createdAt: new Date(),
        ativo: true
      });
      
      toast.success('Pacote cadastrado com sucesso!');
      setPacote({
        nome: '',
        descricao: '',
        servicos: [],
        precoTotal: '',
        economia: ''
      });
    } catch (error) {
      toast.error('Erro ao cadastrar pacote');
      console.error(error);
    }
  };

  // Verificação de usuário não logado
  if (!user) {
    return (
      <div className="restricted-area">
        <h2>🔒 Área Restrita</h2>
        <p>Faça login para acessar o painel administrativo.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Voltar para Home
        </button>
      </div>
    );
  }

  // Verificação de admin
  if (!isAdmin) {
    return (
      <div className="restricted-area">
        <h2>⛔ Acesso Negado</h2>
        <p>Apenas o administrador pode acessar esta área.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="pacotes-container">
      <h1 className="pacotes-title">📦 Cadastro de Pacotes</h1>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Nome do pacote:</label>
          <input
            type="text"
            value={pacote.nome}
            onChange={(e) => setPacote({...pacote, nome: e.target.value})}
            placeholder="Ex: Combo Executivo"
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição:</label>
          <textarea
            value={pacote.descricao}
            onChange={(e) => setPacote({...pacote, descricao: e.target.value})}
            placeholder="Ex: Corte + Barba + Sobrancelha"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Selecione os serviços (mínimo 2):</label>
          <div className="servicos-checkbox">
            {servicos.map((servico) => (
              <label key={servico.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={pacote.servicos.includes(servico.id)}
                  onChange={() => handleServicoChange(servico.id, servico.preco)}
                />
                {servico.nome} - R$ {servico.preco}
              </label>
            ))}
          </div>
        </div>

        {pacote.servicos.length >= 2 && (
          <div className="resumo-pacote">
            <p>💰 Preço normal: R$ {pacote.servicos.reduce((total, id) => {
              const servico = servicos.find(s => s.id === id);
              return total + (servico?.preco || 0);
            }, 0).toFixed(2)}</p>
            <p>🎉 Preço do pacote: <strong className="preco-destaque">R$ {pacote.precoTotal}</strong></p>
            <p>💎 Você economiza: <strong className="economia-destaque">R$ {pacote.economia}</strong></p>
          </div>
        )}

        <button type="submit" className="btn btn-success">
          Cadastrar Pacote
        </button>
      </form>
    </div>
  );
}