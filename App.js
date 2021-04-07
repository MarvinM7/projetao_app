import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import firebaseConfig from './scr/config/firebase';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import Reducers from './scr/redux/reducers/Reducers';
import thunk from 'redux-thunk';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginTela from './scr/paginas/login/Login';
import CadastrarTela from './scr/paginas/cadastrar/Cadastrar';
import ResetarSenhaTela from './scr/paginas/resetarSenha/ResetarSenha';
import RotasLogado from './scr/paginas/RotasLogado';
import GenerosFavoritosTela from './scr/paginas/generosFavoritos/GenerosFavoritos';
import GenerosFavoritosPrimeiroAcessoTela from './scr/paginas/generosFavoritos/GenerosFavoritosPrimeiroAcesso';
import LivrosFavoritosTela from './scr/paginas/livrosFavoritos/LivrosFavoritos';
import AtualizarLivrosFavoritosTela from './scr/paginas/livrosFavoritos/AtualizarLivrosFavoritos';
//import { LogBox } from 'react-native';

const store = createStore(Reducers, applyMiddleware(thunk));

const Stack = createStackNavigator();

const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#2196F3',
	  	accent: 'yellow',
	},
};

const App = () => {
	const [carregada, mudarCarregada] = useState(false);
	const [logado, mudarLogado] = useState(false);
	const [rotaLogado, mudarRotaLogado] = useState('RotasLogado');

	useEffect(() => {
		//LogBox.ignoreLogs(['Setting a timer']);
		if (firebase.apps.length === 0) {
			firebase.initializeApp(firebaseConfig);
		}
		firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				mudarCarregada(true);
				mudarLogado(false);
			} else {
				firebase.firestore().collection('usuarios')
					.doc(firebase.auth().currentUser.uid).get()
					.then((snapshot) => {
						if (snapshot.exists) {
							if (snapshot.data().primeiro_acesso) {
								mudarRotaLogado('GenerosFavoritosPrimeiroAcesso');
							} else {
								mudarRotaLogado('RotasLogado');
							}
							mudarLogado(true);
							mudarCarregada(true);
						}
					})
					.catch((resposta) => {
						console.log(resposta);
					})
			}
		})
	}, []);

	return (
		<SafeAreaProvider>
			{!carregada ?
				<PaperProvider theme={theme}>
					<SafeAreaView style={{				
						flex: 1,
						justifyContent: 'center'
					}}>
						<StatusBar style="auto" />
						<ActivityIndicator size="large" color="#00ff00" />
					</SafeAreaView>
				</PaperProvider> 
			:!logado ?
				<NavigationContainer>
					<PaperProvider theme={theme}>
						<Stack.Navigator initialRouteName="Login">
							<Stack.Screen name="Login" component={LoginTela} options={{headerShown: false}} />
							<Stack.Screen name="Cadastrar" component={CadastrarTela} />
							<Stack.Screen name="ResetarSenha" component={ResetarSenhaTela} options={{title: 'Resetar a senha'}} />
						</Stack.Navigator>
					</PaperProvider>
				</NavigationContainer>
			:
				<Provider store={store}>
					<PaperProvider theme={theme}>
						<NavigationContainer>
							<Stack.Navigator initialRouteName={rotaLogado}>
								<Stack.Screen name="RotasLogado" component={RotasLogado} options={{headerShown: false}} />
								<Stack.Screen name="GenerosFavoritosPrimeiroAcesso" component={GenerosFavoritosPrimeiroAcessoTela} options={{headerShown: false}} />
								<Stack.Screen name="GenerosFavoritos" component={GenerosFavoritosTela} options={{title: 'Meus gêneros favoritos'}} />
								<Stack.Screen name="LivrosFavoritos" component={LivrosFavoritosTela} options={{title: 'Meus livros favoritos'}} />
								<Stack.Screen name="AtualizarLivrosFavoritos" component={AtualizarLivrosFavoritosTela} options={{title: 'Atualizar livros favoritos'}} />
							</Stack.Navigator>
						</NavigationContainer>
					</PaperProvider>
				</Provider>
			}
		</SafeAreaProvider>
	)
}

export default App;