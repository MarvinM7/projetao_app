import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import firebase from 'firebase/app';
import 'firebase/firestore';

const CadastrarTela = () => {
    const [nome, mudarNome] = useState('');
    const [erroNome, mudarErroNome] = useState(false);
    const [email, mudarEmail] = useState('');
    const [erroEmail, mudarErroEmail] = useState(false);
    const [senha, mudarSenha] = useState('');
    const [erroSenha, mudarErroSenha] = useState(false);
    const [mensagemErro, mudarMensagemErro] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);

    const cadastrar = () => {
        mudarBotaoCarregando(true);
        let verificador = true;
        if (nome === '') {
            mudarErroNome(true);
            mudarMensagemErro('O campo nome é obrigatório')
            verificador = false;
        } else if (email === '') {
            mudarErroEmail(true);
            mudarMensagemErro('O campo e-mail é obrigatório');
            verificador = false;
        } else if (senha === '') {
            mudarErroSenha(true);
            mudarMensagemErro('O campo senha é obrigatório');
            verificador = false
        }

        if (verificador) {
            firebase.auth().createUserWithEmailAndPassword(email, senha)
                .then((usuario) => {
                    firebase.firestore().collection('usuarios')
                        .doc(firebase.auth().currentUser.uid)
                        .set({
                            nome,
                            email,
                            primeiro_acesso: true,
                            livros: [],
                            generos: []
                        })
                    usuario.user.updateProfile({
                        displayName: nome
                    })
                })
                .catch((resposta) => {
                    switch(resposta.code) {
                        case 'auth/email-already-in-use':
                            mudarMensagemErro('Usuário já cadastrado');
                            mudarErroEmail(true);
                            break;
                        case 'auth/invalid-email':
                            mudarMensagemErro('E-mail inválido');
                            mudarErroEmail(true);
                            break;
                        case 'auth/weak-password':
                            mudarMensagemErro('Senha fraca');
                            mudarErroSenha(true);
                            break;
                        default:
                            null
                    }
                    mudarMostrarModal(true);
                    mudarBotaoCarregando(false);
                })
        } else {
            mudarBotaoCarregando(false);
            mudarMostrarModal(true);
        }
    }

    const mudarNomeFuncao = (texto) => {
        mudarErroNome(false);
        mudarNome(texto);
    }

    const mudarEmailFuncao = (texto) => {
        mudarErroEmail(false);
        mudarEmail(texto);
    }

    const mudarSenhaFuncao = (texto) => {
        mudarErroSenha(false);
        mudarSenha(texto);
    }

    return (
        <SafeAreaView
            style={styles.container}
        >
            <StatusBar style="dark" />
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
                            {mensagemErro}
                        </Text>
                        <TouchableHighlight
                            style={{ ...styles.openButton, backgroundColor: '#2196F3' }}
                            onPress={() => {
                                mudarMostrarModal(false);
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
                style={styles.textInput}
                error={erroNome}
            />
            <TextInput 
                label="E-mail"
                mode="outlined"
                value={email}
                onChangeText={(email) => mudarEmailFuncao(email)}
                style={styles.textInput}
                error={erroEmail}
            />
            <TextInput 
                label="Senha"
                mode="outlined"
                value={senha}
                onChangeText={(senha) => mudarSenhaFuncao(senha)}
                style={styles.textInput}
                secureTextEntry={true}
                error={erroSenha}
            />
            <Button
                mode={'contained'}
                onPress={() => cadastrar()}
                style={{width: '80%', marginTop: 10}}
                loading={botaoCarregando}
            >
                CADASTRAR
            </Button>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    textInput: {
        width: '80%'
    },

    button: {
        width: '80%',
        backgroundColor: "#2196F3",
        alignItems: "center",
    },

    textButton: {
        color: '#FFF'
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

export default CadastrarTela;