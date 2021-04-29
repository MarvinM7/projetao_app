import React, { useEffect, useState } from 'react';
import { useTheme, Title } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';

const GruposTela = (props) => {
    const { colors } = useTheme();
    
    useEffect(() => {
        props.buscarUsuario();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {props.usuarioAtual?
                <>
                    Tela de grupos
                </>
            :
                <ActivityIndicator size='large' color={colors.primary} />
            }
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center'
    }
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(GruposTela);