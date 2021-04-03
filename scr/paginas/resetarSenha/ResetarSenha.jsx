import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import firebase from 'firebase';

const ResetarSenhaTela = ({ navigation }) => {
    const [email, mudarEmail] = useState('');
    const [carregada, mudarCarregada] = useState(true);

    const resetarSenha = () => {
        mudarCarregada(false);
        firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            navigation.navigate('Login');
        })
        .catch((resposta) => {
            mudarCarregada(true);
            console.log(resposta);
        })
    }

    return (
        <View style={styles.container}>
            {carregada?
                <>
                    <TextInput 
                        placeholder="E-mail"
                        onChangeText={(email) => mudarEmail(email)}
                        style={styles.textInput}
                    />
                    <TouchableOpacity
                        onPress={() => resetarSenha()}
                        style={styles.button}
                    >
                        <Text
                            style={styles.textButton}
                        >
                            Resetar senha
                        </Text>
                    </TouchableOpacity>
                </>
            :
                <ActivityIndicator size="large" color="#00ff00" />
            }
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

export default ResetarSenhaTela;