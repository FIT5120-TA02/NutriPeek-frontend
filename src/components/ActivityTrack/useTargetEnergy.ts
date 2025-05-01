export function getEnergyStatus(mealKJ: number, targetKJ: number): 'meets' | 'below' | 'above' {
  if (targetKJ === 0) return 'meets'; 
  const ratio = (mealKJ - targetKJ) / targetKJ;

  if (Math.abs(ratio) <= 0.1) return 'meets';   
  if (ratio < -0.1) return 'below';              
  return 'above';                                
}

