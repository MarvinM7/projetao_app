import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as GoogleSignIn from 'expo-google-sign-in';
import { Button, TextInput } from 'react-native-paper';

const LoginTela = (props) => {
    const [email, mudarEmail] = useState('');
    const [erroEmail, mudarErroEmail] = useState(false);
    const [senha, mudarSenha] = useState('');
    const [erroSenha, mudarErroSenha] = useState(false);
    const [mensagemErro, mudarMensagemErro] = useState('');
    const [mostrarModal, mudarMostrarModal] = useState(false);
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);
    const [botaoGoogleCarregando, mudarBotaoGoogleCarregando] = useState(false);

    const logar = () => {
        mudarBotaoCarregando(true);
        let verificador = true;
        if (email === '') {
            verificador = false;
            mudarErroEmail(true);
        }

        if (senha === '') {
            verificador = false;
            mudarErroSenha(true);
        }

        if (verificador) {
            firebase.auth().signInWithEmailAndPassword(email, senha)
                .then((resposta) => {
                    
                })
                .catch((resposta) => {
                    switch(resposta.code) {
                        case 'auth/user-not-found':
                            mudarMensagemErro('Usuário não encontrado.');
                            mudarErroEmail(true);
                            break;
                        case 'auth/wrong-password':
                            mudarMensagemErro('Senha errada.');
                            mudarErroSenha(true);
                            break;
                        case 'auth/invalid-email':
                            mudarMensagemErro('E-mail inválido.');
                            mudarErroEmail(true);
                            break;
                        default:
                            null
                    }
                    mudarMostrarModal(true);
                    mudarBotaoCarregando(false);
                })
        } else {
            mudarBotaoCarregando(false);
        }
    }

    const mudarEmailFuncao = (texto) => {
        mudarErroEmail(false);
        mudarEmail(texto);
    }

    const mudarSenhaFuncao = (texto) => {
        mudarErroSenha(false);
        mudarSenha(texto);
    }

    const logarComGoogle = async () => {
        mudarBotaoGoogleCarregando(true);
        try {
            await GoogleSignIn.askForPlayServicesAsync();
            const { type, user } = await GoogleSignIn.signInAsync();
            if (type === 'success') {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken);
                const googleProfileData = await firebase.auth().signInWithCredential(credential);
            }
            mudarBotaoGoogleCarregando(false);
            return {success: true};
        } catch (message) {
            mudarMensagemErro(message);
            mudarBotaoGoogleCarregando(false);
            return {success: false, data: message};
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
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
            <View
                style={{width: 100, height: 100, backgroundColor: '#2196F3', marginBottom: 30}}
            >

            </View>
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
                onPress={() => logar()}
                style={{width: '80%', marginTop: 10}}
                loading={botaoCarregando}
            >
                LOGAR
            </Button>
            <TouchableOpacity
                onPress={() => props.navigation.navigate('ResetarSenha')}
                style={styles.button}
            >
                <Text
                    style={{alignSelf: 'flex-end'}}
                >
                    Esqueci a senha
                </Text>
            </TouchableOpacity>
            <Button
                mode={'contained'}
                icon={'google'}
                onPress={() => logarComGoogle()}
                style={{width: '80%', marginVertical: 20}}
                loading={botaoGoogleCarregando}
            >
                ENTRAR COM GOOGLE
            </Button>
            <Button
                mode='text'
                onPress={() => props.navigation.navigate('Cadastrar')}
                color={'#2196F3'}
            >
                CADASTRE-SE
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
        width: '80%'
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

export default LoginTela;