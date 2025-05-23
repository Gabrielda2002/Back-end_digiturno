// Función para generar un número de turno basado en el prefijo y el último número
export const generateTurnoNumber = (prefix: string, lastNumber: number = 0): string => {
  // Incrementar el número
  const nextNumber = lastNumber + 1;
  
  // Convertir a cadena y agregar ceros a la izquierda
  // Ejemplo: 1 -> "001", 25 -> "025"
  const numberStr = nextNumber.toString().padStart(3, '0');
  
  // Concatenar prefijo con número
  return `${prefix}${numberStr}`;
};

// Función para calcular el tiempo de espera en minutos
export const calculateWaitTime = (creationDate: Date): number => {
  const now = new Date();
  const diffMs = now.getTime() - creationDate.getTime();
  return Math.floor(diffMs / 60000); // Convertir ms a minutos
};

// Función para obtener un nombre corto para el turno (mostrar en pantalla)
export const getShortTurnoName = (numeroTurno: string): string => {
  // Implementación específica según tus necesidades
  // Ejemplo: Si el formato es "CM001", podrías retornar solo "001"
  // O podrías retornar el prefijo y el número "CM-001"
  return numeroTurno;
};
