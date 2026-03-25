
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, ImageBackground, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../context/ToastContext';

const GlassContainer = ({ children, style }) => (
    <View style={[styles.glassContainer, style]}>{children}</View>
);

export default function NadiSettingsScreen({ navigation }) {
    const { showToast } = useToast();
    const [cookies, setCookies] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const saved = await AsyncStorage.getItem('nadi_cookies');
        if (saved) setCookies(saved);
    };

    const handleSave = async () => {
        await AsyncStorage.setItem('nadi_cookies', cookies.trim());
        showToast("تم الحفظ بنجاح", "success");
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ImageBackground source={require('../../assets/adaptive-icon.png')} style={styles.bgImage} blurRadius={20}>
                <LinearGradient colors={['rgba(0,0,0,0.6)', '#000000']} style={StyleSheet.absoluteFill} />
            </ImageBackground>

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>إعدادات الربط</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <GlassContainer>
                        <Text style={styles.label}>كوكيز الجلسة (Session Cookies)</Text>
                        <Text style={styles.hint}>
                            ملاحظة: السيرفر يستخدم كوكيز افتراضية قوية مدمجة بداخله. 
                            إذا كنت تواجه مشاكل، يمكنك لصق كوكيز جديدة هنا لتجاوز الافتراضية.
                            صيغة الكوكيز: key=value; key2=value2;
                        </Text>
                        <TextInput
                            style={styles.input}
                            multiline
                            placeholder="اختياري: الصق الكوكيز هنا إذا لزم الأمر..."
                            placeholderTextColor="#666"
                            value={cookies}
                            onChangeText={setCookies}
                            textAlignVertical="top"
                        />
                    </GlassContainer>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveText}>حفظ الإعدادات</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bgImage: { ...StyleSheet.absoluteFillObject },
    header: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    iconBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
    content: { padding: 20 },
    glassContainer: { backgroundColor: 'rgba(20, 20, 20, 0.75)', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    label: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5, textAlign: 'right' },
    hint: { color: '#bbb', fontSize: 12, textAlign: 'right', marginBottom: 15, lineHeight: 18 },
    input: { backgroundColor: 'rgba(0,0,0,0.5)', color: '#ccc', borderRadius: 10, padding: 15, minHeight: 150, borderWidth: 1, borderColor: '#333', textAlign: 'left', fontSize: 12 },
    saveBtn: { marginTop: 30, borderRadius: 16, backgroundColor: '#10b981', padding: 15, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
