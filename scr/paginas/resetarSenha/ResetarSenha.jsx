import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import firebase from 'firebase/app';
import 'firebase/firestore';

const ResetarSenhaTela = ({ navigation }) => {
    const [email, mudarEmail] = useState('');
    const [erroEmail, mudarErroEmail] = useState(false);
    const [carregada, mudarCarregada] = useState(true);
    const [mostrarModal, mudarMostrarModal] = useState(false);
    const [mensagemErro, mudarMensagemErro] = useState('');
    const [botaoCarregando, mudarBotaoCarregando] = useState(false);

    const resetarSenha = () => {
        mudarBotaoCarregando(true);
        let verificador = true;
        if (email === '') {
            verificador = false;
            mudarErroEmail(true);
            mudarMensagemErro('O campo e-mail é obrigatório');
        }

        if (verificador) {
            firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                mudarBotaoCarregando(false);
                navigation.navigate('Login');
            })
            .catch((resposta) => {
                switch(resposta.code) {
                    case 'auth/user-not-found':
                        mudarMensagemErro('Usuário não encontrado');
                        mudarErroEmail(true);
                        break;
                    case 'auth/invalid-email':
                        mudarMensagemErro('E-mail inválido');
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
            mudarMostrarModal(true);
        }
        
    }

    const mudarEmailFuncao = (texto) => {
        mudarErroEmail(false);
        mudarEmail(texto);
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
            {carregada?
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
                        label="E-mail"
                        mode="outlined"
                        value={email}
                        onChangeText={(email) => mudarEmailFuncao(email)}
                        style={styles.textInput}
                        error={erroEmail}
                    />
                    <Button
                        mode={'contained'}
                        onPress={() => resetarSenha()}
                        style={{width: '80%', marginTop: 10}}
                        loading={botaoCarregando}
                    >
                        RESETAR SENHA
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

export default ResetarSenhaTela;