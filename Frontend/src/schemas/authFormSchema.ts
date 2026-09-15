export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Issue = { path: Array<string | number>; message: string };
type SafeParseSuccess<T> = { success: true; data: T };
type SafeParseFailure = { success: false; error: { issues: Issue[] } };
type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

function trim(value: string): string {
  return value.trim();
}

function fail(issues: Issue[]): SafeParseFailure {
  return { success: false, error: { issues } };
}

export function isValidEmail(value: string): boolean {
  const email = trim(value);
  return (
    email.length > 0 &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function isValidPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 128;
}

function parseEmailField(value: string): SafeParseResult<string> {
  const email = trim(value);
  return isValidEmail(email)
    ? { success: true, data: email }
    : fail([{ path: [], message: "Enter a valid email." }]);
}

export const loginFormSchema = {
  shape: {
    email: { safeParse: parseEmailField },
  },
  safeParse(values: {
    email: string;
    password: string;
  }): SafeParseResult<LoginFormValues> {
    const issues: Issue[] = [];
    const email = trim(values.email);
    const password = values.password;

    if (!isValidEmail(email)) {
      issues.push({ path: ["email"], message: "Enter a valid email." });
    }

    if (password.length < 1 || password.length > 128) {
      issues.push({ path: ["password"], message: "Password is required." });
    }

    if (issues.length > 0) {
      return fail(issues);
    }

    return {
      success: true,
      data: { email, password },
    };
  },
};

export const registerFormSchema = {
  safeParse(values: RegisterFormValues): SafeParseResult<RegisterFormValues> {
    const issues: Issue[] = [];
    const firstName = trim(values.firstName);
    const lastName = trim(values.lastName);
    const email = trim(values.email);

    if (firstName.length < 1 || firstName.length > 80) {
      issues.push({ path: ["firstName"], message: "First name is required." });
    }

    if (lastName.length < 1 || lastName.length > 80) {
      issues.push({ path: ["lastName"], message: "Last name is required." });
    }

    if (!isValidEmail(email)) {
      issues.push({ path: ["email"], message: "Enter a valid email." });
    }

    if (!isValidPassword(values.password)) {
      issues.push({
        path: ["password"],
        message: "Password must be at least 8 characters.",
      });
    }

    if (values.confirmPassword.length < 1 || values.confirmPassword.length > 128) {
      issues.push({
        path: ["confirmPassword"],
        message: "Confirm your password.",
      });
    } else if (values.password !== values.confirmPassword) {
      issues.push({
        path: ["confirmPassword"],
        message: "Passwords must match.",
      });
    }

    if (issues.length > 0) {
      return fail(issues);
    }

    return {
      success: true,
      data: {
        firstName,
        lastName,
        email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      },
    };
  },
};

export const forgotRequestSchema = {
  shape: {
    email: { safeParse: parseEmailField },
  },
  safeParse(values: { email: string }): SafeParseResult<{ email: string }> {
    const email = parseEmailField(values.email);
    return email.success
      ? { success: true, data: { email: email.data } }
      : fail([{ path: ["email"], message: "Enter a valid email." }]);
  },
};

export const forgotResetSchema = {
  safeParse(values: {
    email: string;
    password: string;
    confirmPassword: string;
  }): SafeParseResult<{
    email: string;
    password: string;
    confirmPassword: string;
  }> {
    const issues: Issue[] = [];
    const email = trim(values.email);

    if (!isValidEmail(email)) {
      issues.push({ path: ["email"], message: "Enter a valid email." });
    }

    if (!isValidPassword(values.password)) {
      issues.push({
        path: ["password"],
        message: "Password must be at least 8 characters.",
      });
    }

    if (values.confirmPassword.length < 1 || values.confirmPassword.length > 128) {
      issues.push({
        path: ["confirmPassword"],
        message: "Confirm your password.",
      });
    } else if (values.password !== values.confirmPassword) {
      issues.push({
        path: ["confirmPassword"],
        message: "Passwords must match.",
      });
    }

    if (issues.length > 0) {
      return fail(issues);
    }

    return {
      success: true,
      data: {
        email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      },
    };
  },
};

export const changePasswordSchema = {
  safeParse(values: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }): SafeParseResult<{
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }> {
    const issues: Issue[] = [];

    if (values.currentPassword.length < 1 || values.currentPassword.length > 128) {
      issues.push({
        path: ["currentPassword"],
        message: "Current password is required.",
      });
    }

    if (!isValidPassword(values.nextPassword)) {
      issues.push({
        path: ["nextPassword"],
        message: "Password must be at least 8 characters.",
      });
    }

    if (values.confirmPassword.length < 1 || values.confirmPassword.length > 128) {
      issues.push({
        path: ["confirmPassword"],
        message: "Confirm your password.",
      });
    } else if (values.nextPassword !== values.confirmPassword) {
      issues.push({
        path: ["confirmPassword"],
        message: "Passwords must match.",
      });
    }

    if (issues.length > 0) {
      return fail(issues);
    }

    return { success: true, data: values };
  },
};

export function passwordStrengthLabel(password: string): string {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1;
  }

  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 1) {
    return "Weak";
  }

  if (score === 2) {
    return "Fair";
  }

  if (score === 3) {
    return "Good";
  }

  return "Strong";
}

export function passwordStrengthPercent(password: string): number {
  const label = passwordStrengthLabel(password);

  if (password.length === 0) {
    return 0;
  }

  if (label === "Weak") {
    return 25;
  }

  if (label === "Fair") {
    return 50;
  }

  if (label === "Good") {
    return 75;
  }

  return 100;
}
