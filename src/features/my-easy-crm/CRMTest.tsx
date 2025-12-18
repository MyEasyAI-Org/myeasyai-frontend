// =============================================
// MyEasyCRM - Página de Teste
// =============================================
// Este arquivo é para testar o CRM isoladamente.
// Remova após integrar ao projeto principal.
// =============================================

import { MyEasyCRM } from './MyEasyCRM';

export function CRMTest() {
  return (
    <MyEasyCRM
      userName="Usuário Teste"
      userEmail="teste@myeasyai.com"
      onLogout={() => {
        console.log('Logout clicado');
        alert('Função de logout - conectar ao sistema de autenticação');
      }}
      onBackToMain={() => {
        console.log('Voltar clicado');
        window.history.back();
      }}
    />
  );
}

export default CRMTest;
