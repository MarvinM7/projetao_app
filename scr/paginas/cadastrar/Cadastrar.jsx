import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import firebase from 'firebase';

const CadastrarTela = () => {
    const [nome, mudarNome] = useState('');
    const [email, mudarEmail] = useState('');
    const [senha, mudarSenha] = useState('');

    const cadastrar = () => {
        firebase.auth().createUserWithEmailAndPassword(email, senha)
        .then((usuario) => {
            usuario.user.updateProfile({
                displayName: nome
            })
            console.log(usuario)
        })
        .catch((resposta) => {
            console.log(resposta)
        })
    }    

    return (
        <View
            style={styles.container}
        >
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
        </View>
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