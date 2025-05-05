import React, { useState, useEffect, useRef } from 'react';
import { FlatList, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Animated, View } from 'react-native';
import { Icon } from '@/components/images/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { BlinkCard } from './BlinkCard';
import { useBlinksQuery } from '@/hooks/interfaces/useBlinkInterface';
import { BlinkType } from '@/types/BlinksType';

export function BlinkList() {
    const { colors } = useTheme();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useBlinksQuery();

    const [blinks, setBlinks] = useState<BlinkType[]>([]);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const scrollButtonOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (data?.pages) {
            const allBlinks = data.pages.flatMap(page => page.data.data);
            setBlinks(allBlinks);
        }
    }, [data]);

    const handleExpire = (blinkID: string) => {
        setBlinks(prevBlinks => prevBlinks.filter(blink => blink.blinkID !== blinkID)); // Supprimer le blink expiré
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color={colors.accent} />;
    }

    if (error) {
        return <Text style={{ color: colors.danger }}>Erreur : {error.message}</Text>;
    }

    if (!blinks.length) {
        return <Text style={{ color: colors.danger }}>Aucun blink disponible</Text>;
    }

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 100 && !showScrollToTop) {
            setShowScrollToTop(true);
            Animated.timing(scrollButtonOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else if (offsetY <= 100 && showScrollToTop) {
            setShowScrollToTop(false);
            Animated.timing(scrollButtonOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    };

    const scrollToTop = () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={blinks}
                keyExtractor={(item) => item.blinkID}
                renderItem={({ item }) => <BlinkCard blink={item} onExpire={handleExpire} />}
                onEndReached={() => {
                    if (hasNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={true}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={colors.accent} /> : null}
                contentContainerStyle={styles.listContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />

            <Animated.View style={[styles.scrollToTopButton, { opacity: scrollButtonOpacity }]}>
                <TouchableOpacity
                    onPress={scrollToTop}
                    activeOpacity={0.7}
                >
                    <View style={[styles.scrollToTopButtonInner,{backgroundColor: colors.card}]}>
                        <Icon name="chevron-up" size={24} color={colors.accent} />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    listContainer: {
        padding: 10,
    },
    scrollToTopButton: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        zIndex: 999,
    },
    scrollToTopButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
        elevation: 5,
    },
});
