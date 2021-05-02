import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';

const StatusLiterarioTela = (props) => {
    const { colors } = useTheme();
    const db = firebase.firestore();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaLivros, mudarListaLivros] = useState([]);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const [mensagemModal, mudarMensagemModal] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);
        
    useEffect(() => {
        props.buscarUsuario();
        db.collection('livros').orderBy('nome', 'asc').get()
            .then((livros) => {
                let listaLivrosAux = [];
                livros.forEach((resp) => {
                    let livro = resp.data();
                    livro.id = resp.id;
                    livro.marcado = false
                    if (props.usuarioAtual.status_literario) {
                        if (livro.id === props.usuarioAtual.status_literario.id) {
                            console.log('teste 1')
                            livro.marcado = true;
                        }
                    }
                    listaLivrosAux.push(livro);
                });
                mudarListaLivros(listaLivrosAux);
                mudarPaginaCarregada(true);
            })
            .catch((erro) => {
                console.log('Erro: ' + erro);
            })
    }, []);

    const marcarLivro = (livroCheckBox) => {
        let contador = 0;
        listaLivros.forEach((livro) => {
            if (livro.marcado) {
                contador++;
            }
        })
        
        let livros = [];
        listaLivros.forEach((livro) => {
            if (livro.id === livroCheckBox.id) {
                if (contador === 0) {
                    livro.marcado = !livro.marcado;
                } else {
                    if (!livro.marcado) {
                        mudarMensagemModal('Você só pode adicionar 1 livro');
                        mudarMostrarModal(true);
                    } else {
                        livro.marcado = !livro.marcado;
                    }
                }
            }
            livros.push(livro)
        })

        mudarListaLivros(livros);
    }

    const renderItem = ({ item }) => {
        return (
            <View
                style={[styles.item, {borderColor: colors.primary, borderRadius: 10}]}
            >
                <Checkbox.Item 
                    label={item.nome}
                    status={item.marcado ? 'checked' : 'unchecked'}
                    onPress={() => marcarLivro(item)}
                    color={colors.primary}
                />
            </View>
        );
    };

    const salvar = () => {
        mudarBotaoCarregando(true);
        let status_literario = '';
        listaLivros.forEach((livro) => {
            if (livro.marcado) {
                status_literario = db.doc('livros/' + livro.id);
            }
        })
        db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            status_literario
        })
        .then(() => {
            props.buscarUsuario();
            mudarBotaoCarregando(false);
            mudarMensagemModal('Dado salvo com sucesso');
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
                        style={{width: '90%'}}
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
                                    {mensagemModal}
                                </Text>
                                <TouchableHighlight
                                    style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                                    onPress={() => {
                                        mudarMostrarModal(false);
                                        mudarMensagemModal('');
                                    }}
                                >
                                    <Text style={styles.textStyle}>Fechar aviso</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </Modal>
                    <Title style={{color: colors.primary, alignSelf: 'center'}}>Leitura do momento</Title>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={listaLivros}
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

export default connect(mapStateToProps, mapDispatchProps)(StatusLiterarioTela);