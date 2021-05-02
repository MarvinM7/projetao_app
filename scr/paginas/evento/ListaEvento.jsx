import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Linking, Modal, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { Button, Checkbox, Divider, Menu, Title, useTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';

const ListaEventoTela = (props) => {
    const { colors } = useTheme();
    const db = firebase.firestore();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaEvento, mudarListaEvento] = useState([]);
    const [listaGeneros, mudarListaGeneros] = useState([]);
    const [mostrarMenu, mudarMostrarMenu] = useState(false);
    const [meusEventos, mudarMeusEventos] = useState(false);
    const [menu, mudarMenu] = useState({
        nome: 'Todos os gêneros',
        id: ''
    });
    const [mensagemModal, mudarMensagemModal] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);
    const [textoBotaoModal, mudarTextoBotaoModal] = useState('Fechar descrição');

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            props.buscarUsuario();
            db.collection('eventos').orderBy('data', 'asc').get()
                .then((eventos) => {
                    let listaEventos = [];
                    let listaEstabelecimentos = [];
                    eventos.forEach((resp) => {
                        let evento = resp.data();
                        evento.id = resp.id;
                        evento.mostrar = true;
                        listaEventos.push(evento);
                        listaEstabelecimentos.push(resp.data().estabelecimento.id);
                    })

                    db.collection('estabelecimentos').where(firebase.firestore.FieldPath.documentId(), 'in', listaEstabelecimentos).get()
                    .then((estabelecimentos) => {
                        let listaEstabelecimentosAux = [];
                        estabelecimentos.forEach((resp) => {
                            let estabelecimento = resp.data();
                            estabelecimento.id = resp.id;
                            listaEstabelecimentosAux.push(estabelecimento);
                            
                        });


                        db.collection('generos').orderBy('nome', 'asc').get()
                        .then((generos) => {
                            let listaGenerosAux = [];
                            generos.forEach((resp) => {
                                let genero = resp.data();
                                genero.id = resp.id;
                                listaGenerosAux.push(genero);
                            });
                            

                            for (let i = 0; i < listaEventos.length; i++) {
                                for (let j = 0; j < listaEstabelecimentosAux.length; j++) {
                                    if (listaEventos[i].estabelecimento.id === listaEstabelecimentosAux[j].id) {
                                        listaEventos[i].estabelecimentoInformacoes = listaEstabelecimentosAux[j];
                                        break;
                                    }
                                }

                                for (let j = 0; j < listaGenerosAux.length; j++) {
                                    if (listaEventos[i].genero.id === listaGenerosAux[j].id) {
                                        listaEventos[i].generoInformacoes = listaGenerosAux[j];
                                        break;
                                    }
                                }
                            }

                            mudarListaGeneros(listaGenerosAux);
                            mudarListaEvento(listaEventos);
                            mudarPaginaCarregada(true);
                        })
                        .catch((erro) => {
                            console.log('Erro: ' + erro);
                        })
                    })
                })
                .catch((erro) => {
                    console.log('Erro: ' + erro);
                });
        });
        return unsubscribe;
    }, [props.navigation]);

    const openMaps = (evento) => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${evento.estabelecimentoInformacoes.localizacao.U},${evento.estabelecimentoInformacoes.localizacao.k}&zoom=15&query_place_id=${evento.estabelecimentoInformacoes.google_maps_id}`);
    }

    const mostrarDescricao = (item) => {
        mudarMensagemModal(item.descricao);
        mudarTextoBotaoModal('Fechar descrição');
        mudarMostrarModal(true);
    }

    const renderItem = ({ item }) => (
        <>
            {item.mostrar?
                <View
                    style={[styles.item, {borderColor: colors.primary}]}
                >
                    <View
                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10}}
                    >
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}
                        >
                            <Ionicons 
                                style={{marginRight: 10}}
                                name="information-circle-outline"
                                color={colors.primary}
                                size={20}
                                onPress={() => mostrarDescricao(item)}
                            />
                            <Text style={styles.title}>{`Evento: ${item.nome}`}</Text>
                        </View>
                        {item.criador.id === firebase.auth().currentUser.uid?
                            <View
                                style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}
                            >
                                <Ionicons 
                                    style={{marginRight: 5}}
                                    name="create"
                                    color={colors.primary}
                                    size={20}
                                    onPress={() => props.navigation.navigate('EditarEvento', item)}
                                />
                                <Ionicons 
                                    name="trash"
                                    color={colors.primary}
                                    size={20}
                                    onPress={() => excluirEvento(item)}
                                />
                            </View>
                        :
                            null
                        }
                    </View>
                    <Divider />
                    <View
                        style={{marginTop: 10}}
                    >
                        <View
                            style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10}}
                        >
                            <Text style={styles.title}>{`Local: ${item.estabelecimentoInformacoes.nome}`}</Text>
                            <Ionicons 
                                name="navigate"
                                color={colors.primary}
                                size={20}
                                onPress={() => openMaps(item)}
                            />
                        </View>
                        <Text style={[styles.title, {marginBottom: 10}]}>{`Dia/Hora: ${moment(item.data.toDate()).format('DD/MM/YYYY hh:mm:ss')}`}</Text>
                        <Text style={styles.title}>{`Gênero: ${item.generoInformacoes.nome}`}</Text>
                    </View>
                </View>
            :
                null
            }
        </>
    );

    const excluirEvento = (item) => {
        db.collection("eventos").doc(item.id).delete()
            .then(() => {
                let listEventosAux = [];
                listaEvento.forEach((evento) => {
                    if (evento.id !== item.id) {
                        listEventosAux.push(evento);
                    }
                })
                mudarListaEvento(listEventosAux);
                mudarMensagemModal('Evento excluído com sucesso');
                mudarTextoBotaoModal('Fechar aviso');
                mudarMostrarModal(true);
            }).catch((erro) => {
                mudarMensagemModal('Erro ao excluir o evento: ' + erro);
                mudarTextoBotaoModal('Fechar aviso');
                mudarMostrarModal(true);
            });
    }

    const abrirMenu = () => {
        mudarMostrarMenu(true);
    }

    const fecharMenu = () => {
        mudarMostrarMenu(false);
    }

    const selecionarMenu = (obj) => {
        let listaEventos = [];
        listaEvento.forEach((evento) => {
            if (meusEventos) {
                if (evento.criador.id === firebase.auth().currentUser.uid) {
                    evento.mostrar = true;
                } else {
                    evento.mostrar = false;
                }
            } else {
                evento.mostrar = true;
            }

            if (obj.id !== '') {
                if (evento.mostrar) {
                    if (obj.id !== evento.genero.id) {
                        evento.mostrar = false;
                    }
                }
            }
            listaEventos.push(evento);
        })
        mudarMenu(obj);
        fecharMenu();
    }

    const marcarFiltro = () => {
        let statusFiltro = !meusEventos;
        let listaEventos = [];
        listaEvento.forEach((evento) => {
            if (statusFiltro) {
                if (evento.criador.id === firebase.auth().currentUser.uid) {
                    evento.mostrar = true;
                } else {
                    evento.mostrar = false;
                }
            } else {
                evento.mostrar = true;
            }
            if (menu.id !== '') {
                if (evento.mostrar) {
                    if (menu.id !== evento.genero.id) {
                        evento.mostrar = false;
                    }
                }
            }
            listaEventos.push(evento);
        })

        mudarMeusEventos(!meusEventos);
        mudarListaEvento(listaEventos);
    }

    return (
        <SafeAreaView
            style={styles.container}
        >
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
                                    {mensagemModal}
                                </Text>
                                <TouchableHighlight
                                    style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                                    onPress={() => {
                                        mudarMostrarModal(false);
                                        mudarMensagemModal('');
                                    }}
                                >
                                    <Text style={styles.textStyle}>{textoBotaoModal}</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </Modal>
                    <View
                        style={{width: '100%', alignItems: 'flex-start'}}
                    >
                        <Menu
                            visible={mostrarMenu}
                            onDismiss={fecharMenu}
                            anchor={
                                <Button
                                    onPress={abrirMenu}
                                >
                                    {menu.nome}
                                </Button>
                            }
                        >
                            <Menu.Item onPress={() => selecionarMenu({id: '', nome: 'Todos os gêneros'})} title="Todos" />
                            {listaGeneros.map((genero) => {
                                return (
                                    <Menu.Item
                                        key={genero.id}
                                        onPress={() => selecionarMenu(
                                            {
                                                id: genero.id,
                                                nome: genero.nome
                                            }   
                                        )} 
                                        title={genero.nome}
                                    />        
                                )
                            })}
                        </Menu>
                    </View>
                    <View
                        style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}
                    >
                        <View
                            style={{flex: 1}}
                        >
                            <Checkbox.Item
                                label={'Meus eventos'}
                                status={meusEventos ? 'checked' : 'unchecked'}
                                onPress={() => marcarFiltro()}
                                color={colors.primary}
                            />
                        </View>
                        {props.usuarioAtual?
                            <>
                                {props.usuarioAtual.cidades.length > 0?
                                    <View
                                        style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', padding: 8}}
                                    >
                                        <Ionicons 
                                            name="add-circle"
                                            color={colors.primary}
                                            size={25}
                                            onPress={() => props.navigation.navigate('CriarEvento')}
                                        />
                                    </View>
                                :
                                    null
                                }
                            </>
                        :
                            null
                        }
                    </View>
                    {props.usuarioAtual?
                        <>
                            {props.usuarioAtual.cidades.length > 0?
                                <>
                                    {listaEvento.length > 0?
                                        <FlatList
                                            style={{width: '100%'}}
                                            data={listaEvento}
                                            renderItem={renderItem}
                                            keyExtractor={evento => evento.id.toString()}
                                            showsVerticalScrollIndicator={false}
                                            showsHorizontalScrollIndicator={false}
                                        />
                                    :
                                        <View style={{width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                                            <Title style={{color: colors.primary}}>Nenhum evento cadastrado</Title>
                                        </View>
                                    }
                                </>
                            :
                                <View style={{width: '80%', alignItems: 'center', justifyContent: 'center'}}>
                                    <Title style={{color: colors.primary}}>Adicione cidades no seu perfil para poder visualizar os eventos</Title>
                                    <Button
                                        mode='contained'
                                        onPress={() => props.navigation.navigate('MeusDados')}
                                        style={{width: '80%', marginVertical: 20}}
                                    >
                                        IR PARA MEU PERFIL
                                    </Button>
                                </View>
                            }
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
        justifyContent: "center",
        alignItems: "center",
    },
    
    item: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderRadius: 5,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 8,
    },
    
    title: {
        fontSize: 20,
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

const mapDispatchProps = (dispatch) => bindActionCreators({buscarUsuario}, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(ListaEventoTela);