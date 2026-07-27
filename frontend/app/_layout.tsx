import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
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

const baseFonts = tamaguiDefaultConfig.fonts || {};
const config = createTamagui({
  ...tamaguiDefaultConfig,
  fonts: {
    ...baseFonts,
    ...(baseFonts.heading ? { heading: { ...baseFonts.heading, family: 'Oswald_700Bold' } } : {}),
    ...(baseFonts.body ? { body: { ...baseFonts.body, family: 'Manrope_500Medium' } } : {}),
  },
});

function WebStyleReset() {
  if (Platform.OS !== 'web') return null;
  const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap');
input:focus,textarea:focus{outline:none!important}
html,body,#root,div,span,p,a,button,input,textarea,li{font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
h1,h2,h3,h4,h5,h6{font-family:'Oswald','Manrope',sans-serif!important;letter-spacing:0.5px;}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export default function RootLayout() {
  useFrameworkReady();
  useFonts({
    Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold,
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });

  return (
    <BlinkProvider config={config} defaultTheme="dark">
      <Theme name="dark">
        <QueryClientProvider client={queryClient}>
          <BlinkToastProvider>
            <WebStyleReset />
            <Stack screenOptions={{ headerShown: false }}>
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
