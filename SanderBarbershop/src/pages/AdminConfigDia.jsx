import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import '../styles/AdminConfigDia.css';

export function AdminConfigDia() {
  const { data } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [configDia, setConfigDia] = useState({
    data: data,
    ativo: true,
    horarioInicio: '09:00',
    horarioFim: '18:00',
    intervaloMinutos: 30,
    observacao: ''
  });

  const isAdmin = user?.email === "narutex216bits@gmail.com";

  useEffect(() => {
    if (user && !isAdmin) {
      toast.error('Acesso negado!');
      navigate('/admin/config');
    } else if (isAdmin) {
      carregarConfiguracaoDia();
    }
  }, [user, isAdmin, data]);

  const carregarConfiguracaoDia = async () => {
    try {
      const docRef = doc(db, 'configDias', data);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfigDia(docSnap.data());
      }
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await setDoc(doc(db, 'configDias', data), {
        ...configDia,
        atualizadoEm: new Date()
      });
      toast.success(`Configurações do dia ${data} salvas com sucesso!`);
      navigate('/admin/config');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
    }
  };

  const formatarData = (dataString) => {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  if (!user || !isAdmin) {
    return null;
  }

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="config-dia-container">
      <button onClick={() => navigate('/admin/config')} className="btn-back">
        ← Voltar ao Calendário
      </button>
      
      <div className="config-dia-card">
        <h1>⚙️ Configurar Dia: {formatarData(data)}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={configDia.ativo}
                  onChange={(e) => setConfigDia({...configDia, ativo: e.target.checked})}
                />
                📅 Dia disponível para agendamentos
              </label>
            </div>
          </div>

          {configDia.ativo && (
            <>
              <div className="form-section">
                <h3>⏰ Horário de Funcionamento</h3>
                <div className="horarios-row">
                  <div className="form-group">
                    <label>Abrir às:</label>
                    <input
                      type="time"
                      value={configDia.horarioInicio}
                      onChange={(e) => setConfigDia({...configDia, horarioInicio: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fechar às:</label>
                    <input
                      type="time"
                      value={configDia.horarioFim}
                      onChange={(e) => setConfigDia({...configDia, horarioFim: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>⚡ Configurações Adicionais</h3>
                <div className="form-group">
                  <label>Intervalo entre agendamentos:</label>
                  <select
                    value={configDia.intervaloMinutos}
                    onChange={(e) => setConfigDia({...configDia, intervaloMinutos: parseInt(e.target.value)})}
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>📝 Observação (opcional)</h3>
                <div className="form-group">
                  <textarea
                    value={configDia.observacao}
                    onChange={(e) => setConfigDia({...configDia, observacao: e.target.value})}
                    placeholder="Ex: Feriado - funcionamento especial das 09h às 13h"
                    rows="3"
                  />
                </div>
              </div>
            </>
          )}

          {!configDia.ativo && (
            <div className="aviso-bloqueio">
              <p>🔒 Este dia está bloqueado. Os clientes não poderão agendar.</p>
            </div>
          )}

          <div className="botoes">
            <button type="submit" className="btn-save">
              💾 Salvar Configuração
            </button>
            <button type="button" onClick={() => navigate('/admin/config')} className="btn-cancel">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}