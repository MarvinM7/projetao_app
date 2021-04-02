import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { Text, View } from 'react-native';
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
import Landing from './componentes/autenticacao/Landing';
import Cadastrar from './componentes/autenticacao/Cadastrar';

const Stack = createStackNavigator();

export class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			carregada: false
		}
	}

	componentDidMount() {
		firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				this.setState({
					logado: false,
					carregada: true
				})
			} else {
				this.setState({
					logado: true,
					carregada: true
				})
			}
		})
	}

	render() {
		const { logado, carregada } = this.state;
		if (!carregada) {
			return (
				<View style={{				
					flex: 1,
					justifyContent: 'center'
				}}>
					<Text>Carregando</Text>
				</View>
			)
		}

		if (!logado) {
			return (
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Landing">
						<Stack.Screen name="Landing" component={Landing} options={{headerShown: false}} />
						<Stack.Screen name="Cadastrar" component={Cadastrar} />
					</Stack.Navigator>
				</NavigationContainer>
			);
		}
		
		return (
			<View style={{				
				flex: 1,
				justifyContent: 'center'
			}}>
				<Text>Usuário logado!</Text>
			</View>
		)
	}
}

export default App;