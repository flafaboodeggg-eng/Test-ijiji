
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, StatusBar, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const PYTHON_SERVER_URL = 'https://nadi-production.up.railway.app'; 

const GlassCard = ({ children, style, onPress }) => (
    <TouchableOpacity 
        style={[styles.glassCard, style]} 
        onPress={onPress}
        activeOpacity={0.9}
        disabled={!onPress}
    >
        {children}
    </TouchableOpacity>
);

export default function NadiPublisherHubScreen({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${PYTHON_SERVER_URL}/nadi/jobs`);
            setJobs(res.data);
        } catch (e) {
            console.log("Failed to fetch jobs");
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
            const interval = setInterval(fetchJobs, 3000);
            return () => clearInterval(interval);
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchJobs();
        setRefreshing(false);
    };

    const handleAction = async (action, jobId) => {
        try {
            await axios.post(`${PYTHON_SERVER_URL}/nadi/${action}`, { jobId });
            fetchJobs();
        } catch(e) {}
    };

    // 🔥 تصميم مطابق للمترجم (TranslatorHub)
    const renderJobItem = (job) => {
        const parts = job.progress.split('/');
        const current = parseInt(parts[0]) || 0;
        const total = parseInt(parts[1]) || 1;
        const percent = (current / total) * 100;

        return (
            <GlassCard key={job.id} style={styles.jobCard}>
                <View style={styles.jobContentWrapper}>
                    <Image 
                        source={job.cover ? {uri: job.cover} : require('../../assets/adaptive-icon.png')} 
                        style={styles.jobCover} 
                    />
                    <View style={styles.jobInfo}>
                        <Text style={styles.jobTitle} numberOfLines={1}>{job.novelTitle}</Text>
                        
                        <View style={styles.jobStatusRow}>
                            <View style={[styles.statusDot, {backgroundColor: job.status === 'active' ? '#4ade80' : '#f59e0b'}]} />
                            <Text style={styles.statusText}>
                                {job.status === 'active' ? 'جاري النشر' : job.status === 'completed' ? 'مكتمل' : 'متوقف'}
                            </Text>
                            <Text style={styles.nadiLinkText}>ID: {job.nadiId}</Text>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, {width: `${percent}%`}]} />
                        </View>
                        <Text style={styles.progressText}>{current} / {total} فصل</Text>
                        <Text style={styles.logText} numberOfLines={1}>{job.lastLog}</Text>
                    </View>

                    <View style={styles.actionColumn}>
                        {job.status === 'active' ? (
                            <TouchableOpacity onPress={() => handleAction('stop', job.id)} style={styles.miniBtn}>
                                <Ionicons name="pause" size={18} color="#f59e0b" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => handleAction('start', job.id)} style={styles.miniBtn}>
                                <Ionicons name="play" size={18} color="#4ade80" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleAction('delete', job.id)} style={styles.miniBtn}>
                            <Ionicons name="trash" size={18} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </GlassCard>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ImageBackground source={require('../../assets/adaptive-icon.png')} style={styles.bgImage} blurRadius={20}>
                <LinearGradient colors={['rgba(0,0,0,0.6)', '#000000']} style={StyleSheet.absoluteFill} />
            </ImageBackground>

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('NadiSettings')} style={styles.iconBtn}>
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>ناشر نادي الروايات</Text>
                        <Text style={styles.headerSub}>Auto Publisher</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Ionicons name="arrow-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}>
                    
                    <TouchableOpacity style={styles.newJobBtn} onPress={() => navigation.navigate('NadiNovelSelection')}>
                        <Ionicons name="add-circle" size={28} color="#fff" />
                        <Text style={styles.newJobText}>مهمة نشر جديدة</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>المهام النشطة</Text>
                    
                    {jobs.length === 0 ? (
                        <Text style={{color: '#666', textAlign: 'center', marginTop: 50}}>لا توجد مهام نشطة حالياً</Text>
                    ) : (
                        <View style={styles.jobsList}>
                            {jobs.map(renderJobItem)}
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bgImage: { ...StyleSheet.absoluteFillObject },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
    headerSub: { color: '#ccc', fontSize: 12, textAlign: 'right' },
    iconBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
    content: { padding: 20 },
    
    newJobBtn: { 
        marginBottom: 30, borderRadius: 16, overflow: 'hidden', 
        backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10
    },
    newJobText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'right' },
    jobsList: { gap: 15, marginBottom: 30 },

    glassCard: { 
        backgroundColor: 'rgba(20, 20, 20, 0.75)',
        borderRadius: 16, 
        overflow: 'hidden', 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.1)', 
        position: 'relative' 
    },
    jobCard: { marginBottom: 0 },
    jobContentWrapper: { flexDirection: 'row-reverse', padding: 15, alignItems: 'center' },
    jobCover: { width: 60, height: 80, borderRadius: 8, backgroundColor: '#333' },
    jobInfo: { flex: 1, marginRight: 15, alignItems: 'flex-end' },
    jobTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
    jobStatusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginBottom: 8 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    nadiLinkText: { color: '#666', fontSize: 10, marginRight: 10 },
    progressContainer: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 4 },
    progressBar: { height: '100%', backgroundColor: '#4ade80', borderRadius: 2 },
    progressText: { color: '#ccc', fontSize: 10 },
    logText: { color: '#666', fontSize: 9, marginTop: 2 },
    actionColumn: { justifyContent: 'space-between', height: 80, marginLeft: 5 },
    miniBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }
});
