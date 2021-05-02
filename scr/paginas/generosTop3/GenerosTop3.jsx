import React, { useEffect, useState } from 'react';
import { Button, Checkbox, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';
import DraggableFlatList from "react-native-draggable-flatlist";

const GenerosTop3Tela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [generosFavoritos, mudarGenerosFavoritos] = useState([]);
    const [mostrarModal, mudarMostrarModal] = useState(false);
    const [mensagemErro, mudarMensagemErro] = useState('');
    const [listaGeneros, mudarlistaGeneros] = useState([]);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
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
                    listaGeneros.push(genero);
                })
                mudarlistaGeneros(listaGeneros);

                if (props.usuarioAtual.generos_top_3.length > 0) {
                    db.collection('generos').where(firebase.firestore.FieldPath.documentId(), 'in', props.usuarioAtual.generos_top_3).get()
                    .then((generos_top_3) => {
                        let generosFavoritos = [];
                        let generosFavoritosAux = [];
                        generos_top_3.forEach((resp) => {
                            let genero = resp.data();
                            genero.id = resp.id;
                            generosFavoritosAux.push(genero);
                        })
        
                        for (let i = 0; i < props.usuarioAtual.generos_top_3.length; i++) {
                            for (let j = 0; j < generosFavoritosAux.length; j++) {
                                if (props.usuarioAtual.generos_top_3[i].id === generosFavoritosAux[j].id) {
                                    generosFavoritos.push(generosFavoritosAux[j]);
                                    for (let k = 0; k < listaGeneros.length; k++) {
                                        if (generosFavoritosAux[j].id === listaGeneros[k].id) {
                                            listaGeneros[k].marcado = true;
                                        }
                                    }
                                }
                            }
                        }
                        mudarGenerosFavoritos(generosFavoritos);
                        mudarPaginaCarregada(true);
                    })
                    .catch((erro) => {
                        mudarPaginaCarregada(true);
                        console.log('Erro: ' + erro);
                    });
                } else {
                    mudarPaginaCarregada(true);
                }
            })
            .catch((erro) => {
                console.log('Erro: ' + erro);
            });
    }, []);

    const renderItemGeneros = ({ item }) => {
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

    const marcarGenero = (generoCheckBox) => {
        let listaGenerosFavoritos = [];
        generosFavoritos.forEach((genero) => {
            listaGenerosFavoritos.push(genero);
        });

        let generos = [];
        listaGeneros.forEach((genero) => {
            if (genero.id === generoCheckBox.id) {
                if (!genero.marcado) {
                    if (listaGenerosFavoritos.length < 3) {
                        genero.marcado = !genero.marcado;
                        listaGenerosFavoritos.push(genero);
                        mudarGenerosFavoritos(listaGenerosFavoritos);
                    } else {
                        mudarMensagemErro('Você só pode escolher até 3 generos');
                        mudarMostrarModal(true);
                    }
                } else {
                    genero.marcado = false;
                    let novaListaGenerosFavoritos = [];
                    generosFavoritos.forEach((generoFavorito) => {
                        if (generoFavorito.id !== genero.id) {
                            novaListaGenerosFavoritos.push(generoFavorito);
                        }
                    });
                    mudarGenerosFavoritos(novaListaGenerosFavoritos);
                }
            }
            generos.push(genero);
        })

        mudarlistaGeneros(generos);
    }

    const excluirGeneroFavorito = (genero) => {
        let novaListaGenerosFavoritos = [];
        generosFavoritos.forEach((generoFavorito) => {
            if (generoFavorito.id !== genero.id) {
                novaListaGenerosFavoritos.push(generoFavorito);
            }
        });

        let generos = [];
        listaGeneros.forEach((generoListado) => {
            if (generoListado.id === genero.id) {
                generoListado.marcado = !generoListado.marcado;
            }
            generos.push(generoListado);
        })

        mudarlistaGeneros(generos);
        mudarGenerosFavoritos(novaListaGenerosFavoritos);
    }

    const renderItemGenerosFavoritos = ({ item, index, drag, isActive }) => {
        return (
            <TouchableHighlight
                style={{
                    height: 56,
                    width: '90%',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.primary,
                    paddingLeft: 20,
                    marginTop: 10,
                    backgroundColor: isActive ? colors.primary : "#FFF",
                    alignSelf: 'center',
                    justifyContent: "center",
                    alignItems: 'center',
                    flexDirection: 'row'
                }}
                onLongPress={drag}
            >
                <>
                    <View
                        style={{flex: 1, flexDirection: 'row'}}
                    >
                        <Ionicons 
                            name="list"
                            color={colors.primary}
                            size={16}
                        />
                    </View>
                    
                    <Text
                        style={{
                            flex: 7
                        }}
                    >
                        {`${index + 1}º - ${item.nome}`}
                    </Text>
                    <Ionicons 
                        style={{flex: 1}}
                        name="trash"
                        color={colors.primary}
                        size={16}
                        onPress={() => excluirGeneroFavorito(item)}
                    />
                </>
            </TouchableHighlight>
        );
    };

    const salvar = () => {
        mudarBotaoCarregando(true);
        let generos_top_3 = [];
        generosFavoritos.forEach((genero) => {
            generos_top_3.push(db.doc("generos/" + genero.id));
        });

        db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            generos_top_3
        })
        .then(() => {
            props.buscarUsuario();
            mudarBotaoCarregando(false);
            mudarMensagemErro('Top 3 atualizado com sucesso');
            mudarMostrarModal(true);
        })
        .catch((erro) => {
            mudarBotaoCarregando(false);
            console.log('Erro: ' + erro)
        })
    }

    return (
        <SafeAreaView style={[styles.container]}>
            {paginaCarregada?
                <>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={mostrarModal}
                        onRequestClose={() => {
                            Alert.alert('Modal has been closed');
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>
                                    {mensagemErro}
                                </Text>
                                <TouchableHighlight
                                    style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                                    onPress={() => {
                                        mudarMostrarModal(false);
                                        mudarMensagemErro('');
                                    }}
                                >
                                    <Text style={styles.textStyle}>Fechar aviso</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </Modal>
                    <Title style={{color: colors.primary, alignSelf: 'center'}}>Marque os 3 generos favoritos</Title>
                    <View
                        style={{flex: 3.5, alignItems: 'center', justifyContent: 'center'}}
                    >
                        {generosFavoritos.length > 0?
                            <View style={{flex: 1, width: '100%', justifyContent: 'center'}}>
                                <DraggableFlatList
                                    data={generosFavoritos}
                                    renderItem={renderItemGenerosFavoritos}
                                    keyExtractor={(item, index) => `draggable-item-${item.id}`}
                                    onDragEnd={({ data }) => mudarGenerosFavoritos(data)}
                                />
                            </View>
                        :
                            <Title style={{color: colors.primary}}>Gêneros marcados</Title>
                        }        
                    </View>
                    <View
                        style={{flex: 5}}
                    >
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={listaGeneros}
                            renderItem={renderItemGeneros}
                            keyExtractor={genero => genero.id}
                        />
                    </View>
                    <View style={{alignItems: 'center', marginVertical: 10}}>
                        <Button
                            mode="contained"
                            onPress={() => salvar()}
                            loading={botaoCarregando}
                            style={{width: '90%'}}
                        >
                            SALVAR
                        </Button>
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
    },

    item: {
        marginVertical: 8,
        width: '90%',
        alignSelf: 'center',
        borderWidth: 1
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },

    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    openButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },

    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(GenerosTop3Tela);