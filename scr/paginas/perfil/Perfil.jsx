import React, { useEffect, useState } from 'react';
import { useTheme, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario, logOut } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as GoogleSignIn from 'expo-google-sign-in';

const TesteTela = (props) => {
    const { colors } = useTheme();
    
    useEffect(() => {
        props.buscarUsuario();
    }, []);

    const deslogar = async () => {
        await GoogleSignIn.signOutAsync();
        props.logOut();
    };

    return (
        <SafeAreaView style={styles.container}>
            {props.usuarioAtual?
                <>
                    <View style={styles.item}>
                        <Title>{props.usuarioAtual.nome}</Title>
                    </View>
                    <TouchableOpacity
                        style={[styles.item, {alignItems: 'center', flexDirection: 'row'}]}
                        onPress={() => props.navigation.navigate('MeusDados')}
                    >
                        <Ionicons 
                            style={{marginRight: 10}}
                            name="information-circle-outline"
                            color={colors.primary}
                            size={25}
                        />
                        <Title>Meus dados</Title>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.item, {alignItems: 'center', flexDirection: 'row'}]}
                        onPress={() => props.navigation.navigate('GenerosCurtidos')}
                    >
                        <Ionicons 
                            style={{marginRight: 10}}
                            name="list"
                            color={colors.primary}
                            size={25}
                        />
                        <Title>Gêneros curtidos</Title>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.item, {alignItems: 'center', flexDirection: 'row'}]}
                        onPress={() => props.navigation.navigate('GenerosTop3')}
                    >
                        <Ionicons 
                            style={{marginRight: 10}}
                            name="star"
                            color={colors.primary}
                            size={25}
                        />
                        <Title>Gêneros top 3</Title>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.item, {alignItems: 'center', flexDirection: 'row'}]}
                        onPress={() => props.navigation.navigate('LivrosFavoritos')}
                    >
                        <Ionicons 
                            style={{marginRight: 10}}
                            name="star"
                            color={colors.primary}
                            size={25}
                        />
                        <Title>Livros top 3</Title>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.item, {alignItems: 'center', flexDirection: 'row'}]}
                        onPress={() => props.navigation.navigate('Estante')}
                    >
                        <Ionicons 
                            style={{marginRight: 10}}
                            name="book"
                            color={colors.primary}
                            size={25}
                        />
                        <Title>Minha estante</Title>
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={[styles.item, {alignItems: 'center', flexDirection: 'row'}]}
                        onPress={() => props.navigation.navigate('Configuracoes')}
                    >
                        <Ionicons 
                            style={{marginRight: 10}}
                            name="build"
                            color={colors.primary}
                            size={25}
                        />
                        <Title>Configurações</Title>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={[styles.item, {alignItems: 'center', flexDirection: 'row'}]}
                        onPress={() => deslogar()}
                    >
                        <Ionicons 
                            style={{marginRight: 10}}
                            name="log-out"
                            color={colors.primary}
                            size={25}
                        />
                        <Title>Deslogar</Title>
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

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario, logOut }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(TesteTela);