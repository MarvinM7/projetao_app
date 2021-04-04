import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { buscarUsuario, logOut } from '../../redux/acoes/Acoes';
import * as GoogleSignIn from 'expo-google-sign-in';

const DashboardTela = (props) => {
    useEffect(() => {
        props.buscarUsuario();
    }, []);

    const deslogar = async () => {
        await GoogleSignIn.signOutAsync();
        props.logOut();
    };

    return (
        <SafeAreaView
            style={styles.container}
        >
            <StatusBar style="auto" />
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
        </SafeAreaView>
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