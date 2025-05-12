import React from 'react';
import { Image, StyleSheet, ImageProps } from 'react-native';
import { useCountryFlag } from '@/hooks/useCountryFlag';

type CountryFlagProps = {
    countryCode: string;
    size?: number;
} & Omit<ImageProps, 'source'>;

export function CountryFlag({ countryCode, size = 24, ...props }: CountryFlagProps) {
    const flagUrl = useCountryFlag(countryCode, size);
    return <Image source={{ uri: flagUrl }} style={[styles.flag, { width: size, height: size }, props.style]} {...props} />;
}

const styles = StyleSheet.create({
    flag: {
        resizeMode: 'contain',
        borderRadius: 4,
    },
});
