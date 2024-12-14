interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Por favor, digite seu email' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Por favor, digite um email válido' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Por favor, digite sua senha' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
  }

  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: 'Por favor, digite seu nome' };
  }

  if (name.length < 2) {
    return { isValid: false, message: 'O nome deve ter pelo menos 2 caracteres' };
  }

  return { isValid: true };
};

export const getAuthErrorMessage = (error: any): string => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('invalid login credentials')) {
    return 'Email ou senha incorretos. Por favor, tente novamente.';
  }
  
  if (errorMessage.includes('user not found')) {
    return 'Usuário não encontrado. Que tal criar uma conta?';
  }
  
  if (errorMessage.includes('email already exists')) {
    return 'Este email já está cadastrado. Por favor, faça login.';
  }

  if (errorMessage.includes('invalid email')) {
    return 'Este email não parece válido. Que tal verificar?';
  }

  if (errorMessage.includes('weak password')) {
    return 'Sua senha precisa ser mais forte. Use pelo menos 6 caracteres.';
  }

  return 'Ops! Algo deu errado. Por favor, tente novamente.';
};
