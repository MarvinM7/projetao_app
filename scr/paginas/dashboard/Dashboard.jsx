import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { buscarUsuario, logOut } from '../../redux/acoes/Acoes';
import { LogBox } from 'react-native';
import * as GoogleSignIn from 'expo-google-sign-in';

const DashboardTela = (props) => {
    useEffect(() => {
        LogBox.ignoreLogs(['Setting a timer']);
        props.buscarUsuario();
    }, []);

    const deslogar = async () => {
        await GoogleSignIn.signOutAsync();
        props.logOut();
    };

    return (
        <View
            style={styles.container}
        >
            {props.usuarioAtual?
                <>
                    <Text>
                        {`Bem vindo(a), ${props.usuarioAtual.nome}`}
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

    button: {
        width: '80%',
        backgroundColor: "#2196F3",
        alignItems: "center",
    },

    textButton: {
        color: '#FFF'
    }
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({buscarUsuario, logOut}, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(DashboardTela);