import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Title, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
//import { LogBox } from 'react-native';

const GenerosFavoritosPrimeiroAcessoTela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaGeneros, mudarlistaGeneros] = useState([]);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const window = Dimensions.get('window');
    const db = firebase.firestore();
    
    useEffect(() => {
        props.buscarUsuario();
        db.collection('generos').orderBy('nome', 'asc').get()
        .then((generos) => {
            let listaGeneros = [];
            generos.forEach((resp) => {
                let genero = resp.data();
                genero.id = resp.id;
                genero.marcado = false;
                props.usuarioAtual.generos.forEach((generoUsuario) => {
                    if (genero.id === generoUsuario.id) {
                        genero.marcado = true;
                    }
                })
                listaGeneros.push(genero);
            })
            mudarlistaGeneros(listaGeneros);
            mudarPaginaCarregada(true);
        })
        .catch((erro) => {
            console.log('Erro: ', erro);
        });
    }, [])

    const marcarGenero = (generoCheckBox) => {
        let generos = [];
        listaGeneros.forEach((genero) => {
            if (genero.id === generoCheckBox.id) {
                genero.marcado = !genero.marcado;
            }
            generos.push(genero)
        })

        mudarlistaGeneros(generos);
    }

    const salvar = () => {
        mudarBotaoCarregando(true)
        let listaGenerosMarcados = [];
        listaGeneros.forEach((genero) => {
            if (genero.marcado) {
                listaGenerosMarcados.push(db.doc("autores/" + genero.id));
            }
        })

        db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            generos: listaGenerosMarcados
        })
        .then(() => {
            props.buscarUsuario();
            mudarBotaoCarregando(false);
            props.navigation.navigate('RotasLogado');
        })
        .catch((erro) => {
            mudarBotaoCarregando(false);
            console.log('Erro: ' + erro)
        })
    }

    const renderItem = ({ item }) => {
        return (
            <View
                style={[styles.item, {borderColor: colors.primary, borderRadius: 10}]}
            >
                <Checkbox.Item 
                    label={item.nome}
                    status={item.marcado ? 'checked' : 'unchecked'}
                    onPress={() => marcarGenero(item)}
                    color={colors.primary}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container]}>
            {paginaCarregada?
                <>
                    <Title style={{flex: 1, color: colors.primary}}>Marque os gêneros que você curte</Title>
                    <View style={{flex: 10, width: '100%'}}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={listaGeneros}
                            renderItem={renderItem}
                            keyExtractor={genero => genero.id}
                            ListFooterComponent={
                                <Button
                                    mode="contained"
                                    onPress={() => salvar()}
                                    loading={botaoCarregando}
                                    style={{width: '90%', alignSelf: 'center', marginBottom: 10}}
                                >
                                    SALVAR
                                </Button>
                            }
                            
                        />
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
        flex: 1,
        alignItems: "center",
    },

    tituloView: {
        width: '80%'
    },

    item: {
        marginVertical: 8,
        width: '90%',
        alignSelf: 'center',
        borderWidth: 1
    },
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(GenerosFavoritosPrimeiroAcessoTela);