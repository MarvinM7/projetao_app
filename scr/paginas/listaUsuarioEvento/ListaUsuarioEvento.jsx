import React, { useEffect, useState } from 'react';
import { Title, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';

const ListaUsuarioEventoTela = (props) => {
    const { colors } = useTheme();
    const db = firebase.firestore();
    const dados = props.route.params;
    const [paginaCarregada, mudarPaginaCarregada] = useState(false);
    
    useEffect(() => {
        props.buscarUsuario();
        mudarPaginaCarregada(true);
    }, []);

    const renderItem = ({ item }) => {
        return (
            <View
                style={[styles.item, {borderColor: colors.primary, borderRadius: 10}]}
            >
                <Text>{item.nome}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container]}>
            {paginaCarregada?
                <>
                    <Title style={{color: colors.primary}}>{`Evento: ${dados.evento.nome}`}</Title>
                    <FlatList
                        style={{width: '90%'}}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={dados.listaUsuarios}
                        renderItem={renderItem}
                        keyExtractor={usuario => usuario.id}
                    />
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
        alignItems: 'center'
    },

    item: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderRadius: 5,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 8,
    },
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({ buscarUsuario }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(ListaUsuarioEventoTela);