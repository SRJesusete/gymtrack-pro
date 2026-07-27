import { useState } from 'react';
import { ScrollView } from 'react-native';
import {
  YStack, XStack, H2, H3, H4, Paragraph, Button, Card,
  Input, Theme, Spinner, toast, Avatar, Divider,
} from '@blinkdotnew/mobile-ui';
import { User, LogOut, Mail, Shield, Dumbbell, Calendar, Award } from '@blinkdotnew/mobile-ui';
import { useAuth } from '@/hooks/useAuth';
import { useSessions, usePersonalRecords } from '@/hooks/useDatabase';

export default function ProfileScreen() {
  const { user, isLoading: authLoading, isAuthenticated, signUp, signIn, signOut } = useAuth();
  const { data: sessions } = useSessions(user?.id || null);
  const { data: records } = usePersonalRecords(user?.id || null);

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const handleAuth = async () => {
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('Completa todos los campos');
      return;
    }
    if (authMode === 'signup' && password !== confirmPassword) {
      setAuthError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setAuthBusy(true);
    try {
      if (authMode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
      toast(authMode === 'signin' ? 'Sesión iniciada' : 'Cuenta creada', { variant: 'success' });
    } catch (e: any) {
      setAuthError(e?.message || 'Error al autenticar');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast('Sesión cerrada', { variant: 'success' });
  };

  if (authLoading) {
    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1" justifyContent="center" alignItems="center">
          <Spinner size="large" color="$color9" />
        </YStack>
      </Theme>
    );
  }

  // -- AUTHENTICATED VIEW --
  if (isAuthenticated && user) {
    const totalSessions = sessions?.length || 0;
    const totalVolume = sessions?.reduce((sum, s) => sum + s.totalVolume, 0) || 0;
    const totalPRs = records?.length || 0;
    const lastSession = sessions?.[0];

    return (
      <Theme name="dark">
        <YStack flex={1} backgroundColor="$color1">
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <YStack padding="$4" paddingTop="$6" gap="$2">
              <H2 color="$color12" fontWeight="800">Perfil</H2>
            </YStack>

            {/* User Card */}
            <Card bordered padding="$6" margin="$4" borderRadius="$4" backgroundColor="$color2" alignItems="center" gap="$3">
              <Avatar size="$9" circular backgroundColor="$color9">
                <User size={40} color="white" />
              </Avatar>
              <YStack alignItems="center" gap="$1">
                <H3 color="$color12">{user.email || 'Usuario'}</H3>
                <Paragraph size="$2" color="$color10">
                  Miembro desde {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </Paragraph>
              </YStack>

              {/* Quick Stats */}
              <XStack gap="$4" marginTop="$2">
                <YStack alignItems="center" gap="$1">
                  <Dumbbell size={20} color="$color9" />
                  <H4 color="$color12" fontWeight="800">{totalSessions}</H4>
                  <Paragraph size="$1" color="$color10">Sesiones</Paragraph>
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <Award size={20} color="$orange9" />
                  <H4 color="$color12" fontWeight="800">{totalPRs}</H4>
                  <Paragraph size="$1" color="$color10">PRs</Paragraph>
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <Calendar size={20} color="$color9" />
                  <H4 color="$color12" fontWeight="800">
                    {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}k` : '0'}
                  </H4>
                  <Paragraph size="$1" color="$color10">kg totales</Paragraph>
                </YStack>
              </XStack>
            </Card>

            {/* Last session */}
            {lastSession && (
              <YStack paddingHorizontal="$4" gap="$2">
                <H4 color="$color11">Último entreno</H4>
                <Card bordered padding="$4" borderRadius="$4" backgroundColor="$color2">
                  <Paragraph fontWeight="700" color="$color12">{lastSession.name}</Paragraph>
                  <XStack gap="$3" marginTop="$1">
                    <Paragraph size="$2" color="$color10">
                      {new Date(lastSession.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </Paragraph>
                    <Paragraph size="$2" color="$color9">{lastSession.totalVolume.toLocaleString()} kg</Paragraph>
                  </XStack>
                </Card>
              </YStack>
            )}

            {/* Sign Out */}
            <YStack padding="$4" marginTop="$4">
              <Button
                variant="outline"
                width="100%"
                onPress={handleSignOut}
                icon={<LogOut size={18} color="$red9" />}
                borderColor="$red9"
              >
                <Paragraph color="$red9">Cerrar Sesión</Paragraph>
              </Button>
            </YStack>
          </ScrollView>
        </YStack>
      </Theme>
    );
  }

  // -- UNAUTHENTICATED VIEW --
  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor="$color1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
          <YStack padding="$4" paddingTop="$6" paddingBottom="$2" gap="$2">
            <H2 color="$color12" fontWeight="800">Cuenta</H2>
            <Paragraph color="$color10">
              Inicia sesión para guardar tus entrenamientos y seguir tu progreso
            </Paragraph>
          </YStack>

          {/* Auth Form */}
          <YStack padding="$4" gap="$4">
            <Card bordered padding="$6" borderRadius="$4" backgroundColor="$color2" alignItems="center" gap="$4">
              <YStack
                width={72}
                height={72}
                borderRadius={36}
                backgroundColor="$color3"
                justifyContent="center"
                alignItems="center"
              >
                <Shield size={36} color="$color9" />
              </YStack>
              <H3 color="$color12" textAlign="center">
                {authMode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </H3>
              <Paragraph size="$2" color="$color10" textAlign="center">
                {authMode === 'signin'
                  ? 'Accede a tu historial y estadisticas'
                  : 'Registrate para empezar a registrar tus entrenos'}
              </Paragraph>
            </Card>

            <YStack gap="$3">
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                size="$4"
                data-testid="auth-email-input"
              />
              <Input
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                size="$4"
                data-testid="auth-password-input"
              />
              {authMode === 'signup' && (
                <Input
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  size="$4"
                  data-testid="auth-confirm-input"
                />
              )}
              {authError ? (
                <Card padding="$3" backgroundColor="$red2" borderRadius="$3">
                  <Paragraph size="$2" color="$red10" data-testid="auth-error">{authError}</Paragraph>
                </Card>
              ) : null}

              <Button
                width="100%"
                size="$5"
                borderRadius={999}
                backgroundColor="#D4FF00"
                color="#000000"
                fontWeight="900"
                pressStyle={{ backgroundColor: '#BEE600', scale: 0.98 }}
                onPress={handleAuth}
                disabled={authBusy}
                icon={authBusy ? <Spinner size="small" /> : <Mail size={18} color="#000000" />}
                data-testid="auth-submit-btn"
              >
                {authBusy
                  ? 'Procesando...'
                  : authMode === 'signin'
                    ? 'Iniciar Sesión'
                    : 'Crear Cuenta'}
              </Button>

              <Divider marginVertical="$2" />

              <Button
                variant="outline"
                width="100%"
                onPress={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setAuthError('');
                  setConfirmPassword('');
                }}
                icon={<User size={18} />}
                data-testid="auth-toggle-btn"
              >
                {authMode === 'signin'
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </Button>
            </YStack>
          </YStack>

          {/* Benefits card */}
          <YStack padding="$4" gap="$3" marginTop="$2">
            <Paragraph color="$color11" fontWeight="600" textAlign="center">
              Al crear tu cuenta podrás:
            </Paragraph>
            <YStack gap="$2">
              {[
                { icon: <Dumbbell size={18} color="$color9" />, text: 'Guardar todos tus entrenamientos' },
                { icon: <Award size={18} color="$orange9" />, text: 'Registrar récords personales' },
                { icon: <Calendar size={18} color="$color9" />, text: 'Ver tu progreso con gráficos' },
                { icon: <Shield size={18} color="$color9" />, text: 'Crear plantillas personalizadas' },
              ].map((item, idx) => (
                <XStack key={idx} gap="$3" alignItems="center" padding="$2">
                  <YStack width={36} height={36} borderRadius={18} backgroundColor="$color2" justifyContent="center" alignItems="center">
                    {item.icon}
                  </YStack>
                  <Paragraph color="$color11" size="$2">{item.text}</Paragraph>
                </XStack>
              ))}
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
}
