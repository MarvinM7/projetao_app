import React, { useEffect, useState } from 'react';
import { Divider, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';

const UsuarioTela = (props) => {
    const { colors } = useTheme();
    const usuario = props.route.params;
    const db = firebase.firestore();
    
    useEffect(() => {
        props.buscarUsuario();
    }, []);

    const abrirTwitter = () => {
        Linking.openURL(`twitter://user?screen_name=${usuario.twitter}`);
    }
    
    const abrirInstagram = () => {
        Linking.openURL(`instagram://user?username=${usuario.instagram}`);
    }
    
    console.log(usuario);

    return (
        <SafeAreaView style={[styles.container]}>
            {usuario?
                <>
                    <View>
                        <Title style={{marginLeft: 8}}>
                            {usuario.nome}
                        </Title>
                        
                        <View style={{borderColor: colors.primary, borderWidth: 1, borderRadius: 5, marginHorizontal: 8, marginVertical: 10, backgroundColor: '#FFF', padding: 10}}>
                            <Title>Descrição</Title>
                            <Divider/>
                            <Text style={{marginTop: 5}}>
                                {usuario.descricao? usuario.descricao : 'Usuário sem descrição'}
                            </Text>
                        </View>
                        <View style={{borderColor: colors.primary, borderWidth: 1, borderRadius: 5, marginHorizontal: 8, marginVertical: 10, backgroundColor: '#FFF', padding: 10}}>
                            <Title>Status literário</Title>
                            <Divider/>
                            <View
                                style={{display: 'flex', flexDirection: 'row', alignSelf: 'flex-start', marginVertical: 5, backgroundColor: colors.primary, borderRadius: 5, padding: 10}}
                            >
                                <Text
                                    style={{color: '#FFF'}}
                                >
                                    {usuario.status_literario? usuario.status_literario.nome : 'Sem leitura no momento'}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={{borderColor: colors.primary, borderWidth: 1, borderRadius: 5, marginHorizontal: 8, marginVertical: 10, backgroundColor: '#FFF', padding: 10}}>
                            <Title>Top 3 de gênero</Title>
                            <Divider/>
                            {usuario.generos_top_3.length > 0?
                                <>
                                    {usuario.generos_top_3.map((genero) => {
                                        return (
                                            <View
                                                key={genero.id}
                                                style={{display: 'flex', flexDirection: 'row', alignSelf: 'flex-start', marginVertical: 5, backgroundColor: colors.primary, borderRadius: 5, padding: 10}}
                                            >
                                                <Text
                                                    style={{color: '#FFF'}}
                                                >
                                                    {genero.nome}
                                                </Text>
                                            </View>
                                        )
                                    })}
                                </>
                            :
                                <View
                                    style={{display: 'flex', flexDirection: 'row', alignSelf: 'flex-start', marginVertical: 5, backgroundColor: colors.primary, borderRadius: 5, padding: 10}}
                                >
                                    <Text
                                        style={{color: '#FFF'}}
                                    >
                                        Sem gênero marcado no top 3
                                    </Text>
                                </View>
                            }
                        </View>
                        <View style={{borderColor: colors.primary, borderWidth: 1, borderRadius: 5, marginHorizontal: 8, marginVertical: 10, backgroundColor: '#FFF', padding: 10}}>
                            <Title>Redes Sociais</Title>
                            <Divider />
                            <View
                                style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}
                            >
                                <TouchableOpacity
                                    onPress={() => abrirTwitter()}
                                >
                                    <Ionicons
                                        style={{marginHorizontal: 5}}
                                        name="logo-twitter"
                                        color={colors.primary}
                                        size={26}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => abrirInstagram()}
                                >
                                    <Ionicons
                                        style={{marginHorizontal: 5}}
                                        name="logo-instagram"
                                        color={colors.primary}
                                        size={26}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </>
            :
                <ActivityIndicator size="large" color="#00ff00" />
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(UsuarioTela);