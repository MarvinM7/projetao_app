import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import firebase from 'firebase';
import firebaseConfig from './src/config/firebase';
import Rotas from './Rotas';

export default function App() {
	useEffect(() => {
		if (!firebase.apps.length) {
        	firebase.initializeApp(firebaseConfig);
		}
    }, []);

	return (
		<NavigationContainer>
			<Rotas />
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFF',
		alignItems: 'center',
		justifyContent: 'center',
	}
});