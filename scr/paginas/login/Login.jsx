import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import * as GoogleSignIn from 'expo-google-sign-in';

const LoginTela = ({ navigation }) => {
    const [email, mudarEmail] = useState('');
    const [senha, mudarSenha] = useState('');
    const [mensagem, mudarMensagem] = useState('');

    const logar = () => {
        firebase.auth().signInWithEmailAndPassword(email, senha)
        .then((resposta) => {
            
        })
        .catch((resposta) => {
            console.log(resposta)
        })
    }

    const logarComGoogle = async () => {
        try {
            await GoogleSignIn.askForPlayServicesAsync();
            const { type, user } = await GoogleSignIn.signInAsync();
            if (type === 'success') {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken);
                const googleProfileData = await firebase.auth().signInWithCredential(credential);
            }
            return {success: true};
        } catch ({ message }) {
            mudarMensagem(message);
            return {success: false, data: message};
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
            <TextInput 
                placeholder="E-mail"
                onChangeText={(email) => mudarEmail(email)}
                style={styles.textInput}
            />
            <TextInput 
                placeholder="Senha"
                onChangeText={(senha) => mudarSenha(senha)}
                style={styles.textInput}
                secureTextEntry={true}
            />
            <TouchableOpacity
                onPress={() => logar()}
                style={styles.button}
            >
                <Text
                    style={styles.textButton}
                >
                    LOGAR
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate('ResetarSenha')}
            >
                <Text>
                    Esqueci a senha
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => logarComGoogle()}
                style={styles.button}
            >
                <Text
                    style={styles.textButton}
                >
                    Entrar com Google
                </Text>
            </TouchableOpacity>
            <Text>
                {mensagem}
            </Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('Cadastrar')}
            >
                <Text>
                    Cadastre-se
                </Text>
            </TouchableOpacity>
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
    }
});

export default LoginTela;