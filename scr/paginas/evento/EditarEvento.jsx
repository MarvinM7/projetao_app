import React, { useEffect, useState } from 'react';
import { Button, Menu, Provider, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';

const EditarEventoTela = (props) => {
    const { colors } = useTheme();
    const db = firebase.firestore();
    const evento = props.route.params;
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [mensagemModal, mudarMensagemModal] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);
    const [nome, mudarNome] = useState(evento.nome);
    const [erroNome, mudarErroNome] = useState(false);
    const [descricao, mudarDescricao] = useState(evento.descricao);
    const [erroDescricao, mudarErroDescricao] = useState(false);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const [listaEstabelecimentos, mudarListaEstabelecimentos] = useState([]);
    const [mostrarMenuGenero, mudarMostrarMenuGenero] = useState(false);
    const [menuGenero, mudarMenuGenero] = useState({
        id: '',
        texto: 'Selecione um gênero'
    });
    const [mostrarMenuEstabelecimento, mudarMostrarMenuEstabelecimento] = useState(false);
    const [menuEstabelecimento, mudarMenuEstabelecimento] = useState({
        id: '',
        nome: 'Selecione um estabelecimento'
    });
    const listaGeneros = [
        {id: 'FEjoajl7XMF6Htow4uzl', nome: 'Auto Ajuda'},
        {id: 'sINFmEZpO5iBiVpHjypw', nome: 'Aventura',},
        {id: 'Zb2jZ10e53W8xnnDD5tz', nome: 'Conto'},
        {id: 'N93R3vJEZDaxMWJ7zMLZ', nome: 'Drama'},
        {id: '8LYB8k19vgz2h2W7HlqN', nome: 'Fantasia'},
        {id: 'rfSwARK1ghJi3frQkZbW', nome: 'Ficção Científica'},
        {id: 'nR9V4Ra1khlsF4V60cZB', nome: 'Poesia'},
        {id: 'z0coz0ANGSP52ow1QArl', nome: 'Romance'},
        {id: 'cLUGrR3awrazgjEg9xaW', nome: 'Terror'}
    ]
    
    useEffect(() => {
        props.buscarUsuario();
        console.log(evento);
        db.collection('estabelecimentos').where('cidade', 'in', props.usuarioAtual.cidades).get()
            .then((estabelecimentos) => {
                console.log(estabelecimentos);
                let listaEstabelecimentos = [];
                estabelecimentos.forEach((resp) => {
                    let estabelecimento = resp.data();
                    estabelecimento.id = resp.id;
                    listaEstabelecimentos.push(estabelecimento);
                });
                listaEstabelecimentos.forEach((estabelecimento) => {
                    if (estabelecimento.id === evento.estabelecimento.id) {
                        mudarMenuEstabelecimento({
                            id: estabelecimento.id,
                            nome: estabelecimento.nome
                        })
                    }
                })
                listaGeneros.forEach((genero) => {
                    if (genero.id === evento.genero.id) {
                        mudarMenuGenero({
                            id: genero.id,
                            nome: genero.nome
                        })
                    }
                })
                mudarListaEstabelecimentos(listaEstabelecimentos);
                mudarPaginaCarregada(true);
            })
        mudarPaginaCarregada(true);
    }, []);

    const mudarNomeFuncao = (texto) => {
        mudarErroNome(false);
        mudarNome(texto);
    }

    const mudarDescricaoFuncao = (texto) => {
        mudarErroDescricao(false);
        mudarDescricao(texto);
    }

    const abrirMenuGenero = () => {
        mudarMostrarMenuGenero(true);
    }

    const fecharMenuGenero = () => {
        mudarMostrarMenuGenero(false);
    }

    const selecionarMenuGenero = (obj) => {
        mudarMenuGenero(obj);
        fecharMenuGenero();
    }

    const abrirMenuEstabelecimento = () => {
        mudarMostrarMenuEstabelecimento(true);
    }

    const fecharMenuEstabelecimento = () => {
        mudarMostrarMenuEstabelecimento(false);
    }

    const selecionarMenuEstabelecimento = (obj) => {
        mudarMenuEstabelecimento(obj);
        fecharMenuEstabelecimento();
    }

    const atualizarEvento = () => {
        mudarBotaoCarregando(true);
        let verificador = true;
        if (nome === '') {
            verificador = false;
            mudarErroNome(true);
            mudarMensagemModal('O campo nome é obrigatório');
        } else if (descricao === '') {
            verificador = false;
            mudarErroDescricao(true);
            mudarMensagemModal('O campo descricao é obrigatório');
        } else if (menuGenero.id === '') {
            verificador = false;
            mudarMensagemModal('O campo gênero é obrigatório');
        } else if (menuEstabelecimento.id === '') {
            verificador = false;
            mudarMensagemModal('O campo estabelecimento é obrigatório');
        }

        if (verificador) {
            db.collection('eventos').doc(evento.id).update({
                nome,
                descricao,
                genero: db.doc('generos/' + menuGenero.id),
                estabelecimento: db.doc('estabelecimentos/' + menuEstabelecimento.id),
                data: firebase.firestore.Timestamp.now(),
                criador: db.doc('usuarios/' + firebase.auth().currentUser.uid)
            })
            .then(() => {
                mudarBotaoCarregando(false);
                props.navigation.navigate('RotasLogado');
            })
            .catch((resposta) => {
                mudarMensagemModal('Erro ao tentar atualizar o evento, favor tente novamente');
                mudarMostrarModal(true);
                mudarBotaoCarregando(false);
                console.error("Erro: ", resposta);
            });
        } else {
            mudarMostrarModal(true);
            mudarBotaoCarregando(false);
        }
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
                            Alert.alert('Modal has been closed.');
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
                    <TextInput
                        label="Nome"
                        mode="outlined"
                        value={nome}
                        onChangeText={(texto) => mudarNomeFuncao(texto)}
                        style={{width: '90%', alignSelf: 'center', marginBottom: 10}}
                        error={erroNome}
                    />
                    <TextInput
                        label="Descrição"
                        mode="outlined"
                        value={descricao}
                        multiline={true}
                        textarea={true}
                        onChangeText={(texto) => mudarDescricaoFuncao(texto)}
                        style={{width: '90%', alignSelf: 'center', marginBottom: 10, height: 150}}
                        error={erroDescricao}
                    />
                    <View
                        style={{width: '100%', alignItems: 'flex-start'}}
                    >
                        <Menu
                            style={{marginVertical: 10}}
                            visible={mostrarMenuGenero}
                            onDismiss={fecharMenuGenero}
                            anchor={
                                <Button
                                    onPress={abrirMenuGenero}
                                >
                                    {menuGenero.nome}
                                </Button>
                            }
                        >
                            <Menu.Item onPress={() => selecionarMenuGenero({nome: 'Selecione um gênero', id: ''})} title="Selecione um gênero" />
                            {listaGeneros.map((genero) => {
                                return (
                                    <Menu.Item
                                        key={genero.id}
                                        onPress={() => selecionarMenuGenero(
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

                        <Menu
                            style={{marginVertical: 10}}
                            visible={mostrarMenuEstabelecimento}
                            onDismiss={fecharMenuEstabelecimento}
                            anchor={
                                <Button
                                    onPress={abrirMenuEstabelecimento}
                                >
                                    {menuEstabelecimento.nome}
                                </Button>
                            }
                        >
                            <Menu.Item onPress={() => selecionarMenuEstabelecimento({nome: 'Selecione um estabelecimento', id: ''})} title="Selecione um estabelecimento" />
                            {listaEstabelecimentos.map((estabelecimento) => {
                                return (
                                    <Menu.Item
                                        key={estabelecimento.id}
                                        onPress={() => selecionarMenuEstabelecimento(
                                            {
                                                id: estabelecimento.id,
                                                nome: estabelecimento.nome
                                            }   
                                        )} 
                                        title={estabelecimento.nome}
                                    />        
                                )
                            })}
                        </Menu>
                    </View>
                    {/* <Button onPress={() => mudarMostrarModalData(true)} uppercase={false} mode="outlined">
                        Pick single date
                    </Button> */}
                    <Text>
                        Resolver problema da data/hora
                    </Text>
                    <Button
                        mode={'contained'}
                        onPress={() => atualizarEvento()}
                        style={{width: '90%', marginTop: 10}}
                        loading={botaoCarregando}
                    >
                        ATUALIZAR EVENTO
                    </Button>
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

export default connect(mapStateToProps, mapDispatchProps)(EditarEventoTela);