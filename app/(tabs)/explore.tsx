import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { SalonCard } from '@/components/SalonCard';
import { CATEGORIES } from '@/lib/categories';
import { api } from '@/lib/api';
import { clsx } from 'clsx';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: salons = [], isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['salons'],
    queryFn: api.getSalons,
  });

  const filteredSalons = useMemo(() => {
    return salons.filter((salon) => {
      const matchesSearch =
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory) {
        try {
          const parsed = salon.categories ? JSON.parse(salon.categories) : {};
          const primary = parsed.primary || '';
          const related = parsed.related || [];
          matchesCategory = primary === selectedCategory || related.includes(selectedCategory);
        } catch {
          matchesCategory = false;
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [salons, searchQuery, selectedCategory]);

  const totalServices = salons.reduce((acc, s) => acc + s.serviceCount, 0);
  const reviewedCount = salons.filter((s) => s.reviewCount > 0).length;

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={() => refetch()} tintColor="#1c1917" />
        }
      >
        {/* Hero */}
        <View className="mx-4 mt-2 mb-6 bg-stone-900 rounded-3xl px-6 py-10 overflow-hidden">
          <Text className="text-3xl font-display font-bold text-white text-center leading-tight mb-3">
            Find the perfect salon near you
          </Text>
          <Text className="text-stone-300 text-center text-sm mb-6">
            Book hair, beauty, and wellness services instantly.
          </Text>
          <View className="relative">
            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
              <Search size={20} color="#a8a29e" />
            </View>
            <TextInput
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-base"
              placeholder="Search by salon name or location..."
              placeholderTextColor="#d6d3d1"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View className="flex-row flex-wrap justify-center gap-2 mt-4">
            {['Instant booking', 'Verified reviews', 'Top-rated salons'].map((tag) => (
              <View key={tag} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <Text className="text-xs font-semibold text-stone-100">{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6">
          <Pressable
            onPress={() => setSelectedCategory(null)}
            className={clsx(
              'px-5 py-3 rounded-full border mr-2',
              selectedCategory === null
                ? 'bg-stone-900 border-stone-900'
                : 'bg-white border-stone-200',
            )}
          >
            <Text
              className={clsx(
                'text-sm font-bold',
                selectedCategory === null ? 'text-white' : 'text-stone-600',
              )}
            >
              All
            </Text>
          </Pressable>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'flex-row items-center gap-2 px-5 py-3 rounded-full border mr-2',
                  selected ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-200',
                )}
              >
                <Icon size={16} color={selected ? '#fff' : '#57534e'} />
                <Text className={clsx('text-sm font-bold', selected ? 'text-white' : 'text-stone-600')}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Stats */}
        <View className="flex-row gap-2 px-4 mb-6">
          {[
            { label: 'Active salons', value: salons.length },
            { label: 'Total services', value: totalServices },
            { label: 'Reviewed', value: reviewedCount },
          ].map((stat) => (
            <View
              key={stat.label}
              className="flex-1 bg-white border border-stone-200/60 rounded-2xl px-3 py-3 items-center"
            >
              <Text className="text-[10px] uppercase font-bold text-stone-500 text-center">
                {stat.label}
              </Text>
              <Text className="text-xl font-display font-bold text-stone-900 mt-1">{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* List header */}
        <View className="flex-row items-center justify-between px-4 mb-4">
          <Text className="text-2xl font-display font-bold text-stone-900">
            {selectedCategory
              ? `${CATEGORIES.find((c) => c.id === selectedCategory)?.label} Salons`
              : 'Featured Salons'}
          </Text>
          <Text className="text-stone-500 font-medium">{filteredSalons.length} results</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator className="py-20" color="#1c1917" />
        ) : error ? (
          <View className="mx-4 p-8 bg-white rounded-3xl border border-red-100 items-center">
            <Text className="text-stone-900 font-semibold mb-2">Could not load salons</Text>
            <Text className="text-stone-500 text-center mb-4">{(error as Error).message}</Text>
            <Pressable onPress={() => refetch()} className="bg-stone-900 px-6 py-3 rounded-full">
              <Text className="text-white font-bold">Try again</Text>
            </Pressable>
          </View>
        ) : filteredSalons.length === 0 ? (
          <View className="mx-4 p-10 bg-white rounded-3xl border border-stone-200/60 items-center">
            <Text className="text-xl font-medium text-stone-900">No salons found</Text>
            <Text className="text-stone-400 mt-2 text-center">Try adjusting your search or filters.</Text>
            {(searchQuery || selectedCategory) && (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-6 bg-stone-100 px-6 py-2 rounded-full"
              >
                <Text className="font-bold text-stone-800">Clear Filters</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View className="px-4">
            {filteredSalons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
