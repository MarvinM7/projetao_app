import React, { useEffect, useState } from 'react';
import { Divider, Button, Menu, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';

const AdicionarLivroEstanteTela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaLivros, mudarlistaLivros] = useState([]);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const [mostrarModal, mudarMostrarModal] = useState(false);
    const [mostrarModalLivro, mudarMostrarModalLivro] = useState(false);
    const [mostrarMenu, mudarMostrarMenu] = useState(false);
    const [texto, mudarTexto] = useState('');
    const db = firebase.firestore();
    
    useEffect(() => {
        props.buscarUsuario();
        mudarPaginaCarregada(true);
    }, []);

    const adicionarLivro = (item) => {
        mudarMostrarModalLivro(true);
    }

    const openMenu = () => {
        mudarMostrarMenu(true);
    }

    const closeMenu = () => {
        mudarMostrarMenu(false);
    }

    const buscar = () => {
        if (texto !== '') {
            db.collection('livros').where('nome', '==', texto).get()
            .then((livros) => {
                let listaLivros = [];
                livros.forEach((resp) => {
                    let livro = resp.data();
                    livro.id = resp.id;
                    livro.marcado = false;
                    props.usuarioAtual.estante.forEach((livroUsuario) => {
                        if (livro.id === livroUsuario.livro.id) {
                            livro.marcado = true;
                        }
                    })
                    listaLivros.push(livro);
                })
                mudarlistaLivros(listaLivros);
                mudarPaginaCarregada(true);
            })
            .catch((erro) => {
                console.log('Erro: ' + erro);
            });
        }
    }

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.item, {borderColor: colors.primary, borderRadius: 10, backgroundColor: item.marcado ? colors.primary : ''}]}
                onPress={() => adicionarLivro(item)}
            >
                <Text>{item.nome}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container]}>
            {paginaCarregada?
                <>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={mostrarModal}
                        onRequestClose={() => {
                            Alert.alert('Modal has been closed.');
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>
                                    Teste
                                </Text>
                                <TouchableHighlight
                                    style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                                    onPress={() => {
                                        mudarMostrarModal(false);
                                    }}
                                >
                                    <Text style={styles.textStyle}>Fechar aviso</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={mostrarModalLivro}
                        onRequestClose={() => {
                            Alert.alert('Modal has been closed.');
                        }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Menu
                                    visible={mostrarMenu}
                                    onDismiss={closeMenu}
                                    anchor={<Button onPress={openMenu}>Show menu</Button>}>
                                    <Menu.Item onPress={() => {}} title="Item 1" />
                                    <Menu.Item onPress={() => {}} title="Item 2" />
                                    <Divider />
                                    <Menu.Item onPress={() => {}} title="Item 3" />
                                </Menu>
                                <TouchableHighlight
                                    style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                                    onPress={() => {
                                        mudarMostrarModalLivro(false);
                                    }}
                                >
                                    <Text style={styles.textStyle}>Fechar aviso</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </Modal>


                    <View style={{width: '100%', alignItems: 'center'}}>
                        <TextInput
                            right={
                                <TextInput.Icon
                                    name={() => <Ionicons name="md-search" color={colors.primary} size={26} />}
                                    onPress={() => buscar()}
                                />
                            }
                            label="Buscar"
                            mode="outlined"
                            value={texto}
                            onChangeText={(texto) => mudarTexto(texto)}
                            style={{width: '90%'}}
                        />
                    </View>
                    <View style={{width: '100%'}}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={listaLivros}
                            renderItem={renderItem}
                            keyExtractor={livro => livro.id}
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
        justifyContent: 'center',
        paddingLeft: 20,
        height: 56,
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

export default connect(mapStateToProps, mapDispatchProps)(AdicionarLivroEstanteTela);