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

const LivrosFavoritosTela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaLivros, mudarlistaLivros] = useState([]);
    const db = firebase.firestore();
    
    useEffect(() => {
        props.buscarUsuario();
        //ordenar por ordem alfabética
        db.collection('livros').where(firebase.firestore.FieldPath.documentId(), 'in', props.usuarioAtual.livros).get()
        .then((livros) => {
            let listaLivros = [];
            livros.forEach((resp) => {
                let livro = resp.data();
                livro.id = resp.id;
                listaLivros.push(livro);
            })
            mudarlistaLivros(listaLivros);
            mudarPaginaCarregada(true);
        })
        .catch((erro) => {
            console.log('Erro: ', erro);
        });

        const unsubscribe = props.navigation.addListener('focus', () => {
            mudarPaginaCarregada(false);
            db.collection('usuarios').doc(firebase.auth().currentUser.uid).get()
            .then((resposta) => {
                let usuarioResposta = resposta.data();
                db.collection('livros').where(firebase.firestore.FieldPath.documentId(), 'in', usuarioResposta.livros).get()
                .then((livros) => {
                    let listaLivros = [];
                    livros.forEach((resp) => {
                        let livro = resp.data();
                        livro.id = resp.id;
                        listaLivros.push(livro);
                    })
                    mudarlistaLivros(listaLivros);
                    mudarPaginaCarregada(true);
                })
                .catch((erro) => {
                    console.log('teste');
                })
            })
            .catch((erro) => {
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
        props.usuarioAtual.livros.forEach((livroUsuario) => {
            if (livroUsuario.id === livro.id) {
                livroExcluir = livroUsuario;
            } else {
                novaListaLivro.push(livroUsuario);
            }
        })
        return db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            livros: firebase.firestore.FieldValue.arrayRemove(livroExcluir)
        })
        .then(() => {
            props.buscarUsuario();
            if (novaListaLivro.length > 0) {
                db.collection('livros').where(firebase.firestore.FieldPath.documentId(), 'in', novaListaLivro).get()
                .then((livros) => {
                    let listaLivros = [];
                    livros.forEach((resp) => {
                        let livro = resp.data();
                        livro.id = resp.id;
                        livro.referencia = resp;
                        listaLivros.push(livro);
                    })
                    mudarlistaLivros(listaLivros);
                    mudarPaginaCarregada(true);
                })
                .catch((erro) => {
                    console.log('Erro: ', erro);
                });
            } else {
                mudarlistaLivros([]);
                mudarPaginaCarregada(true);
            }
        })
        .catch((erro) => {
            mudarPaginaCarregada(true);
        });
    }

    const renderItem = ({ item }) => {
        return (
            <View
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
                        onPress={() => props.navigation.navigate('AtualizarLivrosFavoritos')}
                        style={{width: '90%'}}
                    >
                        ADICIONAR
                    </Button>
                    <View style={{flex: 10, width: '100%'}}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={listaLivros}
                            renderItem={renderItem}
                            keyExtractor={genero => genero.id}
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
        alignItems: 'center',
        justifyContent: 'center'
    }
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(LivrosFavoritosTela);