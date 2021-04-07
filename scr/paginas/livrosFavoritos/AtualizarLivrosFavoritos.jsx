import React, { useEffect, useState } from 'react';
import { Button, Checkbox, TextInput, Title, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';

const AtualizarLivrosFavoritosTela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaLivros, mudarlistaLivros] = useState([]);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const [texto, mudarTexto] = useState('');
    const window = Dimensions.get('window');
    const db = firebase.firestore();
    
    useEffect(() => {
        props.buscarUsuario();
        db.collection('livros').orderBy('nome', 'asc').get()
        .then((livros) => {
            let listaLivros = [];
            livros.forEach((resp) => {
                let livro = resp.data();
                livro.id = resp.id;
                livro.marcado = false;
                props.usuarioAtual.livros.forEach((livroUsuario) => {
                    if (livro.id === livroUsuario.id) {
                        livro.marcado = true;
                    }
                })
                listaLivros.push(livro);
            })
            mudarlistaLivros(listaLivros);
            mudarPaginaCarregada(true);
        })
        .catch((erro) => {
            console.log('Erro: ', erro);
        });
    }, [])

    const marcarLivro = (livroCheckBox) => {
        let livros = [];
        listaLivros.forEach((livro) => {
            if (livro.id === livroCheckBox.id) {
                livro.marcado = !livro.marcado;
            }
            livros.push(livro)
        })
        mudarlistaLivros(livros);
    }

    const salvar = () => {
        mudarBotaoCarregando(true)
        let listaLivrosMarcados = [];
        listaLivros.forEach((livro) => {
            if (livro.marcado) {
                listaLivrosMarcados.push(db.doc("livros/" + livro.id));
            }
        })
        
        return db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
            livros: listaLivrosMarcados
        })
        .then(() => {
            props.buscarUsuario();
            mudarBotaoCarregando(false);
            //props.navigation.navigate('LivrosFavoritos');
        })
        .catch((erro) => {
            mudarBotaoCarregando(false);
            console.log('Erro: ' + erro)
        })
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
                    props.usuarioAtual.livros.forEach((livroUsuario) => {
                        if (livro.id === livroUsuario.id) {
                            livro.marcado = true;
                        }
                    })
                    listaLivros.push(livro);
                })
                mudarlistaLivros(listaLivros);
                mudarPaginaCarregada(true);
            })
            .catch((erro) => {
                console.log('Erro: ', erro);
            });
        }
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

    return (
        <SafeAreaView style={[styles.container]}>
            {paginaCarregada?
                <>
                    <View style={{flex: 1, width: '100%', alignItems: 'center'}}>
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
                    <View style={{flex: 9, width: '100%'}}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={listaLivros}
                            renderItem={renderItem}
                            keyExtractor={livro => livro.id}
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

export default connect(mapStateToProps, mapDispatchProps)(AtualizarLivrosFavoritosTela);