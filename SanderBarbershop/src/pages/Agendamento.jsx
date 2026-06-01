import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import '../styles/Agendamento.css';

export function Agendamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [servico, setServico] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  // Buscar dados do serviço
  useEffect(() => {
    const carregarServico = async () => {
      const docRef = doc(db, 'servicos', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setServico({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    carregarServico();
  }, [id]);

  // Carregar configurações da barbearia
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      const docRef = doc(db, 'config', 'horarios');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    };
    carregarConfiguracoes();
  }, []);

  // Buscar horários ocupados quando mudar a data
  useEffect(() => {
    if (dataSelecionada) {
      carregarHorariosOcupados();
    }
  }, [dataSelecionada]);

  const carregarHorariosOcupados = async () => {
    const q = query(
      collection(db, 'agendamentos'),
      where('data', '==', dataSelecionada),
      where('servicoId', '==', id)
    );
    const querySnapshot = await getDocs(q);
    const ocupados = [];
    querySnapshot.forEach((doc) => {
      ocupados.push(doc.data().horario);
    });
    setHorariosOcupados(ocupados);
  };

  // Gerar horários baseado na configuração
  const gerarHorarios = () => {
    if (!config) return [];
    
    const horarios = [];
    const inicio = config.horarioInicio || '09:00';
    const fim = config.horarioFim || '18:00';
    const intervalo = config.intervaloMinutos || 30;
    
    const inicioMin = parseInt(inicio.split(':')[0]) * 60 + parseInt(inicio.split(':')[1]);
    const fimMin = parseInt(fim.split(':')[0]) * 60 + parseInt(fim.split(':')[1]);
    
    for (let min = inicioMin; min < fimMin; min += intervalo) {
      const horas = Math.floor(min / 60);
      const minutos = min % 60;
      const horarioStr = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      horarios.push(horarioStr);
    }
    
    return horarios;
  };

  const handleAgendar = async () => {
    if (!user) {
      toast.error('Faça login para agendar!');
      navigate('/');
      return;
    }

    if (!dataSelecionada) {
      toast.error('Selecione uma data!');
      return;
    }

    if (!horarioSelecionado) {
      toast.error('Selecione um horário!');
      return;
    }

    try {
      await addDoc(collection(db, 'agendamentos'), {
        servicoId: id,
        servicoNome: servico.nome,
        servicoPreco: servico.preco,
        clienteId: user.uid,
        clienteNome: user.displayName,
        clienteEmail: user.email,
        data: dataSelecionada,
        horario: horarioSelecionado,
        status: 'pendente',
        createdAt: new Date()
      });

      toast.success('Agendamento realizado com sucesso!');
      navigate('/meus-agendamentos');
    } catch (error) {
      console.error('Erro ao agendar:', error);
      toast.error('Erro ao realizar agendamento');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (!servico) return <div className="loading">Serviço não encontrado!</div>;

  // Gerar próximos dias (baseado na configuração)
  const gerarDatas = () => {
    if (!config) return [];
    
    const datas = [];
    let diasAdicionados = 0;
    let diasPulados = 0;
    
    while (diasAdicionados < 14) {
      const data = new Date();
      data.setDate(data.getDate() + diasPulados);
      let diaSemana = data.getDay();
      let diaNumero = diaSemana === 0 ? 7 : diaSemana;
      
      if (config.diasFuncionamento && config.diasFuncionamento.includes(diaNumero)) {
        const dataString = data.toISOString().split('T')[0];
        const diaSemanaNome = data.toLocaleDateString('pt-BR', { weekday: 'short' });
        const diaMes = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        datas.push({ value: dataString, label: `${diaSemanaNome} ${diaMes}`, data });
        diasAdicionados++;
      }
      diasPulados++;
    }
    return datas;
  };

  const datasDisponiveis = gerarDatas();
  const horariosDisponiveis = gerarHorarios();

  return (
    <div className="agendamento-container">
      <div className="agendamento-card">
        <h1>Agendar {servico.nome}</h1>
        <p className="servico-preco">R$ {servico.preco}</p>
        
        {/* Seleção de Data */}
        <div className="secao">
          <h3>📅 Selecione uma data</h3>
          {datasDisponiveis.length === 0 ? (
            <p>Nenhuma data disponível no momento.</p>
          ) : (
            <div className="datas-grid">
              {datasDisponiveis.map((data) => (
                <button
                  key={data.value}
                  className={`data-botao ${dataSelecionada === data.value ? 'selecionado' : ''}`}
                  onClick={() => {
                    setDataSelecionada(data.value);
                    setHorarioSelecionado('');
                  }}
                >
                  <span className="dia-semana">{data.label.split(' ')[0]}</span>
                  <span className="dia-mes">{data.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Seleção de Horário */}
        {dataSelecionada && (
          <div className="secao">
            <h3>⏰ Selecione um horário</h3>
            {horariosDisponiveis.length === 0 ? (
              <p>Nenhum horário disponível para hoje.</p>
            ) : (
              <div className="horarios-grid">
                {horariosDisponiveis.map((horario) => {
                  const estaOcupado = horariosOcupados.includes(horario);
                  return (
                    <button
                      key={horario}
                      className={`horario-botao ${horarioSelecionado === horario ? 'selecionado' : ''} ${estaOcupado ? 'ocupado' : ''}`}
                      onClick={() => !estaOcupado && setHorarioSelecionado(horario)}
                      disabled={estaOcupado}
                    >
                      {horario}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Botão Confirmar */}
        {dataSelecionada && horarioSelecionado && (
          <div className="secao">
            <button className="btn-confirmar" onClick={handleAgendar}>
              ✅ Confirmar Agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}