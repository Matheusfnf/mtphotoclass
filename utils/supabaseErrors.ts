import { AuthError } from '@supabase/supabase-js';

export function handleSupabaseError(error: AuthError | Error | unknown): string {
  if (!error) return 'Ocorreu um erro inesperado';

  // Converte o erro para string para facilitar a verificação
  const errorMessage = error.toString().toLowerCase();
  const errorDetails = (error as any)?.message?.toLowerCase() || '';

  // Erros de validação de email
  if (errorMessage.includes('unable to validate email') || 
      errorDetails.includes('invalid format')) {
    return 'O email informado não é válido';
  }

  // Erros de credenciais
  if (errorMessage.includes('invalid login credentials') ||
      errorDetails.includes('invalid login credentials')) {
    return 'Email ou senha incorretos';
  }

  // Erros de email já existente
  if (errorMessage.includes('user already registered') ||
      errorDetails.includes('already registered')) {
    return 'Este email já está cadastrado';
  }

  // Erros de senha fraca
  if (errorMessage.includes('weak password') ||
      errorDetails.includes('password should be')) {
    return 'A senha deve ter pelo menos 6 caracteres';
  }

  // Erros de email não confirmado
  if (errorMessage.includes('email not confirmed') ||
      errorDetails.includes('email not confirmed')) {
    return 'Por favor, confirme seu email antes de fazer login';
  }

  // Erros de rate limit
  if (errorMessage.includes('too many requests') ||
      errorDetails.includes('too many requests')) {
    return 'Muitas tentativas. Por favor, aguarde alguns minutos';
  }

  // Erros de conexão
  if (errorMessage.includes('network') ||
      errorDetails.includes('network')) {
    return 'Erro de conexão. Verifique sua internet';
  }

  // Erro padrão
  return 'Ocorreu um erro. Por favor, tente novamente';
}
