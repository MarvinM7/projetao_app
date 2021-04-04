import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import firebase from 'firebase';

const CadastrarTela = () => {
    const [nome, mudarNome] = useState('');
    const [email, mudarEmail] = useState('');
    const [senha, mudarSenha] = useState('');
    const [carregada, mudarCarregada] = useState(true);

    const cadastrar = () => {
        mudarCarregada(false);
        firebase.auth().createUserWithEmailAndPassword(email, senha)
        .then((usuario) => {
            firebase.firestore().collection('usuarios')
                .doc(firebase.auth().currentUser.uid)
                .set({
                    nome,
                    email
                })
            usuario.user.updateProfile({
                displayName: nome
            })
        })
        .catch((resposta) => {
            mudarCarregada(true);
            console.log(resposta)
        })
    }    

    return (
        <SafeAreaView
            style={styles.container}
        >
            <StatusBar style="auto" />
            {carregada?
                <>
                    <TextInput 
                        placeholder="Nome"
                        onChangeText={(nome) => mudarNome(nome)}
                        style={styles.textInput}
                    />
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
                        onPress={() => cadastrar()}
                        style={styles.button}
                    >
                        <Text
                            style={styles.textButton}
                        >
                            Cadastrar
                        </Text>
                    </TouchableOpacity>
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
    }
});

export default CadastrarTela;