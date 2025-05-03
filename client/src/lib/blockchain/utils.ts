/**
 * Formata um valor de token BigInt para uma string legível por humanos
 * @param amount Valor em wei (10^18)
 * @returns String formatada
 */
export function formatTokenAmount(amount: bigint): string {
  if (amount === BigInt(0)) return '0';
  
  const divisor = BigInt(10**18);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }
  
  let fractionalStr = fractionalPart.toString().padStart(18, '0');
  // Remove zeros à direita
  fractionalStr = fractionalStr.replace(/0+$/, '');
  
  if (integerPart === BigInt(0)) {
    return `0.${fractionalStr}`;
  }
  
  return `${integerPart}.${fractionalStr}`;
}

/**
 * Converte uma string de valor de token para BigInt em wei
 * @param amount String representando o valor do token
 * @returns Valor em wei como BigInt
 */
export function parseTokenAmount(amount: string): bigint {
  if (!amount || isNaN(Number(amount))) return BigInt(0);
  
  try {
    // Converte para número com 18 casas decimais
    const multiplier = 10**18;
    const value = parseFloat(amount) * multiplier;
    return BigInt(Math.floor(value));
  } catch (error) {
    console.error("Erro ao converter valor de token:", error);
    return BigInt(0);
  }
}

/**
 * Formata um endereço Ethereum para exibição abreviada
 * @param address Endereço completo
 * @param prefixLength Número de caracteres no prefixo
 * @param suffixLength Número de caracteres no sufixo
 * @returns Endereço formatado
 */
export function formatAddress(
  address: string, 
  prefixLength: number = 6, 
  suffixLength: number = 4
): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  
  const prefix = address.substring(0, prefixLength);
  const suffix = address.substring(address.length - suffixLength);
  
  return `${prefix}...${suffix}`;
}