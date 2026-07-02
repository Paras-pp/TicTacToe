import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Platform,
  ScrollView, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../../store/hooks';
import type { User } from '../../store/authSlice';
import { useFocusEffect } from 'expo-router';

const USERS_KEY = 'ttt_users';

function RankBadge({ rank }: { rank: number }) {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const labels = ['1st', '2nd', '3rd'];
  if (rank <= 3) {
    return (
      <View style={[styles.badge, { backgroundColor: colors[rank - 1] + '22' }]}>
        <Text style={[styles.badgeText, { color: colors[rank - 1] }]}>{labels[rank - 1]}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: '#2A2A4A' }]}>
      <Text style={[styles.badgeText, { color: '#6B6B8D' }]}>#{rank}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const user = useAppSelector(state => state.auth.user);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadUsers() {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    if (raw) {
      const users: User[] = JSON.parse(raw);
      const sorted = [...users].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        const rateA = (a.wins + a.losses + a.draws) > 0 ? a.wins / (a.wins + a.losses + a.draws) : 0;
        const rateB = (b.wins + b.losses + b.draws) > 0 ? b.wins / (b.wins + b.losses + b.draws) : 0;
        return rateB - rateA;
      });
      setAllUsers(sorted);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }

  const myTotal = (user?.wins ?? 0) + (user?.losses ?? 0) + (user?.draws ?? 0);
  const myWinRate = myTotal > 0 ? Math.round(((user?.wins ?? 0) / myTotal) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C4DFF" />}
      >
        <Text style={styles.pageTitle}>Leaderboard</Text>

        {/* My stats summary */}
        <View style={styles.myCard}>
          <View style={styles.myCardHeader}>
            <Text style={styles.myCardTitle}>Your Performance</Text>
            <Text style={styles.myCardName}>{user?.username}</Text>
          </View>
          <View style={styles.myStatsRow}>
            <MyStat label="Wins" value={user?.wins ?? 0} color="#69F0AE" />
            <MyStat label="Losses" value={user?.losses ?? 0} color="#FF4081" />
            <MyStat label="Draws" value={user?.draws ?? 0} color="#FFD740" />
            <MyStat label="Win %" value={`${myWinRate}%`} color="#7C4DFF" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>All Players</Text>

        {allUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={styles.emptyText}>No players yet</Text>
            <Text style={styles.emptySub}>Play some games to appear here</Text>
          </View>
        ) : (
          <View style={styles.leaderboard}>
            {allUsers.map((u, i) => {
              const total = u.wins + u.losses + u.draws;
              const rate = total > 0 ? Math.round((u.wins / total) * 100) : 0;
              const isMe = u.username === user?.username;

              return (
                <View
                  key={u.username}
                  style={[styles.row, isMe && styles.rowMe]}
                >
                  <RankBadge rank={i + 1} />
                  <View style={styles.rowInfo}>
                    <Text style={[styles.rowName, isMe && styles.rowNameMe]}>
                      {u.username}{isMe ? ' (you)' : ''}
                    </Text>
                    <Text style={styles.rowSub}>{total} games · {rate}% win rate</Text>
                  </View>
                  <View style={styles.rowScores}>
                    <Text style={[styles.rowWins, { color: '#69F0AE' }]}>{u.wins}W</Text>
                    <Text style={[styles.rowWins, { color: '#FF4081' }]}>{u.losses}L</Text>
                    <Text style={[styles.rowWins, { color: '#FFD740' }]}>{u.draws}D</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MyStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={styles.myStat}>
      <Text style={[styles.myStatValue, { color }]}>{value}</Text>
      <Text style={styles.myStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D1A' },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 40,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  myCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#7C4DFF44',
    marginBottom: 28,
  },
  myCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  myCardTitle: { color: '#9B9BB4', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  myCardName: { color: '#7C4DFF', fontSize: 14, fontWeight: '700' },
  myStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  myStat: { alignItems: 'center', gap: 4 },
  myStatValue: { fontSize: 26, fontWeight: '800' },
  myStatLabel: { color: '#6B6B8D', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },

  sectionTitle: {
    color: '#9B9BB4',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  leaderboard: { gap: 8 },
  row: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A4A',
    gap: 12,
  },
  rowMe: {
    borderColor: '#7C4DFF55',
    backgroundColor: '#1F1040',
  },
  badge: {
    width: 40,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '800' },
  rowInfo: { flex: 1 },
  rowName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  rowNameMe: { color: '#7C4DFF' },
  rowSub: { color: '#4A4A6A', fontSize: 12, marginTop: 2 },
  rowScores: { flexDirection: 'row', gap: 8 },
  rowWins: { fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#4A4A6A', fontSize: 14, marginTop: 4 },
});
