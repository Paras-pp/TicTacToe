import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/authSlice';

export default function HomeScreen() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const total = (user?.wins ?? 0) + (user?.losses ?? 0) + (user?.draws ?? 0);
  const winRate = total > 0 ? Math.round(((user?.wins ?? 0) / total) * 100) : 0;

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.username}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroGrid}>
            {'X │ O │ X\n──┼───┼──\nO │ X │ O\n──┼───┼──\nX │ O │ X'}
          </Text>
          <Text style={styles.heroTitle}>Tic Tac Toe</Text>
          <Text style={styles.heroSub}>Challenge a friend, take turns on the same device</Text>

          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => router.push('/(tabs)/game')}
            activeOpacity={0.85}
          >
            <Text style={styles.playBtnText}>Play Now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <StatCard label="Wins" value={user?.wins ?? 0} color="#69F0AE" />
          <StatCard label="Losses" value={user?.losses ?? 0} color="#FF4081" />
          <StatCard label="Draws" value={user?.draws ?? 0} color="#FFD740" />
        </View>

        <View style={styles.winRateCard}>
          <Text style={styles.winRateLabel}>Win Rate</Text>
          <Text style={styles.winRateValue}>{winRate}%</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${winRate}%` }]} />
          </View>
          <Text style={styles.winRateSub}>{total} games played</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: '#6B6B8D',
    fontSize: 14,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#FF4081',
    fontSize: 13,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A4A',
    marginBottom: 28,
  },
  heroGrid: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    color: '#7C4DFF',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 2,
    opacity: 0.7,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSub: {
    color: '#6B6B8D',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  playBtn: {
    backgroundColor: '#7C4DFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: '#9B9BB4',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: '#6B6B8D',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  winRateCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  winRateLabel: {
    color: '#9B9BB4',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  winRateValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#2A2A4A',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C4DFF',
    borderRadius: 3,
  },
  winRateSub: {
    color: '#4A4A6A',
    fontSize: 12,
  },
});
