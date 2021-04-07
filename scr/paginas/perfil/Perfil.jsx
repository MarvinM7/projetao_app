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
import Ionicons from '@expo/vector-icons/Ionicons';

const TesteTela = (props) => {
    const { colors } = useTheme();
    
    useEffect(() => {
        props.buscarUsuario();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {props.usuarioAtual?
                <>
                    <View style={styles.item}>
                        <Title>{props.usuarioAtual.nome}</Title>
                    </View>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => props.navigation.navigate('GenerosFavoritos')}
                    >
                        <Title>Gêneros favoritos</Title>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => props.navigation.navigate('LivrosFavoritos')}
                    >
                        <Title>Livros favoritos</Title>
                    </TouchableOpacity>
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
    },

    item: {
        width: '100%',
        height: 66,
        borderBottomWidth: 1,
        paddingLeft: 20,
        flexDirection: "row",
        alignItems: 'center'
    }
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(TesteTela);