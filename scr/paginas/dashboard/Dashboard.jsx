import React, { useEffect, useState } from 'react';
import { Divider, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import firebase, { auth } from 'firebase/app';
import 'firebase/firestore';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { buscarUsuario, logOut } from '../../redux/acoes/Acoes';
import Ionicons from '@expo/vector-icons/Ionicons';

const DashboardTela = (props) => {
    const { colors } = useTheme();
    const db = firebase.firestore();
    const [listaUsuarios, mudarListaUsuarios] = useState([]);
    const [listaGeneros, mudarListaGeneros] = useState([]);
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);

    useEffect(() => {
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

                db.collection('usuarios').orderBy('nome', 'asc').get()
                    .then((usuarios) => {
                        let listaUsuarios = [];
                        usuarios.forEach((resp) => {
                            let usuario = resp.data();
                            usuario.id = resp.id;
                            let verificarUsuario = true;
                            for (let i = 0; i < listaUsuariosMatches.length; i++) {
                                if (usuario.id === listaUsuariosMatches[i].id) {
                                    verificarUsuario = false;
                                    break;
                                }
                            }
                            if (verificarUsuario) {
                                listaUsuarios.push(usuario);
                            }
                        });
                        let listaStatusLiterario = [];
                        for (let i = 0; i < listaUsuarios.length; i++) {
                            if (listaUsuarios[i].status_literario) {
                                listaStatusLiterario.push(listaUsuarios[i].status_literario.id);
                            }
                        }
                        db.collection('generos').orderBy('nome', 'asc').get()
                            .then((generos) => {
                                let listaGeneros = [];
                                generos.forEach((resp) => {
                                    let genero = resp.data();
                                    genero.id = resp.id;
                                    listaGeneros.push(genero);
                                });
                                
                                db.collection('livros').where(firebase.firestore.FieldPath.documentId(), 'in', listaStatusLiterario).get()
                                    .then((statusliterarios) => {
                                        let listaStatusLiterarioAux = [];
                                        statusliterarios.forEach((resp) => {
                                            let statusliterario = resp.data();
                                            statusliterario.id = resp.id;
                                            listaStatusLiterarioAux.push(statusliterario);
                                        });

                                        for (let i = 0; i < listaUsuarios.length; i++) {
                                            for (let j = 0; j < listaUsuarios[i].generos_top_3.length; j++) {
                                                for (let k = 0; k < listaGeneros.length; k++) {
                                                    if (listaUsuarios[i].generos_top_3[j].id === listaGeneros[k].id) {
                                                        listaUsuarios[i].generos_top_3[j].nome = listaGeneros[k].nome;
                                                    }
                                                }
                                            }

                                            for (let j = 0; j < listaStatusLiterarioAux.length; j++) {
                                                if (listaUsuarios[i].status_literario) {
                                                    if (listaStatusLiterarioAux[j].id === listaUsuarios[i].status_literario.id) {
                                                        listaUsuarios[i].status_literario.nome = listaStatusLiterarioAux[j].nome;
                                                    }
                                                }
                                            }
                                        }

                                        mudarListaUsuarios(listaUsuarios);
                                        mudarPaginaCarregada(true);
                                    })
                                    .catch((erro) => {
                                        console.log('Erro: ', erro);
                                    })
                                
                            })
                            .catch((erro) => {
                                console.log('Erro: ', erro);
                            });
                    })
                    .catch((erro) => {
                        console.log('Erro: ', erro);
                    });
            })
            .catch((erro) => {
                console.log('Erro: ' + erro);
            })   
    }, []);

    const renderItem = ({ item }) => (
        <>
            {props.usuarioAtual.email !== item.email?
                <View
                    style={styles.item}
                >
                    <View
                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10}}
                    >
                        <Text style={styles.title}>{`Nome: ${item.nome}`}</Text>
                        <Ionicons 
                            name="add-circle"
                            color={colors.primary}
                            size={25}
                            onPress={() => match(item)}
                        />
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
                </View>
            :
                null
            }
        </>
    );

    const match = (item) => {
        let listaUsuariosAux = [];
        console.log(props.usuarioAtual)
        db.collection('matches').where('usuario_1', '==', item.id).where('usuario_2', '==', firebase.auth().currentUser.uid).get()
            .then((matches) => {
                let match = {};
                matches.forEach((resp) => {
                    match = resp.data();
                    match.id = resp.id;
                });
                if (match !== {}) {
                    db.collection('matches').doc(match.id).update({
                        status: true
                    })    
                        .then((resp) => {
                            listaUsuarios.forEach((usuario) => {
                                if (usuario.id !== item.id) {
                                    listaUsuariosAux.push(usuario);
                                }
                            })
                            mudarListaUsuarios(listaUsuariosAux);
                        })
                        .catch((erro) => {
                            console.log('Erro: ' + erro);
                        })
                } else {
                    db.collection('matches').add({
                        usuario_1: firebase.auth().currentUser.uid,
                        usuario_2: item.id,
                        status: false
                    })
                    .then((resp) => {
                        listaUsuarios.forEach((usuario) => {
                            if (usuario.id !== item.id) {
                                listaUsuariosAux.push(usuario);
                            }
                        })
                        mudarListaUsuarios(listaUsuariosAux);
                    })
                    .catch((erro) => {
                        console.log('Erro: ' + erro);
                    })
                }
            })
            .catch((erro) => {
                console.log('Erro: ' + erro);
            })
    }

    return (
        <SafeAreaView
            style={styles.container}
        >
            {props.usuarioAtual?
                <>
                    <Title style={{color: colors.primary}}>
                        Dê um match
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
        justifyContent: "center",
        alignItems: "center",
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

    button: {
        width: '80%',
        backgroundColor: "#2196F3",
        alignItems: "center",
    },

    textButton: {
        color: '#FFF'
    }
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({buscarUsuario, logOut}, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(DashboardTela);