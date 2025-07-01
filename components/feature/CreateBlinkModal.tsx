import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { ThemedText } from '../base/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Icon } from '@/components/images/Icon';
import CreateBlinkForm from '../forms/CreateBlinkForm';

interface CreateBlinkModalProps {
    visible: boolean;
    onClose: () => void;
}

const CreateBlinkModal: React.FC<CreateBlinkModalProps> = ({ visible, onClose }) => {
    const { colors } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (visible) {
            // Animation d'entrée
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Animation de sortie
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 50,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, fadeAnim, slideAnim]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            onRequestClose={onClose}
            animationType="none"
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            backgroundColor: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']
                            })
                        }
                    ]}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                {
                                    backgroundColor: colors.background,
                                    transform: [{ translateY: slideAnim }],
                                    opacity: fadeAnim
                                }
                            ]}
                        >
                            <View style={styles.modalHeader}>
                                <ThemedText variant="Title">Créer un Blink</ThemedText>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.closeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Icon name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            <CreateBlinkForm onSuccess={onClose} />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: 500, // Limiter la largeur maximale sur les grands écrans
        maxHeight: '85%',
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
});

export default CreateBlinkModal;