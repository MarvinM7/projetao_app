import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import firebaseConfig from './scr/config/firebase';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import Reducers from './scr/redux/reducers/Reducers';
import thunk from 'redux-thunk';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginTela from './scr/paginas/login/Login';
import CadastrarTela from './scr/paginas/cadastrar/Cadastrar';
import DashboardTela from './scr/paginas/dashboard/Dashboard';
import ResetarSenhaTela from './scr/paginas/resetarSenha/ResetarSenha';

const store = createStore(Reducers, applyMiddleware(thunk))

const Stack = createStackNavigator();

const App = () => {
	const [carregada, mudarCarregada] = useState(false);
	const [logado, mudarLogado] = useState(false);

	useEffect(() => {
		if (firebase.apps.length === 0) {
			firebase.initializeApp(firebaseConfig);
		}
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
						<Stack.Screen name="ResetarSenha" component={ResetarSenhaTela} options={{title: 'Resetar a senha'}} />
					</Stack.Navigator>
				</NavigationContainer>
			:
				<Provider store={store}>
					<NavigationContainer>
						<Stack.Navigator initialRouteName="Dashboard">
							<Stack.Screen name="Dashboard" component={DashboardTela} options={{headerShown: false}} />
						</Stack.Navigator>
					</NavigationContainer>
				</Provider>
			}
		</>
	)
}

export default App;