export function getEnergyStatus(mealKJ: number, targetKJ: number): 'meets' | 'below' | 'above' {
  if (targetKJ === 0) return 'meets'; // 防止除以0错误
  const ratio = (mealKJ - targetKJ) / targetKJ;

  if (Math.abs(ratio) <= 0.1) return 'meets';   
  if (ratio < -0.1) return 'below';              
  return 'above';                                
}
