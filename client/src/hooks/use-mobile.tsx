import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook para detectar se o dispositivo atual é um dispositivo móvel
 * Incluindo detecção específica para iPhone e outros dispositivos Apple
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isIOS, setIsIOS] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Detectar tamanho de tela mobile
    const detectMobileScreen = () => {
      return window.innerWidth < MOBILE_BREAKPOINT;
    };

    // Detectar dispositivo móvel baseado no user agent
    const detectMobileDevice = () => {
      const ua = navigator.userAgent;
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    };

    // Detectar especificamente dispositivos iOS
    const detectIOS = () => {
      const ua = navigator.userAgent;
      return /iPhone|iPad|iPod/i.test(ua) || 
             (ua.includes('Mac') && 'ontouchend' in document);
    };

    // Atualizar estados
    const updateMobileState = () => {
      const isMobileScreen = detectMobileScreen();
      const isMobileDevice = detectMobileDevice();
      const iosDevice = detectIOS();
      
      setIsMobile(isMobileScreen || isMobileDevice);
      setIsIOS(iosDevice);
    };

    // Observar mudanças de tamanho de tela
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", updateMobileState)
    
    // Inicialização
    updateMobileState();
    
    return () => mql.removeEventListener("change", updateMobileState)
  }, [])

  return !!isMobile;
}

/**
 * Hook para detectar especificamente dispositivos iOS (iPhone, iPad)
 */
export function useIsIOS() {
  const [isIOS, setIsIOS] = React.useState<boolean>(false)

  React.useEffect(() => {
    const ua = navigator.userAgent;
    const iosDevice = /iPhone|iPad|iPod/i.test(ua) || 
                     (ua.includes('Mac') && 'ontouchend' in document);
    setIsIOS(iosDevice);
  }, []);

  return isIOS;
}

/**
 * Hook para verificar se o MetaMask está disponível
 */
export function useIsMetaMaskAvailable() {
  const [isAvailable, setIsAvailable] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    const checkMetaMask = () => {
      return typeof window !== 'undefined' && 
             typeof window.ethereum !== 'undefined' &&
             (window.ethereum.isMetaMask || false);
    };
    
    setIsAvailable(checkMetaMask());
    
    // Recheck if window is resized (useful for browsers with dev tools)
    window.addEventListener('resize', () => setIsAvailable(checkMetaMask()));
    
    return () => {
      window.removeEventListener('resize', () => setIsAvailable(checkMetaMask()));
    };
  }, []);
  
  return isAvailable;
}
