import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import '../styles/AdminConfig.css';

export function AdminConfig() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dataAtual, setDataAtual] = useState(new Date());
  const [configDias, setConfigDias] = useState({});
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [configDiaEdit, setConfigDiaEdit] = useState({
    ativo: true,
    horarioInicio: '09:00',
    horarioFim: '18:00',
    intervaloMinutos: 30
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === "narutex216bits@gmail.com";

  useEffect(() => {
    if (user && !isAdmin) {
      toast.error('Acesso negado!');
      navigate('/');
    } else if (isAdmin) {
      carregarConfiguracoes();
    }
  }, [user, isAdmin, dataAtual]);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'configDias'));
    const configs = {};
    querySnapshot.forEach((doc) => {
      configs[doc.id] = doc.data();
    });
    setConfigDias(configs);
    setLoading(false);
  };

  const abrirConfiguracaoDia = (dataString) => {
    const configExistente = configDias[dataString];
    setDiaSelecionado(dataString);
    if (configExistente) {
      setConfigDiaEdit({
        ativo: configExistente.ativo,
        horarioInicio: configExistente.horarioInicio || '09:00',
        horarioFim: configExistente.horarioFim || '18:00',
        intervaloMinutos: configExistente.intervaloMinutos || 30
      });
    } else {
      setConfigDiaEdit({
        ativo: true,
        horarioInicio: '09:00',
        horarioFim: '18:00',
        intervaloMinutos: 30
      });
    }
  };

  const fecharConfiguracao = () => {
    setDiaSelecionado(null);
  };

  const salvarConfiguracaoDia = async () => {
    try {
      await setDoc(doc(db, 'configDias', diaSelecionado), {
        ...configDiaEdit,
        data: diaSelecionado,
        atualizadoEm: new Date()
      });
      toast.success(`Configuração do dia ${diaSelecionado} salva!`);
      fecharConfiguracao();
      carregarConfiguracoes(); // recarrega para mostrar atualização
    } catch (error) {
      toast.error('Erro ao salvar');
      console.error(error);
    }
  };

  // Gerar calendário
  const getDiasDoMes = () => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias = [];
    
    const primeiroDiaSemana = primeiroDia.getDay();
    const diasDoMesAnterior = primeiroDiaSemana === 0 ? 6 : primeiroDiaSemana - 1;
    
    for (let i = diasDoMesAnterior; i > 0; i--) {
      const data = new Date(ano, mes, -i + 1);
      const dataString = data.toISOString().split('T')[0];
      dias.push({
        numero: data.getDate(),
        data: dataString,
        isMesAtual: false
      });
    }
    
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const data = new Date(ano, mes, i);
      const dataString = data.toISOString().split('T')[0];
      dias.push({
        numero: i,
        data: dataString,
        isMesAtual: true
      });
    }
    
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const data = new Date(ano, mes + 1, i);
      const dataString = data.toISOString().split('T')[0];
      dias.push({
        numero: i,
        data: dataString,
        isMesAtual: false
      });
    }
    return dias;
  };

  const getStatusDia = (dataString) => {
    const config = configDias[dataString];
    if (!config) return 'nao-configurado';
    return config.ativo ? 'ativo' : 'bloqueado';
  };

  const mesAnterior = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1));
  };

  const proximoMes = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1));
  };

  const dias = getDiasDoMes();
  const nomeMes = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  if (!user || !isAdmin) return <div className="restricted-area">Acesso negado.</div>;
  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="admin-config-container">
      <h1>⚙️ Configuração da Barbearia</h1>
      <p className="subtitle">Clique em qualquer dia para configurar horários e bloqueio individual</p>

      <div className="calendario-header">
        <button onClick={mesAnterior} className="nav-btn">◀</button>
        <h2>{nomeMes}</h2>
        <button onClick={proximoMes} className="nav-btn">▶</button>
      </div>

      <div className="calendario-grid">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(dia => (
          <div key={dia} className="dia-semana-header">{dia}</div>
        ))}
        
        {dias.map((dia, idx) => {
          const status = getStatusDia(dia.data);
          let classe = '';
          let icone = '';
          let texto = '';
          
          if (!dia.isMesAtual) {
            classe = 'outro-mes';
          } else if (status === 'ativo') {
            classe = 'status-ativo';
            icone = '✅';
            texto = configDias[dia.data]?.horarioInicio?.slice(0,5);
          } else if (status === 'bloqueado') {
            classe = 'status-bloqueado';
            icone = '🔒';
            texto = 'Bloqueado';
          } else {
            classe = 'status-nao-configurado';
            icone = '⚙️';
            texto = 'Configurar';
          }
          
          return (
            <button
              key={idx}
              className={`calendario-dia ${classe}`}
              onClick={() => dia.isMesAtual && abrirConfiguracaoDia(dia.data)}
              disabled={!dia.isMesAtual}
            >
              <span className="dia-numero">{dia.numero}</span>
              <span className="status-icone">{icone}</span>
              <span className="status-texto">{texto}</span>
            </button>
          );
        })}
      </div>

      {/* Modal / Formulário de configuração do dia */}
      {diaSelecionado && (
        <div className="modal-overlay" onClick={fecharConfiguracao}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Configurar dia: {diaSelecionado}</h3>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={configDiaEdit.ativo}
                  onChange={(e) => setConfigDiaEdit({...configDiaEdit, ativo: e.target.checked})}
                />
                Dia disponível para agendamento
              </label>
            </div>
            
            {configDiaEdit.ativo && (
              <>
                <div className="form-group">
                  <label>Horário de início:</label>
                  <input
                    type="time"
                    value={configDiaEdit.horarioInicio}
                    onChange={(e) => setConfigDiaEdit({...configDiaEdit, horarioInicio: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Horário de fim:</label>
                  <input
                    type="time"
                    value={configDiaEdit.horarioFim}
                    onChange={(e) => setConfigDiaEdit({...configDiaEdit, horarioFim: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Intervalo entre agendamentos (min):</label>
                  <select
                    value={configDiaEdit.intervaloMinutos}
                    onChange={(e) => setConfigDiaEdit({...configDiaEdit, intervaloMinutos: parseInt(e.target.value)})}
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="modal-buttons">
              <button onClick={salvarConfiguracaoDia} className="btn-save">Salvar</button>
              <button onClick={fecharConfiguracao} className="btn-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}