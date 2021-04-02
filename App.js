import 'react-native-gesture-handler';
import React, { Component, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import * as firebase from 'firebase';
//ajusteMarvin usar env
const firebaseConfig = {
	apiKey: "AIzaSyAN413bAgPWMZ86wNpoDMb2XXufjmBdPZQ",
	authDomain: "projetao-app-v1.firebaseapp.com",
	projectId: "projetao-app-v1",
	storageBucket: "projetao-app-v1.appspot.com",
	messagingSenderId: "337650844872",
	appId: "1:337650844872:web:7d8eb49a18792b8e3751fd",
	measurementId: "G-Q25827LZ0T"
};
if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginTela from './scr/paginas/login/Login';
import CadastrarTela from './scr/paginas/cadastrar/Cadastrar';
import HomeTela from './scr/paginas/home/Home';

const Stack = createStackNavigator();

const App = () => {
	const [carregada, mudarCarregada] = useState(false);
	const [logado, mudarLogado] = useState(false);

	useEffect(() => {
		firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				mudarCarregada(true);
				mudarLogado(false);
			} else {
				mudarCarregada(true);
				mudarLogado(true);
			}
		})
	}, []);

	return (
		<>
			{!carregada ? 
				<View style={{				
					flex: 1,
					justifyContent: 'center'
				}}>
					<ActivityIndicator size="large" color="#00ff00" />
				</View>
			:!logado ?
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Login">
						<Stack.Screen name="Login" component={LoginTela} options={{headerShown: false}} />
						<Stack.Screen name="Cadastrar" component={CadastrarTela} />
					</Stack.Navigator>
				</NavigationContainer>
			:
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Home">
						<Stack.Screen name="Home" component={HomeTela} options={{headerShown: false}} />
					</Stack.Navigator>
				</NavigationContainer>
			}
		</>
	)
}

export default App;