import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { buscarUsuario } from '../../redux/acoes/Acoes';
import firebase from 'firebase';

const ListaEventoTela = (props) => {
    const [listaEvento, mudarListaEvento] = useState([]);

    useEffect(() => {
        props.buscarUsuario();
        let db = firebase.firestore();
        db.collection('eventos').orderBy('data', 'asc').get()
        .then((eventos) => {
            let lista = [];
            eventos.forEach((resp) => {
                let evento = resp.data();
                evento.id = resp.id;
                if (evento.estabelecimento) {
                    evento.estabelecimento.get()
                    .then((estabelecimento) => {
                        evento.estabelecimentoInformacoes = estabelecimento.data();
                        lista.push(evento);
                        mudarListaEvento(lista);
                    })
                    .catch ((erro) => {
                        console.log(erro);
                    })
                } else {
                    lista.push(evento);
                }
            })
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
    }, []);

    const openMaps = (estabelecimento) => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${estabelecimento.localizacao.U},${estabelecimento.localizacao.k}&zoom=15&query_place_id=${estabelecimento.google_maps_id}`);
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => openMaps(item.estabelecimentoInformacoes)}
        >
            <Text style={styles.title}>{`Evento: ${item.nome}`}</Text>
            <Text style={styles.title}>{`Local: ${item.estabelecimentoInformacoes.nome}`}</Text>
            <Text style={styles.title}>{`Dia/Hora: ${item.data.toDate().toLocaleString('en-GB')}`}</Text>
        </TouchableOpacity>
    );

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
                    {listaEvento.length > 0?
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            data={listaEvento}
                            renderItem={renderItem}
                            keyExtractor={evento => evento.id}
                        />
                    :
                        null
                    }

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
    
    item: {
        backgroundColor: '#2196F3',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    
    title: {
        fontSize: 20,
    },
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({buscarUsuario}, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(ListaEventoTela);