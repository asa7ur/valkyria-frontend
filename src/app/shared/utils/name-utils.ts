// "Senda del Guerrero (Abono General)" -> título "Senda del Guerrero" y subtítulo "Abono General".
// Sin expresión regular: una con grupos perezosos puede disparar el backtracking (SonarQube S5852).
export function splitName(name: string): {title: string; subtitle: string | null} {
  const trimmed = name.trim();
  const open = trimmed.lastIndexOf('(');
  if (open <= 0 || !trimmed.endsWith(')')) {
    return {title: trimmed, subtitle: null};
  }
  const subtitle = trimmed.slice(open + 1, -1).trim();
  return subtitle ? {title: trimmed.slice(0, open).trim(), subtitle} : {title: trimmed, subtitle: null};
}
