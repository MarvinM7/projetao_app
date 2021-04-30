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

const LivrosFavoritosTela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [livrosFavoritos, mudarLivrosFavoritos] = useState([]);
    const [texto, mudarTexto] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);
    const [mensagemErro, mudarMensagemErro] = useState('');
    const [listaLivrosBuscados, mudarlistaLivrosBuscados] = useState([]);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const db = firebase.firestore();
    
    useEffect(() => {
        props.buscarUsuario();
        if (props.usuarioAtual.livros_top_3.length > 0) {
            db.collection('livros').where(firebase.firestore.FieldPath.documentId(), 'in', props.usuarioAtual.livros_top_3).get()
            .then((livros) => {
                let livrosFavoritos = [];
                let livrosFavoritosAux = [];
                livros.forEach((resp) => {
                    let livro = resp.data();
                    livro.id = resp.id;
                    livrosFavoritosAux.push(livro);
                })

                for (let i = 0; i < props.usuarioAtual.livros_top_3.length; i++) {
                    for (let j = 0; j < livrosFavoritosAux.length; j++) {
                        if (props.usuarioAtual.livros_top_3[i].id === livrosFavoritosAux[j].id) {
                            livrosFavoritos.push(livrosFavoritosAux[j]);
                        }
                    }
                }
                mudarLivrosFavoritos(livrosFavoritos);
                mudarPaginaCarregada(true);
            })
            .catch((erro) => {
                mudarPaginaCarregada(true);
                console.log('Erro: ', erro);
            });
        } else {
            mudarPaginaCarregada(true);
        }
    }, []);

    const buscar = () => {
        if (texto !== '') {
            db.collection('livros').where('nome', '==', texto).get()
            .then((livros) => {
                let listaLivros = [];
                livros.forEach((resp) => {
                    let livro = resp.data();
                    livro.id = resp.id;
                    livro.marcado = false;
                    listaLivros.push(livro);
                })
                mudarlistaLivrosBuscados(listaLivros);
            })
            .catch((erro) => {
                console.log('Erro: ', erro);
            });
        } else {
            mudarMensagemErro('Digite alguma coisa para poder buscar');
            mudarMostrarModal(true);
        }
    }    

    const renderItemLivrosBuscados = ({ item }) => {
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

    const marcarLivro = (livroCheckBox) => {
        let listaLivrosFavoritos = [];
        let ja_marcado = false;
        livrosFavoritos.forEach((livro) => {
            listaLivrosFavoritos.push(livro);
            if (livroCheckBox.id === livro.id) {
                ja_marcado = true;
            }
        });

        if (livrosFavoritos.length < 3) {
            let livros = [];
            listaLivrosBuscados.forEach((livro) => {
                if (livro.id === livroCheckBox.id) {
                    livro.marcado = !livro.marcado;
                    if (!ja_marcado) {
                        listaLivrosFavoritos.push(livro);
                    } else {
                        if (livro.marcado) {
                            mudarMensagemErro('Livro já adicionado');
                            mudarMostrarModal(true);
                        }
                    }
                }
                livros.push(livro)
            })
            mudarLivrosFavoritos(listaLivrosFavoritos);
            mudarlistaLivrosBuscados(livros);
        } else {
            mudarMensagemErro('Você só pode escolher até 3 livros');
            mudarMostrarModal(true);
        }   
    }

    const renderItemLivrosFavoritos = ({ item, index, drag, isActive }) => {
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
                        onPress={() => excluirLivroFavorito(item)}
                    />
                </>
            </TouchableHighlight>
        );
    };

    const excluirLivroFavorito = (livro) => {
        let novaListaLivrosFavoritos = [];
        livrosFavoritos.forEach((livroFavorito) => {
            if (livroFavorito.id !== livro.id) {
                novaListaLivrosFavoritos.push(livroFavorito);
            }
        });

        mudarLivrosFavoritos(novaListaLivrosFavoritos);
    }

    const salvar = () => {
        mudarBotaoCarregando(true);
        let livros_top_3 = [];
        livrosFavoritos.forEach((livro) => {
            livros_top_3.push(db.doc("livros/" + livro.id));
        });

        db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            livros_top_3
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

                    <Title style={{color: colors.primary, alignSelf: 'center'}}>Marque os 3 livros favoritos</Title>
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
                        style={{width: '90%', alignSelf: 'center', marginBottom: 10}}
                    />
                    {livrosFavoritos.length > 0?
                        <DraggableFlatList
                            data={livrosFavoritos}
                            renderItem={renderItemLivrosFavoritos}
                            keyExtractor={(item, index) => `draggable-item-${item.id}`}
                            onDragEnd={({ data }) => mudarLivrosFavoritos(data)}
                        />
                    :
                        null
                    }
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={listaLivrosBuscados}
                        renderItem={renderItemLivrosBuscados}
                        keyExtractor={livro => livro.id}
                    />
                    <View style={{alignItems: 'center', marginBottom: 10}}>
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

export default connect(mapStateToProps, mapDispatchProps)(LivrosFavoritosTela);