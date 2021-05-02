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
import GenerosCurtidosTela from './scr/paginas/generosCurtidos/GenerosCurtidos';
import GenerosTop3Tela from './scr/paginas/generosTop3/GenerosTop3';
import PrimeiroAcessoTela from './scr/paginas/primeiroAcesso/PrimeiroAcesso';
import LivrosFavoritosTela from './scr/paginas/livrosFavoritos/LivrosFavoritos';
import EstanteTela from './scr/paginas/estante/Estante';
import AdicionarLivroEstanteTela from './scr/paginas/estante/AdicionarLivroEstante';
import AtualizarLivrosEstanteTela from './scr/paginas/estante/AtualizarLivrosEstante';
import ConfiguracoesTela from './scr/paginas/configuracoes/Configuracoes';
import MeusDadosTela from './scr/paginas/meusDados/meusDados';
import CriarEventoTela from './scr/paginas/evento/CriarEvento';
import EditarEventoTela from './scr/paginas/evento/EditarEvento';
import UsuarioTela from './scr/paginas/usuario/Usuario';
import ListaUsuarioEventoTela from './scr/paginas/listaUsuarioEvento/ListaUsuarioEvento';
import StatusLiterarioTela from './scr/paginas/statusLiterario/StatusLiterario';

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
		if (firebase.apps.length === 0) {
			firebase.initializeApp(firebaseConfig);
		}
		firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				mudarLogado(false);
				mudarCarregada(true);
			} else {
				firebase.firestore().collection('usuarios').doc(firebase.auth().currentUser.uid).get()
					.then((snapshot) => {
						if (snapshot.exists) {
							if (snapshot.data().primeiro_acesso) {
								mudarRotaLogado('PrimeiroAcesso');
							} else {
								mudarRotaLogado('RotasLogado');
							}
							mudarLogado(true);
							mudarCarregada(true);
						} else {
							let usuario = firebase.auth().currentUser;
							firebase.firestore().collection('usuarios').doc(firebase.auth().currentUser.uid).set({
								nome: usuario.displayName,
								descricao: '',
								email: usuario.email,
								generos: [],
								generos_top_3: [],
								estante: [],
								livros_top_3: [],
								primeiro_acesso: true,
								twitter: '',
								instagram: '',
								cidades: []
							})
							.then(() => {
								mudarRotaLogado('PrimeiroAcesso');
								mudarLogado(true);
								mudarCarregada(true);
							})
							.catch((erro) => {
								console.log('Erro: ' + erro);
							});
						}
					})
					.catch((erro) => {
						console.log('Erro: ' + erro);
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
								<Stack.Screen name="PrimeiroAcesso" component={PrimeiroAcessoTela} options={{headerShown: false}} />
								<Stack.Screen name="GenerosCurtidos" component={GenerosCurtidosTela} options={{title: 'Meus gêneros curtidos'}} />
								<Stack.Screen name="GenerosTop3" component={GenerosTop3Tela} options={{title: 'Gêneros top 3'}} />
								<Stack.Screen name="LivrosFavoritos" component={LivrosFavoritosTela} options={{title: 'Livros top 3'}} />
								<Stack.Screen name="Estante" component={EstanteTela} options={{title: 'Minha estante'}} />
								<Stack.Screen name="Configuracoes" component={ConfiguracoesTela} options={{title: 'Configurações'}} />
								<Stack.Screen name="AdicionarLivroEstante" component={AdicionarLivroEstanteTela} options={{title: 'Adicionar livros na estante'}} />
								<Stack.Screen name="AtualizarLivrosEstante" component={AtualizarLivrosEstanteTela} options={{title: 'Adicionar livros na estante'}} />
								<Stack.Screen name="MeusDados" component={MeusDadosTela} options={{title: 'Meus dados'}} />
								<Stack.Screen name="CriarEvento" component={CriarEventoTela} options={{title: 'Criar evento'}} />
								<Stack.Screen name="EditarEvento" component={EditarEventoTela} options={{title: 'Editar evento'}} />
								<Stack.Screen name="Usuario" component={UsuarioTela} options={{title: 'Perfil'}} />
								<Stack.Screen name="ListaUsuarioEvento" component={ListaUsuarioEventoTela} options={{title: 'Lista de presença'}} />
								<Stack.Screen name="StatusLiterario" component={StatusLiterarioTela} options={{title: 'Status literário'}} />
							</Stack.Navigator>
						</NavigationContainer>
					</PaperProvider>
				</Provider>
			}
		</SafeAreaProvider>
	)
}

export default App;