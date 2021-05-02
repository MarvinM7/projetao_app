import React, { useEffect, useState } from 'react';
import { Button, Checkbox, TextInput, Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';

const MeusDadosTela = (props) => {
    const { colors } = useTheme();
    const db = firebase.firestore();
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    const [nome, mudarNome] = useState('');
    const [erroNome, mudarErroNome] = useState(false);
    const [descricao, mudarDescricao] = useState('');
    const [cidades, mudarCidades] = useState([]);
    const [instagram, mudarInstagram] = useState('');
    const [twitter, mudarTwitter] = useState('');
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const [mensagemModal, mudarMensagemModal] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);
    
    useEffect(() => {
        props.buscarUsuario();
        mudarNome(props.usuarioAtual.nome);
        if (props.usuarioAtual.descricao !== '') {
            mudarDescricao(props.usuarioAtual.descricao);
        }
        if (props.usuarioAtual.instagram !== '') {
            mudarInstagram(props.usuarioAtual.instagram);
        }
        if (props.usuarioAtual.twitter !== '') {
            mudarTwitter(props.usuarioAtual.twitter);
        }
        db.collection('cidades').orderBy('nome', 'asc').get()
            .then((cidades) => {
                let listaCidades = [];
                cidades.forEach((resp) => {
                    let cidade = resp.data();
                    cidade.id = resp.id;
                    cidade.marcado = false;
                    for (let i = 0; i < props.usuarioAtual.cidades.length; i++) {
                        if (cidade.id === props.usuarioAtual.cidades[i].id) {
                            cidade.marcado = true;
                        }
                    }
                    listaCidades.push(cidade);
                })
                mudarCidades(listaCidades);
                mudarPaginaCarregada(true);
            })
            .catch((erro) => {
                console.log('Erro: ' + erro);
            });
    }, []);

    const mudarNomeFuncao = (texto) => {
        mudarErroNome(false);
        mudarNome(texto);
    }

    const salvar = () => {
        let verificador = true;
        if (nome === '') {
            mudarErroNome(true);
            mudarMensagemModal('O campo nome não pode ser vazio')
            verificador = false;
        }

        if (verificador) {
            mudarBotaoCarregando(true);
            let listaCidades = [];
            cidades.forEach((cidade) => {
                if (cidade.marcado) {
                    listaCidades.push(db.doc("cidades/" + cidade.id));
                }
            });

            db.collection('usuarios').doc(firebase.auth().currentUser.uid).update({
                nome,
                descricao,
                cidades: listaCidades,
                instagram,
                twitter
            })
            .then(() => {
                props.buscarUsuario();
                mudarBotaoCarregando(false);
                mudarMensagemModal('Dados atualizados com sucesso.');
                mudarMostrarModal(true);
            })
            .catch((erro) => {
                mudarBotaoCarregando(false);
                console.log('Erro: ' + erro)
            })
        }
    }

    const renderItemCidades = ({ item }) => {
        return (
            <View
                style={[styles.item, {borderColor: colors.primary, borderRadius: 10}]}
            >
                <Checkbox.Item
                    label={item.nome}
                    status={item.marcado ? 'checked' : 'unchecked'}
                    onPress={() => marcarCidade(item)}
                    color={colors.primary}
                />
            </View>
        )
    }

    const marcarCidade = (item) => {
        let listaCidades = [];
        cidades.forEach((cidade) => {
            if (cidade.id === item.id) {
                cidade.marcado = !cidade.marcado;
            }
            listaCidades.push(cidade)
        })

        mudarCidades(listaCidades);
    }

    const mudarInstagramFuncao = (texto) => {
        if (texto.includes('@')) {
            mudarMensagemModal('Não precisar colocar @')
            mudarMostrarModal(true);
        } else {
            mudarInstagram(texto);
        }
    }

    const mudarTwitterFuncao = (texto) => {
        if (texto.includes('@')) {
            mudarMensagemModal('Não precisar colocar @')
            mudarMostrarModal(true);
        } else {
            mudarTwitter(texto);
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
                    <TextInput 
                        label="Nome"
                        mode="outlined"
                        value={nome}
                        onChangeText={(nome) => mudarNomeFuncao(nome)}
                        style={{width: '90%', marginVertical: 8}}
                        error={erroNome}
                    />
                    <TextInput 
                        label="Descrição"
                        mode="outlined"
                        value={descricao}
                        multiline={true}
                        onChangeText={(descricao) => mudarDescricao(descricao)}
                        style={{width: '90%', marginVertical: 8, height: 100, justifyContent:"center"}}
                    />
                    <View style={{flexDirection: 'row', alignItems: 'center', width: '90%'}}>
                        <TextInput 
                            label="Instagram"
                            mode="outlined"
                            value={instagram}
                            onChangeText={(instagram) => mudarInstagramFuncao(instagram)}
                            style={{flex: 4, marginVertical: 8}}
                        />
                        <View style={{flex: 1}}>

                        </View>
                        <TextInput 
                            label="Twitter"
                            mode="outlined"
                            value={twitter}
                            onChangeText={(twitter) => mudarTwitterFuncao(twitter)}
                            style={{flex: 4, marginVertical: 8}}
                        />
                    </View>
                    <View
                        style={{width: '90%', alignItems: 'flex-start'}}
                    >
                        <Title>Lista de cidades</Title>
                    </View>
                    <FlatList
                        style={{width: '90%'}}
                        data={cidades}
                        renderItem={renderItemCidades}
                        keyExtractor={livro => livro.id}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    />
                    <Button
                        mode={'contained'}
                        onPress={() => salvar()}
                        style={{width: '90%', marginVertical: 20}}
                        loading={botaoCarregando}
                    >
                        SALVAR
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

    item: {
        marginVertical: 8,
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

export default connect(mapStateToProps, mapDispatchProps)(MeusDadosTela);