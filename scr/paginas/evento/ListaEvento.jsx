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

const ListaEventoTela = (props) => {
    const { colors } = useTheme();
    const db = firebase.firestore();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [listaEvento, mudarListaEvento] = useState([]);
    const [mostrarMenu, mudarMostrarMenu] = useState(false);
    const [meusEventos, mudarMeusEventos] = useState(false);
    const [menu, mudarMenu] = useState({
        texto: 'Todos os gêneros',
        id: ''
    });
    const [mensagemModal, mudarMensagemModal] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);

    useEffect(() => {
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

                console.log(listaEventos);
                for (let i = 0; i < listaEventos.length; i++) {
                    for (let j = 0; j < listaEstabelecimentosAux.length; j++) {
                        if (listaEventos[i].estabelecimento.id === listaEstabelecimentosAux[j].id) {
                            listaEventos[i].estabelecimentoInformacoes = listaEstabelecimentosAux[j];
                            if (listaEventos[i].data) {
                                let dia = listaEventos[i].data.toDate().getDate();
                                if (dia < 10) {
                                    dia = '0' + dia;
                                }
                                let mes = listaEventos[i].data.toDate().getMonth();
                                if (mes < 10) {
                                    mes = '0' + mes;
                                }
                                let ano = listaEventos[i].data.toDate().getFullYear();
                                let hora = listaEventos[i].data.toDate().getHours();
                                if (hora < 10) {
                                    hora = '0' + hora;
                                }
                                let minuto = listaEventos[i].data.toDate().getMinutes();
                                if (minuto < 10) {
                                    minuto = '0' + minuto;
                                }
                                let segundo = listaEventos[i].data.toDate().getSeconds();
                                if (segundo < 10) {
                                    segundo = '0' + segundo;
                                }
                                listaEventos[i].data = dia + '/' + mes + '/' + ano + ' ' + hora + ':' + minuto + ':' + segundo;
                            } else {
                                listaEventos[i].data = 'Sem data definida';
                            }
                        }
                    }
                }
                mudarListaEvento(listaEventos);
                mudarPaginaCarregada(true);
            })
        })
        .catch((erro) => {
            console.log('Erro: ' + erro);
        });
    }, []);

    const openMaps = (evento) => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${evento.estabelecimentoInformacoes.localizacao.U},${evento.estabelecimentoInformacoes.localizacao.k}&zoom=15&query_place_id=${evento.estabelecimentoInformacoes.google_maps_id}`);
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
                        <Text style={styles.title}>{`Evento: ${item.nome}`}</Text>
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
                        
                        <Text style={styles.title}>{`Dia/Hora: ${item.data}`}</Text>
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
                mudarMostrarModal(true);
            }).catch((erro) => {
                mudarMensagemModal('Erro ao excluir o evento: ' + erro);
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
            listaEventos.push(evento);
        })
        mudarMeusEventos(!meusEventos);
        mudarListaEvento(listaEventos);
    }

    const atualizarLista = () => {
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

                console.log(listaEventos);
                for (let i = 0; i < listaEventos.length; i++) {
                    for (let j = 0; j < listaEstabelecimentosAux.length; j++) {
                        if (listaEventos[i].estabelecimento.id === listaEstabelecimentosAux[j].id) {
                            listaEventos[i].estabelecimentoInformacoes = listaEstabelecimentosAux[j];
                            if (listaEventos[i].data) {
                                let dia = listaEventos[i].data.toDate().getDate();
                                if (dia < 10) {
                                    dia = '0' + dia;
                                }
                                let mes = listaEventos[i].data.toDate().getMonth();
                                if (mes < 10) {
                                    mes = '0' + mes;
                                }
                                let ano = listaEventos[i].data.toDate().getFullYear();
                                let hora = listaEventos[i].data.toDate().getHours();
                                if (hora < 10) {
                                    hora = '0' + hora;
                                }
                                let minuto = listaEventos[i].data.toDate().getMinutes();
                                if (minuto < 10) {
                                    minuto = '0' + minuto;
                                }
                                let segundo = listaEventos[i].data.toDate().getSeconds();
                                if (segundo < 10) {
                                    segundo = '0' + segundo;
                                }
                                listaEventos[i].data = dia + '/' + mes + '/' + ano + ' ' + hora + ':' + minuto + ':' + segundo;
                            } else {
                                listaEventos[i].data = 'Sem data definida';
                            }
                        }
                    }
                }
                mudarListaEvento(listaEventos);
                mudarPaginaCarregada(true);
            })
        })
        .catch((erro) => {
            console.log('Erro: ' + erro);
        });
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
                                    <Text style={styles.textStyle}>Fechar aviso</Text>
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
                            anchor={<Button onPress={abrirMenu}>{menu.texto}</Button>}>
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Todos os gêneros', id: ''})} title="Todos" />
                            {/* <Menu.Item onPress={() => selecionarMenu({texto: 'Meus gêneros favoritos', id: ''})} title="Meus gêneros favoritos" /> */}
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Auto Ajuda', id: 'FEjoajl7XMF6Htow4uzl'})} title="Auto Ajuda" />
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Aventura', id: 'sINFmEZpO5iBiVpHjypw'})} title="Aventura" />
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Conto', id: 'Zb2jZ10e53W8xnnDD5tz'})} title="Conto" />
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Drama', id: 'N93R3vJEZDaxMWJ7zMLZ'})} title="Drama" />
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Fantasia', id: '8LYB8k19vgz2h2W7HlqN'})} title="Fantasia" />
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Ficção Científica', id: 'rfSwARK1ghJi3frQkZbW'})} title="Ficção Científica" />
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Poesia', id: 'nR9V4Ra1khlsF4V60cZB'})} title="Poesia" />
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Romance', id: 'z0coz0ANGSP52ow1QArl'})} title="Romance" />
                            <Menu.Item onPress={() => selecionarMenu({texto: 'Terror', id: 'cLUGrR3awrazgjEg9xaW'})} title="Terror" />
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
                        <View
                            style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', padding: 8}}
                        >
                            <Ionicons 
                                style={{marginRight: 5}}
                                name="refresh"
                                color={colors.primary}
                                size={25}
                                onPress={() => atualizarLista()}
                            />
                            <Ionicons 
                                name="add-circle"
                                color={colors.primary}
                                size={25}
                                onPress={() => props.navigation.navigate('CriarEvento')}
                            />
                        </View>
                    </View>
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