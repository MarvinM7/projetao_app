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

const PrimeiroAcessoTela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaGeneros, mudarlistaGeneros] = useState([]);
    const [generosFavoritos, mudarGenerosFavoritos] = useState([]);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const [botaoPularCarregando, mudarBotaoPularCarregando] = useState(false);
    const [pagina, mudarPagina] = useState(1);
    const [texto, mudarTexto] = useState('');
    const [listaLivros, mudarlistaLivros] = useState([]);
    const [livrosFavoritos, mudarLivrosFavoritos] = useState([]);
    const [mensagemErro, mudarMensagemErro] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);
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
            mudarPaginaCarregada(true);
        })
        .catch((erro) => {
            console.log('Erro: ' + erro);
        });
    }, [])

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
                        mudarMensagemErro('Voc?? s?? pode escolher at?? 3 generos');
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

    const pular = () => {
        mudarBotaoPularCarregando(true);
        db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            primeiro_acesso: false
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

    const avancar = () => {
        let pagina_atual = pagina + 1;
        if (pagina_atual > 2) {
            pagina_atual = 2;
        }

        mudarPagina(pagina_atual);
    }

    const voltar = () => {
        let pagina_atual = pagina - 1;
        if (pagina_atual < 1) {
            pagina_atual = 1;
        }

        mudarPagina(pagina_atual);
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
                    listaLivros.push(livro);
                })
                mudarlistaLivros(listaLivros);
            })
            .catch((erro) => {
                console.log('Erro: ' + erro);
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
            listaLivros.forEach((livro) => {
                if (livro.id === livroCheckBox.id) {
                    livro.marcado = !livro.marcado;
                    if (!ja_marcado) {
                        listaLivrosFavoritos.push(livro);
                    } else {
                        if (livro.marcado) {
                            mudarMensagemErro('Livro j?? adicionado');
                            mudarMostrarModal(true);
                        }
                    }
                }
                livros.push(livro)
            })
            mudarLivrosFavoritos(listaLivrosFavoritos);
            mudarlistaLivros(livros);
        } else {
            mudarMensagemErro('Voc?? s?? pode escolher at?? 3 livros');
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
                    <Ionicons 
                        style={{flex: 1}}
                        name="list"
                        color={colors.primary}
                        size={16}
                    />
                    <Text
                        style={{
                            flex: 7
                        }}
                    >
                        {`${index + 1}?? - ${item.nome}`}
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
        let generos_top_3 = [];
        generosFavoritos.forEach((genero) => {
            generos_top_3.push(db.doc("generos/" + genero.id));
        });

        let livros_top_3 = [];
        livrosFavoritos.forEach((livro) => {
            livros_top_3.push(db.doc("livros/" + livro.id));
        });

        db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            generos_top_3,
            livros_top_3,
            primeiro_acesso: false
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
                        {`${index + 1}?? - ${item.nome}`}
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
                    {pagina == 1?
                        <>
                            <View style={{alignItems: 'center'}}>
                                <Title style={{color: colors.primary}}>Marque os 3 g??neros favoritos</Title>
                            </View>
                            <View
                                style={{flex: 3, alignItems: 'center', justifyContent: 'center'}}
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
                                    <Title style={{color: colors.primary}}>G??neros marcados</Title>
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
                            <View style={{width: '90%', flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
                                <View style={{flex: 1, alignItems: 'center'}}>
                                    <Button
                                        mode="text"
                                        onPress={() => pular()}
                                        loading={botaoPularCarregando}
                                        color={colors.primary}
                                    >
                                        PULAR
                                    </Button>
                                </View>
                                <View style={{alignItems: 'center'}}>
                                    <Button
                                        mode="contained"
                                        onPress={() => avancar()}
                                        loading={botaoCarregando}
                                    >
                                        PR??XIMA
                                    </Button>
                                </View>
                            </View>
                        </>
                    :pagina == 2?
                    <>                       
                        <View>
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
                        </View>

                        <DraggableFlatList
                            data={livrosFavoritos}
                            renderItem={renderItemLivrosFavoritos}
                            keyExtractor={(item, index) => `draggable-item-${item.id}`}
                            onDragEnd={({ data }) => mudarLivrosFavoritos(data)}
                        />
                            
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={listaLivros}
                            renderItem={renderItemLivrosBuscados}
                            keyExtractor={livro => livro.id}
                        />

                        <View style={{width: '90%', flexDirection: 'row', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 10}}>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Button
                                    mode="contained"
                                    onPress={() => voltar()}
                                    loading={botaoCarregando}
                                >
                                    ANTERIOR
                                </Button>
                            </View>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Button
                                    mode="contained"
                                    onPress={() => salvar()}
                                    loading={botaoCarregando}
                                >
                                    SALVAR
                                </Button>
                            </View>
                        </View>
                    </>
                    :
                        null
                    }
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

    tituloView: {
        width: '80%'
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

export default connect(mapStateToProps, mapDispatchProps)(PrimeiroAcessoTela);