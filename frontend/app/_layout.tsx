import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlinkProvider, createTamagui, tamaguiDefaultConfig, Theme, BlinkToastProvider } from '@blinkdotnew/mobile-ui';
import { useFonts, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const STACK_OPTIONS = { headerShown: false } as const;

const FONT_CSS = `input:focus,textarea:focus{outline:none!important}
html,body,#root,div,span,p,a,button,input,textarea,li{font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
h1,h2,h3,h4,h5,h6{font-family:'Oswald','Manrope',sans-serif!important;letter-spacing:0.5px;}`;

const baseFonts = tamaguiDefaultConfig.fonts || {};
const config = createTamagui({
  ...tamaguiDefaultConfig,
  fonts: {
    ...baseFonts,
    ...(baseFonts.heading ? { heading: { ...baseFonts.heading, family: 'Oswald_700Bold' } } : {}),
    ...(baseFonts.body ? { body: { ...baseFonts.body, family: 'Manrope_500Medium' } } : {}),
  },
});

// Inject fonts + resets via the DOM (web only) using textContent — no dangerouslySetInnerHTML.
function useWebFonts() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.getElementById('gt-web-fonts')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
    const style = document.createElement('style');
    style.id = 'gt-web-fonts';
    style.textContent = FONT_CSS;
    document.head.appendChild(style);
  }, []);
}

export default function RootLayout() {
  useFrameworkReady();
  useWebFonts();
  useFonts({
    Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold,
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });

  return (
    <BlinkProvider config={config} defaultTheme="dark">
      <Theme name="dark">
        <QueryClientProvider client={queryClient}>
          <BlinkToastProvider>
            <Stack screenOptions={STACK_OPTIONS}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="session/[id]" />
              <Stack.Screen name="session/new" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </BlinkToastProvider>
        </QueryClientProvider>
      </Theme>
    </BlinkProvider>
  );
}
