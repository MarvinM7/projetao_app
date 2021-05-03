import React, { useEffect, useState } from 'react';
import { Divider, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';

const MeusMatchsTela = (props) => {
    const { colors } = useTheme();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaUsuarios, mudarListaUsuarios] = useState([]);
    const db = firebase.firestore();
    
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            mudarPaginaCarregada(false);
            props.buscarUsuario();
            db.collection('matches').where('status', '==', true).get()
                .then((matches) => {
                    let listaUsuariosMatches = [];
                    matches.forEach((resp) => {
                        let match = resp.data();
                        match.id = resp.id;
                        if (match.usuario_1 == firebase.auth().currentUser.uid) {
                            listaUsuariosMatches.push(db.doc('usuarios/' + match.usuario_2));
                        } else if (match.usuario_2 == firebase.auth().currentUser.uid) {
                            listaUsuariosMatches.push(db.doc('usuarios/' + match.usuario_1));
                        }
                    });
                    db.collection('generos').orderBy('nome', 'asc').get()
                        .then((generos) => {
                            let listaGeneros = [];
                            generos.forEach((resp) => {
                                let genero = resp.data();
                                genero.id = resp.id;
                                listaGeneros.push(genero);
                            });
                            db.collection('usuarios').where(firebase.firestore.FieldPath.documentId(), 'in', listaUsuariosMatches).get()
                                .then((usuarios) => {
                                    let listaUsuariosAux = [];
                                    usuarios.forEach((resp) => {
                                        let usuario = resp.data();
                                        usuario.id = resp.id;
                                        listaUsuariosAux.push(usuario)
                                    })

                                    let listaStatusLiterario = [];
                                    for (let i = 0; i < listaUsuariosAux.length; i++) {
                                        if (listaUsuariosAux[i].status_literario) {
                                            listaStatusLiterario.push(listaUsuariosAux[i].status_literario.id);
                                        }

                                        for (let j = 0; j < listaUsuariosAux[i].generos_top_3.length; j++) {
                                            for (let k = 0; k < listaGeneros.length; k++) {
                                                if (listaUsuariosAux[i].generos_top_3[j].id === listaGeneros[k].id) {
                                                    listaUsuariosAux[i].generos_top_3[j].nome = listaGeneros[k].nome;
                                                }
                                            }
                                        }
                                    }                                        

                                    if (listaStatusLiterario.length > 0) {
                                        db.collection('livros').where(firebase.firestore.FieldPath.documentId(), 'in', listaStatusLiterario).get()
                                            .then((statusliterarios) => {
                                                let listaStatusLiterarioAux = [];
                                                statusliterarios.forEach((resp) => {
                                                    let statusliterario = resp.data();
                                                    statusliterario.id = resp.id;
                                                    listaStatusLiterarioAux.push(statusliterario);
                                                });

                                                for (let i = 0; i < listaUsuariosAux.length; i++) {
                                                    for (let j = 0; j < listaStatusLiterarioAux.length; j++) {
                                                        if (listaUsuariosAux[i].status_literario) {
                                                            if (listaStatusLiterarioAux[j].id === listaUsuariosAux[i].status_literario.id) {
                                                                listaUsuariosAux[i].status_literario.nome = listaStatusLiterarioAux[j].nome;
                                                            }
                                                        }
                                                    }
                                                }

                                                mudarListaUsuarios(listaUsuariosAux);
                                                mudarPaginaCarregada(true);
                                            })
                                            .catch((erro) => {
                                                console.log('Erro: ' + erro);
                                            })
                                    } else {
                                        mudarListaUsuarios(listaUsuariosAux);
                                        mudarPaginaCarregada(true);
                                    }
                                    
                                })
                                .catch((erro) => {
                                    console.log('Erro: ' + erro);
                                })
                        })    
                        .catch((erro) => {
                            console.log('Erro: ' + erro);
                        })
                })
                .catch((erro) => {
                    console.log('Erro: ' + erro);
                })
                mudarPaginaCarregada(true);
        });
        return unsubscribe;
    }, [props.navigation]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => props.navigation.navigate('Usuario', item)}
        >
            <View
                style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10}}
            >
                <Text style={styles.title}>{`Nome: ${item.nome}`}</Text>
            </View>
            <Divider />
            <View
                style={{flexDirection: 'row', marginTop: 10}}
            >
                <View
                    style={{flex: 1, paddingRight: 5}}
                >
                    <View
                        style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}
                    >
                        <Ionicons
                            style={{marginRight: 5}}
                            name="radio-button-on"
                            color={'#21f394'}
                            size={10}
                        />
                        <Text
                            style={styles.title}
                        >
                            Status literário
                        </Text>
                    </View>
                    <View
                        style={{display: 'flex', flexDirection: 'row', alignSelf: 'flex-start', marginVertical: 5, backgroundColor: colors.primary, borderRadius: 5, padding: 10}}
                    >
                        <Text
                            style={{color: '#FFF'}}
                        >
                            {item.status_literario? item.status_literario.nome : 'Sem leitura no momento'}
                        </Text>
                    </View>
                </View>

                <View
                    style={{flex: 1, paddingLeft: 5}}
                >
                    <View
                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
                    >
                        <Ionicons
                            style={{marginRight: 5}}
                            name="trophy"
                            color={'#EDE91C'}
                            size={15}
                        />
                        <Text>
                            Top 3 gêneros
                        </Text>
                    </View>
                    {item.generos_top_3.length > 0?
                        item.generos_top_3.map((genero) => {
                            return (
                                <View
                                    key={genero.id}
                                    style={{marginVertical: 5, alignSelf: 'center', backgroundColor: colors.primary, borderRadius: 5, padding: 10}}
                                >
                                    <Text
                                        style={{color: '#FFF'}}
                                    >
                                        {genero.nome}
                                    </Text>
                                </View>
                            )
                        })
                    :
                        null
                    }
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container]}>
            {paginaCarregada?
                <>
                    <Title style={{color: colors.primary}}>
                        Sua lista de matchs
                    </Title>
                    <FlatList
                        style={{width: '100%'}}
                        data={listaUsuarios}
                        renderItem={renderItem}
                        keyExtractor={evento => evento.id.toString()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
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
        alignItems: 'center',
    },

    item: {
        backgroundColor: '#FFF',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 8,
        borderRadius: 5,
        borderColor: '#2196F3',
        borderWidth: 1
    },
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(MeusMatchsTela);