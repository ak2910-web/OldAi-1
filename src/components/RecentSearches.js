import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Button, useColorScheme } from 'react-native';
import { getRecentSearches } from '../api/api';

export default function RecentSearches({ limit = 10 }) {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';
  const styles = {
    container: {
      padding: 16,
      backgroundColor: isDark ? '#181a20' : '#fff',
      flex: 1,
    },
    card: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: isDark ? '#23262f' : '#f7f7f7',
      borderRadius: 8,
    },
    title: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 12,
      color: isDark ? '#fff' : '#222',
    },
    question: {
      fontWeight: 'bold',
      fontSize: 16,
      color: isDark ? '#fff' : '#222',
    },
    language: {
      color: isDark ? '#aaa' : '#666',
      marginBottom: 4,
    },
    preview: {
      color: isDark ? '#eee' : '#444',
      marginBottom: 4,
    },
    timestamp: {
      fontSize: 12,
      color: isDark ? '#888' : '#aaa',
    },
    empty: {
      padding: 16,
      color: isDark ? '#aaa' : '#888',
    },
  };

  const fetchHistory = async () => {
    setRefreshing(true);
    const data = await getRecentSearches(limit);
    setSearches(data);
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [limit]);

  if (loading) {
    return <ActivityIndicator style={{ margin: 32 }} size="large" color={isDark ? '#fff' : '#888'} />;
  }

  if (!searches.length) {
    return <Text style={styles.empty}>No recent searches found.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={styles.title}>Recent Searches</Text>
        <Button title={refreshing ? 'Refreshing...' : 'Refresh'} onPress={fetchHistory} disabled={refreshing} />
      </View>
      {searches.map((item, idx) => (
        <View key={item.id || idx} style={styles.card}>
          <Text style={styles.question}>{item.question}</Text>
          <Text style={styles.language}>{item.language}</Text>
          <Text numberOfLines={2} style={styles.preview}>{item.preview}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
