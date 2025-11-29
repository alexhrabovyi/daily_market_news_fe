export function emailValidator(subject: string) {
  const errors: string[] = [];

  if (!subject) {
    errors.push("Email обов'язковий");
  } else if (subject.length > 254) {
    errors.push('Максимальна довжина email - 254 символи');
  } else if (!/^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(subject)) {
    errors.push('Невірний формат email');
  }

  return errors;
}

export function passwordValidator(subject: string) {
  const errors: string[] = [];

  if (!subject) {
    errors.push("Пароль обов'язковий");
  } else if (subject.length < 8) {
    errors.push('Пароль має бути не менше 8 символів');
  } else if (subject.length > 32) {
    errors.push('Пароль має бути не більше 32 символів');
  } else if (/^\d+$/.test(subject)) {
    errors.push('Пароль не може складатися лише з чисел');
  } else if (/^\s+$/.test(subject)) {
    errors.push('Пароль не може складатися лише з пробілів');
  } else if (/^[^a-zA-Z0-9\s]+$/.test(subject)) {
    errors.push('Пароль не може складатися лише зі спец. символів');
  }

  return errors;
}

export function confirmPasswordValidator(password: string, confirmPassword: string) {
  const errors: string[] = [];

  if (!confirmPassword) {
    errors.push("Підтвердження паролю обов'язкове");
  } else if (password !== confirmPassword) {
    errors.push('Паролі не співпадають');
  }

  return errors;
}

export function fistNameLastNameValidator(subject: string, isFirstName = true) {
  const FIRSTNAME_LASTNAME_REGEXP = /^[\p{L}\p{M}'\u2019\- ]{2,100}$/u;

  const errors: string[] = [];

  if (!subject) {
    errors.push(`${isFirstName ? 'Ім\'я' : 'Прізвище'} обов'язкове`);
  } else if (subject.length < 2) {
    errors.push(`Мінімальна довжина ${isFirstName ? 'імені' : 'прізвища'} - 2 символи`);
  } else if (subject.length > 100) {
    errors.push(`Максимальна довжина ${isFirstName ? 'імені' : 'прізвища'} - 100 символи`);
  } else if (!FIRSTNAME_LASTNAME_REGEXP.test(subject)) {
    errors.push(`${isFirstName ? 'Ім\'я' : 'Прізвище'} може складатися лише с букв, пробілів, апострофів та дефісів`);
  }

  return errors;
}
