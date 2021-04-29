import React, { useEffect, useState } from 'react';
import { Button, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';

const EstanteTela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaLivros, mudarlistaLivros] = useState([]);
    const db = firebase.firestore();
    
    useEffect(() => {
        props.buscarUsuario();
        //ordenar por ordem alfabética
        const unsubscribe = props.navigation.addListener('focus', () => {
            mudarPaginaCarregada(false);
            db.collection('usuarios').doc(firebase.auth().currentUser.uid).get()
            .then((resposta) => {
                let usuarioResposta = resposta.data();
                if (usuarioResposta.estante.length > 0) {
                    let estanteArray = [];
                    for (let i = 0; i < usuarioResposta.estante.length; i++) {
                        estanteArray.push(usuarioResposta.estante[i].livro.id);
                    }
                    db.collection('livros').where(firebase.firestore.FieldPath.documentId(), 'in', estanteArray).get()
                        .then((livros) => {
                            let listaLivros = [];
                            let listaLivrosAux = [];
                            livros.forEach((resp) => {
                                let livro = resp.data();
                                livro.id = resp.id;
                                listaLivrosAux.push(livro);
                            });

                            db.collection('status').get()
                                .then((status) => {
                                    let listaStatus = [];
                                    status.forEach((resp2) => {
                                        let status_aux = resp2.data();
                                        status_aux.id = resp2.id;
                                        listaStatus.push(status_aux);
                                    });
                                    for (let i = 0; i < usuarioResposta.estante.length; i++) {
                                        for (let j = 0; j < listaLivrosAux.length; j++) {
                                            if (usuarioResposta.estante[i].livro.id === listaLivrosAux[j].id) {
                                                for (let k = 0; k < listaStatus.length; k++) {
                                                    if (listaStatus[k].id === usuarioResposta.estante[i].status_leitura.id) {
                                                        listaLivrosAux[j].status = listaStatus[k].nome;
                                                        listaLivrosAux[j].registro =usuarioResposta.estante[i];
                                                        break;
                                                    }
                                                }
                                                
                                                listaLivros.push(listaLivrosAux[j]);
                                            }
                                        }
                                    }
                                    mudarlistaLivros(listaLivros);
                                    mudarPaginaCarregada(true);
                                })
                                .catch((erro) => {
                                    console.log(erro)
                                })
                        })
                        .catch((erro) => {
                            mudarPaginaCarregada(true);
                        })
                } else {
                    mudarlistaLivros([]);
                    mudarPaginaCarregada(true); 
                }
            })
            .catch((erro) => {
                mudarPaginaCarregada(true);
                console.log('Erro: ' + erro);
            })
        });
      
        return () => {
            unsubscribe;
        };
    }, []);

    const exluirLivroFavorito = (livro) => {
        mudarPaginaCarregada(false);
        let livroExcluir;
        let novaListaLivro = [];
        listaLivros.forEach((livroUsuario) => {
            if (livroUsuario.id === livro.id) {
                livroExcluir = livroUsuario.registro;
            } else {
                novaListaLivro.push(livroUsuario);
            }
        })
        return db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            estante: firebase.firestore.FieldValue.arrayRemove(livroExcluir)
        })
        .then(() => {
            mudarlistaLivros(novaListaLivro);
            mudarPaginaCarregada(true);
        })
        .catch((erro) => {
            console.log('Erro: ' + erro);
            mudarPaginaCarregada(true);
        });
    }

    const renderItem = ({ item }) => {
        return (
            <View
                key={item.id}
                style={{marginVertical: 8, width: '90%', alignSelf: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 10, height: 56, paddingLeft: 20, alignItems: 'center', flexDirection: 'row'}}
            >
                <Text style={{flex: 8}}>{item.nome}</Text>
                <Ionicons 
                    style={{flex: 1}}
                    name="trash"
                    color={colors.primary}
                    size={16}
                    onPress={() => exluirLivroFavorito(item)}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container]}>
            {paginaCarregada?
                <>
                    <Button
                        style={{flex: 1, marginBottom: 10}}
                        mode={'contained'}
                        onPress={() => props.navigation.navigate('AtualizarLivrosEstante')}
                        style={{width: '90%'}}
                    >
                        ADICIONAR
                    </Button>
                    {listaLivros.length > 0?
                        <View style={{flex: 10, width: '100%'}}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                data={listaLivros}
                                renderItem={renderItem}
                                keyExtractor={genero => genero.id}
                            />
                        </View>
                    :
                        <View style={{width: '100%', flex: 2, alignItems: 'center', justifyContent: 'center'}}>
                            <Title style={{color: colors.primary}}>Nenhum livro adicionado</Title>
                        </View>
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
        alignItems: 'center',
        justifyContent: 'center'
    }
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(EstanteTela);