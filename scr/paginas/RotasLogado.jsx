import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { buscarUsuario, logOut } from '../redux/acoes/Acoes';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardTela from './dashboard/Dashboard';
import ListaEventoTela from './evento/ListaEvento';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const RotasLogado = (props) => {
    useEffect(() => {
        props.buscarUsuario();
    }, []);

    return (
        <Tab.Navigator initialRouteName="Dashboard">
            <Tab.Screen
                name="Dashboard"
                component={DashboardTela}
                options={
                    {
                        title: 'Home',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => {
                            return (
                                <Ionicons name="home" color={color} size={26} />
                            )
                        }                      
                    }
                } />
            <Tab.Screen
                name="ListaEvento"
                component={ListaEventoTela}
                options={
                    {
                        title: 'Lista de Eventos',
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => {
                            return (
                                <Ionicons name="list" color={color} size={26} />
                            )
                        }
                    }
                }
            />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});

const mapStateToProps = (store) => ({
    usuarioAtual: store.usuarioState.usuarioAtual
})

const mapDispatchProps = (dispatch) => bindActionCreators({buscarUsuario, logOut}, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(RotasLogado);