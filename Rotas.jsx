import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/paginas/login/Login';
import Home from './src/paginas/home/Home';

const Stack = createStackNavigator();

export default function Rotas() {
    return (
        <Stack.Navigator
            initialRoute='Login'
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
	);
}