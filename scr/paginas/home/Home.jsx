import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import firebase from 'firebase';

const HomeTela = () => {
    const [usuario, mudarUsuario] = useState({});

    useEffect(() => {
        const { currentUser } = firebase.auth();
        mudarUsuario(currentUser);
    }, []);

    const deslogar = () => {
        firebase
            .auth()
            .signOut()
            .then()
            .catch(error => alert('Erro ao deslogar: ' + error));
    };

    return (
        <View
            style={styles.container}
        >
            <Text>
                {`Bem vindo(a), ${usuario.displayName}`}
            </Text>
            <TouchableOpacity
                onPress={() => deslogar()}
                style={styles.button}
            >
                <Text
                    style={styles.textButton}
                >
                    Sair
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

    button: {
        width: '80%',
        backgroundColor: "#2196F3",
        alignItems: "center",
    },

    textButton: {
        color: '#FFF'
    }
});

export default HomeTela;