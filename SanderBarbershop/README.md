# ✂️ Sander Barbershop - Sistema de Agendamento para Barbearia

Sistema completo de agendamento online para barbearias, com painel administrativo, gestão de serviços, pacotes, calendário flexível e autenticação via Google.

## 🚀 Funcionalidades

### 👤 Cliente
- Login com conta Google
- Visualizar serviços e pacotes
- Agendar horários com seleção de data/horário
- Visualizar meus agendamentos

### 👑 Administrador
- **Gestão de Serviços**: Cadastrar, editar e deletar serviços (nome, descrição, preço)
- **Gestão de Pacotes**: Criar combos com múltiplos serviços e desconto automático
- **Calendário Dinâmico**: 
  - Configurar horário de funcionamento por dia individualmente
  - Bloquear dias específicos (feriados, férias)
  - Visualizar calendário mensal com status de cada dia
- **Dashboard de Agendamentos**: Visualizar todos os agendamentos

### ⏰ Sistema de Agendamento
- Seleção de data (calendário visual)
- Horários disponíveis em intervalos configuráveis
- Bloqueio automático de horários já ocupados
- Validação de disponibilidade em tempo real

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| **React 18** | Interface do usuário |
| **Vite** | Build e desenvolvimento rápido |
| **Firebase** | Autenticação (Google), Banco de dados (Firestore), Hospedagem |
| **React Router DOM** | Navegação entre páginas |
| **React Hot Toast** | Notificações e alerts |
| **CSS Modules** | Estilização componentizada |

## 📦 Estrutura do Banco de Dados (Firestore)

```javascript
// Coleções principais
servicos       // Serviços oferecidos
pacotes        // Combos com desconto
agendamentos   // Todos os agendamentos
configDias     // Configuração individual por dia (horários/bloqueios)

🗂️ Estrutura de Pastas

src/
├── components/        # Componentes reutilizáveis
│   ├── ListaServicos.jsx
│   ├── ListaPacotes.jsx
│   └── ...
├── pages/            # Páginas da aplicação
│   ├── Admin.jsx           # Gestão de serviços
│   ├── AdminPacotes.jsx    # Gestão de pacotes
│   ├── AdminConfig.jsx     # Calendário/configurações
│   ├── Agendamento.jsx     # Página de agendamento
│   └── MeusAgendamentos.jsx
├── contexts/         # Contextos React
│   └── AuthContext.jsx     # Autenticação
├── services/         # Configurações dos serviços
│   ├── firebase.js         # Config Firebase
│   └── supabase.js         # Config Supabase (para fotos)
├── styles/           # Estilos CSS
│   ├── global.css
│   ├── Navbar.css
│   ├── AdminConfig.css
│   └── ...
└── App.jsx           # Rotas principais

🔧 Instalação e Configuração
1. Clone o repositório

git clone https://github.com/seu-usuario/sanderbarbershop.git
cd sanderbarbershop

2. Instale as dependências

npm install

3. Configure as variáveis de ambiente

Crie um arquivo .env na raiz:

VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

4. Configure o Firebase

    Crie um projeto no Firebase Console

    Ative Authentication (Google Sign-in)

    Crie um Firestore Database

    Copie as credenciais para src/services/firebase.js
    
5. Execute o projeto

npm run dev

🔒 Regras de Segurança (Firestore)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /servicos/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "admin@email.com";
    }
    match /pacotes/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "admin@email.com";
    }
    match /agendamentos/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /configDias/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "admin@email.com";
    }
  }
}

🎯 Como Usar
Cliente

    Acesse o site

    Faça login com Google

    Escolha um serviço ou pacote

    Selecione data e horário disponível

    Confirme o agendamento

Administrador

    Faça login com a conta de administrador (email configurado)

    Acesse o painel administrativo

    Cadastre serviços e pacotes

    Configure o calendário (dias/horários)

    Visualize os agendamentos dos clientes

📱 Funcionalidades em Desenvolvimento

    Upload de fotos para serviços (Supabase Storage)

    Sistema de pagamento com Pix (split 3%)

    Notificações por email/WhatsApp

    Dashboard com gráficos

    Agendamento para múltiplos serviços no mesmo horário

🤝 Contribuição

Contribuições são bem-vindas! Siga os passos:

    Fork o projeto

    Crie sua branch (git checkout -b feature/nova-feature)

    Commit suas mudanças (git commit -m 'Adiciona nova feature')

    Push para a branch (git push origin feature/nova-feature)

    Abra um Pull Request

    ⚙️ Variáveis de Ambiente Necessárias
env

# Supabase (para armazenamento de imagens)
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave

# Firebase (configurações automáticas via SDK)
# As credenciais são configuradas diretamente no firebase.js

📄 Licença

Este projeto está sob a licença GNU General Public License v3.0 (GPL-3.0).

🚨 Troubleshooting
Erro de permissão no Firestore

    Verifique as regras de segurança no Firebase Console

    Certifique-se de que o usuário está autenticado

Calendário não carrega

    Verifique se a coleção configDias existe no Firestore

    Confirme as regras de leitura/escrita

Login com Google não funciona

    Verifique se o provedor está ativado no Firebase Console

    Confirme as configurações do OAuth

Desenvolvido com ❤️ para barbearias que querem modernizar seus agendamentos