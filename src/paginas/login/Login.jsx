import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as GoogleSignIn from 'expo-google-sign-in';
import firebase from 'firebase';


export default function Login({ navigation }) {
	const [logado, mudarLogado] = useState('Não logado');

    SignInWithGoogle = async () => {
		try {
			await GoogleSignIn.askForPlayServicesAsync();
			const { type, user } = await GoogleSignIn.signInAsync();
			if (type === 'success') {
				await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
				const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken,);
				const googleProfileData = await firebase.auth().signInWithCredential(credential);
				mudarLogado('Logado');
			}
			return {success: true};
		} catch ({ message }) {
			mudarLogado(message);
			return {success: false, data: message};
		}
	}

	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
			<Text>
				{logado}
			</Text>
			<TouchableOpacity
				onPress={() => SignInWithGoogle()}
				style={styles.button}
			>
				<Text style={{ fontSize: 20, color: '#fff' }}>ENTRAR COM GOOGLE</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFF',
		alignItems: 'center',
		justifyContent: 'center',
	},

	button: {
		width: '80%',
		backgroundColor: 'blue',
		alignItems: 'center',
		justifyContent: 'center',
	}
});